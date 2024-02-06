/* global L Papa */
/* Script to display two tables from Google Sheets as point and geometry layers using Leaflet
 * The Sheets are then imported using PapaParse and overwrite the initially laded layers
 * Mixing leaflet-gsheets by Chris Arderne + https://creating-with-data.glitch.me/leaflet-filtering/complete.html + others */

// PASTE YOUR URLs HERE
// these URLs come from Google Sheets 'shareable link' form // the first is the geometry layer and the second the points
let geomURL =  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1on0SyoQQfTL0lsTJTuZGotL3IRWj7raYbbnYy5WT83TiQUshrby-SHIducbO7j5T4H3t8x63OKQy/pub?output=csv";
let pointsURL =  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8kfDgeV5DH0yXntk8-b2WXs5oW_bHuJdNb4hDXPA6AilTSTsNvHieU9yEhP14uBxaj3wALggT03-D/pub?gid=0&single=true&output=csv";
let points_listaURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8kfDgeV5DH0yXntk8-b2WXs5oW_bHuJdNb4hDXPA6AilTSTsNvHieU9yEhP14uBxaj3wALggT03-D/pub?gid=284159536&single=true&output=csv" //sheet5

window.addEventListener("DOMContentLoaded", init);

let map;
let sidebar;
let panelID = "my-info-panel";

/* FUNCIONINIT
 * init() is called when the page has loaded
 */
function init() {
  // Create a new Leaflet map centered on the continental US
  map = L.map('map').setView([41.10, -4.00], 9.4);

  // This is the Carto Positron basemap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://cloudmade.com">CloudMade</a>',
	maxZoom: 18,
  }).addTo(map);
  
	map.spin(true, {
		lines: 13, length: 30
	}); //on_spin

  sidebar = L.control.sidebar({  container: "sidebar", closeButton: true, position: "right",  }).addTo(map);

  let panelContent = {
    id: panelID,
    tab: "<i class='fa fa-bars active'></i>",
    pane: "<p id='sidebar-content'></p>",
    title: "<h2 id='sidebar-title'>Nothing selected</h2>",
  };
  sidebar.addPanel(panelContent);

  map.on("click", function () {
    sidebar.close(panelID);
  });

  // Use PapaParse to load data from Google Sheets // And call the respective functions to add those to the map.
  Papa.parse(geomURL, {
    download: true,
    header: true,
    complete: addGeoms,
  });
  Papa.parse(pointsURL, {
    download: true,
    header: true,
    complete: addPoints,
  });
  Papa.parse(points_listaURL, {
	download: true,
	header: false,
	complete: addPoints_lista,
  });  
}//FinInit


window.onload = function () {	
	document.getElementById("claseX").addEventListener("change", cargarEspecies); //mio
	// CargaEspecies
	function cargarEspecies() {
		var listaEspecies = window.data; //recoge de addPoints_lista
		var claseXs = document.getElementById('claseX')
		var especieXs = document.getElementById('especieX')
		var claseSeleccionada = claseXs.value
		
		// Se limpian las especies del desplegable
		especieXs.innerHTML = '<option value="-">...</option>'
		
		if(claseSeleccionada !== "-"){
			// Se seleccionan los especies y se ordenan
			switch (claseSeleccionada) {
				case "MAMIFERO": claseSeleccionada = 0; break;
				case "AVE": claseSeleccionada = 1; break;
				case "REPTIL": claseSeleccionada = 2; break;
				case "ANFIBIO": claseSeleccionada = 3; break;	
				default: claseSeleccionada = [];
			}			
			claseSeleccionada = listaEspecies[claseSeleccionada]
			const filtrada = claseSeleccionada.filter(dato => dato != ''); //quita las celdas vacías
			
			// Insertamos las especies
			filtrada.forEach(function(especieX){
				let opcion = document.createElement('option')
				opcion.value = especieX
				opcion.text = especieX
				especieXs.add(opcion)
				//document.getElementById("Narray3").value = filtrada.length; //nºespecies
			});		
		}	
	} // FinCargaEspecies	
}
	

/* ADDGEOM
 * Expects a JSON representation of the table with properties columns * and a 'geometry' column that can be parsed by parseGeom() */
