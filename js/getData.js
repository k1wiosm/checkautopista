var dataOSM;
var dataGeoJSON;
var capaDatos;
var cargado;
var errores;

var rq1;
var rq3;
var rq41;
var rq51;

var grupoVias = [];
var grupoPeaje = [];
var grupoSalDestination = [];
var grupoSalExitTo = [];
var grupoSalName = [];
var grupoSalNada = [];
var grupoSalRef = [];
var grupoSalNoRef = [];
var grupoSalSinSal = [];
var grupoAreas = [];
var grupoOtros = [];

var grupos = [grupoPeaje, grupoSalDestination, grupoSalExitTo, grupoSalName, grupoSalNada, grupoSalRef, grupoSalNoRef, grupoSalSinSal, grupoAreas];
var gruposnombre = ["Peaje", "SalDestination", "SalExitTo", "SalName", "SalNada", "SalRef", "SalNoRef", "SalSinSal", "Areas"];

var visibVias = true;
var visibPeaje = true;
var visibSalDestination = true;
var visibSalExitTo = true;
var visibSalName = true;
var visibSalNada = true;
var visibSalRef = true;
var visibSalNoRef = true;
var visibSalSinSal = true;
var visibAreas = true;
var visibOtros = true;

//Colors
var colorPeaje = "#0000ff";
var colorPeajeFondo = "#55a0bd";
var colorSalDestination = "#1e452b";
var colorSalExitTo = "#00b140";
var colorSalName = "#00ffff";
var colorSalNada = "#ff0000";
var colorSalRefFondo = "#00ff00";
var colorSalNoRefFondo = "#eca411";
var colorSalSinSal = "#ae0000";
var colorSalSinSalFondo = "#985652";
var colorAreas = "#f043b4";
var colorAreasFondo = "#d48fd1";
var colorDesactivadoFondo = "#b7c3c2";

function getVisibleFreeways () {
    // Gets the freeways that are visible on the map and adds them to the selector

    bounds = map.getBounds();

    n = bounds._northEast.lat;
    e = bounds._northEast.lng;
    s = bounds._southWest.lat;
    w = bounds._southWest.lng;


    consulta = '[out:json][timeout:25];relation["route"="road"](' + s + ',' + w + ',' + n + ',' + e + ');(._;way(r););out body;'

    rq0 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {

            $("select[name=autopistas]").empty();
            var autopistas = [];
            var vias = [];
            for (i in response.elements) {
                if (response.elements[i].type == "relation") {  // Organize the received data on autopistas (relations) y vias (ways)
                    autopistas.push({id:response.elements[i].id, ref:response.elements[i].tags.ref, members:response.elements[i].members});
                } else if (response.elements[i].type == "way") {
                    vias.push({id:response.elements[i].id, tags:response.elements[i].tags});
                }
            }

            var copiaautopistas = autopistas;
            autopistas = [];

            for (i in copiaautopistas) {    // Delete false freeways
                var primeravia = vias[findWithAttr(vias, "id", copiaautopistas[i].members[0].ref)]; //The first way of the freeway
                if (primeravia) {
                    if (primeravia.tags) {
                        if (primeravia.tags.highway == "motorway" || primeravia.tags.highway == "motorway_link" || primeravia.tags.highway == "trunk" 
                        || primeravia.tags.highway == "trunk_link") {
                            autopistas.push(copiaautopistas[i]);
                        }
                    }
                }
            }

            autopistas.sort(function(a,b){      // Sort freeways by reference
                if (a.ref > b.ref) {
                    return +1;
                } else {
                    return -1;
                }
            });
            
            for (i in autopistas) {     // Add freeways to selector
                $("select[name=autopistas]").append('<option value="' + autopistas[i].id + '">' + autopistas[i].ref + '</option>');
            }

            $("div#feedback1").html($.i18n._('autopistascargadas'));
            $("input[name=cargar]").prop("disabled",false);
            $("input[name=ver]").prop("value",$.i18n._('verautopistas'));
            cargando=false;
            $("#selector").show();
        }
    )
    .fail( function() { 
        $("div#feedback1").html($.i18n._('erroralcargar') +".");
        $("input[name=cargar]").prop("disabled",false);
        $("input[name=ver]").prop("value",$.i18n._('verautopistas'));
        cargando=false;
    });
}

