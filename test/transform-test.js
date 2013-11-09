var vows = require("vows"),
    assert = require("assert"),
    xml2js = require("xml2js"),
    transform = require("../src/transform");
   
vows.describe("transformation").addBatch({
    "given parsed xml search results": {
        topic: function() {
            var xml = require("fs").readFileSync("./test/data/ubuntu.xml");
            xml2js.parseString(xml.toString(), this.callback);
        },
        "data is returned": function(err, xml) {
            assert.isNull(err);
            assert.isNotNull(xml);
        },
        "the xml can be transformed": {
            topic: function(xml) {
               transform(xml, this.callback); 
            },
            "no errors occured": function(err, result) {
                assert.isNull(err);
            },
            "the result is an object": function(err, result) {
                assert.isDefined(result);
                assert.isDefined(result.title);
            },
            "*items* is an array of 2 items": function(err, result) {
                assert.isArray(result.items);
                assert.equal(result.items.length, 2);
            },
            "the first item is for *ubuntu 13.10 server amd64.iso*": itemMatches(0, {
                title: "ubuntu 13.10 server amd64.iso",
                category: {
                    raw: "Applications > UNIX",
                    path: ["Applications", "UNIX"]
                },
                author: {
                    name: "mr_madness",
                    link: "http://kickass.to/user/mr_madness/"
                },
                date: "2013-10-18T00:56:25.000Z",
                size: 704643072,
                infohash: "6A36DE201DF2F1B2C817474C3075FF0EAA8C7785",
                magnet: "magnet:?xt=urn:btih:6A36DE201DF2F1B2C817474C3075FF0EAA8C7785&dn=ubuntu+13+10+server+amd64+iso&tr=http%3A%2F%2Fipv6.torrent.ubuntu.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337",
                seeds: 560,
                verified: false,
                filename: "ubuntu.13.10.server.amd64.iso.torrent",
                url: "http://torcache.net/torrent/6A36DE201DF2F1B2C817474C3075FF0EAA8C7785.torrent?title=[kickass.to]ubuntu.13.10.server.amd64.iso"
            }),
            "the second item is for *ubuntu 11-04...*": itemMatches(1, {
                title: "ubuntu 11.04 desktop i386 fr.iso",
                category: {
                    raw: "Applications",
                    path: ["Applications"]
                },
                author: {
                    name: "Qazew",
                    link: "http://kickass.to/user/Qazew/"
                },
                date: "2013-10-18T00:11:05.000Z",
                size: 674670592,
                infohash: "B2F6CD76F4DD68E02908F009E91C7F82B9D6E756",
                magnet: "magnet:?xt=urn:btih:B2F6CD76F4DD68E02908F009E91C7F82B9D6E756&dn=ubuntu+11+04+desktop+i386+fr+iso&tr=udp%3A%2F%2Ffr33domtracker.h33t.com%3A3310%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337",
                seeds: 0,
                verified: false,
                filename: "ubuntu.11.04.desktop.i386.fr.iso.torrent",
                url: "http://torcache.net/torrent/B2F6CD76F4DD68E02908F009E91C7F82B9D6E756.torrent?title=[kickass.to]ubuntu.11.04.desktop.i386.fr.iso"
            })

        }
    }
}).export(module);

function itemMatches(index, values) {
    var result = {};
    result.topic = function(result) {
        return result.items[index];
    }

    function buildAssert(key, expected) {
        return function(item) {
            assert.isDefined(item[key], "field not found");
            assert.equal(JSON.stringify(item[key]), expected);
        };
    }

    for (var key in values) {
        var json = JSON.stringify(values[key]);
        result["has field *" + key + "* with value *" + json.substr(0, 10) + "...*"] = buildAssert(key, json);
    }

    return result;
}
