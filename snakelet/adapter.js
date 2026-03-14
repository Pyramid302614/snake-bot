module.exports = {

    set_log(v) {
        require("./log.js").log_f = v;
    },
    set_err(v) {
        require("./log.js").err_f = v;
    },

    started: false,
    node_modules_path: null,

    client(v) {
        if(!v) return require("../cache.js").client;
        else require("../cache.js").client = v;
    },
    async start(token) {

        if(this.started) return; // Forces no duplicate clients

        this.started = true;
        console.log("Starting : Snake Bot");

        await require("../client.js").boot(token);

    },
    async stop() {

        if(!this.started) return; // Forces no killing non-existant clients

        this.started = false;
        console.log("Stopping : Snake Bot");

    }

}