var dataOSM;
var dataGeoJSON;
var capaDatos;
var cargado;
var errores;

var rq0;
var rq1;
var rq3;
var rq41;
var rq51;

// Group is a constructor for the groups of nodes or ways that we are going to show in the map
function Group(name, visib, color, colorbg, type) {
	this.name = name;
	this.visib = visib;
	this.elem = [];
	this.color = color;
	this.colorbg = colorbg;
	this.type = type; // It can be "way", "node", "nodeIn", "nodeOut", "area"
	this.meters = 0;
	this.add = function (thingToAdd) {
		this.elem.push(thingToAdd);
	}
	this.updateStyle = function () {
		for (var i in this.elem) {
			if (this.color=="") {
				this.elem[i].setStyle({fillColor:this.colorbg});
			} else {
				this.elem[i].setStyle({color:this.color, fillColor:this.colorbg});
			}
			if (this.type=="way") {
				this.elem[i].setStyle({opacity: 0.7});
				if (this.elem[i].feature.properties.tags.name==undefined) {
					this.elem[i].setStyle({dashArray:"1,10"});
				}
			} else if (this.type=="node") {
				this.elem[i].setStyle({radius: 6, weight: 3, opacity: 1, fillOpacity: 1});
			} else if (this.type=="nodeIn") {
				this.elem[i].setStyle({radius: 5, weight: 1, opacity: 1, fillOpacity: 1});
			} else if (this.type=="nodeOut") {
				this.elem[i].setStyle({radius: 6, weight: 3, opacity: 1, fillOpacity: 0});
			} else if (this.type=="area") {
				if (this.elem[i].feature.properties.type=="way") {
					this.elem[i].setStyle({radius: 6, weight: 3, opacity: 1, fillOpacity: 0.5});
				} else {
					this.elem[i].setStyle({radius: 6, weight: 3, opacity: 1, fillOpacity: 1});
				}
			}
		}
	}
	this.clear = function () {
		for (var i in this.elem) {
			map.removeLayer(this.elem[i]);
		}
		this.elem = [];
	}
	this.updateMap = function () {
		this.updateStyle();
		if (this.color == "#000000") {
			var color = "white";
		} else {
			var color = this.color;
		}
		if (this.visib) {
			for (var i in this.elem) {
				map.addLayer(this.elem[i]);
			};
			$("#" + this.name + "> .boton").css("border-color", color);
			$("#" + this.name + "> .boton").css("background-color", this.colorbg);
		} else {
			for (var i in this.elem) {
				map.removeLayer(this.elem[i]);
			};
			$("#" + this.name + "> .boton").css("border-color", "white");
			$("#" + this.name + "> .boton").css("background-color", "#b7c3c2");
		};
	}
	this.measure = function () {
		var distance = 0;
		for (var i in this.elem) {
			for (var j = 0; j < this.elem[i]._latlngs.length - 1; j++) {
				distance += this.elem[i]._latlngs[j].distanceTo(this.elem[i]._latlngs[j + 1]);
			};
		};
		this.meters = distance;
	}
};

//Define the groups
var grupoVia = new Group ("Via", true, "", "", "way");
var grupoViaTodo = new Group ("ViaTodo", true, "#0000ff", "", "way");
var grupoViaNoMaxspeed = new Group ("ViaNoMaxspeed", true, "#ffff00", "", "way");
var grupoViaNoLanes = new Group ("ViaNoLanes", true, "#ff8d00", "", "way");
var grupoViaNoMaxspeedNoLanes = new Group ("ViaNoMaxspeedNoLanes", true, "#D430AB", "", "way");
var grupoViaNoName = new Group ("ViaNoName", true, "", "", "way");
var grupoViaConstruccion = new Group ("ViaConstruccion", true, "#000000", "", "way");
var grupoViaProyecto = new Group ("ViaProyecto", true, "#82858a", "", "way");

var grupoPeaje = new Group ("Peaje", true, "#0000ff", "#55a0bd", "node");

