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
	    default:
	        $.i18n.load(my_dictionary_en);
	}

	$('div#lema')._t('lema', '<a href="http://www.openstreetmap.org/">', '</a>');
	$('input[name=ver]').prop('value', $.i18n._('verautopistas'));
	$('input[name=cargar]').prop('value', $.i18n._('cargar'));
	$('h3#seleccionarautopista')._t('seleccionarautopista');
	$('h3#leyenda')._t('leyenda');
	$('div.leyenda_text#Peaje')._t('Peaje');
	$('div.leyenda_text#SalDestination')._t('SalDestination', '<span class="code">', '</span>');
	$('div.leyenda_text#SalExitTo')._t('SalExitTo', '<span class="code">', '</span>');
	$('div.leyenda_text#SalName')._t('SalName', '<span class="code">', '</span>');
	$('div.leyenda_text#SalNada')._t('SalNada', '<span class="code">', '</span>');
	$('div.leyenda_text#SalRef')._t('SalRef', '<span class="code">', '</span>');
	$('div.leyenda_text#SalNoRef')._t('SalNoRef', '<span class="code">', '</span>');
	$('div.leyenda_text#SalSinSal')._t('SalSinSal');
	$('div.leyenda_text#Areas')._t('Areas');
	$('div.leyenda_text#ViaTodo')._t('ViaTodo');
	$('div.leyenda_text#ViaNoMaxspeed')._t('ViaNoMaxspeed', '<span class="code">', '</span>');
	$('div.leyenda_text#ViaNoLanes')._t('ViaNoLanes', '<span class="code">', '</span>');
	$('div.leyenda_text#ViaNoMaxspeedNoLanes')._t('ViaNoMaxspeedNoLanes', '<span class="code">', '</span>');
	$('div.leyenda_text#ViaNoName')._t('ViaNoName', '<span class="code">', '</span>');
	$('div.leyenda_text#ViaConstruccion')._t('ViaConstruccion');
	$('div.leyenda_text#ViaProyecto')._t('ViaProyecto');
	$('div#mostrar').text($.i18n._('esconder') + " →");

});
