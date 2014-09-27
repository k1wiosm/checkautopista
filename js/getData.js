var a = $.url().param("a");
var osm_data;

$.getJSON('http://overpass-api.de/api/interpreter?data=[maxsize:1073741824][out:json][timeout:25];area(3601311341)->.area;(relation["ref"="'+a+'"](area.area);way(r);node(w););out;',
    function (response) {
        osm_data=response;
        data = osmtogeojson(osm_data, uninterestingTags = {
            "source": true,
            "source_ref": true,
            "source:ref": true,
            "history": true,
            "attribution": true,
            "created_by": true,
            "converted_by": false,
            "tiger:county": true,
            "tiger:tlid": true,
            "tiger:upload_uuid": true
        });
        addData();
});