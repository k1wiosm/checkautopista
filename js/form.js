var visibSelector = true;
var id;
var cargando = false;
$(document).ready( function() {

    //Estilo de los botones de la leyenda
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

    //Botón Ver
    $("input[name=ver]").click(function () {
        if (cargando) {
            $(this).prop("value",$.i18n._('ver'));
            rq0.abort();
        } else {
            if (map.getZoom()>9) {
                cargando=true;
                $(this).prop("value",$.i18n._('cancelar'));
                $("input[name=cargar]").prop("disabled",true);
                $("div#feedback1").html($.i18n._('cargandoautopistas'));
                $("div#feedback2").html("");
                getData0();
            } else {
                $("div#feedback1").html($.i18n._('acercamas'));
                $("div#feedback2").html("");
            }
        }
    });

    //Botón Cargar
    $("input[name=cargar]").click(function () {
        if (cargando) {
            $(this).prop("value",$.i18n._('ver'));
            rq1.abort();
            rq3.abort();
            rq41.abort();
            rq51.abort();
        } else {
            cargando=true;
            $(this).prop("value",$.i18n._('cancelar'));
            id=$("select[name=autopistas]").val();
            $("input[name=ver]").prop("disabled",true);
            $("div#feedback1").html($.i18n._('cargandodatos'));
            $("div#feedback2").html("");
            cargado=0;
            errores=0;
            getData1();
            getData3();
            getData41();
        }
    });

    //Para ocultar datos
    $(".boton").click(function () {
        nombre = this.id;
        window["visib" + nombre] = !window["visib" + nombre]; // Invierto el valor guardado en visib___
        actualizarGrupoEnMapa(nombre);
    })

    //Botón Mostrar todo
    $(document).on('click', 'div.mostrar', function() {
        $("div.alltags").toggle();
    });

    //Boton esconder menu
    $("#mostrar").click(function(){
        $("#selector").toggle();
        visibSelector=!visibSelector;
        if (visibSelector) {
            $("#mostrar").html($.i18n._('esconder') +" &#8594;");
        } else {
            $("#mostrar").html("&#8592;" + $.i18n._('mostrar'));
        }
    });
    
});

function actualizarGrupoEnMapa (nombre) {
    visib = window["visib" + nombre];
    grupo = window["grupo" + nombre];
    if (window["color" + nombre + "Fondo"] !== undefined) { //Obtengo el color de fondo asignado a este grupo___
        colorBg = window["color" + nombre + "Fondo"];
    } else {
        colorBg = "white";
    }
    if (window["color" + nombre] !== undefined) {   //Obtengo el color de borde asignado a este grupo___
        color = window["color" + nombre];
    } else {
        color = "white";
    }                                               // Borro o añado los nodos según la visib___
    if (!visib) { //Borro nodos                                  
        $("#"+nombre).css("border-color", "white");     //Estilo de la leyenda
        $("#"+nombre).css("background-color", colorDesactivadoFondo);
        for (var i = 0; i < grupo.length; i++) { // Para cada nodo de este grupo___
            x = getGrupo(grupo[i]); //grupos a los que pertenece este nodo
            if(x.length>1) { // si pertenece a más de un grupo
                if (nombre.indexOf("Ref") == -1) { // si no es de ref
                    grupo[i].setStyle({radius:5, color:"black", weight:1});
                    if (window["visib" + x[1]] == false) { // Si el otro grupo tambien esta apagado borro el nodo
                    map.removeLayer(grupo[i]);
                    };
                } else { // si es de ref
                    grupo[i].setStyle({fillOpacity:0});
                    if (window["visib" + x[0]] == false) { // Si el otro grupo tambien esta apagado borro el nodo
                    map.removeLayer(grupo[i]);
                    };
                };
            } else {
                map.removeLayer(grupo[i]);
            };
        };
    } else {    //Añado nodos
        $("#"+nombre).css("border-color", color);   //Estilo de la leyenda
        $("#"+nombre).css("background-color", colorBg);
        for (var i = 0; i < grupo.length; i++) { // Para cada nodo de este grupo___
            if (nombre.indexOf("Ref") == -1) { // si no es de ref
                grupo[i].setStyle({radius:6, color:color, weight:3});
            } else { // si es de ref
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