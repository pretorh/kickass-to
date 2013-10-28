var kickass = require("../");

kickass.search("ubuntu", function(err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log(data);
    }
});
