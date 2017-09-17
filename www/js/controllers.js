angular.module('dermApp.controllers', [])


.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, $localStorage, loginFactory, neo4jFactory, $ionicHistory) {
   
  //Creamos datos autentificacion modal
  //Comprobamos si no se ha cerrado correctamente
  $scope.loginData = {};
  $scope.loginData = $localStorage.getObject('userinfo','{}');  
  
  if($scope.loginData.password != null || $scope.loginData.validacion != null){
    $scope.loginData = {};
    $scope.loginData.username = $localStorage.getObject('userinfo','{}').username;
    $localStorage.storeObject('userinfo', $scope.loginData);
  } 

  //Reiteramos que la validacion sea nula
  $scope.loginData.validacion = null; 
  //Creamos la variable del caso que vamos a utilizar
  $scope.caso = {};
  $localStorage.storeObject('caso',$scope.caso);


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

   // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };


  // Triggered in the login modal to close it
  $scope.closeLogin = function() { 
    //Preparamos variables de login
    $scope.loginData.username = $localStorage.getObject('userinfo','{}').username;
    delete $scope.loginData.password;
    $scope.loginData.validacion = null;  
    $localStorage.storeObject('userinfo', $scope.loginData);  
    //Borrramos la variable del caso que hemos utilizado
    $scope.caso = {};
    $localStorage.storeObject('caso',$scope.caso);   

    $timeout(function() {      
      //Vigilar
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
      $state.go('login');
    }, 500);
    
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {   

    loginFactory.validarMedico($scope.loginData.username, $scope.loginData.password).then(function(response) {

            console.log(response);
            if(response.data.data.length!=0){
              $scope.loginData.validacion = 0;
              $scope.loginData.password = null;
              //Almacenarlo
              $localStorage.storeObject('userinfo', $scope.loginData);  
              //Pasamos a la siguiente tab
              $state.go('identify');
            }else{
              neo4jFactory.showAlert('No encontrado', 'Puede no ser un médico con autorización' );
            }

        }, function(err) {
            // Hacer algo con el error
           console.log(err);
        });        
    };
 
})


.controller('IdentifyCtrl', function($scope, $state, $timeout, neo4jFactory, $localStorage, $cordovaBarcodeScanner) {

  $scope.caso = {};
  $localStorage.storeObject('caso',$scope.caso);

  $scope.leerCodigo = function(){
      
    $cordovaBarcodeScanner
      .scan()
      .then(function (imagenEscaneada) {

          $scope.caso = {};
          $scope.caso.nuhsa = imagenEscaneada.text;
          $scope.siguiente();
    
      }, function(error) {
        neo4jFactory.showAlert('Ha ocurrido un error con la lectura : ', error);
      });

    }

    $scope.atras = function(){
      $state.go('login');
    }

    $scope.siguiente = function(){

        if($scope.caso.nuhsa == "undefined" ||  $scope.caso.nuhsa == null || $scope.caso.nuhsa == ''){
          $scope.caso.nuhsa = "AN123456789";
        }

         neo4jFactory.getPatient($scope.caso.nuhsa).then(function(response) {
          
            if(response.data.data.length!=0){
              $scope.caso.paciente = response.data.data[0][0].data;  
              $scope.caso.paciente.id = response.data.data[0][0].metadata.id;
              //ACCEDER A TODAS LAS PRUEBAS
              $scope.caso.historico = [];
              $scope.caso.historico = neo4jFactory.getHistorico($scope.caso.paciente.nuhsa);
              $timeout(function() {  
                $localStorage.storeObject('caso', $scope.caso);
                //Pasamos a la siguiente pantalla
                $state.go('menu');
              }, 500);
            }else{
              neo4jFactory.showAlert('No encontrado', 'Puede no ser un paciente en nuestra base de datos' );
            }

        }, function(err) {
            // Hacer algo con el error
           console.log(err);
        });        
        
    }


    var isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
        
    var esNUHSAValido = function (nuhsa) {
        if (nuhsa.length!=12 || nuhsa.substr(0,2)!='AN' || !isNumber(nuhsa.substr(3)))
            return false;

        var b=parseInt(nuhsa.substr(2,8));
        var c=parseInt(nuhsa.substr(10,2));
        var d;
        if (b<10000000)
            d=b+60*10000000;
        else
            d=parseInt("60"+nuhsa.substr(2,8));
        return d%97==c;
    }

})

