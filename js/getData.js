var a = $.url().param("a");
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

//Colores
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
// Añado:       Vías y salidas
// Compruebo:   maxspeed, lanes, name, ref, construction y proposed en vías
//              exit_to, name, ref en salidas

function addData1 () { 
    MarkerStyleDefault = {        // Estilo por defecto de los nodos
        radius: 6,
        fillColor: "#000000",
        color: "#000000",
        weight: 3,
        opacity: 1,
        fillOpacity: 1
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {
            if (feature.geometry.type=='LineString') {                          // Estilo de las vías  
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

            } else {                                                            // Estilo de los nodos
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

        },                                                                          //Configuro los popup de nodos y vías
        onEachFeature: function (feature, layer) {                                              //Popup de las vías
            if (feature.geometry.type=='LineString'){
                layer.bindPopup("<b>" + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + 
                    "</div><br/>lanes: " + feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='motorway_junction') {                         //Popup de las salidas
                if (feature.properties.tags.ref !== undefined) {        // Preparo la ref
                    ref = feature.properties.tags.ref
                } else {
                    ref = "&nbsp";
                }
                direcciones = [];
                if(feature.properties.tags.exit_to !== undefined) {     // Preparo las direcciones
                    direcciones=feature.properties.tags.exit_to.split(";");
                } else if (feature.properties.tags.name !== undefined) {
                    direcciones=feature.properties.tags.name.split(";");
                }
                popup = '<div class="senal">' +                         // Preparo el codigo HTML del popup
                            '<div class="senal senalElem" id="ref"><img src="img/salida.svg" height="20px"/>' + ref + '&nbsp</div>' +
                            '<div class="senal senalElem" id="destination">';
                for (i in direcciones) { 
                    if(esReferencia(direcciones[i])){ // Si tiene la referencia de carretera
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
                            '<div class="alltags">' + // Muestro todas las tags
                            '<b>' + $.i18n._('nodo') + ' ID: </b>' + feature.properties.id + ' ' + linkEditID("node", feature.properties.id); // Añado el link a editor ID
                for (key in feature.properties.tags) {                  
                    popup += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + feature.properties.tags[key];
                }
                popup += '</div>';
                layer.bindPopup(popup);

            }
            if (feature.properties.tags.highway=='construction') {                                  // Popup de las vías en construcción
                layer.bindPopup("<b>" + $.i18n._('ViaConstruccion') + ": " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + 
                    feature.properties.tags.lanes);
            }
            if (feature.properties.tags.highway=='proposed') {                                      // Popup de las vías propuestas
                layer.bindPopup("<b>" + $.i18n._('enproyecto') + ": " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
                    feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: " + feature.properties.tags.maxspeed + "<br/>lanes: " + 
                    feature.properties.tags.lanes);
            }
            if (feature.properties.tags.barrier=='toll_booth') {                                    // Popup de los peajes
                layer.bindPopup("<b>"+ $.i18n._('Peaje') + ": " + feature.properties.tags.name + "</b>" +
                    "<br>" + linkEditID("node", feature.properties.id) );
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, MarkerStyleDefault);        // Convierto los nodos en circleMarker
        }

    })
    .addTo(map);

    // Organizo los nodos y vías en grupos
    layers = capaDatos.getLayers()
    for (var i = 0; i < layers.length; i++) {                           
        if (layers[i].feature.geometry.type=='LineString') { // Organizo las vias
            grupoVias.push(layers[i]);
        } else if (layers[i].feature.properties.tags.highway=="motorway_junction") {    // Organizo las salidas
            if (layers[i].feature.properties.tags.ref!==undefined){ // Organizo según ref si o no
                grupoSalRef.push(layers[i]);
            } else {
                grupoSalNoRef.push(layers[i]);
            }
            if (layers[i].feature.properties.tags.exit_to!==undefined){ // Organizo segun exit_to, name o nada
                grupoSalExitTo.push(layers[i]);
            } else if (layers[i].feature.properties.tags.name!==undefined){
                grupoSalName.push(layers[i]);
            } else {
                grupoSalNada.push(layers[i]);
            }
        } else if (layers[i].feature.properties.tags.barrier=="toll_booth") {   // Organizo los peajes
            grupoPeaje.push(layers[i]);
        } else {
            grupoOtros.push(layers[i]);;    // Resto
        }
    };

    //Borro los nodos inutiles
    for (var i = 0; i < grupoOtros.length; i++) {
        map.removeLayer(grupoOtros[i]);
    };

    //Para ocultar datos
    actualizarGrupoEnMapa ("Peaje");
    actualizarGrupoEnMapa ("SalExitTo");
    actualizarGrupoEnMapa ("SalName");
    actualizarGrupoEnMapa ("SalNada");
    actualizarGrupoEnMapa ("SalRef");
    actualizarGrupoEnMapa ("SalNoRef");

}

// addData3
// Añado:       Áreas de servicio y Áreas de descanso
// Compruebo:   nombre

function addData3 () {
    MarkerStyleAreas = {        // Estilo por defecto de los nodos
        radius: 6,
        fillColor: colorAreasFondo,
        color: colorAreas,       //Color areas de servicio
        weight: 3,
        opacity: 1,
        fillOpacity: 1
    };

    capaDatos = new L.geoJson(dataGeoJSON, {
        style: function(feature) {  
            return {color: "#f043b4"}
        },
        onEachFeature: function (feature, layer) {                              //Configuro los popup
            var tipo;
            if (feature.properties.tags.highway=="services") {
                tipo="<img src='https://upload.wikimedia.org/wikipedia/commons/b/b6/Spain_traffic_signal_s127.svg' height=50px/>" + $.i18n._('areadeservicio');
            } else if (feature.properties.tags.highway=="rest_area") {
                tipo="<img src='https://upload.wikimedia.org/wikipedia/commons/5/56/Spain_traffic_signal_s123.svg' height=50px/>" + $.i18n._('areadedescanso');
            }
            if(feature.geometry.type=="Point"){
                layer.bindPopup("<b> " + tipo + ": " + feature.properties.tags.name + 
                    "<br>" + linkEditID("node", feature.properties.id) );
            } else {
                layer.bindPopup("<b> " + tipo + ": " + feature.properties.tags.name + 
                    "<br>" + linkEditID("way", feature.properties.id) );
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, MarkerStyleAreas);        // Convierto los nodos en circleMarker
        }

    })
    .addTo(map);

    // Organizo los nodos y vías en grupos
    layers = capaDatos.getLayers()
    for (var i = 0; i < layers.length; i++) {                           
        grupoAreas.push(layers[i]);
    };

    // Convierto las áreas a circulos
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
                    "<br>" + linkEditID("way", grupoAreas[i].feature.properties.id) );
                circulo.addTo(map);
                grupoAreas.push(circulo);
            }
        }
    };

    //Para ocultar datos
    actualizarGrupoEnMapa ("Areas");

}

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
                if (response.elements[i].type == "relation") {  // Ordeno los datos obtenidos en autopistas (relacion) y vias (ways)
                    autopistas.push({id:response.elements[i].id, ref:response.elements[i].tags.ref, members:response.elements[i].members});
                } else if (response.elements[i].type == "way") {
                    vias.push({id:response.elements[i].id, tags:response.elements[i].tags});
                }
            }

            var copiaautopistas = autopistas;
            autopistas = [];

            for (i in copiaautopistas) {    // Borro las autopistas que no lo son
                var primeravia = vias[findWithAttr(vias, "id", copiaautopistas[i].members[0].ref)]; //la primera via de la autopista
                if (primeravia) {
                    if (primeravia.tags) {
                        if (primeravia.tags.highway == "motorway" || primeravia.tags.highway == "motorway_link" || primeravia.tags.highway == "trunk" 
                        || primeravia.tags.highway == "trunk_link") {
                            autopistas.push(copiaautopistas[i]);
                        }
                    }
                }
            }

            autopistas.sort(function(a,b){      // Ordeno por referencia las autopistas
                if (a.ref > b.ref) {
                    return +1;
                } else {
                    return -1;
                }
            });
            
            for (i in autopistas) {     // Añado las autopistas al selector
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


// getData41 y getData51
// Obtengo: Vías de salidas
// Compruebo: destination, posibles salidas sin marcar

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
            MarkerStyleSalSinSal = {        // Estilo de los nodos de salida sin marcar
                radius: 6,
                fillColor: colorSalSinSalFondo,
                color: colorSalSinSal,       
                weight: 3,
                opacity: 1,
                fillOpacity: 1
            };
            MarkerStyleSalDestination = {   // Estilo de los nodos de salida con destination
                radius: 6,
                fillColor: "#000000",
                color: colorSalDestination,
                weight: 3,
                opacity: 1,
                fillOpacity: 1
            };
            var viasSalidas = response;

            for (var i = 0; i < viasSalidas.elements.length; i++) {
                if (viasSalidas.elements[i].type == "way") {            // Solo trabajo con las "way"s
                    if (viasSalidas.elements[i].tags.oneway == "-1") {  // Obtengo el ID del primer nodo de la salida
                        nodosalida = viasSalidas.elements[i].nodes.length; //Que me sirve para detectar si es salida o entrada
                    } else {
                        nodosalida = 0;
                    }
                    if (viasSalidas.elements[i].tags.access !== "no" && viasSalidas.elements[i].tags.access !== "private") { // Compruebo si es posible el acceso
                        var esSalida = true;
                        for (var m = 0; m < grupoVias.length; m++) { // Compruebo si realmente es una salida y no es parte de la autopista
                            if (grupoVias[m].feature.properties.id == viasSalidas.elements[i].id) {
                                esSalida = false;
                            }
                        };
                        if (esSalida) {
                            for (var j = 0; j < nodosAutopista.elements.length; j++) {  // Para cada nodo de la autopista
                                if (nodosAutopista.elements[j].id == viasSalidas.elements[i].nodes[nodosalida]) { //Busco el nodo de unión con la salida
                                    lat=nodosAutopista.elements[j].lat;
                                    lon=nodosAutopista.elements[j].lon;

                                    if (nodosAutopista.elements[j].tags == undefined) {  // Si no tiene tags lo marco como salida sin marcar
                                        circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalSinSal);
                                        circulo.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
                                        circulo.addTo(map);
                                        grupoSalSinSal.push(circulo);

                                    } else if (nodosAutopista.elements[j].tags.highway !== "motorway_junction" ) {  // Si no tiene motorway_junction  
                                        circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalSinSal);         // lo marco como salida sin marcar
                                        circulo.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
                                        circulo.addTo(map);
                                        grupoSalSinSal.push(circulo);
                                                                                        //  Si tiene destination lo marco como salida con destination
                                    } else if (nodosAutopista.elements[j].tags.name == undefined && nodosAutopista.elements[j].tags.exit_to == undefined) {
                                        if (viasSalidas.elements[i].tags.destination !== undefined){
                                            circulo = L.circleMarker(L.latLng(lat, lon), MarkerStyleSalDestination);
                                            circulo.feature = {properties: nodosAutopista.elements[j]}; // le copio las propiedades del nodo

                                            if (circulo.feature.properties.tags.ref !== undefined) {        // Preparo la ref
                                                ref = circulo.feature.properties.tags.ref
                                            } else {
                                                ref = "&nbsp";
                                            }
                                            direcciones=viasSalidas.elements[i].tags.destination.split(";"); // Preparo las direcciones

                                            popup = '<div class="senal">' +                         // Preparo el codigo HTML del popup
                                                        '<div class="senal senalElem" id="ref"><img src="img/salida.svg" height="20px"/>' + ref + '&nbsp</div>' +
                                                        '<div class="senal senalElem" id="destination">';
                                            for (p in direcciones) { 
                                                if(esReferencia(direcciones[p])){ // Si tiene la referencia de carretera
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
                                                        '<div class="alltags">' + // Muestro todas las tags
                                                        '<b>' + $.i18n._('nodo') + ' ID: </b>' + circulo.feature.properties.id + " " +
                                                        linkEditID("node", circulo.feature.properties.id); // Añado el link a editor ID
                                            for (key in circulo.feature.properties.tags) {                  
                                                popup += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + circulo.feature.properties.tags[key];
                                            }

                                            popup += '<br/><br/><b>' + $.i18n._('via') + ' ID: </b>' + viasSalidas.elements[i].id + " " +
                                                linkEditID("way", viasSalidas.elements[i].id); // Añado el link a editor ID
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

            //Borro los nodos que voy a actualizar con la nueva informacion de destination
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

            //Añado los nodos con la informacion de destination
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

            //Para ocultar datos
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

function linkEditID (type, id) {    // Para obtener el link de edición en el editor ID dados el tipo de via y el ID del objeto
    return "<a target='_blank' href='http://level0.osmz.ru/?url=%2F%2Foverpass-api.de%2Fapi%2Finterpreter%3Fdata%3D%" + 
        "253Cosm-script%2520output%253D%2522xml%2522%2520timeout%253D%252225%2522%253E%250A%2520%2520%253Cunion%253E%250" + 
        "A%2520%2520%2520%2520%253Cquery%2520type%253D%2522" + type + "%2522%253E%250A%2520%2520%2520%2520%2520%2520%253Cid-query%" + 
        "2520type%253D%2522" + type + "%2522%2520ref%253D%2522" + id + 
        "%2522%252F%253E%250A%2520%2520%2520%2520%253C%252Fquery%253E%250A%2520%2520%253C%252Funion%253E%250A%2520%2520%253C" + 
        "print%2520mode%253D%2522meta%2522%252F%253E%250A%2520%2520%253Crecurse%2520type%253D%2522down%2522%252F%253E%250A%252" + 
        "0%2520%253Cprint%2520mode%253D%2522meta%2522%2520order%253D%2522quadtile%2522%252F%253E%250A%253C%252" + 
        "Fosm-script%253E'>level0<img class='link' src='img/link.png'/></a>";
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