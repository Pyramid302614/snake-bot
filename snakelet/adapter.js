const log = () => { return require("../utilities/log/log.js"); };
const { MessageFlags, ContainerBuilder, TextDisplayBuilder } = require("discord.js");
const { parseValue } = require("../utilities/values.js");

module.exports = {

    config30: null,
    chip: false,
    nodisclog: false,

    started: false,

    async bootSnakelet() {

        console.log("Configuring SBDB");
        await require("../sbdb/sbdb.js").configure();

        console.log("Booting Snakelet");
        await require("./client.js").boot(this.chip);
        console.log("Snakelet booted as: \x1b[33m" + require("./client.js").client.user.username + "\x1b[0m");

        console.log("Fetching log channel");
        await log().fetchchannel(require("./client.js").client);
        try {
            console.log("Channel echo: \x1b[33m#" + log().channelObj.name + "\x1b[0m");
        } catch(e) {
            console.log("Error fetching channel.");
            console.log(e);
        }

        console.log("Configuring error catchers");
        process.addListener("uncaughtException",e => log().err("Uncaught exception: %s",e,"uncaught"));
        process.addListener("unhandledRejection",e => log().err("Uncaught rejection: %s",e,"uncaught"));


    },
    async bootIdleClient() {

        log().log("\x1b[35mStarting idle client");
        await require("../idleclient/idle-client.js").boot(this.chip);
        log().log("Idle client started as: \x1b[33m" + require("../idleclient/idle-client.js").client.user.username + "\x1b[0m");

    },
    async startSnakeBot() {

        if(this.started) return; // Forces no duplicate clients

        this.started = true;
        console.log("Starting : Snake Bot");
        log().log("## Snake Bot is Starting",true)

        await require("../client.js").boot(this.chip?this.config30.beetroot_token:this.config30.snakebot_token);

        console.log("Configuring spawn timers");
        require("../systems/spawning/spawner.js").configure();

        require("../systems/website/gateway.js").host();
        require("../systems/website/gateway.js").idle = false;
        
        try {
            require("../cache.js").client.user.setPresence({
                activities: [],
                status: "online" // Do not disturb (Others: "online", "idle", "invisible")
            });
            const split = this.config30.ids.status[this.chip?0:1].split(":");
            (await (await (await require("../idleclient/idle-client.js").client.guilds.fetch(split[0])).channels.fetch(split[1])).messages.fetch(split[2])).edit({
                content: null,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent("# 🟢 Snake Bot is **Online**"))
                        .setAccentColor([0,255,0])
                ],
                flags: [MessageFlags.IsComponentsV2]
            });
        } catch(ignored) {}

    },
    async stopSnakeBot() {

        if(!this.started) return; // Forces no killing non-existant clients
        for(const timeout of this.timeouts) clearTimeout(timeout);
        for(const interval of this.intervals) clearTimeout(interval);
        

        this.started = false;
        console.log("Stopping : Snake Bot");

        await require("../cache.js").client.removeAllListeners();
        await require("../cache.js").client.destroy();

        require("../systems/website/gateway.js").idle = true;

        try {
            const split = this.config30.ids.status[this.chip?0:1].split(":");
            (await (await (await require("../idleclient/idle-client.js").client.guilds.fetch(split[0])).channels.fetch(split[1])).messages.fetch(split[2])).edit({
                content: null,
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent("# 🔴 Snake Bot is **Offline**\n"+(require("../snakelet/client.js").stopReason ?? "No reason provided :P")))
                        .setAccentColor([255,0,0])
                ],
                flags: [MessageFlags.IsComponentsV2]
            });
        } catch(ignored) {
            // console.log(ignored);
        }

    },
    async set_chosen_ones(v) {
        this.chosen_ones = v;
    },
    // Returns how to respond
    async event_simulate(name,args) {
        // Arguments are parsed by RLOG command handler
        var simulated = 0;
        require("../utilities/dir.js").traverse(require("../config.json").subsystems.events,(file,path) => {
            if(file.data == name) {
                file.execute(
                    args[0],
                    args[1],
                    args[2],
                    args[3],
                    args[4]
                );
                simulated++;
            }
        });
        if(simulated > 0) {
            return "Successfully simulated `" + simulated + "` event" + ((simulated==1)?"":"s") + "matching `" + name + "`";
        } else {
            return "No events found matching `" + name + "`";
        }
    },

    intervals: [],
    timeouts: []

}