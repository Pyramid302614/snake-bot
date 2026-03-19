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
    },
    // Returns how to respond
    async event_simulate(name,args) {
        var parse = async (v) => {
            if(!v) return v;
            switch(v.split(":")[0]) {
                case "guild":
                    return await require("../cache.js").client.guilds.fetch(v.split(":")[1]);
                default:
                    return v;
            }
        }
        var simulated = 0;
        require("../utilities/dir.js").traverse(require("../config.json").subsystems.events,(file,path) => {
            if(file.data == name) {
                (async () => file.execute(
                    await parse(args[0]),
                    await parse(args[1]),
                    await parse(args[2]),
                    await parse(args[3]),
                    await parse(args[4]),
                ))();
                simulated++;
            }
        });
        if(simulated > 0) {
            return "Successfully simulated `" + simulated + "` event" + ((simulated==1)?"":"s") + "matching `" + name + "`";
        } else {
            return "No events found matching `" + name + "`";
        }
    },

    sbdb: null

}