var visibMenu = true;
var id;
var cargando = false;
$(document).ready( function() {

	//Legend buttons style
	$("#Peaje > .boton").css("border-color", grupoPeaje.color);
	$("#Peaje > .boton").css("background-color", grupoPeaje.colorbg);
	$("#SalDestination > .boton").css("border-color", grupoSalDestination.color);
	$("#SalExitTo > .boton").css("border-color", grupoSalExitTo.color);
	$("#SalName > .boton").css("border-color", grupoSalName.color);
	$("#SalNada > .boton").css("border-color", grupoSalNada.color);   
	$("#SalRef > .boton").css("border-color", "#ffffff");
	$("#SalRef > .boton").css("background-color", grupoSalRef.colorbg);
	$("#SalNoRef > .boton").css("border-color", "#ffffff");
	$("#SalNoRef > .boton").css("background-color", grupoSalNoRef.colorbg);
	$("#SalSinSal > .boton").css("border-color", grupoSalSinSal.color);
	$("#SalSinSal > .boton").css("background-color", grupoSalSinSal.colorbg);
	$("#Areas > .boton").css("border-color", grupoAreas.color);
	$("#Areas > .boton").css("background-color", grupoAreas.colorbg);

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
		name = $(this).parent().attr('id');
		grupo[name].visib=!grupo[name].visib;
		grupo[name].updateMap();
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
		heightStyle: "panel",
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
		$('h3#leyenda').html('<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-e"></span>' + 
			$('select[name=autopistas] option:selected').text());

		grupoVia.clear();
		grupoViaTodo.clear();
		grupoViaNoMaxspeed.clear();
		grupoViaNoLanes.clear();
		grupoViaNoMaxspeedNoLanes.clear();
		grupoViaNoName.clear();
		grupoViaConstruccion.clear();
		grupoViaProyecto.clear();
		grupoPeaje.clear();
		grupoSalDestination.clear();
		grupoSalExitTo.clear();
		grupoSalName.clear();
		grupoSalNada.clear();
		grupoSalRef.clear();
		grupoSalNoRef.clear();
		grupoSalSinSal.clear();
		grupoAreas.clear();
		grupoOtros.clear();

		getBasicData();
		getAreas();
	}
}

function Analizar () {
	$('#Peaje > .stats').text(grupoPeaje.elem.length);
	var totalexits = grupoSalRef.elem.length + grupoSalNoRef.elem.length;
	$('#SalDestination > .stats').text(grupoSalDestination.elem.length + "/" + totalexits);
	$('#SalExitTo > .stats').text(grupoSalExitTo.elem.length + "/" + totalexits);
	$('#SalName > .stats').text(grupoSalName.elem.length + "/" + totalexits);
	$('#SalNada > .stats').text(grupoSalNada.elem.length + "/" + totalexits);
	$('#SalRef > .stats').text(grupoSalRef.elem.length + "/" + totalexits);
	$('#SalNoRef > .stats').text(grupoSalNoRef.elem.length + "/" + totalexits);
	$('#SalSinSal > .stats').text(grupoSalSinSal.elem.length);
	$('#Areas > .stats').text(grupoAreas.elem.length);

	grupoVia.measure();
	grupoViaTodo.measure();
	grupoViaNoMaxspeed.measure();
	grupoViaNoLanes.measure();
	grupoViaNoMaxspeedNoLanes.measure();
	grupoViaNoName.measure();
	grupoViaConstruccion.measure();
	grupoViaProyecto.measure();

	$('#ViaTodo > .stats').text(Math.round(1000*grupoViaTodo.meters/grupoVia.meters)/10 + "%");
	$('#ViaNoMaxspeed > .stats').text(Math.round(1000*grupoViaNoMaxspeed.meters/grupoVia.meters)/10 + "%");
	$('#ViaNoLanes > .stats').text(Math.round(1000*grupoViaNoLanes.meters/grupoVia.meters)/10 + "%");
	$('#ViaNoMaxspeedNoLanes > .stats').text(Math.round(1000*grupoViaNoMaxspeedNoLanes.meters/grupoVia.meters)/10 + "%");
	$('#ViaNoName > .stats').text(Math.round(1000*grupoViaNoName.meters/grupoVia.meters)/10 + "%");
	$('#ViaConstruccion > .stats').text(Math.round(1000*grupoViaConstruccion.meters/grupoVia.meters)/10 + "%");
	$('#ViaProyecto > .stats').text(Math.round(1000*grupoViaProyecto.meters/grupoVia.meters)/10 + "%");

}