module.exports.search = search;
module.exports.download = download;

var xml2js = require("xml2js"),
    defaultify = require("defaultify"),
    sc = require("service-client"),
    util = require("util"),
    querystring = require("querystring"),
    path = require("path"),
    fs = require("fs");

function search(term, opts, callback) {
    if (arguments.length === 2 && typeof(opts) === "function") {
        callback = opts;
        opts = {};
    }
    
    var defaultOpts = {
        sort: "seeders",
        page: 1,
        totalPages: 1
    };
    opts = defaultify(opts, defaultOpts, true).value;
    
    var req = {
        rss: 1,
        field: opts.sort,
        sorder: "desc"
    };
    
    var resultList = [];
    var want = opts.totalPages;
    for (var i = 0; i < opts.totalPages; ++i) {
        requestPage(term, opts.page, i, req, resultList, function(err, data) {
            if (want === 0) return;
            
            if (err) {
                callback(err);
                want = 0;
            } else {
                if (--want == 0) {
                    var obj = {
                        title: resultList[0].title,
                        items: resultList[0].items
                    };
                    for (i = 1; i < opts.totalPages; i++) {
                        obj.items = obj.items.concat(resultList[i].items);
                    }
                    callback(null, obj);
                }
            }
        });
    }
}

function download(result, saveTo, callback) {
    var url = result.url.match(/(.*)\?title=.*$/);
    url = url ? url[1] : result.url;
    
    var full = path.join(saveTo, result.filename);
    sc.get(url, {}, function(err, data) {
        if (err) {
            callback(err);
        } else {
            fs.writeFile(full, data, function(ferr) {
                if (ferr) {
                    callback(ferr);
                } else {
                    callback(null, full);
                }
            });
        }
    });
}

function requestPage(term, startPage, page, req, result, callback) {
    var url = "http://kickass.to/usearch/" + term + "/" + (startPage + page) + "/?" + querystring.stringify(req);
    
    sc.get(url, {
        parse: xml2js.parseString,
        transform: transformRss
    },
    function(err, data) {
        if (err) {
            callback(err);
        } else {
            result[page] = data;
            callback(null);
        }
    });
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
        category: mapCategory(mapArray(item.category)),
        author: mapAuthor(mapArray(item.author)),
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

function mapCategory(categoryStr) {
    return {
        raw: categoryStr,
        path: categoryStr.split(" > ")
    };
}

function mapAuthor(authorLink) {
    var uname = authorLink && authorLink.match(/http:\/\/kickass.to\/user\/(.+)\//);
    return {
        name: uname ? uname[1] : undefined,
        link: authorLink
    };
}
