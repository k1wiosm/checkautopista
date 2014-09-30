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
* destination
* exit_to
* name

También aparecen marcados los peajes.


