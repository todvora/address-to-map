(function ($) {

    $.fn.addressToMap = function (options) {

        var settings = createSettings(options);

        // main google map
        var map = createMap(settings, $(this).get()[0]);

        // google geocoding service
        var geocoder = new google.maps.Geocoder();

        // there should be only one main open infowindow
        var openedInfowindow = null;

        var _processAddressesCallback = function (addresses) {

            // address can be array or object, convert both to array
            var iterableAddresses = convertToIterable(addresses);

            for (var i = 0; i < iterableAddresses.length; i++) (
                function (i) {
                    var timeout = i * settings.timeoutPerItem;
                    var address = iterableAddresses[i];

                    setTimeout(function () {
                        doProcessOneAddress(map, geocoder, settings, address);
                    }, timeout);
                }(i));
        };

        // pass callback - loading of addr can be done asynchronously(for example ajax call)
        settings.addressLoader(_processAddressesCallback);



        function createSettings(options) {
            // This is the easiest way to have default options.
            var settings = $.extend({
                // These are the defaults.
                mapElementId: "map-canvas",
                mapCenter: "50.074934, 12.369562",
                mapZoom: 13,
                timeoutPerItem: 1000, // one second timeout (ok for geocoding service)
                convertObjToPlainAddress: function (addressObject) {
                    return addressObject;
                },
                createInfoWindow: function (addressObject) {
                    return new google.maps.InfoWindow({
                        content: "<p>" + addressObject + "</p>"
                    });
                },
                createMarker: function(map, coordinates, address) {
                    return new google.maps.Marker({
                        map: map,
                        position: coordinates,
                        animation: google.maps.Animation.DROP
                    });
                }
            }, options);

            return settings;
        }

        function createMap(settings, domElement) {
            var mapCenterPoint = settings.mapCenter.split(",");
            var mapOptions = {
                zoom: settings.mapZoom,
                center: new google.maps.LatLng(mapCenterPoint[0], mapCenterPoint[1])
            };

            return new google.maps.Map(
                domElement,
                mapOptions
            );
        }

        function convertToIterable(addresses) {
            if($.isArray(addresses)) {
                return addresses;
            } else if($.isPlainObject(addresses)) {
                // if object, convert to array of values (ignoring keys)
                var iterableAddresses = [];
                $.each(addresses, function( key, value ) {
                    iterableAddresses.push(value);
                });
                return iterableAddresses;
            }
        }

        function doProcessOneAddress(map, geocoder, settings, address) {
            var plainAddress = settings.convertObjToPlainAddress(address)
            geocoder.geocode({ 'address': plainAddress}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var coordinates = results[0].geometry.location;
                    addMapMarker(map, settings, coordinates, address);
                } else {
                    console.log("Failed to load coordinates of address '" + plainAddress + "'. Reason: " + status);
                }
            })

        }

        function addMapMarker(map, settings, coordinates, address) {

            // infowindow created by function from settings (can be overriden)
            var infowindow = settings.createInfoWindow(address);

            // marker created by function from settings(can be overriden)
            var marker = settings.createMarker(map, coordinates, address);

            google.maps.event.addListener(marker, 'click', function () {
                if (openedInfowindow) {
                    openedInfowindow.close();
                }
                infowindow.open(map, marker);
                openedInfowindow = infowindow;
            });
        }


    };

}(jQuery));
