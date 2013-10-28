module.exports.search = search;

var xml2js = require("xml2js"),
    sc = require("service-client"),
    util = require("util");

function search(term, callback) {
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
        title: data.description[0],
        items: []
    };
    
    for (var i = 0; i < data.item.length; ++i) {
        obj.items[i] = transformItem(data.item[i]);
    }
    
    callback(null, obj);
}

function transformItem(item) {
    return {
        title: mapArray(item.title),
        category: mapArray(item.category),
        author: mapArray(item.author),
        link: mapArray(item.link),
        date: new Date(mapArray(item.pubDate)),
        size: parseInt(mapArray(item["torrent:contentLength"])),
        infohash: mapArray(item["torrent:infoHash"]),
        magnet: mapArray(item["torrent:magnetURI"]),
        seeds: parseInt(mapArray(item["torrent:seeds"])),
        peers: parseInt(mapArray(item["torrent:peers"])),
        verified: mapArray(item["torrent:verified"]) === "1",
        filename: mapArray(item["torrent:fileName"]),
        url: mapArray(item.enclosure)["$"].url
    };
}

function mapArray(field) {
    if (field) {
        return field[0];
    }
}
