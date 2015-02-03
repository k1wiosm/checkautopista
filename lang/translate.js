$(document).ready( function() {
	var userlang = (window.navigator.userLanguage || window.navigator.language); // Get the browser language
	var lang = $.url().param("lang");	// Get the language from permalink
	if (lang) { userlang=lang;}
	var langcode = userlang.substr(0,2);	// Get the essential part of lang code

	switch(langcode) {
	    case "ca":
	        $.i18n.load(my_dictionary_ca);
	        break;
	    case "de":
	        $.i18n.load(my_dictionary_de);
	        break;
	    case "en":
	        $.i18n.load(my_dictionary_en);
	        break;
	    case "es":
	        $.i18n.load(my_dictionary_es);
	        break;
	    case "fr":
	        $.i18n.load(my_dictionary_fr);
	        break;
	    case "pt":
	        $.i18n.load(my_dictionary_pt);
	        break;
	    case "tl":
	        $.i18n.load(my_dictionary_tl);
	        break;
	    case "uk":
	    	$.i18n.load(my_dictionary_uk);
	    	break;
	    case "zh":
	    	$.i18n.load(my_dictionary_zh_HANT);
	    	break;
	    default:
	        $.i18n.load(my_dictionary_en);
	}

	$('div#lema')._t('lema', '<a href="http://www.openstreetmap.org/">', '</a>');
	$('input[name=ver]').prop('value', $.i18n._('verautopistas'));
	$('input[name=cargar]').prop('value', $.i18n._('cargar'));
	$('h3#seleccionarautopista')._t('seleccionarautopista');
	$('h3#leyenda')._t('leyenda');
	$('#Peaje > .leyenda_text')._t('Peaje');
	$('#SalDestination > .leyenda_text')._t('SalDestination', '<span class="code">', '</span>');
	$('#SalExitTo > .leyenda_text')._t('SalExitTo', '<span class="code">', '</span>');
	$('#SalName > .leyenda_text')._t('SalName', '<span class="code">', '</span>');
	$('#SalNada > .leyenda_text')._t('SalNada', '<span class="code">', '</span>');
	$('#SalRef > .leyenda_text')._t('SalRef', '<span class="code">', '</span>');
	$('#SalNoRef > .leyenda_text')._t('SalNoRef', '<span class="code">', '</span>');
	$('#SalSinSal > .leyenda_text')._t('SalSinSal');
	$('#Areas > .leyenda_text')._t('Areas');
	$('#ViaTodo > .leyenda_text')._t('ViaTodo');
	$('#ViaNoMaxspeed > .leyenda_text')._t('ViaNoMaxspeed', '<span class="code">', '</span>');
	$('#ViaNoLanes > .leyenda_text')._t('ViaNoLanes', '<span class="code">', '</span>');
	$('#ViaNoMaxspeedNoLanes > .leyenda_text')._t('ViaNoMaxspeedNoLanes', '<span class="code">', '</span>');
	$('#ViaNoName > .leyenda_text')._t('ViaNoName', '<span class="code">', '</span>');
	$('#ViaConstruccion > .leyenda_text')._t('ViaConstruccion');
	$('#ViaProyecto > .leyenda_text')._t('ViaProyecto');
	$('div#mostrar').text($.i18n._('esconder') + " →");

});