var grupoSalDestination = new Group ("SalDestination", true, "#1e452b", "", "nodeOut");
var grupoSalExitTo = new Group ("SalExitTo", true, "#00b140", "", "nodeOut");
var grupoSalName = new Group ("SalName", true, "#00ffff", "", "nodeOut");
var grupoSalNada = new Group ("SalNada", true, "#ff0000", "", "nodeOut");
var grupoSalRef = new Group ("SalRef", true, "#000000", "#00ff00", "nodeIn");
var grupoSalNoRef = new Group ("SalNoRef", true, "#000000", "#eca411", "nodeIn");
var grupoSalSinSal = new Group ("SalSinSal", true, "#ae0000", "#985652", "node");

var grupoAreas = new Group ("Areas", true, "#f043b4", "#d48fd1", "area");
var grupoOtros = new Group ("Otros", true, "", "", "node");

var grupos = [grupoVia, grupoViaTodo, grupoViaNoMaxspeed, grupoViaNoLanes, grupoViaNoMaxspeedNoLanes, grupoViaNoName, grupoViaConstruccion,grupoViaProyecto,
 grupoPeaje, grupoSalDestination, grupoSalExitTo, grupoSalName, grupoSalNada, grupoSalRef, grupoSalNoRef, grupoSalSinSal, grupoAreas, grupoOtros];

//Dictionary
var grupo = {};
for (i in grupos) {
	grupo[grupos[i].name] = grupos[i];
};

function getVisibleFreeways () {
	// Gets the freeways that are visible on the map and adds them to the selector

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
			// Parsing the response data
			// We organize the data into two objects: autopistas (relations) and vias (ways)
			for (i in response.elements) {
				if (response.elements[i].type == "relation") {
					autopistas.push({id:response.elements[i].id, ref:response.elements[i].tags.ref, members:response.elements[i].members});
				} else if (response.elements[i].type == "way") {
					vias.push({id:response.elements[i].id, tags:response.elements[i].tags});
				}
			}

			var autopistas_copy = autopistas;
			autopistas = [];
			// Delete false freeways
			for (i in autopistas_copy) {
				var primeravia = vias[findWithAttr(vias, "id", autopistas_copy[i].members[0].ref)]; //Get the first way of the freeway
				if (primeravia) {
					if (primeravia.tags) {
						if (primeravia.tags.highway == "motorway" || primeravia.tags.highway == "motorway_link" || primeravia.tags.highway == "trunk" 
						|| primeravia.tags.highway == "trunk_link") {
							autopistas.push(autopistas_copy[i]);
						}
					}
				}
			}

			autopistas.sort(function(a,b){      // Sort freeways by reference
				if (a.ref > b.ref) {
					return +1;
				} else {
					return -1;
				}
			});
			
			for (i in autopistas) {     // Add freeways to selector
				$("select[name=autopistas]").append('<option value="' + autopistas[i].id + '">' + autopistas[i].ref + '</option>');
			}

			$("div#feedback1").html($.i18n._('autopistascargadas'));
			$("input[name=cargar]").prop("disabled",false);
			$("input[name=ver]").prop("value",$.i18n._('verautopistas'));
			cargando=false;
			$("#selector").show();
		}
	)
	.fail( function() { 
		$("div#feedback1").html($.i18n._('erroralcargar') +".");
		$("input[name=cargar]").prop("disabled",false);
		$("input[name=ver]").prop("value",$.i18n._('verautopistas'));
		cargando=false;
	});
}

function getBasicData () {
	// Gets the data for addBasicData

	consulta = '[out:json][timeout:25];(relation(' + id + ');way(r);node(w););out body;';

	rq1 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
		function (response) {
			dataOSM = response;
			dataGeoJSON = osmtogeojson(dataOSM);
			addBasicData();
			cargado++;
			updateFeedback();
		}
	)
	.fail(function() { 
		errores++;
		updateFeedback();
	});
}

