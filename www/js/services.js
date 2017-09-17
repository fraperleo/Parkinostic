angular.module('dermApp.services', ['ngResource'])

.value("baseURL","http://localhost:7474/")

.factory('neo4jFactory', function(baseURL, $http, $ionicPopup) {
 
  return {
      showAlert: showAlert,
      createNode: createNode,
      createRelationship: createRelationship,
      getTest1: getTest1,
      getPatient: getPatient,
      getPruebas: getPruebas,
      getHistorico: getHistorico
  }

    //Create generic alerts
    function showAlert(titulo,cuerpo) {
     var alertPopup = $ionicPopup.alert({
       title: titulo,
       template: '<p style="text-align: center">' + cuerpo + '</p>'
      });
    }

    function createNode(clase, objeto){     
        //Construyo la estructura
        var url = baseURL + 'db/data/cypher';
        var dataTemp = '{';
        dataTemp += '"query" : "CREATE (n:' + clase + convertToText(objeto).replace(new RegExp('"', 'g'),"'") + ') RETURN n",';
        dataTemp += '"params" : { }';
        dataTemp += '}';
        console.log(dataTemp);
        console.log(objeto);
        //Hago el post
        return $http.post(url, dataTemp, { headers: {'Authorization': 'Basic bmVvNGo6cm9vdA==','Content-Type': 'application/json' } } );               
    }

    function createRelationship(id1, id2){     
        //Construyo la estructura
        var url = baseURL + 'db/data/cypher';
        var dataTemp = '{';
        dataTemp += '"query" : "Start n=node(' + id1 + '), n2=node(' + id2 + ') CREATE (n)-[:TIENE]->(n2)",';
        dataTemp += '"params" : { }';
        dataTemp += '}';
        console.log(dataTemp);
        //Hago el post
        return $http.post(url, dataTemp, { headers: {'Authorization': 'Basic bmVvNGo6cm9vdA==','Content-Type': 'application/json' } } );               
    }

    function getPatient(nuhsa){     
        //Construyo la estructura
        var url = baseURL + 'db/data/cypher';
        var dataTemp = '{';
        dataTemp += '"query" : "MATCH (p:Paciente {nuhsa:' +"'" + nuhsa + "'" +'} ) RETURN p",';
        dataTemp += '"params" : { }';
        dataTemp += '}';
        //Hago el post
        return $http.post(url, dataTemp, { headers: {'Authorization': 'Basic bmVvNGo6cm9vdA==','Content-Type': 'application/json' } } );               
    }

    //Obtener un estudio en concreto
    function getTest1(id){             
        //Construyo la estructura
        var url = baseURL + 'db/data/cypher';
        var dataTemp = '{';
        dataTemp += '"query" : "Start n=node(' + id + ') MATCH r=(n)-[a*]->(n2) RETURN n2 LIMIT 25",';
        dataTemp += '"params" : { }';
        dataTemp += '}';
        console.log(dataTemp);
        //Hago el post
        return $http.post(url, dataTemp, { headers: {'Authorization': 'Basic bmVvNGo6cm9vdA==','Content-Type': 'application/json' } } );               
   }

    function getPruebas(clase, nuhsa){    
        //Construyo la estructura
        var url = baseURL + 'db/data/cypher';
        var dataTemp = '{';
        dataTemp += '"query" : "MATCH (t:' + clase + ') MATCH (p:Paciente {nuhsa:' +"'" + nuhsa + "'" +'} ) MATCH o=(p)-[r:TIENE]->(t) RETURN t",';
        dataTemp += '"params" : { }';
        dataTemp += '}';
        //Hago el post
        return $http.post(url, dataTemp, { headers: {'Authorization': 'Basic bmVvNGo6cm9vdA==','Content-Type': 'application/json' } } );               
    }

    function getHistorico(nuhsa){    
        //ACCEDER A TODAS LAS PRUEBAS
        var ret = [];
        var y = 0;

        getPruebas('Test1', nuhsa).then(function(response) { 
            console.log(response.data.data);
            var i;
            for (i = 0; i < response.data.data.length; i++) { 
              ret[y] = response.data.data[i][0].data;
              ret[y].id = response.data.data[i][0].metadata.id;
              ret[y].tipo = 'Test1';
              y++;
            }

        }, function(err) {
            // Hacer algo con el error
           console.log(err);
        });      

        getPruebas('Test2', nuhsa).then(function(response) { 
            console.log(response.data.data);
            var i;
            for (i = 0; i < response.data.data.length; i++) { 
              ret[y] = response.data.data[i][0].data;
              ret[y].id = response.data.data[i][0].metadata.id;
              ret[y].tipo = 'Test2';
              y++;
            }

        }, function(err) {
            // Hacer algo con el error
           console.log(err);
        });   

        return ret;   
    }

    function convertToText(obj) {
    //create an array that will later be joined into a string.
    var string = [];
    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (typeof(obj) == "object" && (obj.join == undefined)) {
        string.push("{");
        for (prop in obj) {
            if(prop.indexOf("$") == -1 ){
            string.push(prop, ": ", convertToText(obj[prop]), ",");
          }
        };
        delete string[string.length-1];
        string.push("}");
    //is array
    } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
        string.push("[")
        for(prop in obj) {
            string.push(convertToText(obj[prop]), ",");
        }
        string.push("]")
    //is function
    } else if (typeof(obj) == "function") {
        string.push(obj.toString())
    //all other values can be done with JSON.stringify
    } else {
        string.push(JSON.stringify(obj));        
    }
    return string.join("")
    }    

})