.controller('PatientCtrl', function($scope, $state, $localStorage) {
  
  $scope.caso = $localStorage.getObject('caso','{}');   

  $scope.getUltimo = function(){
      var res=null;
      for (i = 0; i < $scope.caso.historico.length; i++) { 
        if($scope.caso.historico[i].tipo=="Test1"){
          res = $scope.caso.historico[i];
        }
      }
      return res;
  }

  $scope.ultimo = $scope.getUltimo();  
  console.log($scope.ultimo);

  $scope.atras = function(){
      $state.go("menu");
  }

})


.controller('MenuCtrl', function($scope, $timeout, $state, $ionicLoading, $ionicPopup, $localStorage, neo4jFactory) {

  $ionicLoading.show({
    template: '<ion-spinner></ion-spinner> Cargando...'
  });

  $scope.caso = $localStorage.getObject('caso','{}');

  $timeout(function() {  
    console.log($scope.caso);
    $ionicLoading.hide();
  }, 500);


  $scope.goPatient = function(){
    $state.go("paciente");
  }

  $scope.goHistorico = function() {
    $state.go("historico");
  }

  $scope.goTest1 = function(){
    $state.go("test1");
  }

  $scope.goTest2 = function(){
    $state.go("test2");
  }

  $scope.atras = function(){
    $state.go("menu");
  }

  $scope.exit = function(){
    delete $scope.caso.nuhsa;
    $state.go("login");
  }

})

.controller('HistoricoCtrl', function($scope, $timeout, $state, $ionicLoading, $ionicPopup, $localStorage, neo4jFactory) {


  $scope.caso = $localStorage.getObject('caso','{}');

  $ionicLoading.show({
    template: '<ion-spinner></ion-spinner> Cargando...'
  });

  $timeout(function() {  
    console.log($scope.caso);
    $ionicLoading.hide();
  }, 100);

  $scope.logo = function(resp){   

    if(resp.tipo == 'Test1'){
      return false;
    }else{
      return true;
    }
  };

  $scope.isEmpty = function() {
    if($scope.caso.historico.length == 0 || $scope.caso.historico.length == undefined)
        return false;                
    else{
        return true;
    }
  }

  $scope.atras = function(){
    $state.go("menu");
  }

  $scope.refresh = function(){   
    $scope.caso = $localStorage.getObject('caso','{}');

    //ACCEDER A TODAS LAS PRUEBAS
    $scope.caso.historico = neo4jFactory.getHistorico($scope.caso.nuhsa);

    $timeout(function() {  
      console.log($scope.caso);
      $localStorage.storeObject('caso', $scope.caso);
      $scope.$broadcast('scroll.refreshComplete');
    }, 500);
    
  };   

})


