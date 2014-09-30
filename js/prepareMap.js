var map = L.map('map', {editInOSMControlOptions: {widget:"attributionBox", editors:["josm"]}}).setView([40.179, -4.482], 6);

L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> with <a href="http://www.overpass-api.de/"">Overpass API</a>',
        maxZoom: 18,})
    .addTo(map);

L.control.locate().addTo(map);