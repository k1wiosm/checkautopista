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



// addData1
// Adds:        Ways and exits
// Checks:      maxspeed, lanes, name, ref, construction and proposed on ways
//              exit_to, name, ref on exits

function addData1 () { 
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
                    ref = feature.properties.tags.ref
                } else {
                    ref = "&nbsp";
                }
                direcciones = [];
                if(feature.properties.tags.exit_to !== undefined) {     // Prepare the directions
                    direcciones=feature.properties.tags.exit_to.split(";");
                } else if (feature.properties.tags.name !== undefined) {
                    direcciones=feature.properties.tags.name.split(";");
                }
                popup = '<div class="senal">' +                         // Prepare the HTML code of the popup
                            '<div class="senal senalElem" id="ref"><img src="img/salida.svg" height="20px"/>' + ref + '&nbsp</div>' +
                            '<div class="senal senalElem" id="destination">';
                for (i in direcciones) { 
                    if(esReferencia(direcciones[i])){ // If it has a reference in the directions
                        direccion = direcciones[i].split(" ");
                        for (j in direccion) {
                            if (esReferencia(direccion[j])){
                                popup += '<div class="senalReferencia">&nbsp' + direccion[j] + '&nbsp</div> ';
                            } else {
                                popup += ' ' + direccion[j];
                            }
                        }
                        popup += '<br/>';
                    } else {
                        popup += direcciones[i] + '<br/>';
                    }
                }
                popup +=    '</div></div>' + 
                            '<div class="mostrar">' + $.i18n._('mostrartodastags') + '</div>' + 
                            '<div class="alltags">' + // Show all tags
                            '<b>' + $.i18n._('nodo') + ' ID: </b>' + feature.properties.id + '<br/>&nbsp&nbsp&nbsp' + linkEditors("node", feature.properties.id); // Link to editors
                for (key in feature.properties.tags) {                  
                    popup += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + feature.properties.tags[key];
                }
                popup += '</div>';
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
                    "<br>&nbsp&nbsp&nbsp" + linkEditors("node", feature.properties.id) );
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
    actualizarGrupoEnMapa ("Peaje");
    actualizarGrupoEnMapa ("SalExitTo");
    actualizarGrupoEnMapa ("SalName");
    actualizarGrupoEnMapa ("SalNada");
    actualizarGrupoEnMapa ("SalRef");
    actualizarGrupoEnMapa ("SalNoRef");
}

// addData3
// Add:         Service and rest areas
// Check:       name

function addData3 () {
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
        onEachFeature: function (feature, layer) {                              //Popup config
            var tipo;
            if (feature.properties.tags.highway=="services") {
                tipo="<img src='https://upload.wikimedia.org/wikipedia/commons/b/b6/Spain_traffic_signal_s127.svg' height=50px/>" + $.i18n._('areadeservicio');
            } else if (feature.properties.tags.highway=="rest_area") {
                tipo="<img src='https://upload.wikimedia.org/wikipedia/commons/5/56/Spain_traffic_signal_s123.svg' height=50px/>" + $.i18n._('areadedescanso');
            }
            if(feature.geometry.type=="Point"){
                layer.bindPopup("<b> " + tipo + ": " + feature.properties.tags.name + 
                    "<br>&nbsp&nbsp&nbsp" + linkEditors("node", feature.properties.id) );
            } else {
                layer.bindPopup("<b> " + tipo + ": " + feature.properties.tags.name + 
                    "<br>&nbsp&nbsp&nbsp" + linkEditors("way", feature.properties.id) );
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, MarkerStyleAreas);        // Convert nodes to circleMarker
        }

    })
    .addTo(map);

    // Organize service and rest areas in its group
    layers = capaDatos.getLayers()
    for (var i = 0; i < layers.length; i++) {                           
        grupoAreas.push(layers[i]);
    };

    // Convert areas to nodes
    for (var i = 0; i < grupoAreas.length; i++) {
        if(grupoAreas[i].feature!==undefined){
            if(grupoAreas[i].feature.geometry.type=="Polygon"){
                var tipo;
                if (grupoAreas[i].feature.properties.tags.highway=="services") {
                    tipo="<img src='https://upload.wikimedia.org/wikipedia/commons/b/b6/Spain_traffic_signal_s127.svg' height=50px/>" + $.i18n._('areadeservicio');
                } else if (grupoAreas[i].feature.properties.tags.highway=="rest_area") {
                    tipo="<img src='https://upload.wikimedia.org/wikipedia/commons/5/56/Spain_traffic_signal_s123.svg' height=50px/>" + $.i18n._('areadedescanso');
                }
                circulo = L.circleMarker(grupoAreas[i].getBounds().getCenter(), MarkerStyleAreas);
                circulo.bindPopup("<b> " + tipo + ": " + grupoAreas[i].feature.properties.tags.name + 
                    "<br>&nbsp&nbsp&nbsp" + linkEditors("way", grupoAreas[i].feature.properties.id) );
                circulo.addTo(map);
                grupoAreas.push(circulo);
            }
        }
    };

    // Hide data
    actualizarGrupoEnMapa ("Areas");
}