function addBasicData () { 
	// Adds:        Ways and exits
	// Checks:      maxspeed, lanes, name, ref, construction and proposed on ways
	//              exit_to, name, ref on exits

	// Separate the GeoJSON data into Nodes and Ways
	var dataGeoJSONWays = {type:'FeatureCollection', features:[]};
	var dataGeoJSONNodes = {type:'FeatureCollection', features:[]};
	for (i in dataGeoJSON.features) {
		if (dataGeoJSON.features[i].properties.type=="way"){
			dataGeoJSONWays.features.push(dataGeoJSON.features[i]);
		} else {
			dataGeoJSONNodes.features.push(dataGeoJSON.features[i]);
		}
	};

	// Add ways to the map
	layerWays = new L.geoJson(dataGeoJSONWays, {
		onEachFeature: function (feature, layer) {
			if (feature.properties.tags.highway=='construction') {
				layer.bindPopup("<b>" + $.i18n._('ViaConstruccion') + ": " + feature.properties.tags.name + 
					" <span style='color:white;background-color:blue'>&nbsp" + 
					feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + "</div><br/>lanes: " + 
					feature.properties.tags.lanes);
			} else if (feature.properties.tags.highway=='proposed') {
				layer.bindPopup("<b>" + $.i18n._('enproyecto') + ": " + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
					feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + "</div><br/>lanes: " + 
					feature.properties.tags.lanes);
			} else {
				layer.bindPopup("<b>" + feature.properties.tags.name + " <span style='color:white;background-color:blue'>&nbsp" + 
					feature.properties.tags.ref + "&nbsp</span></b><br/> maxspeed: <div class='maxspeed'>" + feature.properties.tags.maxspeed + 
					"</div><br/>lanes: " + feature.properties.tags.lanes);
			};
		}
	});

	// Sort ways into groups
	layers = layerWays.getLayers();
	for (var i in layers) {
		grupoVia.elem.push(layers[i]);
		if (layers[i].feature.properties.tags.highway=='construction') {
			grupoViaConstruccion.elem.push(layers[i]);
		} else if (layers[i].feature.properties.tags.highway=='proposed') {
			grupoViaProyecto.elem.push(layers[i]);
		} else {
			if (layers[i].feature.properties.tags.lanes==undefined && layers[i].feature.properties.tags.maxspeed==undefined) {
				grupoViaNoMaxspeedNoLanes.elem.push(layers[i]);
			} else {
				if (layers[i].feature.properties.tags.maxspeed==undefined) {
					grupoViaNoMaxspeed.elem.push(layers[i]);
				} else if (layers[i].feature.properties.tags.lanes==undefined) {
					grupoViaNoLanes.elem.push(layers[i]);
				} else {
					grupoViaTodo.elem.push(layers[i]);
				}
			}
			if (layers[i].feature.properties.tags.name==undefined) {
				grupoViaNoName.elem.push(layers[i]);
			}
			if (layers[i].feature.properties.tags.name!=undefined && layers[i].feature.properties.tags.lanes!=undefined && layers[i].feature.properties.tags.maxspeed!=undefined) {
				grupoViaTodo.elem.push(layers[i]);
			}
		};
	};

	// Add nodes to the map
	for (var i in dataGeoJSONNodes.features) {
		var lat = dataGeoJSONNodes.features[i].geometry.coordinates[1];
		var lon = dataGeoJSONNodes.features[i].geometry.coordinates[0];
		if (dataGeoJSONNodes.features[i].properties.tags.highway=='motorway_junction') {
			var popup = "";
			var destination = "";
			var ref ="&nbsp";
			// Get destination info
			if (dataGeoJSONNodes.features[i].properties.tags.exit_to!==undefined) {
				destination = dataGeoJSONNodes.features[i].properties.tags.exit_to;
			} else if (dataGeoJSONNodes.features[i].properties.tags.name!==undefined) {
				destination = dataGeoJSONNodes.features[i].properties.tags.name;
			} else {
				destination ="&nbsp";
			}
			// Get ref
			if (dataGeoJSONNodes.features[i].properties.tags.ref!==undefined) {
				ref = dataGeoJSONNodes.features[i].properties.tags.ref;
			}
			else {
			}
			// Prepare popup
			popup += htmlPanel(destination,ref);
			popup += htmlShowAllTags("node", dataGeoJSONNodes.features[i].properties.id, dataGeoJSONNodes.features[i].properties.tags, true);
			var marker = L.circleMarker(L.latLng(lat, lon));
			marker.bindPopup(popup);
			marker.feature = {properties: dataGeoJSONNodes.features[i].properties};
			if (dataGeoJSONNodes.features[i].properties.tags.exit_to!==undefined) {
				grupoSalExitTo.elem.push(marker);
			} else if (dataGeoJSONNodes.features[i].properties.tags.name!==undefined) {
				grupoSalName.elem.push(marker);
			} else {
				grupoSalNada.elem.push(marker);
			};
			var marker = L.circleMarker(L.latLng(lat, lon));
			marker.bindPopup(popup);
			marker.feature = {properties: dataGeoJSONNodes.features[i].properties};
			if (dataGeoJSONNodes.features[i].properties.tags.ref!==undefined) {
				grupoSalRef.elem.push(marker);
			}
			else {
				grupoSalNoRef.elem.push(marker);
			};
		} else if (dataGeoJSONNodes.features[i].properties.tags.barrier=='toll_booth') {
			var marker = L.circleMarker(L.latLng(lat, lon));
			marker.bindPopup("<b>"+ $.i18n._('Peaje') + ": " + dataGeoJSONNodes.features[i].properties.tags.name + "</b>" +
				"<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("node", dataGeoJSONNodes.features[i].properties.id) );
			grupoPeaje.elem.push(marker);
		}
	};

	updateMap();

	getDestinationUnmarked1();
}

function getAreas () {
	// Gets tha data for addAreas

	consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);(node(around:1000)["highway"~"services|rest_' + 
		'area"]->.x;way(around:1000)["highway"~"services|rest_area"];);(._;>;);out;';

	
	rq3 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
		function (response) {
			dataOSM = response;
			dataGeoJSON = osmtogeojson(dataOSM);
			addAreas();
			cargado++;
			updateFeedback();
		}
	)
	.fail(function() { 
		errores++;
		updateFeedback();
	});
}

function addAreas () {
	// Add:         Service and rest areas
	// Check:       name

	capaDatos = new L.geoJson(dataGeoJSON, {
		style: function(feature) {  
			return {color: "#f043b4"}
		},
		onEachFeature: function (feature, layer) {      //Popup config
			var imgandtitle;
			if (feature.properties.tags.highway=="services") {
				imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/' + 
					'Spain_traffic_signal_s127.svg" height=50px/>' + $.i18n._('areadeservicio');
			} else if (feature.properties.tags.highway=="rest_area") {
				imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/5/56/' + 
					'Spain_traffic_signal_s123.svg" height=50px/>' + $.i18n._('areadedescanso');
			}
			if(feature.geometry.type=="Point"){
				layer.bindPopup("<b> " + imgandtitle + ": " + feature.properties.tags.name + 
					"<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("node", feature.properties.id) );
			} else {
				layer.bindPopup("<b> " + imgandtitle + ": " + feature.properties.tags.name + 
					"<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("way", feature.properties.id) );
			}
		},
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng);    // Convert nodes to circleMarker
		}

	});

	// Organize service and rest areas in its group
	layers = capaDatos.getLayers()
	for (var i in layers) {
		grupoAreas.elem.push(layers[i]);
	};

	// Convert areas to nodes
	var length = grupoAreas.elem.length;
	for (var i=0; i<length; i++) {
		if(grupoAreas.elem[i].feature!==undefined){
			if(grupoAreas.elem[i].feature.geometry.type=="Polygon"){
				var imgandtitle;
				if (grupoAreas.elem[i].feature.properties.tags.highway=="services") {
					imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/b/b6/' + 
						'Spain_traffic_signal_s127.svg" height=50px/>' + $.i18n._('areadeservicio');
				} else if (grupoAreas.elem[i].feature.properties.tags.highway=="rest_area") {
					imgandtitle='<img src="https://upload.wikimedia.org/wikipedia/commons/5/56/' + 
						'Spain_traffic_signal_s123.svg" height=50px/>' + $.i18n._('areadedescanso');
				}
				marker = L.circleMarker(grupoAreas.elem[i].getBounds().getCenter()); // Create a node in the middle of the area
				marker.feature = {properties : {type : "node"}};
				marker.bindPopup("<b> " + imgandtitle + ": " + grupoAreas.elem[i].feature.properties.tags.name + 
					"<br>&nbsp&nbsp&nbsp" + htmlLinkEditors("way", grupoAreas.elem[i].feature.properties.id) );
				grupoAreas.add(marker);
			}
		}
	};

	updateMap();
}

function getDestinationUnmarked1 () {
	// Gets all nodes of the freeway
	// Loads them into getDestinationUnmarked2

	consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);out;';

	
	rq41 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
		function (response) {
			getDestinationUnmarked2(response);
			cargado++;
			updateFeedback();
		}
	)
	.fail(function() { 
		errores++;
		errores++;
		updateFeedback();
	});
}

