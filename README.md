checkautopista
==============

http://checkautopista.hol.es/

Herramienta de control de calidad de autopistas en OSM. Se puede comprobar cualquier autopista del mundo, siempre y cuando esté marcada como relación con ```route=road```.

Funcionamiento interno: Para obtener los datos se utiliza Overpass API y se utiliza Leaflet para mostrarlos.

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

También aparecen marcados los peajes y las áreas de servicio y de descanso.