// getData0
// Gets the freeways that are visible on the map and adds them to the selector

function getData0 () {

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
        }
    )
    .fail( function() { 
        $("div#feedback1").html($.i18n._('erroralcargar') +".");
        $("input[name=cargar]").prop("disabled",false);
        $("input[name=ver]").prop("value",$.i18n._('verautopistas'));
        cargando=false;
    });
}

// getData1
// Gets the data for addData1

function getData1 () {

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
            addData1();
            cargado++;
            $("div#feedback1").html($.i18n._('datoscargados') + " (" + cargado + "/4).");
            if (cargado + errores == 4) {
                $("input[name=cargar]").prop("value", $.i18n._('cargar') );
                if (cargado == 0) {
                    $("#feedback1").html("");
                }
                $("input[name=ver]").prop("disabled",false);
                cargando=false;
            }
        }
    )
    .fail(function() { 
        errores++;
        $("div#feedback2").html($.i18n._('erroralcargar') + " (" + errores + "/4)." );
        if (cargado + errores == 4) {
            $("input[name=cargar]").prop("value", $.i18n._('cargar') );
            if (cargado == 0) {
                $("#feedback1").html("");
            }
            $("input[name=ver]").prop("disabled",false);
            cargando=false;
        }
    });
}

// getData3
// Gets tha data for addData3

function getData3 () {

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
            addData3();
            cargado++;
            $("div#feedback1").html($.i18n._('datoscargados') + " (" + cargado + "/4).");
            if (cargado + errores == 4) {
                $("input[name=cargar]").prop("value", $.i18n._('cargar') );
                if (cargado == 0) {
                    $("#feedback1").html("");
                }
                $("input[name=ver]").prop("disabled",false);
                cargando=false;
            }
        }
    )
    .fail(function() { 
        errores++;
        $("div#feedback2").html($.i18n._('erroralcargar') + " (" + errores + "/4)." );
        if (cargado + errores == 4) {
            $("input[name=cargar]").prop("value", $.i18n._('cargar') );
            if (cargado == 0) {
                $("#feedback1").html("");
            }
            $("input[name=ver]").prop("disabled",false);
            cargando=false;
        }
    });
}

// getData41 and getData51
// Obtain:      Exit ways
// Check:       destination, Possible unmarked exits

function getData41 () {

    consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);out;';

    
    rq41 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            getData51(response);
            cargado++;
            $("div#feedback1").html($.i18n._('datoscargados') + " (" + cargado + "/4).");
        }
    )
    .fail(function() { 
        errores++;
        errores++;
        $("div#feedback2").html($.i18n._('erroralcargar') + " (" + errores + "/4)." );
        if (cargado + errores == 4) {
            $("input[name=cargar]").prop("value", $.i18n._('cargar') );
            if (cargado == 0) {
                $("#feedback1").html("");
            }
            $("input[name=ver]").prop("disabled",false);
            cargando=false;
        }
    });
}

