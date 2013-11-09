var vows = require("vows"),
    assert = require("assert"),
    kickass = require("../");

vows.describe("integration test").addBatch({
    "when searching for *ubuntu*": {
        topic: function() {
            kickass.search("ubuntu", {totalPages: 3}, this.callback);
        },
        "no errors occured": function(err, data) {
            assert.isNull(err);
        },
        "the result has *title*, *items* fields": function(err, data) {
            assert.isNotNull(data);
            assert.isDefined(data.title);
            assert.isDefined(data.items);
        },
        "*at least one* item is returned": function(err, data) {
            assert.isArray(data.items);
            assert(data.items.length > 0);
        },
        "the torrent can be downloaded": {
            topic: function(data) {
                var cb = this.callback;
                kickass.download(data.items[0], ".", function(err, path) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, {
                            item: data.items[0],
                            path: path
                        });
                    }
                });
            },
            "no error occured": function(err, path) {
                assert.isNull(err);
            },
            "the file is saved based on the *filename* field": function(err, info) {
                assert.isNotNull(info);
                assert.isNotNull(info.path);
                assert.equal(info.path, info.item.filename);
            },
            "(perform cleanup)": function(err, info) {
                if (!err) {
                    require("fs").unlink(info.path);
                }
            }
        }
    }
}).export(module);