.factory('loginFactory', function(baseURL, $http, $localStorage) {
  
 return {
      isLoggin: isLoggin,
      validarMedico: validarMedico
  }


      function isLoggin(){
          var ret = false;
          if($localStorage.getObject('userinfo','{}').validacion == '0'){
            ret = true;
          }
        return ret;
      }

      function validarMedico(user, pass){ 
        var CryptoJS=CryptoJS||function(h,s){var f={},t=f.lib={},g=function(){},j=t.Base={extend:function(a){g.prototype=this;var c=new g;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=t.WordArray=j.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||u).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=j.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new q.init(c,a)}}),v=f.enc={},u=v.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
2),16)<<24-4*(b%8);return new q.init(d,c/2)}},k=v.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new q.init(d,c)}},l=v.Utf8={stringify:function(a){try{return decodeURIComponent(escape(k.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return k.parse(unescape(encodeURIComponent(a)))}},
x=t.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=l.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var m=0;m<a;m+=e)this._doProcessBlock(d,m);m=d.splice(0,a);c.sigBytes-=b}return new q.init(m,b)},clone:function(){var a=j.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});t.Hasher=x.extend({cfg:j.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){x.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new w.HMAC.init(a,
d)).finalize(c)}}});var w=f.algo={};return f}(Math);
(function(h){for(var s=CryptoJS,f=s.lib,t=f.WordArray,g=f.Hasher,f=s.algo,j=[],q=[],v=function(a){return 4294967296*(a-(a|0))|0},u=2,k=0;64>k;){var l;a:{l=u;for(var x=h.sqrt(l),w=2;w<=x;w++)if(!(l%w)){l=!1;break a}l=!0}l&&(8>k&&(j[k]=v(h.pow(u,0.5))),q[k]=v(h.pow(u,1/3)),k++);u++}var a=[],f=f.SHA256=g.extend({_doReset:function(){this._hash=new t.init(j.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],m=b[2],h=b[3],p=b[4],j=b[5],k=b[6],l=b[7],n=0;64>n;n++){if(16>n)a[n]=
c[d+n]|0;else{var r=a[n-15],g=a[n-2];a[n]=((r<<25|r>>>7)^(r<<14|r>>>18)^r>>>3)+a[n-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+a[n-16]}r=l+((p<<26|p>>>6)^(p<<21|p>>>11)^(p<<7|p>>>25))+(p&j^~p&k)+q[n]+a[n];g=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&m^f&m);l=k;k=j;j=p;p=h+r|0;h=m;m=f;f=e;e=r+g|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+m|0;b[3]=b[3]+h|0;b[4]=b[4]+p|0;b[5]=b[5]+j|0;b[6]=b[6]+k|0;b[7]=b[7]+l|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=g.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=g._createHelper(f);s.HmacSHA256=g._createHmacHelper(f)})(Math);

        var sha = CryptoJS.SHA256(pass).toString();   
        //Construyo la estructura
        var url = baseURL + 'db/data/cypher';
        var dataTemp = '{';
        dataTemp += '"query" : "MATCH (p:Medico {sha:' +"'" + sha + "'" +',user:' +"'" + user + "'" +'} ) RETURN p",';
        dataTemp += '"params" : { }';
        dataTemp += '}';
        //Hago el post
        return $http.post(url, dataTemp, { headers: {'Authorization': 'Basic bmVvNGo6cm9vdA==','Content-Type': 'application/json' } } );               
    }

})


.factory('$localStorage', ['$window', function($window) {
          return {
            store: function(key, value) {
              $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
              return $window.localStorage[key] || defaultValue;
            },
            storeObject: function(key, value) {
              $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key,defaultValue) {
              return JSON.parse($window.localStorage[key] || defaultValue);
            }
          }
        }])

;