function getBasicData () {
    // Gets the data for addBasicData

    consulta = '[out:json][timeout:25];(relation(' + id + ');way(r);node(w););out body;';

    rq1 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
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
            addBasicData();
            cargado++;
            updateFeedback();
        }
    )
    .fail(function() { 
        errores++;
        updateFeedback();
    });
}

function addBasicData () { 
    // Adds:        Ways and exits
    // Checks:      maxspeed, lanes, name, ref, construction and proposed on ways
    //              exit_to, name, ref on exits

    MarkerStyleDefault = {        // Default style for the exit nodes
        radius: 6,
        fillColor: "#000000",
        color: "#000000",
        weight: 3,
        opacity: 1,
        fillOpacity: 1
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {
            if (feature.geometry.type=='LineString') {                          // Ways style  
                var dash = "1,0";
                if (feature.properties.tags.highway=='construction'){
                    return {"color": "#000000", opacity:"0.8"};
                } else if (feature.properties.tags.highway=='proposed'){
                    return {"color": "#82858a", opacity:"0.8"};
                } else if (feature.properties.tags.name==undefined) {
                    dash = "1,10";
                };
                if (feature.properties.tags.maxspeed==undefined){
                    if (feature.properties.tags.lanes==undefined){
                        return {"color": "#D430AB", dashArray: dash, opacity:"0.8"};
                    } else {
                        return {"color": "#ffff00", dashArray: dash, opacity:"0.8"};
                    }
                } else if (feature.properties.tags.lanes==undefined){
                        return {"color": "#ff8d00", dashArray: dash, opacity:"0.8"};
                } else {
                        return {"color": "#0000ff", dashArray: dash, opacity:"0.8"};
                }

            } else {                                                            // Nodes style
                if (feature.properties.tags.highway=="motorway_junction") {
                    if (feature.properties.tags.ref==undefined) {
                        if (feature.properties.tags.exit_to!==undefined){
                            return {fillColor: colorSalNoRefFondo, color: colorSalExitTo};
                        } else if (feature.properties.tags.name!==undefined){
                            return {fillColor: colorSalNoRefFondo, color: colorSalName};
                        } else {
                            return {fillColor: colorSalNoRefFondo, color: colorSalNada};
                        }
                    } else {

                        if (feature.properties.tags.exit_to!==undefined){
                            return {fillColor: colorSalRefFondo, color: colorSalExitTo};
                        } else if (feature.properties.tags.name!==undefined){
                            return {fillColor: colorSalRefFondo, color: colorSalName};
                        } else {
                            return {fillColor: colorSalRefFondo, color: colorSalNada};
                        }
                    }
                } else if (feature.properties.tags.barrier=="toll_booth") {
                    return {fillColor:colorPeajeFondo, color: colorPeaje};
                } else {
                    
                }
            }

        },                                                                          //Configure the ways and nodes popups
        onEachFeature: function (feature, layer) {                                              //Ways popups
            if (feature.geometry.type=='LineString'){
                layer.bindPopup("<b>" + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + 
                    "</div><br/>lanes: " + feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='motorway_junction') {                         //Exit popups
                if (feature.properties.tags.ref !== undefined) {        // Prepare the ref
                    var ref = feature.properties.tags.ref;
                } else {
                    var ref = "&nbsp";
                }

                var direcciones = "";
                if(feature.properties.tags.exit_to !== undefined) {     // Prepare the directions
                    direcciones = feature.properties.tags.exit_to;
                } else if (feature.properties.tags.name !== undefined) {
                    direcciones = feature.properties.tags.name;
                }

                popup = htmlPanel(direcciones, ref);
                popup += htmlShowAllTags ('node', feature.properties.id, feature.properties.tags, true);

                layer.bindPopup(popup);

            }
            if (feature.properties.tags.highway=='construction') {                                  // Popup of ways under construction
                layer.bindPopup("<b>" + $.i18n._('ViaConstruccion') + ": " + feature.properties.tags.name + 
                    " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + 
                    feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='proposed') {                                      // Popup of ways in project
                layer.bindPopup("<b>" + $.i18n._('enproyecto') + ": " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + 
                    feature.properties.tags.lanes);
            }
            if (feature.properties.tags.barrier=='toll_booth') {                                    // Popup of Tollbooth
                layer.bindPopup("<b>"+ $.i18n._('Peaje') + ": " + feature.properties.tags.name + "</b>" +
                    "<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("node", feature.properties.id) );
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, MarkerStyleDefault);        // Convert nodes to circleMarker
        }

    })
    .addTo(map);

    // Organize nodes and ways in groups
    layers = capaDatos.getLayers()
    for (var i = 0; i < layers.length; i++) {                           
        if (layers[i].feature.geometry.type=='LineString') {                                // Organize the ways
            grupoVias.push(layers[i]);

        } else if (layers[i].feature.properties.tags.highway=="motorway_junction") {        // Organizo the exits
            if (layers[i].feature.properties.tags.ref!==undefined){ // Organize depending on ref
                grupoSalRef.push(layers[i]);
            } else {
                grupoSalNoRef.push(layers[i]);
            }
            if (layers[i].feature.properties.tags.exit_to!==undefined){ //Organize depending on exit_to, name or nothing
                grupoSalExitTo.push(layers[i]);
            } else if (layers[i].feature.properties.tags.name!==undefined){
                grupoSalName.push(layers[i]);
            } else {
                grupoSalNada.push(layers[i]);
            }
        } else if (layers[i].feature.properties.tags.barrier=="toll_booth") {   // Organize the tollbooths
            grupoPeaje.push(layers[i]);
        } else {
            grupoOtros.push(layers[i]);;    // The rest
        }
    };

    // Delete unused nodes
    for (var i = 0; i < grupoOtros.length; i++) {
        map.removeLayer(grupoOtros[i]);
    };

    // Hide data
    updateGroupVisib ("Peaje");
    updateGroupVisib ("SalExitTo");
    updateGroupVisib ("SalName");
    updateGroupVisib ("SalNada");
    updateGroupVisib ("SalRef");
    updateGroupVisib ("SalNoRef");
}

function getAreas () {
    // Gets tha data for addAreas

    consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);(node(around:1000)["highway"~"services|rest_' + 
        'area"]->.x;way(around:1000)["highway"~"services|rest_area"];);(._;>;);out;';

    
    rq3 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
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
            addAreas();
            cargado++;
            updateFeedback();
        }
    )
    .fail(function() { 
        errores++;
        updateFeedback();
    });
}

function addAreas () {
    // Add:         Service and rest areas
    // Check:       name

    MarkerStyleAreas = {
        radius: 6,
        fillColor: colorAreasFondo,
        color: colorAreas,       //Service and rest areas color
        weight: 3,
        opacity: 1,
        fillOpacity: 1
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {  
            return {color: "#f043b4"}
        },
        onEachFeature: function (feature, layer) {      //Popup config
            var imgandtitle;
            if (feature.properties.tags.highway=="services") {
                imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/' + 
                    'Spain_traffic_signal_s127.svg" height=50px/>' + $.i18n._('areadeservicio');
            } else if (feature.properties.tags.highway=="rest_area") {
                imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/5/56/' + 
                    'Spain_traffic_signal_s123.svg" height=50px/>' + $.i18n._('areadedescanso');
            }
            if(feature.geometry.type=="Point"){
                layer.bindPopup("<b> " + imgandtitle + ": " + feature.properties.tags.name + 
                    "<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("node", feature.properties.id) );
            } else {
                layer.bindPopup("<b> " + imgandtitle + ": " + feature.properties.tags.name + 
                    "<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("way", feature.properties.id) );
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, MarkerStyleAreas);    // Convert nodes to circleMarker
        }

    })
    .addTo(map);

    // Organize service and rest areas in its group
    layers = capaDatos.getLayers()
    for (i in layers) {
        grupoAreas.push(layers[i]);
    };

    // Convert areas to nodes
    var grupoAreas_copy=grupoAreas;
    for (var i in grupoAreas_copy) {
        if(grupoAreas_copy[i].feature!==undefined){
            if(grupoAreas_copy[i].feature.geometry.type=="Polygon"){ // If it's an area
                var imgandtitle;
                if (grupoAreas_copy[i].feature.properties.tags.highway=="services") {
                    imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/' + 
                        'Spain_traffic_signal_s127.svg" height=50px/>' + $.i18n._('areadeservicio');
                } else if (grupoAreas_copy[i].feature.properties.tags.highway=="rest_area") {
                    imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/5/56/' + 
                        'Spain_traffic_signal_s123.svg" height=50px/>' + $.i18n._('areadedescanso');
                }
                circulo = L.circleMarker(grupoAreas_copy[i].getBounds().getCenter(), MarkerStyleAreas); // Create a node in the middle of the area
                circulo.bindPopup("<b> " + imgandtitle + ": " + grupoAreas[i].feature.properties.tags.name + 
                    "<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("way", grupoAreas[i].feature.properties.id) );
                circulo.addTo(map);
                grupoAreas.push(circulo);
            }
        }
    };

    // Hide data
    updateGroupVisib ("Areas");
}

function getDestinationUnmarked1 () {
    // Gets all nodes of the freeway
    // Loads them into getDestinationUnmarked2

    consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);out;';

    
    rq41 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            getDestinationUnmarked2(response);
            cargado++;
            updateFeedback();
        }
    )
    .fail(function() { 
        errores++;
        errores++;
        updateFeedback();
    });
}

