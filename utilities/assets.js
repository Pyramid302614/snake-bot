module.exports = {

    path(path) {

        return require("../cache.js").sbdir + "/assets/" + path;

    },

    pfp() {

        return this.path("images/profile/pfp/pfp-gen3.png");

    }
    
}