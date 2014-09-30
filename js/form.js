var a = $.url().param("a");
$(document).ready( function() {
    var autopista = ["A-1", "AP-1", "A-2", "AP-2", "A-3", "A-4", "AP-4", "A-5", "A-6", "AP-6", "A-7", "AP-7", "A-8", "AP-8", "AP-9","A-10", 
    "A-11", "A-12", "A-13", "A-14", "A-15", "AP-15", "A-16", "A-17", "A-18", "A-19", "A-21", "A-22", "A-23", "A-26", "A-27", "A-30", "A-31", 
    "A-32", "A-33", "A-35", "AP-36", "A-38", "A-40", "A-41", "AP-41", "A-42", "A-43", "A-44", "A-45", "A-46", "A-48", "A-49", "A-50", "AP-51", 
    "A-52", "AP-53", "A-54", "A-55", "A-58", "A-60", "AP-61", "A-62", "A-63", "A-64", "A-65", "A-66", "AP-66", "A-67", "A-68", "AP-68", "A-70", 
    "AP-71", "A-73", "A-75", "A-91", "A-92", "A-92M", "A-231"];
    for (var i = 0; i<74; i++) {
        if (autopista[i] == a) {
            $("select[name=a]").append('<option value="' + autopista[i] + '" selected>' + autopista[i] + '</option>');
        } else {
            $("select[name=a]").append('<option value="' + autopista[i] + '">' + autopista[i] + '</option>');
        }
    };

    $("input[name=submit]").click(function () {
        a=$("select[name=a]").val();
        $("div#feedback").html("Cargando datos...");
        getData();
        getData2();
    });

    //Para ocultar datos
    $("#SalRefExitTo").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalRefExitTo=!visibSalRefExitTo;
        if (!visibSalRefExitTo) {
            for (var i = 0; i < grupoSalRefExitTo.length; i++) {
                map.removeLayer(grupoSalRefExitTo[i]);
            };
        } else {
            for (var i = 0; i < grupoSalRefExitTo.length; i++) {
                map.addLayer(grupoSalRefExitTo[i]);
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
    $("#SalRefName").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalRefName=!visibSalRefName;
        if (!visibSalRefName) {
            for (var i = 0; i < grupoSalRefName.length; i++) {
                map.removeLayer(grupoSalRefName[i]);
            };
        } else {
            for (var i = 0; i < grupoSalRefName.length; i++) {
                map.addLayer(grupoSalRefName[i]);
            };
        }
    })
    $("#SalRef").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalRef=!visibSalRef;
        if (!visibSalRef) {
            for (var i = 0; i < grupoSalRef.length; i++) {
                map.removeLayer(grupoSalRef[i]);
            };
        } else {
            for (var i = 0; i < grupoSalRef.length; i++) {
                map.addLayer(grupoSalRef[i]);
            };
        }
    })
    $("#SalNoRef").click(function () {
        $(this).toggleClass("botondesactivado");
        visibSalNoRef=!visibSalNoRef;
        if (!visibSalNoRef) {
            for (var i = 0; i < grupoSalNoRef.length; i++) {
                map.removeLayer(grupoSalNoRef[i]);
            };
        } else {
            for (var i = 0; i < grupoSalNoRef.length; i++) {
                map.addLayer(grupoSalNoRef[i]);
            };
        }
    })
    $("#Peaje").click(function () {
        $(this).toggleClass("botondesactivado");
        visibPeaje=!visibPeaje;
        if (!visibPeaje) {
            for (var i = 0; i < grupoPeaje.length; i++) {
                map.removeLayer(grupoPeaje[i]);
            };
        } else {
            for (var i = 0; i < grupoPeaje.length; i++) {
                map.addLayer(grupoPeaje[i]);
            };
        }
    })
});