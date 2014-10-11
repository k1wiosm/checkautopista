var a = $.url().param("a"); //obtengo el parametro de autopista personalizada desde la URL
var visibSelector = true;
$(document).ready( function() {
    var autopista = ["A-1", "AP-1", "A-2", "AP-2", "A-3", "A-4", "AP-4", "A-5", "A-6", "AP-6", "A-7", "AP-7", "A-8", "AP-8", "AP-9","A-10", 
    "A-11", "A-12", "A-13", "A-14", "A-15", "AP-15", "A-16", "A-17", "A-18", "A-19", "A-21", "A-22", "A-23", "A-26", "A-27", "A-30", "A-31", 
    "A-32", "A-33", "A-35", "AP-36", "A-38", "A-40", "A-41", "AP-41", "A-42", "A-43", "A-44", "A-45", "A-46", "A-48", "A-49", "A-50", "AP-51", 
    "A-52", "AP-53", "A-54", "A-55", "A-58", "A-60", "AP-61", "A-62", "A-63", "A-64", "A-65", "A-66", "AP-66", "A-67", "A-68", "AP-68", "A-70", 
    "AP-71", "A-73", "A-75", "A-91", "A-92", "A-92M", "A-231"];

    if ($.url().param("a") !== undefined){      //Autopista personalizada
        $("select[name=a]").append('<option value="' + a + '" selected>' + a + '</option>');
    }

    for (var i = 0; i<74; i++) {                //Autopistas por defecto
        if (autopista[i] == a) {
            $("select[name=a]").append('<option value="' + autopista[i] + '" selected>' + autopista[i] + '</option>');
        } else {
            $("select[name=a]").append('<option value="' + autopista[i] + '">' + autopista[i] + '</option>');
        }
    };

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
    $("input[name=submit]").click(function () {
        if (this.value == "Cancelar") {
            $(this).prop("value","Ver");
            rq1.abort();
            rq3.abort();
            rq41.abort();
            rq51.abort();
        } else {
            $(this).prop("value","Cancelar");
            a=$("select[name=a]").val();
            $("div#feedback1").html("Cargando datos...");
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
            $("#mostrar").html("Esconder &#8594;");
        } else {
            $("#mostrar").html("&#8592; Mostrar");
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