function getDestinationUnmarked2 (response) {
	// Receives all nodes of the freeway from getDestinationUnmarked1
	// Gets exit ways
	// Checks destination, Possible unmarked exits

	var nodosAutopista = response; // each of the nodes of the freeway
	var nodosalida = 0;

	consulta = '[out:json][timeout:25];relation(' + id + ');way(r);node(w);way(bn);way._["highway"~"motorway_link|trunk_link|service"];(._;>;);out;'; 

	
	rq51 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
		function (response) {

			var viasSalidas = response;     // motorway_link ways

			var reftemp = [];
			var noreftemp = [];

			for (var i in viasSalidas.elements) {
				if (viasSalidas.elements[i].type == "way") {            // Select only ways
					if (viasSalidas.elements[i].tags.oneway == "-1") {  // If oneway=-1 then the first node of the way is listed the last one
						nodosalida = viasSalidas.elements[i].nodes.length;
					} else {
						nodosalida = 0;
					}
					if (viasSalidas.elements[i].tags.access !== "no" && viasSalidas.elements[i].tags.access !== "private") { // Check if access is possible
						var esSalida = true;
						for (m in grupoVia.elem) { // If the motorway_link is part of the freeway then it's not an exit
							if (grupoVia.elem[m].feature.properties.id == viasSalidas.elements[i].id) {
								esSalida = false;
							}
						};
						if (esSalida) {     // If we determined that is really an exit
							for (j in nodosAutopista.elements) {  // For each node on the freeway
								if (nodosAutopista.elements[j].id == viasSalidas.elements[i].nodes[nodosalida]) { // Get the junction node
									var lat=nodosAutopista.elements[j].lat; // Junction node lat and long
									var lon=nodosAutopista.elements[j].lon;

									if (nodosAutopista.elements[j].tags == undefined) {  // If the junction node has no tags then mark it as Possible Unmarked Exit
										marker = L.circleMarker(L.latLng(lat, lon));
										marker.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
										grupoSalSinSal.elem.push(marker);

									} else if (nodosAutopista.elements[j].tags.highway !== "motorway_junction" ) {  // If the junction node has no highway=motorway_junction  
										marker = L.circleMarker(L.latLng(lat, lon));         // then mark it as Possible Unmarked Exit
										marker.bindPopup("<b>" + $.i18n._('SalSinSal') + "</b>");
										grupoSalSinSal.elem.push(marker);
																						//  If the junction node has destination then mark it as Exit with Destination
									} else if (nodosAutopista.elements[j].tags.name == undefined && nodosAutopista.elements[j].tags.exit_to == undefined) {
										if (viasSalidas.elements[i].tags.destination !== undefined){
											if (nodosAutopista.elements[j].tags.ref !== undefined) { // It the junction node has a reference we get it
												ref = nodosAutopista.elements[j].tags.ref;
											} else {
												ref = "&nbsp";
											}
											popup = htmlPanel(viasSalidas.elements[i].tags.destination, ref);
											popup += htmlShowAllTags ('node', nodosAutopista.elements[j].id, nodosAutopista.elements[j].tags, true);
											popup += htmlShowAllTags ('way', viasSalidas.elements[i].id, viasSalidas.elements[i].tags, false);

											var marker = L.circleMarker(L.latLng(lat, lon));
											marker.feature = {properties: nodosAutopista.elements[j]}; // Copy the node properties
											marker.bindPopup(popup);
											grupoSalDestination.elem.push(marker);

											var marker = L.circleMarker(L.latLng(lat, lon));
											marker.feature = {properties: nodosAutopista.elements[j]}; // Copy the node properties
											marker.bindPopup(popup);

											if (nodosAutopista.elements[j].tags.ref !== undefined) {
												reftemp.push(marker);
											} else {
												noreftemp.push(marker);
											}
										}
									}
								};
							};
						}
					}
				};
			};

			// Delete old nodes that I'll push now with the destination info
			grupoSalRef.elem = deleteOldNodes(grupoSalRef.elem, grupoSalDestination.elem);
			grupoSalNoRef.elem = deleteOldNodes(grupoSalNoRef.elem, grupoSalDestination.elem);
			grupoSalNada.elem = deleteOldNodes(grupoSalNada.elem, grupoSalDestination.elem);

			for (var i in reftemp) {
				grupoSalRef.elem.push(reftemp[i]);
			}

			for (var i in noreftemp) {
				grupoSalNoRef.elem.push(noreftemp[i]);
			}

			updateMap();

			cargado++;
			updateFeedback();
		}
	)
	.fail(function() { 
		errores++;
		updateFeedback();
	});
}

