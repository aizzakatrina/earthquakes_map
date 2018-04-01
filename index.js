// Store our API and data endpoints insides variables
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultLineURL = "data/PB2002_boundaries.json";

// json read of fault line data
d3.json(faultLineURL, function(data) {
    // Receive a response and send the data.features object to the createFaultLines function
    createFaultLines(data.features);
});

// Perform a GET request to the query URL for earthquake data
d3.json(earthquakeURL, function(data) {
    // Receive a response and send the data.features object to the createEarthquakeMarkers function
    createEarthquakeMarkers(data.features);
});

function createFaultLines(faultLineData) { 
    // Define a function to make fault lines
    function makeFaultLines (features, latlng) {
        var faultLine = {
            color: "blue",
            weight: 3,
        };
        return L.polyline(latlng, faultLine);
    };
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing details of the fault line
    function onEachFeature(feature, layer) {
        var faultContent = "<h3>Name: " + feature.properties.Name + "</h3><hr>Coordinates: (" + feature.geometry.coordinates[0][1]  + "," + feature.geometry.coordinates[0][0] + ")";
        layer.bindPopup(faultContent).addTo(faultLines);
    };
    // Create a GeoJSON layer containing the features array on the faultLineData object
    // Run the onEachFeature function once for each piece of data in the array
    L.geoJSON(faultLineData, {
        pointToLayer: makeFaultLines,
        onEachFeature: onEachFeature
        }
    );
};

var faultLines = new L.LayerGroup();

function createEarthquakeMarkers(earthquakeData) {
    // Define a function to make markers
    function markCircle(feature, latlng) {
        var mag = feature.properties.mag;
        var MarkerStyle = {
            radius: markerSize(mag),
            fillColor: markerColor(mag),
            stroke: true,
            color: 'black',
            weight: 0.5,
            fillOpacity: 0.85
        };
        return L.circleMarker(latlng, MarkerStyle);
    };
    // Define a markerSize function that will give each marker a different radius based on its magnitude
    function markerSize(magnitude) {
        return (magnitude * 5);
    };
    // Define a function that will give each marker a different color based on its magnitude
    function markerColor(fill) {
        switch (true) {
            case (fill < 1): 
                color = "#99CC00"; 
                break;
            case (fill < 2): 
                color = "#CCFF33";
                break;
            case (fill < 3): 
                color = "#FFCC00";
                break;
            case (fill < 4): 
                color = "#FF9900";
                break;
            case (fill < 5): 
                color = "#FF5050";
                break;
            default: 
                color = "#FF0000";
                break;
        }
        return color;
    };    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing details of the earthquake
    function handleFeature(feature, layer) {
        var earthquakeContent = "<h3>" + feature.properties.place + "</h3><hr>Magnitude: " + feature.properties.mag + "<br>" + new Date(feature.properties.time);
        layer.bindPopup(earthquakeContent);
    };
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the handleFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: markCircle,
        onEachFeature: handleFeature
        }
    );
    // Send earthquakes layer to the createMap function
    createMap(earthquakes);
};

function createMap(earthquakes) {
    // Define base map layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoidml6enZrIiwiYSI6ImNqZHdnbnloMjA1dWkyd3Fwb2pxY2V6bm0ifQ." +
    "m-DBiNzfVSK62XU2mX04SQ");
    var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoidml6enZrIiwiYSI6ImNqZHdnbnloMjA1dWkyd3Fwb2pxY2V6bm0ifQ." +
    "m-DBiNzfVSK62XU2mX04SQ");
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoidml6enZrIiwiYSI6ImNqZHdnbnloMjA1dWkyd3Fwb2pxY2V6bm0ifQ." +
    "m-DBiNzfVSK62XU2mX04SQ");
    // Define a baseMaps object to hold base layers
    var baseMaps = {
        "Street": streetmap,
        "Outdoor": outdoormap,
        "Satellite": satellitemap
    };
    // Create overlay object to hold overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": faultLines
    };
    // Create map with layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -32.77],
        zoom: 3,
        layers: [streetmap, earthquakes, faultLines]
    });
    // Create a layer control, pass the baseMaps and overlayMaps, and add the layer control to the map
    L.control
        .layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    // Build a legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        // Creates a div with class="info-legend"
        var div = L.DomUtil.create('div', 'info-legend'),
            labels = ['0-1','1-2','2-3','3-4','4-5','5+'],
            colors = ['99CC00','CCFF33','FFCC00','FF9900','FF5050','FF0000'];
        // Sets the html code inside the div
        div.innerHTML = 'Magnitude<hr>';
        for (var i=0; i<labels.length; i++){
            div.innerHTML += '<table><tr><td style="background-color: #' + colors[i] + ';">&nbsp;</td><td>' + labels[i] + '</td></tr></table>';
        };
        return div;
    };
    // Add legend to myMap
    legend.addTo(myMap);
    // Build map title
    var mapTitle = L.control({position: 'bottomleft'});
    mapTitle.onAdd = function (map) {
        // Creates a div with class="map-title"
        var div = L.DomUtil.create('div', 'map-title');
        div.innerHTML = '<h1>Live Earthquakes Map</h1>Data source: <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="new_">USGS</a>';
        return div;
    };
    mapTitle.addTo(myMap);
};