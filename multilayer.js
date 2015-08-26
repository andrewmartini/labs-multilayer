function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

var user = getURLParameter('u');
var table = getURLParameter('t');
var uuid = getURLParameter('v');
 var title = getURLParameter('tt');
 var description = getURLParameter('d');
var baseVizJsonUrl = "http://" + user + ".cartodb.com/api/v2/viz/" + uuid + "/viz.json";

var multilayer = angular.module('multilayer', []);
multilayer.controller('SelectorCtrl', function ($scope) {
    var cartodbLayers = [];

    function addLayer(id, show, map) {
        return function (layer) {
            if (!show) {
                layer.hide();
            }
            cdb.vis.Vis.addInfowindow(map, layer.getSubLayer(0), ['cartodb_id'])
            cartodbLayers[id] = layer;
        };
    }

    $scope.title = title;
    $scope.description = description;

    $scope.selectedLayers = [];

    $scope.layersUpdated = function (id) {
        var layer = cartodbLayers[id];
        if ($scope.selectedLayers[id]) {
            layer.show();
        } else {
            layer.hide();
        }
    };
                // Instantiate new map object, place it in 'map' element
    //            var map = new L.Map('map', {
  //                  center: [40.7033127,-73.979681], // New York, NY
//                    zoom: 11,
      //              maxZoom: 16,
    //                minZoom: 10
  //              });
//
  //              L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
//                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //              }).addTo(map_object);
                
                
    cartodb.createVis('map', baseVizJsonUrl, {
        zoom: 12,
        center_lat: 40.70,
        center_lon: -73.97,
        loaderControl: true,
        zoomControl: false,
        infowindow: false,
        layer_selector: false
    }).done(function (vis) {
        var map = vis.getNativeMap();

        var sql = new cartodb.SQL({user: user});
        sql.execute("SELECT name, layerorder, show, viz_json as vizjson, sql, cartocss, interactivity, sql_user FROM " + table + " WHERE name IS NOT NULL ORDER BY layerorder ASC")
            .done(function (data) {
                $scope.layers = data.rows;
                for (var id = 0; id < $scope.layers.length; ++id) {
                    var layerOptions;

                    layer = $scope.layers[id];
                    layer.id = id;
                    $scope.selectedLayers[id] = layer.show ? true : false;
                    if (layer.vizjson) {
                        layerOptions = layer.vizjson;
                    } else {
                        layerOptions = {
                            user_name: layer.sql_user ? layer.sql_user : user,
                            type: "cartodb",
                            sublayers: [{
                                sql: layer.sql,
                                cartocss: layer.cartocss,
                                interactivity: layer.interactivity
                            }],
                            params: {
                                id: id
                            }
                        };
                    }
                    cartodb.createLayer(map, layerOptions)
                        .addTo(map)
                        .done(addLayer(id, layer.show, map))
                        .error(function (error) {
                            console.log("error: " + error);
                        });
                }
                $scope.$apply();
            })
            .error(function (errors) {
                console.log("errors: " + errors);
            });
    });
});
