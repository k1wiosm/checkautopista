var map = L.map('map').setView([40.179, -4.482], 6);


mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; ' + mapLink + " with <a href='http://www.overpass-api.de/'>Overpass API</a>",
        maxZoom: 18,})
    .addTo(map);

// var marker = L.marker([40.06556, -2.13284],
//     {title: 'Cuenca pues'})
//     .addTo(map)
//     .bindPopup("<b>Cuenca</b><br>Que bella eres.")
//     .openPopup();

L.control.locate({
    // follow: false,  // follow the user's location
}).addTo(map);