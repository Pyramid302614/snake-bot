module.exports = {

    set_log(v) {
        require("./log.js").log_f = v;
    },
    set_err(v) {
        require("./log.js").err_f = v;
    },
    set_id(v) {
        this.id_f = v;
    },
    id(path) {
        if(id_f) this.id_f(path); else return null;
    },
    id_f: null,

    started: false,
    node_modules_path: null,
    chosen_ones: [],

    client(v) {
        if(!v) return require("../cache.js").client;
        else require("../cache.js").client = v;
    },
    async start(token) {

        if(this.started) return; // Forces no duplicate clients

        this.started = true;
        console.log("Starting : Snake Bot");
        require("./log.js").log("## Snake Bot is starting",true)

        await require("../client.js").boot(token);

    },
    async stop() {

        if(!this.started) return; // Forces no killing non-existant clients

        this.started = false;
        console.log("Stopping : Snake Bot");

        await require("../cache.js").client.removeAllListeners();
        await require("../cache.js").client.destroy();

    },
    async set_chosen_ones(v) {
        this.chosen_ones = v;
    }

}