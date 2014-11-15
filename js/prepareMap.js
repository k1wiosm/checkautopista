var userzoom = $.url().param("zoom");
var userlat = $.url().param("lat");
var userlon = $.url().param("lon");

if (userzoom == undefined) { zoom = 6; } else { zoom = userzoom; }
if (userlat == undefined) { lat = 40.179; } else { lat = userlat; }
if (userlon == undefined) { lon = -4.482; } else { lon = userlon; }

var map = L.map('map', {editInOSMControlOptions: {widget:"attributionBox", editors:["josm"]}}).setView([lat, lon], zoom);

L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a id="getpermalink">Get Permalink</a> | Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> with <a href="http://www.overpass-api.de/"">Overpass API</a>',
        maxZoom: 18,})
    .addTo(map);

L.control.locate().addTo(map);