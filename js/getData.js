var a = $.url().param("a");
var dataOSM;
var dataGeoJSON;
var capaDatos;
var i;

var grupoVias = [];
var grupoSalRefExitTo = [];
var grupoSalRefName = [];
var grupoSalRef = [];
var grupoSalNoRef = [];
var grupoSalDestination = [];
var grupoPeaje = [];
var grupoOtros = [];

var visibVias = true;
var visibSalRefExitTo = true;
var visibSalRefName = true;
var visibSalRef = true;
var visibSalNoRef = true;
var visibSalDestination = true;
var visibPeaje = true;
var visibOtros = true;


function addData() {
    geojsonMarkerOptions = {        // Estilo por defecto de los nodos
        radius: 5,
        fillColor: "#000000",
        color: "#000000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {
            if (feature.geometry.type=='LineString') {                          // Estilo de las vías  
                if (feature.properties.tags.highway=='construction'){
                    return {"color": "#000000"};
                } else if (feature.properties.tags.highway=='proposed'){
                    return {"color": "#82858a"};
                } else if (feature.properties.tags.name==undefined) {
                    return {"color": "#ff0000"};
                } else if (feature.properties.tags.maxspeed==undefined){
                    if (feature.properties.tags.lanes==undefined){
                        return {"color": "#D430AB"};
                    } else {
                        return {"color": "#ffff00"};
                    }
                } else if (feature.properties.tags.lanes==undefined){
                        return {"color": "#ff8d00"};
                } else {
                        return {"color": "#0000ff"};
                }

            } else {                                                            // Estilo de los nodos
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
                    
                }
            }

        },
        onEachFeature: function (feature, layer) {                              //Configuro los popup de nodos y vías
            if (feature.properties.tags.highway=='motorway' || feature.properties.tags.highway=='motorway_link'){
                layer.bindPopup("<b>" + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + 
                    "</div><br/>lanes: " + feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='motorway_junction') {
                layer.bindPopup("<b> Salida " + feature.properties.tags.ref + "</b><br/> name: " + feature.properties.tags.name + 
                    "<br/>exit_to: " + feature.properties.tags.exit_to + 
                    "<br><a target='_blank' href='http://level0.osmz.ru/?url=%2F%2Foverpass-api.de%2Fapi%2Finterpreter%3Fdata%3D%" + 
                    "253Cosm-script%2520output%253D%2522xml%2522%2520timeout%253D%252225%2522%253E%250A%2520%2520%253Cunion%253E%250" + 
                    "A%2520%2520%2520%2520%253Cquery%2520type%253D%2522node%2522%253E%250A%2520%2520%2520%2520%2520%2520%253Cid-query%" + 
                    "2520type%253D%2522node%2522%2520ref%253D%2522" + feature.properties.id + 
                    "%2522%252F%253E%250A%2520%2520%2520%2520%253C%252Fquery%253E%250A%2520%2520%253C%252Funion%253E%250A%2520%2520%253C" + 
                    "print%2520mode%253D%2522meta%2522%252F%253E%250A%2520%2520%253Crecurse%2520type%253D%2522down%2522%252F%253E%250A%252" + 
                    "0%2520%253Cprint%2520mode%253D%2522meta%2522%2520order%253D%2522quadtile%2522%252F%253E%250A%253C%252" + 
                    "Fosm-script%253E'>Editar en level0</a>");
            }
            if (feature.properties.tags.highway=='construction') {
                layer.bindPopup("<b>En construcción: " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + 
                    feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='proposed') {
                layer.bindPopup("<b>En proyecto: " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + 
                    feature.properties.tags.lanes);
            }
            if (feature.properties.tags.barrier=='toll_booth') {
                layer.bindPopup("<b>Peaje: " + feature.properties.tags.name + "</b>");
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);        // Convierto los nodos en circleMarker
        }

    })
    .addTo(map);

    // Organizo los nodos y vías en grupos
    layers = capaDatos.getLayers()
    for (var i = 0; i < layers.length; i++) {                           
        if (layers[i].feature.geometry.type=='LineString') {
            grupoVias.push(layers[i]);
        } else if (layers[i].feature.properties.tags.highway=="motorway_junction") {
            if (layers[i].feature.properties.tags.ref!==undefined){
                if (layers[i].feature.properties.tags.exit_to!==undefined){
                    grupoSalRefExitTo.push(layers[i]);
                } else if (layers[i].feature.properties.tags.name!==undefined){
                    grupoSalRefName.push(layers[i]);
                } else {
                    grupoSalRef.push(layers[i]);
                }
            } else {
                grupoSalNoRef.push(layers[i]);
            }
        } else if (layers[i].feature.properties.tags.barrier=="toll_booth") {
            grupoPeaje.push(layers[i]);
        } else {
            grupoOtros.push(layers[i]);;
        }
    };

    //Borro los nodos inutiles
    for (var i = 0; i < grupoOtros.length; i++) {
        map.removeLayer(grupoOtros[i]);
    };

    //Para ocultar datos
    if (!visibSalRefExitTo) {
        for (var i = 0; i < grupoSalRefExitTo.length; i++) {
            map.removeLayer(grupoSalRefExitTo[i]);
        };
    }
    if (!visibSalRefName) {
        for (var i = 0; i < grupoSalRefName.length; i++) {
            map.removeLayer(grupoSalRefName[i]);
        };
    }
    if (!visibSalRef) {
        for (var i = 0; i < grupoSalRef.length; i++) {
            map.removeLayer(grupoSalRef[i]);
        };
    }
    if (!visibSalNoRef) {
        for (var i = 0; i < grupoSalNoRef.length; i++) {
            map.removeLayer(grupoSalNoRef[i]);
        };
    }
    if (!visibPeaje) {
        for (var i = 0; i < grupoPeaje.length; i++) {
            map.removeLayer(grupoPeaje[i]);
        };
    }

}