function getDestinationUnmarked2 (response) {
    // Receives all nodes of the freeway from getDestinationUnmarked1
    // Gets exit ways
    // Checks destination, Possible unmarked exits

    var nodosAutopista = response; // each of the nodes of the freeway
    var nodosalida = 0;

    consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);way(bn);way._["highway"~"motorway_link|trunk_link|service"];(._;>;);out;'; 

    
    rq51 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            MarkerStyleSalSinSal = {        // Possible Unmarked Exits style
                radius: 6,
                fillColor: colorSalSinSalFondo,
                color: colorSalSinSal,       
                weight: 3,
                opacity: 1,
                fillOpacity: 1
            };
            MarkerStyleSalDestination = {   // Exits with destination style
                radius: 6,
                fillColor: "#000000",
                color: colorSalDestination,
                weight: 3,
                opacity: 1,
                fillOpacity: 1
            };
            var viasSalidas = response;     // motorway_link ways

            for (var i in viasSalidas.elements) {
                if (viasSalidas.elements[i].type == "way") {            // Select only ways
                    if (viasSalidas.elements[i].tags.oneway == "-1") {  // If oneway=-1 then the first node of the way is listed the last one
                        nodosalida = viasSalidas.elements[i].nodes.length;
                    } else {
                        nodosalida = 0;
                    }
                    if (viasSalidas.elements[i].tags.access !== "no" && viasSalidas.elements[i].tags.access !== "private") { // Check if access is possible
                        var esSalida = true;
                        for (m in grupoVias) { // If the motorway_link is part of the freeway then it's not an exit
                            if (grupoVias[m].feature.properties.id == viasSalidas.elements[i].id) {
                                esSalida = false;
                            }
                        };
                        if (esSalida) {     // If we determined that is really an exit
                            for (j in nodosAutopista.elements) {  // For each node on the freeway
                                if (nodosAutopista.elements[j].id == viasSalidas.elements[i].nodes[nodosalida]) { // Get the junction node
                                    var lat=nodosAutopista.elements[j].lat; // Junction node lat and long
                                    var lon=nodosAutopista.elements[j].lon;

                                    if (nodosAutopista.elements[j].tags == undefined) {  // If the junction node has no tags then mark it as Possible Unmarked Exit
                                        circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalSinSal);
                                        circulo.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
                                        circulo.addTo(map);
                                        grupoSalSinSal.push(circulo);

                                    } else if (nodosAutopista.elements[j].tags.highway !== "motorway_junction" ) {  // If the junction node has no highway=motorway_junction  
                                        circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalSinSal);         // then mark it as Possible Unmarked Exit
                                        circulo.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
                                        circulo.addTo(map);
                                        grupoSalSinSal.push(circulo);
                                                                                        //  If the junction node has destination then mark it as Exit with Destination
                                    } else if (nodosAutopista.elements[j].tags.name == undefined && nodosAutopista.elements[j].tags.exit_to == undefined) {
                                        if (viasSalidas.elements[i].tags.destination !== undefined){
                                            circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalDestination);
                                            circulo.feature = {properties: nodosAutopista.elements[j]}; // Copy the node properties

                                            if (circulo.feature.properties.tags.ref !== undefined) { // It the junction node has a reference we get it
                                                ref = circulo.feature.properties.tags.ref;
                                            } else {
                                                ref = "&nbsp";
                                            }

                                            popup = htmlPanel(viasSalidas.elements[i].tags.destination, ref);
                                            popup += htmlShowAllTags ('node', circulo.feature.properties.id, circulo.feature.properties.tags, true);
                                            popup += htmlShowAllTags ('way', viasSalidas.elements[i].id, viasSalidas.elements[i].tags, false);

                                            circulo.bindPopup(popup);

                                            if (circulo.feature.properties.tags.ref == undefined) {
                                                circulo.setStyle({fillColor:colorSalNoRefFondo});
                                            } else {
                                                circulo.setStyle({fillColor:colorSalRefFondo});
                                            }
                                            circulo.addTo(map);
                                            grupoSalDestination.push(circulo);
                                        }
                                    }
                                };
                            };
                        }
                    }
                };
            };

            // Delete old nodes that I'll update now with the destination info
            grupoSalRef = deleteOldNodes(grupoSalRef, grupoSalDestination);
            grupoSalNoRef = deleteOldNodes(grupoSalNoRef, grupoSalDestination);
            grupoSalNada = deleteOldNodes(grupoSalNada, grupoSalDestination);

            // Add nodes with destination=*
            for (var i = 0; i < grupoSalDestination.length; i++) {
                if (grupoSalDestination[i].feature.properties.tags.ref !==undefined){
                    grupoSalRef.push(grupoSalDestination[i]);
                } else {
                    grupoSalNoRef.push(grupoSalDestination[i]);
                }
            };
            for (var i = 0; i < grupoSalDestination.length; i++) {
                map.addLayer(grupoSalDestination[i]);
            };

            // Hide data
            updateGroupVisib ("SalRef");
            updateGroupVisib ("SalNoRef");
            updateGroupVisib ("SalDestination");
            updateGroupVisib ("SalSinSal");

            cargado++;
            updateFeedback();
        }
    )
    .fail(function() { 
        errores++;
        updateFeedback();
    });
}