.controller('HistoricoDetailCtrl', function($scope, $state, $stateParams, $timeout, neo4jFactory, message, $localStorage) {


  $scope.getPrueba = function(){
    var aux = $localStorage.getObject('caso','{}');
    var ret = {};
    var i;

    for (i = 0; i < aux.historico.length; i++) { 
        if(aux.historico[i].id==message.id){
          ret = aux.historico[i];
          break;
        }
    }

    if(ret.tipo=="Test1"){
      $scope.getCriterios();
    }

    return ret;
  }  


  $scope.getCriterios = function(){         
      
      neo4jFactory.getTest1(message.id).then(function(response) {
          console.log(response.data.data[0][0].data);
          console.log(JSON.parse(JSON.stringify(response.data.data[0][0].data)).p0);
            
            for (i = 0; i < response.data.data.length; i++) { 
              if(response.data.data[i][0].metadata.labels[0]=="CriterioApoyo"){
                $scope.message.data.criterioApoyo = JSON.parse(JSON.stringify(response.data.data[i][0].data));
              }
              if(response.data.data[i][0].metadata.labels[0]=="CriterioExclusion"){
                $scope.message.data.criterioExclusion = JSON.parse(JSON.stringify(response.data.data[i][0].data));
              }
              if(response.data.data[i][0].metadata.labels[0]=="BanderaRoja"){
                $scope.message.data.banderaRoja = JSON.parse(JSON.stringify(response.data.data[i][0].data));
              }
            } 
        }, function(err) {
            // Hacer algo con el error
           console.log(err);
        });    

  } 
  
  $scope.message = message;  
  $scope.message = $scope.getPrueba();
  $scope.message.data = {};
  $scope.message.data.criterioApoyo = {};
  $scope.message.data.criterioExclusion = {};
  $scope.message.data.banderaRoja = {};

 $timeout(function() {   
    console.log($scope.message); 
    console.log($scope.message.data.banderaRoja); 
    $scope.contar($scope.message.data.banderaRoja);
  }, 200);  


  $scope.contar = function(json){
      cont = 0;
      for(prop in json) {
        if(json[prop]==true){
          cont++;
        }
      }
      return cont;
  }

  $scope.tipo = function(resp){   
    if(resp.tipo == 'Test1'){
      return true;
    }else{
      return false;
    }
  }


  $scope.hayRespuesta = function(respuesta){  
    var respuestaTemp = {};    
    if(typeof respuesta == 'undefined' || respuesta == null){
      respuestaTemp = 'Todavía no hay contestación';
    }else{
      respuestaTemp = respuesta;
    }    
    return respuestaTemp;    
  };

  $scope.atras = function(){
    $state.go("historico");
  }


  $scope.verfecha =function (date) {
    var result = {};
    console.log(date);
    if(date != null){
      dt= new Date(date);
      console.log(dt);
      dd=dt.getDate();
      if(dd<9){ dd= '0'+dd; }
      mm=dt.getMonth();
      if(mm<9){ mm=mm+1; mm= '0'+mm; }else{ mm=mm+1; }
      hh=dt.getHours();
      if(hh<9){ hh= '0'+hh; }
      min=dt.getMinutes();
      if(min<9){ min= '0'+ min; }
      ss=dt.getSeconds();
      if(ss<9){ ss= '0'+ss; }
    //Formato visualizacion espanha
    result = dd + "-" + mm + "-" + dt.getFullYear() + " " + hh + ":" + min + ":" + ss;
    }else{
      result = '-';
    }
    return result;
  };

})


