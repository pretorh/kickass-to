var kickass = require("../");

kickass.search("ubuntu", {totalPages: 3}, function(err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(data.title);
        console.log(data.items.length);
        console.log(data.items[0]);
        kickass.download(data.items[0], ".", function(err, path) {
            if (err) {
                console.log(err);
            } else {
                console.log("saved to %s", path);
            }
        });
    }
});