function getFreewayRefAndLoadIt () { 
	// Adds the desired freeway (getting the id from permalink) to the selector
	// Calls other functions to load the freeway

	consulta = '[out:json][timeout:10];relation(' + id + ');out bb;';

	rq1 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + consulta,
		function (response) {
			if(response.elements[0]) {
				if (!(userlat && userlon && userzoom)) { // If there is not a desired location, fit the data
					var n = response.elements[0].bounds.maxlat;
					var w = response.elements[0].bounds.minlon;
					var s = response.elements[0].bounds.minlat;
					var e = response.elements[0].bounds.maxlon;
					map.fitBounds([[s, w],[n, e]]);
				}

				var ref = response.elements[0].tags.ref;
				$("select[name=autopistas]").append('<option value="' + id + '">' + ref + '</option>');
				$("input[name=cargar]").prop("disabled", false );
				Cargar();
			} else {
				console.log("ERROR: Wrong ID.");
			}
		}
	)
	.fail(function() { 
		$("div#feedback1").html($.i18n._('erroralcargar'));
	});
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

function deleteOldNodes (groupToDelete, groupNew) {
	// Deletes old nodes that are in groupToDelete that also are in groupNew
	// This is currently used to update with Tag:destination=* info

	var groupToDelete_copy = groupToDelete;
	var k;
	for (var i = 0; i < groupNew.length; i++) {
		for (var j = 0; j < groupToDelete_copy.length; j++) {
			if (groupToDelete_copy[j].feature.properties.id == groupNew[i].feature.properties.id){
				map.removeLayer(groupToDelete_copy[j]);		// Remove from map
				k = groupToDelete.indexOf(groupToDelete_copy[j]);	// Find in group
				groupToDelete.splice(k,1);		// Remove from group
			};
		};
	};
	return groupToDelete;
}