function addGeoms(data) {
  data = data.data;
  // Need to convert the PapaParse JSON into a GeoJSON // Start with an empty GeoJSON of type FeatureCollection // All the rows will be inserted into a single GeoJSON
  let fc = {
    type: "FeatureCollection",
    features: [],
  };

  for (let row in data) {
    // The Sheets data has a column 'include' that specifies if that row should be mapped
    if (data[row].include == "y") {
      let features = parseGeom(JSON.parse(data[row].geometry));
      features.forEach((el) => {
        el.properties = {
          name: data[row].name,
          description: data[row].description,
        };
        fc.features.push(el);
      });
    }}

  // The geometries are styled slightly differently on mouse hovers
  let geomStyle = { color: "#2ca25f", fillColor: "#99d8c9", weight: 2 };
  let geomHoverStyle = { color: "green", fillColor: "#2ca25f", weight: 3 };

  L.geoJSON(fc, {
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseout: function (e) {
          e.target.setStyle(geomStyle); },
        mouseover: function (e) {
          e.target.setStyle(geomHoverStyle); },
        click: function (e) {
          // This zooms the map to the clicked geometry // Uncomment to enable // map.fitBounds(e.target.getBounds());
          // if this isn't added, then map.click is also fired!
          L.DomEvent.stopPropagation(e);

          document.getElementById("sidebar-title").innerHTML =  e.target.feature.properties.name;
          document.getElementById("sidebar-content").innerHTML =  e.target.feature.properties.description;
          sidebar.open(panelID);
        },
      });
    },
    style: geomStyle,
  }).addTo(map);
} //Fin Addgeom

/* ADDPOINTS
 * addPoints is a bit simpler, as no GeoJSON is needed for the points */
function addPoints(data) {
	data = data.data; 
	var pointGroupLayer = L.layerGroup([]).addTo(map);
	//console.log (data);
	
	document.getElementById("claseX").addEventListener("change", filterData);
    document.getElementById("especieX").addEventListener("change", filterData);
	
	// RENDERING METHOD
	function renderMarkers (data) {
		
		//map.spin(true, { lines: 13, length: 30 }); //on_spin //ya en inicio y aqui puede que retrase
		pointGroupLayer.clearLayers();
	 
		// Choose marker type. Options are: // (these are case-sensitive, defaults to marker!)
	    // marker: standard point with an icon // circleMarker: a circle with a radius set in pixels // circle: a circle with a radius set in meters
	    let markerType = "marker";

	    // Marker radius // Wil be in pixels for circleMarker, metres for circle  // Ignore for point
	    let markerRadius = 100;

		for (let row = 0; row < data.length; row++) {
			var marker;
			if (markerType == "circleMarker")  { marker = L.circleMarker([data[row].lat, data[row].lon], {	radius: markerRadius, }); } 
			else if (markerType == "circle")  { marker = L.circle([data[row].lat, data[row].lon], { radius: markerRadius, }); } 
			else  { marker = L.marker([data[row].lat, data[row].lon]); }
			marker.addTo(pointGroupLayer);

			// UNCOMMENT THIS LINE TO USE POPUPS
			//marker.bindPopup('<h2>' + data[row].name + '</h2>There's a ' + data[row].description + ' here');

			// COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
			marker.feature = {
			  properties: {
				N: data[row].N, Usuario: data[row].Usuario,	Clase: data[row].Clase,	Especie: data[row].Especie,
				Fecha: data[row].Fecha,	Seguridad_id: data[row].Seguridad_id, Frecuencia_paso: data[row].Frecuencia_paso,
				Carretera: data[row].Carretera,	Pk: data[row].Pk, Foto: data[row].Foto,	Observaciones: data[row].Observaciones,
			  }	};
			marker.on({
			  click: function (e) {
				L.DomEvent.stopPropagation(e);
				document.getElementById('sidebar-title').innerHTML = e.target.feature.properties.Especie;
				let fotografia = e.target.feature.properties.Foto;
				console.log(fotografia);
				if (fotografia.includes("drive.google.com") == true)  {
					document.getElementById('sidebar-content').innerHTML = (
					'N: ' + e.target.feature.properties.N + '<br/>' +
					'Usuario: ' + e.target.feature.properties.Usuario + '<br/>' +
					'Fecha: ' + e.target.feature.properties.Fecha + '<br/>' +
					//'Clase: ' + e.target.feature.properties.Clase + '<br/>' +
					//'Especie: ' + e.target.feature.properties.Especie + '<br/>' +
					'Seguridad_id: ' + e.target.feature.properties.Seguridad_id + '<br/>' +
					'Frecuencia_paso: ' + e.target.feature.properties.Frecuencia_paso + '<br/>' +
					'Carretera: ' + e.target.feature.properties.Carretera + '<br/>' +	
					'Pk: ' + e.target.feature.properties.Pk + '<br/>' +
					//'Foto: ' + e.target.feature.properties.Foto + '<br/>' +	
					'<a href="' + e.target.feature.properties.Foto + '">Descarga la foto del atropello</a><br/>'  
					//'Observaciones: ' + e.target.feature.properties.Observaciones + '<br/>' +
					//Funcionan estos formatos de foto + el id al final: https://drive.google.com/uc?id= // https://drive.google.com/uc?export=download&id=
					//No funciona'<iframe src="' + e.target.feature.properties.Foto + '" name="iframe_a" width="250"></iframe>' + '<br/>' +						
					);
				} else {
					document.getElementById('sidebar-content').innerHTML = (
					'N: ' + e.target.feature.properties.N + '<br/>' +
					'Usuario: ' + e.target.feature.properties.Usuario + '<br/>' +
					'Fecha: ' + e.target.feature.properties.Fecha + '<br/>' +
					'Seguridad_id: ' + e.target.feature.properties.Seguridad_id + '<br/>' +
					'Frecuencia_paso: ' + e.target.feature.properties.Frecuencia_paso + '<br/>' +
					'Carretera: ' + e.target.feature.properties.Carretera + '<br/>' +	
					'Pk: ' + e.target.feature.properties.Pk + '<br/>' +
					//'<a href="' + e.target.feature.properties.Foto + '">Descarga la foto del atropello</a><br/>' + 
					'<img src="' + e.target.feature.properties.Foto + '" width="250"><br/>'  //Esto funciona con las de Jotform
					//'Observaciones: ' + e.target.feature.properties.Observaciones + '<br/>' +
					);
				}	
				sidebar.open(panelID);
			 },
			});
			// COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS
		  
			// AwesomeMarkers is used to create fancier icons
			let icon = L.icon({ iconUrl: getIcon(data[row].Clase), iconSize: [15, 25], iconAnchor: [9, 28],	popupAnchor: [0, -28],
				//shadowUrl: 'css/images/markers-shadow.png', //shadowSize: [30, 10], //shadowAnchor: [5, 5]
			});
			marker.setIcon(icon);			
			pointGroupLayer.addLayer(marker);					
		} //Fin iteracion		
		
	//console.log(data);
	document.getElementById("Narray").value = data.length;	//nºregistros
	map.spin(false);  // spinoff
    } //Fin Render
	
	//FILTERING LOGIC
    function filterData () {	
	
		sidebar.close(panelID);
		document.getElementById('sidebar-title').innerHTML = '';
		document.getElementById('sidebar-content').innerHTML = ('');
		
		let simdFilteredData = [];
        let simdValue = document.getElementById("claseX").value;  
        if (simdValue == "-") { simdFilteredData = data;  }   //en origen data era window.data, cambiar si no funciona
        for (const d of data) { if (d.Clase == simdValue) { simdFilteredData.push(d); } }  //en origen data era window.data, cambiar si no funciona
		
        let filteredData = [];
        let prescValue = document.getElementById("especieX").value; //INMPORTANTE!!!
        if (prescValue == "-") { filteredData = simdFilteredData;  }
        for (const d of simdFilteredData) { if (d.Especie == prescValue) { filteredData.push(d); } }	
		
		//alert("simdValue= " + simdValue + " / prescValue= " + prescValue);
		
		/*let filteredData = [];
		let prescValue = document.getElementById("presc-filter").value;
		if (prescValue === "-") {  filteredData = simdFilteredData; }
		for (const d of simdFilteredData) { if (parseFloat(d.prescriptions) <= parseFloat(prescValue)) { filteredData.push(d); } }*/
		
		renderMarkers(filteredData); //Renderizado desde los datos filtrados
		
    }; //FinFiltro

	renderMarkers(data); //Renderizado desde el conjunto de datos
	
}; //FINADDPOINTS
   	