function getFreewayRefAndLoadIt () { 
    // Adds the desired freeway (getting the id from permalink) to the selector
    // Calls other functions to load the freeway

    consulta = '[out:json][timeout:10];relation(' + id + ');out bb;';

    rq1 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            if(response.elements[0]) {
                if (!(userlat && userlon && userzoom)) { // If there is not a desired location, fit the data
                    var n = response.elements[0].bounds.maxlat;
                    var w = response.elements[0].bounds.minlon;
                    var s = response.elements[0].bounds.minlat;
                    var e = response.elements[0].bounds.maxlon;
                    map.fitBounds([[s, w],[n, e]]);
                }

                var ref = response.elements[0].tags.ref;
                $("select[name=autopistas]").append('<option value="' + id + '">' + ref + '</option>');
                $("input[name=cargar]").prop("disabled", false );
                Cargar();
            } else {
                console.log("ERROR: Wrong ID.");
            }
        }
    )
    .fail(function() { 
        $("div#feedback1").html($.i18n._('erroralcargar'));
    });
}

function esReferencia(string) {
    return (string.indexOf("1") !== -1 || string.indexOf("2") !== -1 || string.indexOf("3") !== -1 || string.indexOf("4") !== -1 || 
        string.indexOf("5") !== -1 || string.indexOf("6") !== -1 || string.indexOf("7") !== -1 || string.indexOf("8") !== -1 || 
        string.indexOf("9") !== -1 || string.indexOf("0") !== -1);
}