.controller('Test1Ctrl', function($scope, $state, $stateParams, $timeout, $localStorage, neo4jFactory) {
  
  $scope.caso = $localStorage.getObject('caso','{}');
  $scope.test1Aux = {};

  $scope.test1Aux.criterioApoyo = [
    { text: "Respuesta singnificativa a la terapia", checked: false },
    { text: "Presenta dyskinesi por levadopa", checked: false },
    { text: "Temblor en resposo de miembros", checked: false }
  ];

  $scope.test1Aux.criterioExclusion = [
    { text: "Anomalias cerebrales", checked: false },
    { text: "Ausencia de respuesta observable", checked: false },
    { text: "Perdida sensorial uniquivoca", checked: false },
    { text: "Neuroimagen funcional anormal", checked: false }
  ];

  $scope.test1Aux.banderaRoja = [
    { text: "Deterioro acelerado del paso (andador)", checked: false },
    { text: "Ausencia progresion sintomatica", checked: false },
    { text: "Influencia de autonomismo", checked: false },
    { text: "Parkinson simetrico bilateral", checked: false }
  ];

  $scope.convertData = function(){
    var res= {};
    res.criterioApoyo = {};
    res.criterioApoyo.p0 = $scope.test1Aux.criterioApoyo[0].text;
    res.criterioApoyo.r0 = $scope.test1Aux.criterioApoyo[0].checked;
    res.criterioApoyo.p1 = $scope.test1Aux.criterioApoyo[1].text;
    res.criterioApoyo.r1 = $scope.test1Aux.criterioApoyo[1].checked;
    res.criterioApoyo.p2 = $scope.test1Aux.criterioApoyo[2].text;
    res.criterioApoyo.r2 = $scope.test1Aux.criterioApoyo[2].checked;
    res.criterioExclusion = {};
    res.criterioExclusion.p0 = $scope.test1Aux.criterioExclusion[0].text;
    res.criterioExclusion.r0 = $scope.test1Aux.criterioExclusion[0].checked;
    res.criterioExclusion.p1 = $scope.test1Aux.criterioExclusion[1].text;
    res.criterioExclusion.r1 = $scope.test1Aux.criterioExclusion[1].checked;
    res.criterioExclusion.p2 = $scope.test1Aux.criterioExclusion[2].text;
    res.criterioExclusion.r2 = $scope.test1Aux.criterioExclusion[2].checked;
    res.criterioExclusion.p3 = $scope.test1Aux.criterioExclusion[3].text;
    res.criterioExclusion.r3 = $scope.test1Aux.criterioExclusion[3].checked;
    res.banderaRoja = {};
    res.banderaRoja.p0 = $scope.test1Aux.banderaRoja[0].text;
    res.banderaRoja.r0 = $scope.test1Aux.banderaRoja[0].checked;
    res.banderaRoja.p1 = $scope.test1Aux.banderaRoja[1].text;
    res.banderaRoja.r1 = $scope.test1Aux.banderaRoja[1].checked;
    res.banderaRoja.p2 = $scope.test1Aux.banderaRoja[2].text;
    res.banderaRoja.r2 = $scope.test1Aux.banderaRoja[2].checked;
    res.banderaRoja.p3 = $scope.test1Aux.banderaRoja[3].text;
    res.banderaRoja.r3 = $scope.test1Aux.banderaRoja[3].checked;
    console.log(res);
    return res;
  }

  $scope.contar = function(json){
      cont = 0;
      for(prop in json) {
        if(json[prop]==true){
          cont++;
        }
      }
      return cont;
  }

  $scope.atras = function(){
      $state.go("menu");
    }

  $scope.guardar = function(){
    /*console.log($scope.criterioApoyo);
    console.log($scope.criterioExclusion);
    console.log($scope.banderaRoja);
    console.log($stateParams);
    $stateParams.id = 4;
    $state.go("historico-detail", $stateParams);*/ 

    var data = {};
    data.fecha = $scope.verfecha(new Date());
    data.diagnostico= 'No PD';
    var contDiagnostico = 0;
    contDiagnostico = contDiagnostico + $scope.contar($scope.convertData().criterioApoyo);
    contDiagnostico = contDiagnostico + $scope.contar($scope.convertData().criterioExclusion);
    contDiagnostico = contDiagnostico + $scope.contar($scope.convertData().banderaRoja);

    if(contDiagnostico >= 4){
      data.diagnostico= 'Problable PD';
    }
    if(contDiagnostico >= 8){
      data.diagnostico= 'PD';
    }
    
    var idTest;

    neo4jFactory.createNode('Test1', data ).then(function(response) {
             console.log(response);
             idTest = response.data.data[0][0].metadata.id;

              neo4jFactory.createRelationship($scope.caso.paciente.id, response.data.data[0][0].metadata.id ).then(function(response) {
                 console.log(response);    

                  neo4jFactory.createNode('CriterioApoyo', $scope.convertData().criterioApoyo ).then(function(response) {
                 console.log(response);

                      neo4jFactory.createRelationship(idTest, response.data.data[0][0].metadata.id ).then(function(response) {
                         console.log(response);                 
                      }, function(err) {
                          // Hacer algo con el error
                         console.log(err);
                      }); 

              }, function(err) {
                  // Hacer algo con el error
                 console.log(err);
    });

    neo4jFactory.createNode('CriterioExclusion', $scope.convertData().criterioExclusion ).then(function(response) {
             console.log(response);

              neo4jFactory.createRelationship(idTest, response.data.data[0][0].metadata.id ).then(function(response) {
                 console.log(response);                 
              }, function(err) {
                  // Hacer algo con el error
                 console.log(err);
              }); 

          }, function(err) {
              // Hacer algo con el error
             console.log(err);
    });

    neo4jFactory.createNode('BanderaRoja', $scope.convertData().banderaRoja ).then(function(response) {
             console.log(response);

              neo4jFactory.createRelationship(idTest, response.data.data[0][0].metadata.id ).then(function(response) {
                 console.log(response);                 
              }, function(err) {
                  // Hacer algo con el error
                 console.log(err);
              }); 

          }, function(err) {
              // Hacer algo con el error
             console.log(err);
    });


              }, function(err) {
                  // Hacer algo con el error
                 console.log(err);
              }); 

          }, function(err) {
              // Hacer algo con el error
             console.log(err);
    });

     //ACCEDER A TODAS LAS PRUEBAS              
      $timeout(function() { 
        $scope.test1Aux = {}; 
        console.log($scope.caso.paciente.nuhsa);
        $scope.caso.historico = neo4jFactory.getHistorico($scope.caso.paciente.nuhsa);
        console.log($scope.caso.historico);
        $timeout(function() { 
        $localStorage.storeObject('caso', $scope.caso);
        //Pasamos a la siguiente pantalla
        $state.go('menu');
        }, 250);       

      }, 500);
      
  }


  $scope.verfecha =function (date) {
    var result = {};
    console.log(date);
    if(date != null){
    dt= new Date(date);
    console.log(dt);
    dd=dt.getDate();
    if(dd<9){ dd= '0'+dd; }
    mm=dt.getMonth();
    if(mm<9){ mm=mm+1; mm= '0'+mm; }else{ mm=mm+1; }
    hh=dt.getHours();
    if(hh<9){ hh= '0'+hh; }
    min=dt.getMinutes();
    if(min<9){ min= '0'+ min; }
    ss=dt.getSeconds();
    if(ss<9){ ss= '0'+ss; }
    //Formato visualizacion espanha
    result = dd + "-" + mm + "-" + dt.getFullYear() + " " + hh + ":" + min + ":" + ss;
  }else{
    result = '-';
  }
    return result;
    };

})