//AñadirLista
function addPoints_lista(data) {
	data = data.data; 
	console.log (data);
	window.data = data; //Para enviar lista	
}	

// Returns different colors depending on the string passed // Used for the points layer
  function getIcon(type) {
  switch (type) {
    case 'MAMIFERO':  return 'css/images/marker-icon-red.png';
    case 'AVE':  return 'css/images/marker-icon-yellow.png';
	 case 'REPTIL':  return 'css/images/marker-icon-green.png';
	 case 'ANFIBIO':  return 'css/images/marker-icon-blue.png';
    default:  return 'css/images/marker-icon-black.png';
  }
}

/* Accepts any GeoJSON-ish object and returns an Array of
 * GeoJSON Features. Attempts to guess the geometry type * when a bare coordinates Array is supplied. */
function parseGeom(gj) {
  // FeatureCollection
  if (gj.type == "FeatureCollection") { return gj.features; }
  // Feature
  else if (gj.type == "Feature") { return [gj]; }
  // Geometry
  else if ("type" in gj) { return [{ type: "Feature", geometry: gj }]; }
  // Coordinates
  else {
    let type;
    if (typeof gj[0] == "number") { type = "Point"; } 
	else if (typeof gj[0][0] == "number") { type = "LineString"; } 
	else if (typeof gj[0][0][0] == "number") { type = "Polygon"; } 
	else { type = "MultiPolygon"; }  
		return [{ type: "Feature", geometry: { type: type, coordinates: gj } }];
  }
}