function updateMap () {
	grupo["ViaTodo"].updateMap();
	grupo["ViaNoMaxspeed"].updateMap();
	grupo["ViaNoLanes"].updateMap();
	grupo["ViaNoMaxspeedNoLanes"].updateMap();
	grupo["ViaConstruccion"].updateMap();
	grupo["ViaProyecto"].updateMap();
	grupo["SalRef"].updateMap();
	grupo["SalNoRef"].updateMap();
	grupo["Peaje"].updateMap();
	grupo["SalExitTo"].updateMap();
	grupo["SalName"].updateMap();
	grupo["SalNada"].updateMap();
	grupo["SalDestination"].updateMap();
	grupo["SalSinSal"].updateMap();
	grupo["Areas"].updateMap();

}

function updateFeedback () {
	if (cargado > 0) {
		$("div#feedback1").html($.i18n._('datoscargados') + " (" + cargado + "/4).");
	};
	if (errores > 0) {
		$("div#feedback2").html($.i18n._('erroralcargar') + " (" + errores + "/4)." );
	};
	if (cargado + errores == 4) {
		$("input[name=cargar]").prop("value", $.i18n._('cargar') );
		if (cargado == 0) {
			$("#feedback1").html("");
		};
		$("input[name=ver]").prop("disabled",false);
		cargando=false;
		Analizar();
		$('h3#leyenda').click();
	};
}