function findWithAttr(array, attr, value) {
    var i;
    for (i in array) {
        if (array[i][attr] == value) {
            return i;
        }
    }
}

function deleteOldNodes (groupToDelete, groupNew) {
    // Deletes old nodes that are in groupToDelete that also are in groupNew
    // This is used to update with Tag:destination=* info

    var copygroupToDelete = groupToDelete;
    var k;
    for (var i = 0; i < groupNew.length; i++) {
        for (var j = 0; j < copygroupToDelete.length; j++) {
            if (copygroupToDelete[j].feature.properties.id == groupNew[i].feature.properties.id){
                map.removeLayer(copygroupToDelete[j]);
                k = groupToDelete.indexOf(copygroupToDelete[j]);
                groupToDelete.splice(k,1);
            };
        };
    };
    return groupToDelete;
}

function updateFeedback () {
    if (cargado > 0) {
        $("div#feedback1").html($.i18n._('datoscargados') + " (" + cargado + "/4).");
    };
    if (errores > 0) {
        $("div#feedback2").html($.i18n._('erroralcargar') + " (" + errores + "/4)." );
    };
    if (cargado + errores == 4) {
        $("input[name=cargar]").prop("value", $.i18n._('cargar') );
        if (cargado == 0) {
            $("#feedback1").html("");
        };
        $("input[name=ver]").prop("disabled",false);
        cargando=false;
    };
}

