checkautopista
==============

http://checkautopista.hol.es/

Herramienta de control de calidad de las autopistas españolas en la base de datos de OSM.

Para obtener los datos utiliza Overpass API, los datos son convertidos con osmtogeojson y se utiliza Leaflet para mostrarlos.

Control de calidad
==================

Se permite elegir una autopista y se comprueba la siguiente información:

* name
* ref
* maxspeed
* lanes

En las salidas se comprueba:

* ref
* exit_to
* name

Las salidas que usan destination aparecen como incorrectas.
