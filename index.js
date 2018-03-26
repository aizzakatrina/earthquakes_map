// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Receive a response and send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function to make markers
    function markCircle(feature, latlng) {
        var MarkerStyle = {
            radius: markerSize(feature.properties.mag),
            color: "steelblue",
            weight: 1,
            fillOpacity: 0.75
        };
        return L.circleMarker(latlng, MarkerStyle);
    };

    // Define a markerSize function that will give each marker a different radius based on its magnitude
    function markerSize(magnitude) {
        return (magnitude * 5);
    };
    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing details of the earthquake
    function handleFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " + feature.properties.mag + 
        "<br>" + new Date(feature.properties.time) + "</p>");
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
        Earthquakes: earthquakes
    };
    // Create map with layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });
    // Create a layer control, pass the baseMaps and overlayMaps, and add the layer control to the map
    L.control
        .layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
};