function htmlLinkEditors (type, id) {
    // Gives the html code for the link to the editors.
    // Needs the type of element ("way", "node") and it's ID.

    return '<a target="_blank" href="http://level0.osmz.ru/?url=' + type + '/' + id + '">level0<img class="link" src="img/link.png"/></a>' + 
    '<a target="_blank" href="http://127.0.0.1:8111/load_object?new_layer=false&objects=' + type + id + '">JOSM<img class="link" src="img/link.png"/></a>';
}

function htmlPanel (destination, ref) {
    // Prepares the html code of a panel simulating the real physical panel on highways that indicate the exits.
    // Needs as input the destination and ref.

    var destinationLine=destination.split(";"); // The character ; is assumed to separate different lines (like a Carriage Return)

    var html = '<div class="senal">' +
        '<div class="senal senalElem" id="ref"><img src="img/salida.svg" height="20px"/>' + ref + '&nbsp</div>' +
        '<div class="senal senalElem" id="destination">';

    for (var p in destinationLine) { 
        if(esReferencia(destinationLine[p])){ // If it has a reference in the directions
            var eachdestination = destinationLine[p].split(" ");
            for (q in eachdestination) {
                if (esReferencia(eachdestination[q])){
                    html += '<div class="senalReferencia">&nbsp' + eachdestination[q] + '&nbsp</div> ';
                } else {
                    html += ' ' + eachdestination[q];
                }
            }
            html += '<br/>';
        } else {
            html += destinationLine[p] + '<br/>';
        }
    }

    html += '</div></div>';

    return html;

}

function htmlShowAllTags (type, id, tags, first) {
    // Gives the html code showing the id of the node or way and all of its tags and links to editors.
    // Needs a type of element ("way", "node"), the id of the element and the desired tags.
    // If it's the first element of the popup then mark first=true. This will create the button to show all tags.

    if (first) {
        var html = '<div class="mostrar">' + $.i18n._('mostrartodastags') + '</div>';
    } else {
        var html = '';
    }

    if (type == 'way') {
        var tipo = 'via';
    } else if (type == 'node') {
        var tipo = 'nodo';
    }

    html += '<div class="alltags">';
    html += '<b>' + $.i18n._(tipo) + ' ID: </b>' + id + "<br/>&nbsp&nbsp&nbsp" +
        htmlLinkEditors(type, id); // Add Link to editors

    for (var key in tags) {
        html += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + tags[key];
    }

    html += '</div>';

    return html;

}