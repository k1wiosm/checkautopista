var zoom = $.url().param("zoom");
var lat = $.url().param("lat");
var lon = $.url().param("lon");

if (zoom == undefined) {zoom = 6;};
if (lat == undefined) {lat = 40.179;};
if (lon == undefined) {lon = -4.482;};

var map = L.map('map', {editInOSMControlOptions: {widget:"attributionBox", editors:["josm"]}}).setView([lat, lon], zoom);

L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a id="getpermalink">Get Permalink</a> | Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> with <a href="http://www.overpass-api.de/"">Overpass API</a>',
        maxZoom: 18,})
    .addTo(map);

L.control.locate().addTo(map);