function htmlLinkEditors (type, id) {
	// Gives the html code for the link to the editors.
	// Needs the type of element ("way", "node") and it's ID.

	return '<a target="_blank" href="http://level0.osmz.ru/?url=' + type + '/' + id + '">level0<img class="link" src="img/link.png"/></a>' + 
	'<a target="_blank" href="http://127.0.0.1:8111/load_object?new_layer=false&objects=' + type + id + '">JOSM<img class="link" src="img/link.png"/></a>';
}

function htmlPanel (destination, ref) {
	// Prepares the html code of a panel simulating the real physical panel on highways that indicate the exits.
	// Needs as input the destination and ref.

	var destinationLine=destination.split(";"); // The character ; is assumed to separate different lines (like a Carriage Return)

	var html = '<div class="senal">' +
		'<div class="senal senalElem" id="ref"><img src="img/salida.svg" height="20px"/>' + ref + '&nbsp</div>' +
		'<div class="senal senalElem" id="destination">';

	for (var p in destinationLine) { 
		if(esReferencia(destinationLine[p])){ // If it has a reference in the directions
			var eachdestination = destinationLine[p].split(" ");
			for (q in eachdestination) {
				if (esReferencia(eachdestination[q])){
					html += '<div class="senalReferencia">&nbsp' + eachdestination[q] + '&nbsp</div> ';
				} else {
					html += ' ' + eachdestination[q];
				}
			}
			html += '<br/>';
		} else {
			html += destinationLine[p] + '<br/>';
		}
	}

	html += '</div></div>';

	return html;

}

function htmlShowAllTags (type, id, tags, first) {
	// Gives the html code showing the id of the node or way and all of its tags and links to editors.
	// Needs a type of element ("way", "node"), the id of the element and the desired tags.
	// If it's the first element of the popup then mark first=true. This will create the button to show all tags.

	if (first) {
		var html = '<div class="mostrar">' + $.i18n._('mostrartodastags') + '</div>';
	} else {
		var html = '';
	}

	if (type == 'way') {
		var tipo = 'via';
	} else if (type == 'node') {
		var tipo = 'nodo';
	}

	html += '<div class="alltags">';
	html += '<b>' + $.i18n._(tipo) + ' ID: </b>' + id + "<br/>&nbsp&nbsp&nbsp" +
		htmlLinkEditors(type, id); // Add Link to editors

	for (var key in tags) {
		html += '<br/><b>&nbsp&nbsp&nbsp' + key + '</b>: ' + tags[key];
	}

	html += '</div>';

	return html;

}