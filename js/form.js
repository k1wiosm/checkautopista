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

    //Estilo de los botones de mostrar/ocultar
    $("#Peaje").css("border-color", colorPeaje);
    $("#Peaje").css("background-color", colorPeajeFondo);
    $("#SalDestination").css("border-color", colorSalDestination);
    $("#SalExitTo").css("border-color", colorSalExitTo);
    $("#SalName").css("border-color", colorSalName);
    $("#SalNada").css("border-color", colorSalNada);   
    $("#SalRef").css("border-color", "#ffffff");
    $("#SalRef").css("background-color", colorSalRef);
    $("#SalNoRef").css("border-color", "#ffffff");
    $("#SalNoRef").css("background-color", colorSalNoRef);
    $("#SalSinSal").css("border-color", colorSalSinSal);
    $("#SalSinSal").css("background-color", colorSalSinSalFondo);
    $("#Areas").css("border-color", colorAreas);
    $("#Areas").css("background-color", colorAreasFondo);

    //Botón Ver
    $("input[name=submit]").click(function () {
        a=$("select[name=a]").val();
        $("div#feedback1").html("Cargando datos...");
        cargado=0;
        getData1();
        getData3();
        getData41();
    });

    //Para ocultar datos
    $("#Peaje").click(function () {
        $(this).toggleClass("botondesactivado");
        visibPeaje=!visibPeaje;
        if (!visibPeaje) {
            $(this).css("background-color", "#b7c3c2");
            for (var i = 0; i < grupoPeaje.length; i++) {
                map.removeLayer(grupoPeaje[i]);
            };
        } else {
            $(this).css("background-color", colorPeajeFondo);
            for (var i = 0; i < grupoPeaje.length; i++) {
                map.addLayer(grupoPeaje[i]);
            };
        }
    })
    $("#SalDestination").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalDestination=!visibSalDestination;
        if (!visibSalDestination) {
            for (var i = 0; i < grupoSalDestination.length; i++) {
                map.removeLayer(grupoSalDestination[i]);
            };
        } else {
            for (var i = 0; i < grupoSalDestination.length; i++) {
                map.addLayer(grupoSalDestination[i]);
            };
        }
    })
    $("#SalExitTo").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalExitTo=!visibSalExitTo;
        if (!visibSalExitTo) {
            for (var i = 0; i < grupoSalExitTo.length; i++) {
                map.removeLayer(grupoSalExitTo[i]);
            };
        } else {
            for (var i = 0; i < grupoSalExitTo.length; i++) {
                map.addLayer(grupoSalExitTo[i]);
            };
        }
    })
    $("#SalName").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalName=!visibSalName;
        if (!visibSalName) {
            for (var i = 0; i < grupoSalName.length; i++) {
                map.removeLayer(grupoSalName[i]);
            };
        } else {
            for (var i = 0; i < grupoSalName.length; i++) {
                map.addLayer(grupoSalName[i]);
            };
        }
    })
    $("#SalNada").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalNada=!visibSalNada;
        if (!visibSalNada) {
            for (var i = 0; i < grupoSalNada.length; i++) {
                map.removeLayer(grupoSalNada[i]);
            };
        } else {
            for (var i = 0; i < grupoSalNada.length; i++) {
                map.addLayer(grupoSalNada[i]);
            };
        }
    })
    $("#SalRef").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalRef=!visibSalRef;
        if (!visibSalRef) {
            $(this).css("background-color", "#b7c3c2");
            for (var i = 0; i < grupoSalRef.length; i++) {
                map.removeLayer(grupoSalRef[i]);
            };
        } else {
            $(this).css("background-color", colorSalRef);
            for (var i = 0; i < grupoSalRef.length; i++) {
                map.addLayer(grupoSalRef[i]);
            };
        }
    })
    $("#SalNoRef").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalNoRef=!visibSalNoRef;
        if (!visibSalNoRef) {
            $(this).css("background-color", "#b7c3c2");
            for (var i = 0; i < grupoSalNoRef.length; i++) {
                map.removeLayer(grupoSalNoRef[i]);
            };
        } else {
            $(this).css("background-color", colorSalNoRef);
            for (var i = 0; i < grupoSalNoRef.length; i++) {
                map.addLayer(grupoSalNoRef[i]);
            };
        }
    })
    $("#SalSinSal").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalSinSal=!visibSalSinSal;
        if (!visibSalSinSal) {
            $(this).css("background-color", "#b7c3c2");
            for (var i = 0; i < grupoSalSinSal.length; i++) {
                map.removeLayer(grupoSalSinSal[i]);
            };
        } else {
            $(this).css("background-color", colorSalSinSalFondo);
            for (var i = 0; i < grupoSalSinSal.length; i++) {
                map.addLayer(grupoSalSinSal[i]);
            };
        }
    })
    $("#Areas").click(function () {
        $(this).toggleClass("botondesactivado");
        visibAreas=!visibAreas;
        if (!visibAreas) {
            $(this).css("background-color", "#b7c3c2");
            for (var i = 0; i < grupoAreas.length; i++) {
                map.removeLayer(grupoAreas[i]);
            };
        } else {
            $(this).css("background-color", colorAreasFondo);
            for (var i = 0; i < grupoAreas.length; i++) {
                map.addLayer(grupoAreas[i]);
            };
        }
    })

    //Botón Mostrar todo
    $(document).on('click', 'div.mostrar', function() {
        $("div.alltags").toggle();
    });

    //Boton esconder menu
    $("#esconder").click(function(){
        $("#selector").toggle();
        $("#mostrar").toggle();
    });

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