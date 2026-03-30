module.exports = {

    path(path_) {

        const path = require("../cache.js").sbdir + "/assets/" + path_;
        return require("fs").existsSync(path) ? path : 
            (path.split("/")[0] == "images")? require("../cache.js").sbdir + "/assets/images/unknown64.png" // 64 x 64
            : path
    },

    pfp() {

        return this.path("images/profile/pfp/pfp-gen3.png");

    }
    
}