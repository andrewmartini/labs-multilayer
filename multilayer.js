function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

var user = getURLParameter('u');
var table = getURLParameter('t');
var uuid = getURLParameter('v');
var title = getURLParameter('tt');
var description = getURLParameter('d');
var baseVizJsonUrl = "http://" + user + ".cartodb.com/api/v2/viz/" + uuid + "/viz.json";

// testing of adding Leaflet map layers onto html map 
                var layer1;
                var layer2;
                var layer3;
                var layer4;
                var layer5;
                var layer6;
                var layer7;

                cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/deaa200a-2a5e-11e5-9ad8-0e9d821ea90d/viz.json')
                // .addTo(map_object)
                .done(function(layer) {
                  layer1 = layer;

                  cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/7ed0ef5a-29b0-11e5-9825-0e853d047bba/viz.json')
                  //.addTo(map_object)
                  .done(function(layer) {
                    layer2 = layer;

                    cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/3f321284-29b0-11e5-a0f8-0e018d66dc29/viz.json')
                    //.addTo(map_object)
                    .done(function(layer) {
                      layer3 = layer;

                      cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/394257cc-2a5e-11e5-9e3f-0e853d047bba/viz.json')
                      //.addTo(map_object)
                      .done(function(layer) {
                        layer4 = layer;

                        cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/8aa5a57e-2a5e-11e5-9807-0e9d821ea90d/viz.json')
                        //.addTo(map_object)
                        .done(function(layer) {
                          layer5 = layer;

                          cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/d0fb1b72-2a5d-11e5-a731-0e4fddd5de28/viz.json')
                          //.addTo(map_object)
                          .done(function(layer) {
                          layer6 = layer;

                            cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/8e9dcb04-9821-11e4-a998-0e9d821ea90d/viz.json')
                            //.addTo(map_object)
                            .done(function(layer) {
                            layer7 = layer;

                              cartodb.createLayer(map_object, 'https://andrewmartini.cartodb.com/api/v2/viz/0546aec0-2a7f-11e5-9807-0e9d821ea90d/viz.json')
                              .done(function(layer) {
                              layer8 = layer;
                            
                    var overlayMaps = {
                      "Neighborhoods": layer1,
                      "City Council": layer2,
                      "Community Districts": layer3,
                      "State Senate": layer4,
                      "State Assembly": layer5,
                      "US Congressional": layer6,
                      "US Census Tracts": layer7,
                      "DOE School Zones": layer8
                    };

                    L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map_object);
                            });
                          });
                        });
                      });
                    });
                  });
                });
              }); 


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
