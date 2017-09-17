Ionic: Parkinostic
=====================

A starting project for Ionic that optionally supports using custom SCSS.

## Before use this project

It is necessary to deploy a neo4j database, in this example it is deploy in local. The login databse for this code should be neo4j:root, and the initial script for the database is the following:

```bash
CREATE (n:Medico { user: "admin", sha: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4" } ) RETURN n

CREATE (n:Paciente { nuhsa: "AN803227519", nombre: "Lott Washington", sexo: "male", edad: 34, email: "lottwashington@kidgrease.com", 
telefono: "+1 (969) 593-3242", direccion: "756 Georgia Avenue, Churchill, South Carolina, 5429" } ) RETURN n

CREATE (n:Paciente { nuhsa: "AN123456789", nombre: "Fran Pérez", sexo: "male", edad: 21, email: "franperez@kidgrease.com", 
telefono: "+34 (969) 593-3242", direccion: "756 Georgia Avenue, Seville, South Andalucian, 41003" } ) RETURN n

CREATE (n:Test1 { fecha: "01-01-1995", diagnostico: "Probable PD" } ) RETURN n
CREATE (n:criterioApoyo { p1: "true", p2: "flase", p3: "true" } ) RETURN n
CREATE (n:criterioExclusion { p1: "true", p2: "flase", p3: "true", p4: "false" } ) RETURN n
CREATE (n:banderaRoja { p1: "true", p2: "true", p3: "true", p4: "false" } ) RETURN n


MATCH (a:Paciente { nuhsa: 'AN803227519' }), (b:Test1 { fecha: "01-01-1995", diagnostico: "Probable PD" } ) CREATE (a)-[:TIENE]->(b)
MATCH (a:Test1 { fecha: "01-01-1995", diagnostico: "Probable PD" } ), (b:criterioApoyo { p1: "true", p2: "flase", p3: "true" } ) CREATE (a)-[:TIENE]->(b)
MATCH (a:Test1 { fecha: "01-01-1995", diagnostico: "Probable PD" } ), (b:criterioExclusion { p1: "true", p2: "flase", p3: "true", p4: "false" } ) CREATE (a)-[:TIENE]->(b)
MATCH (a:Test1 { fecha: "01-01-1995", diagnostico: "Probable PD" } ), (b:banderaRoja { p1: "true", p2: "true", p3: "true", p4: "false" } ) CREATE (a)-[:TIENE]->(b)


CREATE (n:Test2 { fecha: "01-01-1995" } ) RETURN n
CREATE (n:manoDerecha { p1: "true", p2: "true", p3: "true", p4: "false" } ) RETURN n
CREATE (n:manoIzquierda { p1: "true", p2: "true", p3: "true", p4: "false" } ) RETURN n

MATCH (a:Paciente { nuhsa: 'AN803227519' }), (b:Test2 { fecha: "01-01-1995" } ) CREATE (a)-[:TIENE]->(b)
MATCH (a:Test2 { fecha: "01-01-1995" } ), (b:manoDerecha { p1: "true", p2: "true", p3: "true", p4: "false" } ) CREATE (a)-[:TIENE]->(b)
MATCH (a:Test2 { fecha: "01-01-1995" } ), (b:manoIzquierda { p1: "true", p2: "true", p3: "true", p4: "false" } ) CREATE (a)-[:TIENE]->(b)
```

Besides this, you may note that the default medician is set to:  admin:1234.


## Using this project

We recommend using the [Ionic CLI](https://github.com/driftyco/ionic-cli) to create new Ionic projects that are based on this project but use a ready-made starter template.

For example, to start a new Ionic project with the default tabs interface, make sure the `ionic` utility is installed:

```bash
$ npm install -g ionic
```

Then run: 

```bash
$ ionic serve
```

For build:

```bash
$ ionic cordova platform add android
$ ionic build android
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.


## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/submit-issue/) to the main Ionic repository.
