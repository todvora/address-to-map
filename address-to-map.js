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
            for (var i = 0; i < addresses.length; i++) (
                function (i) {
                    var timeout = i * 1000;
                    var address = addresses[i];

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
                convertObjToPlainAddress: function (addressObject) {
                    return addressObject;
                },
                mapInfoWindow: function (addressObject) {
                    return new google.maps.InfoWindow({
                        content: "<p>" + addressObject + "</p>"
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
            var infowindow = settings.mapInfoWindow(address);

            var marker = new google.maps.Marker({
                map: map,
                position: coordinates,
                animation: google.maps.Animation.DROP
            });

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
