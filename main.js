/* global L Papa */
/* Script to display two tables from Google Sheets as point and geometry layers using Leaflet
 * The Sheets are then imported using PapaParse and overwrite the initially laded layers
 * Mixing leaflet-gsheets by Chris Arderne + https://creating-with-data.glitch.me/leaflet-filtering/complete.html + others */

// PASTE YOUR URLs HERE
// these URLs come from Google Sheets 'shareable link' form // the first is the geometry layer and the second the points
let geomURL =  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1on0SyoQQfTL0lsTJTuZGotL3IRWj7raYbbnYy5WT83TiQUshrby-SHIducbO7j5T4H3t8x63OKQy/pub?output=csv";
let pointsURL =  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8kfDgeV5DH0yXntk8-b2WXs5oW_bHuJdNb4hDXPA6AilTSTsNvHieU9yEhP14uBxaj3wALggT03-D/pub?output=csv";
	// Google spreadsheet Leaflet_points_COPIA con campo geometry (sin array para calculo automatico):
	//"https://docs.google.com/spreadsheets/d/e/2PACX-1vQbcdexNbJ3QYG2y7Ska32sodt5Ovv23_j_4wpK1UCMzmlKyUdTWQ4w2v69Q5LZ9aEzgf2lei-Ju9Lc/pub?gid=0&single=true&output=csv"

let pointsURL_lista = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbcdexNbJ3QYG2y7Ska32sodt5Ovv23_j_4wpK1UCMzmlKyUdTWQ4w2v69Q5LZ9aEzgf2lei-Ju9Lc/pub?gid=2070618516&single=true&output=csv"

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
}//FinInit

/////SeleccionandoESPECIE  	
	window.onload = function () {
		
		document.getElementById("claseX").addEventListener("change", cargarEspecies); //mio

		function cargarEspecies() {
			// Objeto de clases con especies
			var listaEspecies = {
			"MAMIFERO": [ "Ardilla Roja","Armiño","Cabra Montés","Ciervo rojo","Comadreja","Conejo","Corzo","Erizo Europeo","Garduña","Gato Montés","Gineta","Jabalí","Liebre ibérica","Lirón careto","Lobo","Meloncillo","Murciélago sp","Nutria","Rata de Agua","Rata sp","Ratón sp","Tejón","Topillo sp","Topo Ibérico","Turón","Visón Americano","Zorro Rojo","MAMÍFERO no identificado con seguridad" ],
			"AVE": [ "Abejaruco","Abubilla","Acentor Común","Agateador Común","Águila Calzada","Águila Imperial Ibérica","Águila Real","Aguilucho Cenizo","Aguilucho Lagunero","Aguilucho Pálido","Alcaraván","Alcaudón Común","Alcaudón Dorsirrojo","Alcaudón Real","Alcotán","Alondra Común","Alondra Totovía","Ánade Azulón","Andarríos Chico","Arrendajo","Autillo","Avefría Europea","Avión Común","Avión Roquero","Azor","Bisbita Pratense","Búho Campestre","Búho Chico","Búho Real","Buitre Leonado","Buitre Negro","Calandria","Cárabo","Carbonero Común","Carbonero Garrapinos","Carricero Común","Cerceta Común","Cernícalo Primilla","Cernícalo Vulgar","Chochín","Chotacabras Europeo (Gris)","Chova Piquirroja","Cigüeña Blanca","Cigüeña Negra","Cigüeñuela Común","Codorniz Común","Cogujada Común","Colirrojo Real","Colirrojo Tizón","Collalba Gris","Collalba Rubia","Cormorán Grande","Corneja","Críalo","Cuco","Cuervo","Culebrera Europea","Curruca Capirotada","Curruca Carrasqueña","Curruca Mirlona","Curruca Mosquitera","Curruca Rabilarga","Curruca Zarcera","Escribano Hortelano","Escribano Montesino","Escribano Soteño","Esmerejón","Estornino Negro","Estornino Pinto","Faisán","Focha Común","Gallineta Común","Garza Real","Gavilán","Gaviota Reidora ","Golondrina Común","Gorrión Chillón","Gorrión Común","Gorrión Molinero","Grajilla","Halcón Peregrino","Herrerillo Común","Jilguero","Lavandera Blanca","Lechuza","Martin Pescador","Milano Negro","Milano Real","Mirlo Común","Mito","Mochuelo","Mosquitero Común","Mosquitero Papialbo","Oropéndola","Paloma cimarrona","Paloma Torcaz","Papamoscas Cerrojillo","Pardillo","Pato Cuchara","Perdiz Roja","Petirrojo","Pico Picapinos","Picogordo","Pinzón Vulgar","Piquituerto","Pito Real","Rabilargo","Ratonero Común","Reyezuelo Listado","Ruiseñor Común","Tarabilla Común","Torcecuello","Tórtola Europea","Tórtola Turca","Trepador Azul","Triguero","Urraca","Vencejo","Verdecillo","Verderón","Zarcero Común","Zorzal Alirrojo","Zorzal Charlo","Zorzal Común","Zorzal Real","AVE no identificada con seguridad" ],
			"REPTIL": [ "Culebra Bastarda","Culebra de Collar","Culebra de Escalera","Culebra Lisa Europea","Culebra Lisa Meridional","Culebra Viperina","Culebrilla ciega","Eslizón Tridáctilo Ibérico","Galápago de florida","Galápago Europeo","Galápago Leproso","Lagartija Carpetana","Lagartija Cenicienta","Lagartija Colilarga","Lagartija Ibérica","Lagartija Roquera","Lagarto Ocelado","Lagarto Verdinegro","Víbora Hocicuda","REPTIL no identificado con seguridad" ],
			"ANFIBIO": [ "Gallipato","Rana Común","Rana Patilarga","Ranita de San Antonio","Salamandra Común","Sapillo Pintojo Ibérico","Sapillo Pintojo Ibérico","Sapo Común","Sapo Corredor","Sapo de Espuelas","Sapo Partero Común","Tritón Ibérico","Tritón Jaspeado","ANFIBIO no identificado con seguridad" ]
			}
			
			var claseXs = document.getElementById('claseX')
			var especieXs = document.getElementById('especieX')
			var claseSeleccionada = claseXs.value
			
			// Se limpian los especies
			especieXs.innerHTML = '<option value="-">...</option>'
			
			if(claseSeleccionada !== "-"){
			  // Se seleccionan los especies y se ordenan
			  claseSeleccionada = listaEspecies[claseSeleccionada]
			  //claseSeleccionada.sort()
			
			  // Insertamos los especies
			  claseSeleccionada.forEach(function(especieX){
				let opcion = document.createElement('option')
				opcion.value = especieX
				opcion.text = especieX
				especieXs.add(opcion)
			  });
			}			
		} // Iniciar la carga de clases solo para comprobar que funciona			
	} /////FIN ESPECIE

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
	//window.data = data; //Creo que no hace falta	

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
					//'Observaciones: ' + e.target.feature.properties.Observaciones + '<br/>' +
					'<img src="' + e.target.feature.properties.Foto + '" width="270">' 
					);					
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