function getData51 (response) {

    var nodosAutopista = response;
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
            var viasSalidas = response;

            for (var i = 0; i < viasSalidas.elements.length; i++) {
                if (viasSalidas.elements[i].type == "way") {            // I get only the "way"s
                    if (viasSalidas.elements[i].tags.oneway == "-1") {  // Get the ID of the first node on the way
                        nodosalida = viasSalidas.elements[i].nodes.length; // And I use it to detect if it's an exit or an entry to the freeway
                    } else {
                        nodosalida = 0;
                    }
                    if (viasSalidas.elements[i].tags.access !== "no" && viasSalidas.elements[i].tags.access !== "private") { // Check if access is possible
                        var esSalida = true;
                        for (var m = 0; m < grupoVias.length; m++) { // Check if it's actually an exit or if it's part of the freeway
                            if (grupoVias[m].feature.properties.id == viasSalidas.elements[i].id) {
                                esSalida = false;
                            }
                        };
                        if (esSalida) {
                            for (var j = 0; j < nodosAutopista.elements.length; j++) {  // For each node on the freeway
                                if (nodosAutopista.elements[j].id == viasSalidas.elements[i].nodes[nodosalida]) { // Get the junction node
                                    lat=nodosAutopista.elements[j].lat;
                                    lon=nodosAutopista.elements[j].lon;

                                    if (nodosAutopista.elements[j].tags == undefined) {  // If it has no tags, I mark it as Possible Unmarked Exit
                                        circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalSinSal);
                                        circulo.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
                                        circulo.addTo(map);
                                        grupoSalSinSal.push(circulo);

                                    } else if (nodosAutopista.elements[j].tags.highway !== "motorway_junction" ) {  // If it has no motorway_junction  
                                        circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalSinSal);         // I mark it as Possible Unmarked Exit
                                        circulo.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
                                        circulo.addTo(map);
                                        grupoSalSinSal.push(circulo);
                                                                                        //  If it has destination I mark it as Exit with Destination
                                    } else if (nodosAutopista.elements[j].tags.name == undefined && nodosAutopista.elements[j].tags.exit_to == undefined) {
                                        if (viasSalidas.elements[i].tags.destination !== undefined){
                                            circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalDestination);
                                            circulo.feature = {properties: nodosAutopista.elements[j]}; // Copy the node properties

                                            if (circulo.feature.properties.tags.ref !== undefined) {        // Prepare the ref
                                                ref = circulo.feature.properties.tags.ref
                                            } else {
                                                ref = "&nbsp";
                                            }
                                            direcciones=viasSalidas.elements[i].tags.destination.split(";"); // Prepare the directions

                                            popup = '<div class="senal">' +                         // Prepare popup HTML code
                                                        '<div class="senal senalElem" id="ref"><img src="img/salida.svg" height="20px"/>' + ref + '&nbsp</div>' +
                                                        '<div class="senal senalElem" id="destination">';
                                            for (p in direcciones) { 
                                                if(esReferencia(direcciones[p])){ // If it has a reference in the directions
                                                    direccion = direcciones[p].split(" ");
                                                    for (q in direccion) {
                                                        if (esReferencia(direccion[q])){
                                                            popup += '<div class="senalReferencia">&nbsp' + direccion[q] + '&nbsp</div> ';
                                                        } else {
                                                            popup += ' ' + direccion[q];
                                                        }
                                                    }
                                                    popup += '<br/>';
                                                } else {
                                                    popup += direcciones[p] + '<br/>';
                                                }
                                            }

                                            popup +=    '</div></div>' + 
                                                        '<div class="mostrar">' + $.i18n._('mostrartodastags') + '</div>' + 
                                                        '<div class="alltags">' + // Show all tags
                                                        '<b>' + $.i18n._('nodo') + ' ID: </b>' + circulo.feature.properties.id + "<br/>&nbsp&nbsp&nbsp" +
                                                        linkEditors("node", circulo.feature.properties.id); // Add Link to editors
                                            for (key in circulo.feature.properties.tags) {                  
                                                popup += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + circulo.feature.properties.tags[key];
                                            }

                                            popup += '<br/><br/><b>' + $.i18n._('via') + ' ID: </b>' + viasSalidas.elements[i].id + "<br/>&nbsp&nbsp&nbsp" +
                                                linkEditors("way", viasSalidas.elements[i].id); // Add Link to editors
                                            for (key in viasSalidas.elements[i].tags) {                  
                                                popup += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + viasSalidas.elements[i].tags[key];
                                            }
                                            popup += '</div>';

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
            var copiagrupoSalNoRef = grupoSalNoRef;
            var k;
            for (var i = 0; i < grupoSalDestination.length; i++) {
                for (var j = 0; j < copiagrupoSalNoRef.length; j++) {
                    if (copiagrupoSalNoRef[j].feature.properties.id == grupoSalDestination[i].feature.properties.id){
                        k = grupoSalNoRef.indexOf(copiagrupoSalNoRef[j]);
                        map.removeLayer(copiagrupoSalNoRef[j]);
                        grupoSalNoRef.splice(k,1);

                    }
                };
            };
            var copiagrupoSalNada = grupoSalNada;
            var k;
            for (var i = 0; i < grupoSalDestination.length; i++) {
                for (var j = 0; j < copiagrupoSalNada.length; j++) {
                    if (copiagrupoSalNada[j].feature.properties.id == grupoSalDestination[i].feature.properties.id){
                        k = grupoSalNada.indexOf(copiagrupoSalNada[j]);
                        map.removeLayer(copiagrupoSalNada[j]);
                        grupoSalNada.splice(k,1);
                        
                    }
                };
            };

            // Add nodes with destination=
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
            actualizarGrupoEnMapa ("SalRef");
            actualizarGrupoEnMapa ("SalNoRef");
            actualizarGrupoEnMapa ("SalDestination");
            actualizarGrupoEnMapa ("SalSinSal");

            cargado++;
            $("div#feedback1").html($.i18n._('datoscargados') + " (" + cargado + "/4).");
            if (cargado + errores == 4) {
                $("input[name=cargar]").prop("value", $.i18n._('cargar') );
                if (cargado == 0) {
                    $("#feedback1").html("");
                }
                $("input[name=ver]").prop("disabled",false);
                cargando=false;
            }
        }
    )
    .fail(function() { 
        errores++;
        $("div#feedback2").html($.i18n._('erroralcargar') + " (" + errores + "/4)." );
        if (cargado + errores == 4) {
            $("input[name=cargar]").prop("value", $.i18n._('cargar') );
            if (cargado == 0) {
                $("#feedback1").html("");
            }
            $("input[name=ver]").prop("disabled",false);
            cargando=false;
        }
    });
}

// getData6
// Adds the desired freeway (getting the id from permalink) to the selector and calls other functions to load it

function getData6 () { 

    consulta = '[out:json][timeout:10];relation(' + id + ');out bb;';

    rq1 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
        function (response) {
            if(response.elements[0]) {
                if (!(lat && lon && zoom)) {
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
                console.log("ERROR: ID incorrect.");
            }
        }
    )
    .fail(function() { 
        $("div#feedback1").html($.i18n._('erroralcargar'));
    });
}

function linkEditors (type, id) {
    return '<a target="_blank" href="http://level0.osmz.ru/?url=' + type + '/' + id + '">level0<img class="link" src="img/link.png"/></a>' + 
    '<a target="_blank" href="http://127.0.0.1:8111/load_object?new_layer=false&objects=' + type + id + '">JOSM<img class="link" src="img/link.png"/></a>';
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