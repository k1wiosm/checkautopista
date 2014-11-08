CheckAutopista
==============

http://checkautopista.hol.es/

Herramienta de control de calidad de autopistas en OSM. Se puede comprobar cualquier autopista del mundo, siempre y cuando esté marcada como relación con ```route=road```.
*Quality Assurance tool for motorways in OSM. It allows to check any motorway in the world, as long as it's tagged as a relation with ```route=road```.*

Funcionamiento interno: Para obtener los datos se utiliza Overpass API y se utiliza Leaflet para mostrarlos.
*How it works: To obtain the data it uses Overpass API and it uses Leaflet to show them.*

Control de Calidad *Quality Assurance*
======================================

Se permite elegir una autopista y se comprueba la siguiente información:
*You can choose a motorway and it checks the following information:*

* name
* ref
* maxspeed
* lanes

En las salidas se comprueba:
*On the exits it checks:*

* ref
* destination
* exit_to
* name

También aparecen marcados los peajes y las áreas de servicio y de descanso.
*Also it shows information about the tollbooths and the rest areas.*

Idiomas *Languages*
======================================

CheckAutopista está disponible en Catalán, Alemán, Inglés, Español, Francés, Portugués, Tagalo y Ucraniano. Puedes colaborar con la traducción aquí: https://www.transifex.com/projects/p/checkautopista/

*CheckAutopista is available in Catalán, German, English, Spanish, French, Portuguese, Tagalog and Ukranian. You can colaborate translating here: https://www.transifex.com/projects/p/checkautopista/*

