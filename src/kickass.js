module.exports.search = get;

var xml2js = require("xml2js"),
    sc = require("service-client"),
    util = require("util");

function get(term, callback) {
    sc.get("http://kickass.to/usearch/" + term + "/?rss=1", {
        parse: xml2js.parseString,
        transform: transformRss
    }, callback);
}


function transformRss(data, callback) {
    process.nextTick(function() {
        if (data && data.rss && data.rss.channel) {
            transformChanel(data.rss.channel[0], callback);
        } else {
            callback("missing element");
        }
    });
}

function transformChanel(data, callback) {
    var obj = {
        title: data.description,
        items: []
    };
    
    for (var i = 0; i < data.item.length; ++i) {
        obj.items[i] = transformItem(data.item[i]);
    }
    
    callback(null, obj);
}

function transformItem(item) {
    var res = {};
    
    mapInto(res, item, "title");
    mapInto(res, item, "category");
    mapInto(res, item, "author");
    mapInto(res, item, "link");
    mapInto(res, item, "pubDate");
    mapInto(res, item, "torrent:contentLength'");
    mapInto(res, item, "torrent:infoHash'");
    mapInto(res, item, "torrent:magnetURI'");
    mapInto(res, item, "torrent:seeds'");
    mapInto(res, item, "torrent:peers'");
    mapInto(res, item, "torrent:verified'");
    mapInto(res, item, "torrent:fileName'");
    mapInto(res, item, "enclosure");
    
    return res;
}

function mapInto(into, from, field) {
    if (from && from[field]) {
        into[field] = from[field][0];
    } else {
        into[field] = undefined;
    }
}
