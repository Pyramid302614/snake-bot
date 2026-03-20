const u = require("../../u.js");
const LOG = require("./log");

module.exports = {

    async ping(msg,args) {

        const sent = await msg.reply("Pinging...");
        sent.edit({
            content: ("**Pong!** ("+(sent.createdTimestamp - msg.createdTimestamp)+" ms)")
        });

    },

    async cat(msg,args) {

        const path = args[0];
        if(!path) return "No path provided.";

        if(msg.content.includes("../")) return "**Sorry, \"../\" is not allowed for security reasons.**\nLuckily, you are in the home directory, so don't need to use that.";
        if(path.includes("config30.json")) {
            msg.reply("**Woah there!**\nThat file is not for you. In fact, accessing that file is so SCRICTLY not allowed, the bot will be shutting down right about now. Peace!");
            await LOG.log("**[16] ATTEMPT TO ACCESS RESTRICTED FILE:** `config30.json`\n\n**Details:**\nUser display name: " + msg.author.displayName + "\nUser username: " + msg.author.username + "\nUser ID: " + msg.author.id + "\n\nTimestamp: " + msg.createdTimestamp);
            process.abort();
        }

        var file;
        try {
            file = require("fs").readFileSync(path,"utf-8");
        } catch(e) {
            return "File not found.\n```"+e+"```";
        }
        if(!file) return "Unknown error occured.";
        return "```"+file+"```";

    },

    async ls(msg,args) {

        const path = args[0];
        if(!path) return "No path provided.";

        if(msg.content.includes("../")) return "**Sorry, \"../\" is not allowed for security reasons.**\nLuckily, you are in the home directory, so don't need to use that.";
        if(path.includes("config30.json")) {
            msg.reply("**Woah there!**\nThat file is not for you. In fact, accessing that file is so SCRICTLY not allowed, the bot will be shutting down right about now. Peace!");
            await LOG.log("**[16] ATTEMPT TO ACCESS RESTRICTED FILE:** `config30.json`\n\n**Details:**\nUser display name: " + msg.author.displayName + "\nUser username: " + msg.author.username + "\nUser ID: " + msg.author.id + "\n\nTimestamp: " + msg.createdTimestamp);
            process.abort();
        }

        var dir;
        try {
            dir = require("fs").readdirSync(path,"utf-8");
        } catch(e) {
            return "Directory not found.\n```"+e+"```";
        }
        if(!dir) return "Unknown error occured.";
        var list = "";
        for(const item of dir) {
            if(item != "config30.json") list += item + "\n";
        }
        return "**Directory: `" + path + "` **\n```"+list+"```";
        
    },

    async stopall(msg,args) {

        console.log("Stopping via RLOG command: stopall...")
        process.exit();

    },

    async simulate(msg,args) {
        return await require(require("node:path").relative(__dirname,u.adapter.config30.adapter_location)).event_simulate(args[0],args.slice(1));
    },

    async backup(msg,args) {

        try {
            await require("./data/data.js").backupAllSectors();
        } catch(e) {
            return "```"+e+"```";
        }
        return "Backed up.";

    },

    async message(msg,args) {

        if(args.length < 3) return "Missing arguments! :(";

        const guild = await u.cache.client.guilds.fetch(args[0]);
        const channel = await guild.channels.fetch(args[1]);
        try {
            channel.send(args[2]);
        } catch(e) {
            return "Failed to send: \n```"+e+"```";
        }
        return "**Sent!**\nPlease note that any messages with ',' in them will not send the way you want them to. Do not use them!";

    }

}