.controller('Test2Ctrl', function($scope, $state, $timeout, $localStorage, neo4jFactory) {
   
  $scope.caso = $localStorage.getObject('caso','{}');
   
  $scope.range = {};
  $scope.range.movilidad = 1;
  $scope.range.temblor = 1;
  $scope.range.resptVisual = 1;
  $scope.range.control = 1;
  $scope.range.mano = null;

  $scope.seleccionarMano = function(mano){
    if(mano==1){
      neo4jFactory.showAlert('Bien', 'Ha seleccionado la mano izquierda' );
      $scope.range.mano = 'izquierda';
    }if(mano==2){
      neo4jFactory.showAlert('Bien', 'Ha seleccionado la mano derecha' );
      $scope.range.mano = 'derecha';
    }
  }

  $scope.atras = function(){
      $state.go("menu");
    }

  $scope.guardar = function(){
    console.log($scope.range);
    //Incluimos la fecha
    $scope.range.fecha = $scope.verfecha(new Date());

    if($scope.range.mano!=null){
      neo4jFactory.createNode('Test2', $scope.range).then(function(response) {
             
             console.log(response);
             neo4jFactory.createRelationship($scope.caso.paciente.id, response.data.data[0][0].metadata.id ).then(function(response) {
                 console.log(response);                 
              }, function(err) {
                  // Hacer algo con el error
                 console.log(err);
              }); 


          }, function(err) {
              // Hacer algo con el error
             console.log(err);
          });        
      
       //ACCEDER A TODAS LAS PRUEBAS
              $scope.caso.historico = [];
              $scope.caso.historico = neo4jFactory.getHistorico($scope.caso.paciente.nuhsa);
              $timeout(function() {  
                $localStorage.storeObject('caso', $scope.caso);
                //Pasamos a la siguiente pantalla
                $state.go('menu');
              }, 500);

    }else{
      neo4jFactory.showAlert('Atención', 'Por favor, seleccione una mano' ); 
    }
  }

  $scope.verfecha =function (date) {
    var result = {};
    console.log(date);
    if(date != null){
    dt= new Date(date);
    console.log(dt);
    dd=dt.getDate();
    if(dd<9){ dd= '0'+dd; }
    mm=dt.getMonth();
    if(mm<9){ mm=mm+1; mm= '0'+mm; }else{ mm=mm+1; }
    hh=dt.getHours();
    if(hh<9){ hh= '0'+hh; }
    min=dt.getMinutes();
    if(min<9){ min= '0'+ min; }
    ss=dt.getSeconds();
    if(ss<9){ ss= '0'+ss; }
    //Formato visualizacion espanha
    result = dd + "-" + mm + "-" + dt.getFullYear() + " " + hh + ":" + min + ":" + ss;
  }else{
    result = '-';
  }
    return result;
    };

})


;
