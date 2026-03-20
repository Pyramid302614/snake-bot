const log = require("../utilities/log/log.js");

module.exports = {

    config30: null,
    chip: false,
    nodisclog: false,

    started: false,

    async bootSnakelet() {

        log.log("Booting Snakelet");
        await require("./client.js").boot(this.chip);
        log.log("Snakelet booted as: \x1b[33m" + require("./client.js").client.user.username + "\x1b[0m");

        console.log("Fetching log channel");
        await log.fetchchannel(require("./client.js").client);
        try {
            console.log("Channel echo: \x1b[33m#" + log.channelObj.name + "\x1b[0m");
        } catch(e) {
            console.log("Error fetching channel.");
            console.log(e);
        }

        console.log("Configuring error catchers");
        process.addListener("uncaughtException",e => log.err("Uncaught exception: %s",e,"uncaught"));
        process.addListener("unhandledRejection",e => log.err("Uncaught rejection: %s",e,"uncaught"));


    },
    async bootIdleClient() {

        log.log("\x1b[35mStarting idle client");
        await require("../idleclient/idle-client.js").boot(this.chip);
        log.log("Idle client started as: \x1b[33m" + require("../idleclient/idle-client.js").client.user.username + "\x1b[0m");

    },
    async startSnakeBot() {

        if(this.started) return; // Forces no duplicate clients

        this.started = true;
        console.log("Starting : Snake Bot");
        log.log("## Snake Bot is Starting",true)

        await require("../client.js").boot(this.chip?this.config30.beetroot_token:this.config30.snakebot_token);

    },
    async stopSnakeBot() {

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