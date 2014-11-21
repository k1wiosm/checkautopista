var visibMenu = true;
var id;
var cargando = false;
$(document).ready( function() {

    //Legend buttons style
    $("#Peaje").css("border-color", colorPeaje);
    $("#Peaje").css("background-color", colorPeajeFondo);
    $("#SalDestination").css("border-color", colorSalDestination);
    $("#SalExitTo").css("border-color", colorSalExitTo);
    $("#SalName").css("border-color", colorSalName);
    $("#SalNada").css("border-color", colorSalNada);   
    $("#SalRef").css("border-color", "#ffffff");
    $("#SalRef").css("background-color", colorSalRefFondo);
    $("#SalNoRef").css("border-color", "#ffffff");
    $("#SalNoRef").css("background-color", colorSalNoRefFondo);
    $("#SalSinSal").css("border-color", colorSalSinSal);
    $("#SalSinSal").css("background-color", colorSalSinSalFondo);
    $("#Areas").css("border-color", colorAreas);
    $("#Areas").css("background-color", colorAreasFondo);

    //Detect wanted freeway from permalink
    id = $.url().param("id");
    if (id) {
        getFreewayRefAndLoadIt(id);
    }

    //"View" button
    $("input[name=ver]").click(function () {
        Ver();
    });

    //"Load" button
    $("input[name=cargar]").click(function () {
        Cargar();
    });

    //Hide data
    $(".boton").click(function () {
        ga('send', 'event', 'Esconder datos', 'click');
        nombre = this.id;
        window["visib" + nombre] = !window["visib" + nombre]; // Flip saved value in visib___
        updateGroupVisib(nombre);
    })

    //"Show all tags" button
    $(document).on('click', 'div.mostrar', function() {
        ga('send', 'event', 'Ver todas las tags', 'click');
        $("div.alltags").toggle();
    });

    //"Hide menu" button
    $("#mostrar").click(function(){
        $("#menu").toggle();
        visibMenu=!visibMenu;
        if (visibMenu) {
            ga('send', 'event', 'Mostrar menu', 'click');
            $("#mostrar").html($.i18n._('esconder') +" &#8594;");
        } else {
            ga('send', 'event', 'Esconder menu', 'click');
            $("#mostrar").html("&#8592;" + $.i18n._('mostrar'));
        }
    });

    //Permalink
    $("a#getpermalink").hover(function(){
        ga('send', 'event', 'Permalink', 'click');
        var lat = map.getCenter().lat;
        var lon = map.getCenter().lng;
        var zoom = map.getZoom(); 
        var link = "?lat=" + lat + "&lon=" + lon + "&zoom=" + zoom;
        if (id) {link += "&id=" + id; }     // If a freeway is loaded we save it in the permalink
        var lang = $.url().param("lang"); 
        if (lang) { link += "&lang=" + lang; } // If a language is loaded we save it in the permalink
        $(this).prop("href", link);
    });


    $("#menu").accordion({
        collapsible: true,
        heightStyle: "content"
    });
    
});

function Ver() {
    if (cargando) {
        $("input[name=ver]").prop("value",$.i18n._('ver'));
        rq0.abort();
    } else {
        ga('send', 'event', 'Ver', 'click');
        if (map.getZoom()>9) {
            cargando=true;
            $("input[name=ver]").prop("value",$.i18n._('cancelar'));
            $("input[name=cargar]").prop("disabled",true);
            $("div#feedback1").html($.i18n._('cargandoautopistas'));
            $("div#feedback2").html("");
            getVisibleFreeways();
        } else {
            $("div#feedback1").html($.i18n._('acercamas'));
            $("div#feedback2").html("");
        }
    }
}

function Cargar() {
    if (cargando) {
        $("input[name=cargar]").prop("value",$.i18n._('ver'));
        rq1.abort();
        rq3.abort();
        rq41.abort();
        rq51.abort();
    } else {
        cargando=true;
        $("input[name=cargar]").prop("value",$.i18n._('cancelar'));
        id=$("select[name=autopistas]").val();
        ga('send', 'event', 'Cargar', 'click', id);
        $("input[name=ver]").prop("disabled",true);
        $("div#feedback1").html($.i18n._('cargandodatos'));
        $("div#feedback2").html("");
        cargado=0;
        errores=0;
        getBasicData();
        getAreas();
        getDestinationUnmarked1();
    }
}

function updateGroupVisib (nombre) {
    // Hides or Shows the group on the map depending on the visib___ of that group
    
    visib = window["visib" + nombre];
    grupo = window["grupo" + nombre];
    if (window["color" + nombre + "Fondo"] !== undefined) { // Get the background color assigned to this grupo___
        colorBg = window["color" + nombre + "Fondo"];
    } else {
        colorBg = "white";
    }
    if (window["color" + nombre] !== undefined) {   // Get the border color assigned to this grupo___
        color = window["color" + nombre];
    } else {
        color = "white";
    }                                               // Hide or show nodes depending on visib___
    if (!visib) { // Hide nodes                                  
        $("#"+nombre).css("border-color", "white");     //Legend style
        $("#"+nombre).css("background-color", colorDesactivadoFondo);
        for (var i = 0; i < grupo.length; i++) { // For each node of this grupo___
            x = getGrupo(grupo[i]); // Groups this node is part of
            if(x.length>1) { // If it's part of more than one group
                if (nombre.indexOf("Ref") == -1) { // If it's not one of ref
                    grupo[i].setStyle({radius:5, color:"black", weight:1});
                    if (window["visib" + x[1]] == false) { // If the other group is also deactivated I delete the node
                    map.removeLayer(grupo[i]);
                    };
                } else { // If it's one of ref
                    grupo[i].setStyle({fillOpacity:0});
                    if (window["visib" + x[0]] == false) { // If the other group is also deactivated I delete the node
                    map.removeLayer(grupo[i]);
                    };
                };
            } else {
                map.removeLayer(grupo[i]);
            };
        };
    } else {    //Add nodes
        $("#"+nombre).css("border-color", color);   //Legend style
        $("#"+nombre).css("background-color", colorBg);
        for (var i = 0; i < grupo.length; i++) { // For each node if this grupo___
            if (nombre.indexOf("Ref") == -1) { // If it's not one of ref
                grupo[i].setStyle({radius:6, color:color, weight:3});
            } else { // If it's one of ref
                grupo[i].setStyle({fillOpacity:1});
            }
            map.addLayer(grupo[i]);
        };
    };
}

function getGrupo (elem) {
    var solucion = [];
    for (i in grupos) {
        if (grupos[i].indexOf(elem) > -1) {
            solucion.push(gruposnombre[i]);
        }
    }
    return solucion;
}