function addData2() {
    geojsonMarkerOptions = {        // Estilo por defecto de los nodos
        radius: 5,
        fillColor: "#000000",
        color: "#000000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {
            return {"color":"#4DA038"}    //Color para salidas con destination

        },
        onEachFeature: function (feature, layer) {                              //Configuro los popup
            layer.bindPopup("<b> Salida " + feature.properties.tags.ref + 
                "<br><a target='_blank' href='http://level0.osmz.ru/?url=%2F%2Foverpass-api.de%2Fapi%2Finterpreter%3Fdata%3D%" + 
                "253Cosm-script%2520output%253D%2522xml%2522%2520timeout%253D%252225%2522%253E%250A%2520%2520%253Cunion%253E%250" + 
                "A%2520%2520%2520%2520%253Cquery%2520type%253D%2522node%2522%253E%250A%2520%2520%2520%2520%2520%2520%253Cid-query%" + 
                "2520type%253D%2522node%2522%2520ref%253D%2522" + feature.properties.id + 
                "%2522%252F%253E%250A%2520%2520%2520%2520%253C%252Fquery%253E%250A%2520%2520%253C%252Funion%253E%250A%2520%2520%253C" + 
                "print%2520mode%253D%2522meta%2522%252F%253E%250A%2520%2520%253Crecurse%2520type%253D%2522down%2522%252F%253E%250A%252" + 
                "0%2520%253Cprint%2520mode%253D%2522meta%2522%2520order%253D%2522quadtile%2522%252F%253E%250A%253C%252" + 
                "Fosm-script%253E'>Editar en level0</a>");
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);        // Convierto los nodos en circleMarker
        }

    })
    .addTo(map);

    // Organizo los nodos y vías en grupos
    layers = capaDatos.getLayers()
    for (var i = 0; i < layers.length; i++) {                           
        grupoSalDestination.push(layers[i]);
    };

    //Borro nodos repetidos
    var copiagrupoSalRef = grupoSalRef;
    var k;
    for (var i = 0; i < grupoSalDestination.length; i++) {
        for (var j = 0; j < copiagrupoSalRef.length; j++) {
            if (copiagrupoSalRef[j].feature.properties.id == grupoSalDestination[i].feature.properties.id){
                k = grupoSalRef.indexOf(copiagrupoSalRef[j]);
                map.removeLayer(copiagrupoSalRef[j]);
                grupoSalRef.splice(k,1);
            }
        };
    };

    //Para ocultar datos
    if (!visibSalDestination) {
        for (var i = 0; i < grupoSalDestination.length; i++) {
            map.removeLayer(grupoSalDestination[i]);
        };
    }

}

function getData () {
    consulta = '[maxsize:1073741824][out:json][timeout:25];area(3601311341)->.area;(relation["ref"="' + a + '"](area.area);way(r);node(w););out;';
    $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            dataOSM = response;
            dataGeoJSON = osmtogeojson(dataOSM, uninterestingTags = {
                "source": true,
                "source_ref": true,
                "source:ref": true,
                "history": true,
                "attribution": true,
                "created_by": true,
                "converted_by": false,
                "tiger:county": true,
                "tiger:tlid": true,
                "tiger:upload_uuid": true
            });
            addData();
            $("div#feedback").html("Datos cargados (1/2) .");
        }
    );
}

function getData2 () {

    consulta = '[maxsize:1073741824][out:json][timeout:25];area(3601311341)->.area;(relation["ref"="' + a + 
        '"](area.area);way(r);node(w););node(around:1)["highway"="motorway_junction"];way(around:1)["hig' + 
        'hway"="motorway_link"]["destination"~"."];node(around:1)["highway"="motorway_junction"];(._;>;);out body;';

    
    $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            dataOSM = response;
            dataGeoJSON = osmtogeojson(dataOSM, uninterestingTags = {
                "source": true,
                "source_ref": true,
                "source:ref": true,
                "history": true,
                "attribution": true,
                "created_by": true,
                "converted_by": false,
                "tiger:county": true,
                "tiger:tlid": true,
                "tiger:upload_uuid": true
            });
            addData2();
            $("div#feedback").html("Datos cargados (2/2) .");
        }
    );

}