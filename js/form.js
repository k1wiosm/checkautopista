var visibMenu = true;
var id;
var cargando = false;
$(document).ready( function() {

	//Legend buttons style
	$("#Peaje").css("border-color", grupoPeaje.color);
	$("#Peaje").css("background-color", grupoPeaje.colorbg);
	$("#SalDestination").css("border-color", grupoSalDestination.color);
	$("#SalExitTo").css("border-color", grupoSalExitTo.color);
	$("#SalName").css("border-color", grupoSalName.color);
	$("#SalNada").css("border-color", grupoSalNada.color);   
	$("#SalRef").css("border-color", "#ffffff");
	$("#SalRef").css("background-color", grupoSalRef.colorbg);
	$("#SalNoRef").css("border-color", "#ffffff");
	$("#SalNoRef").css("background-color", grupoSalNoRef.colorbg);
	$("#SalSinSal").css("border-color", grupoSalSinSal.color);
	$("#SalSinSal").css("background-color", grupoSalSinSal.colorbg);
	$("#Areas").css("border-color", grupoAreas.color);
	$("#Areas").css("background-color", grupoAreas.colorbg);

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
		name = this.id;
		grupo[name].visib=!grupo[name].visib;
		updateGroupVisib(name);
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
	}
}

function updateGroupVisib (name) {
	// Updates the visibility on the map of the given group, based on the visib parameter
	
	if (grupo[name].visib) {
		for (var i in grupo[name].elem) {
			map.addLayer(grupo[name].elem[i]);
		};
		$("#" + name).css("border-color", grupo[name].color);
		$("#" + name).css("background-color", grupo[name].colorbg);
	} else {
		for (var i in grupo[name].elem) {
			map.removeLayer(grupo[name].elem[i]);
		};
		$("#" + name).css("border-color", "white");
		$("#" + name).css("background-color", colorDesactivadoFondo);
	};
}