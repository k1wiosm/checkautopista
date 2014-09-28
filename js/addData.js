var geojsonMarkerOptions;
var capaDatos;

function addData() {
    geojsonMarkerOptions = {
        radius: 5,
        fillColor: "#000000",
        color: "#000000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {
            if (feature.geometry.type=='LineString') {                          // Vías  
                if (feature.properties.tags.highway=='construction'){
                    return {"color": "#000000"};
                } else if (feature.properties.tags.highway=='proposed'){
                    return {"color": "#82858a"};
                } else if (feature.properties.tags.name==undefined) {
                    return {"color": "#ff0000"};
                } else if (feature.properties.tags.maxspeed==undefined || feature.properties.tags.lanes==undefined) {
                    return {"color": "#ffff00"};
                } else {
                    return {"color": "#0000ff"};
                }
            } else {                                                            // Nodos
                if (feature.properties.tags.highway=="motorway_junction") {
                    if (feature.properties.tags.ref!==undefined){
                        if (feature.properties.tags.exit_to!==undefined){
                            return {"color": "#00ff00"};
                        } else if (feature.properties.tags.name!==undefined){
                            return {"color": "#00ffff"};
                        } else {
                            return {"color": "#ff8800"};
                        }
                    } else {
                        return {"color": "#ff0000"};
                    }
                } else if (feature.properties.tags.barrier=="toll_booth") {
                    return {"color": "#0000ff"};
                } else {
                    return {"radius": 0, "opacity": 0, "fillOpacity": 0};
                }

            }

        },
        onEachFeature: function (feature, layer) {
            if (feature.properties.tags.highway=='motorway' || feature.properties.tags.highway=='motorway_link'){
                layer.bindPopup("<b>" + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + "</div><br/>lanes: " + feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='motorway_junction') {
                layer.bindPopup("<b> Salida " + feature.properties.tags.ref + "</b><br/> name: " + feature.properties.tags.name + 
                    "<br/>exit_to: " + feature.properties.tags.exit_to + 
                    "<br><a target='_blank' href='http://level0.osmz.ru/?url=%2F%2Foverpass-api.de%2Fapi%2Finterpreter%3Fdata%3D%253Cosm-script%2520output%253D%2522xml%2522%2520timeout%253D%252225%2522%253E%250A%2520%2520%253Cunion%253E%250A%2520%2520%2520%2520%253Cquery%2520type%253D%2522node%2522%253E%250A%2520%2520%2520%2520%2520%2520%253Cid-query%2520type%253D%2522node%2522%2520ref%253D%2522" + 
                    feature.properties.id + "%2522%252F%253E%250A%2520%2520%2520%2520%253C%252Fquery%253E%250A%2520%2520%253C%252Funion%253E%250A%2520%2520%253Cprint%2520mode%253D%2522meta%2522%252F%253E%250A%2520%2520%253Crecurse%2520type%253D%2522down%2522%252F%253E%250A%2520%2520%253Cprint%2520mode%253D%2522meta%2522%2520order%253D%2522quadtile%2522%252F%253E%250A%253C%252Fosm-script%253E'>Editar en level0</a>");
            }
            if (feature.properties.tags.highway=='construction') {
                layer.bindPopup("<b>En construcción: " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='proposed') {
                layer.bindPopup("<b>En proyecto: " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + feature.properties.tags.lanes);
            }
            if (feature.properties.tags.barrier=='toll_booth') {
                layer.bindPopup("<b>Peaje: " + feature.properties.tags.name + "</b>");
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }

    })
    .addTo(map);
}
