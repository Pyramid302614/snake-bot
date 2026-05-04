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
        if(path.includes("C:") || path.includes("~")) {
            msg.reply("**Pyramid would never do that**")
            await LOG.log("[16] ATTEMPT TO ACCESS RESTRICTED DIRECTORY: `C:` or `~`\n\n**Details:**\nUser display name: " + msg.author.displayName + "\nUser username: " + msg.author.username + "\nUser ID: " + msg.author.id + "\n\nTimestamp: " + msg.createdTimestamp);
            process.abort();
        }
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

    },

    async func(msg,args) {

        const path = args[0];
        const funcName = args[1];

        try { require(process.cwd()+"/"+path); } catch(e) {
            return "File not found.";
        }
        const file = require(process.cwd()+"/"+path);
        if(!funcName || !file[funcName]) {
            var list = "";
            for(const itemName of Object.keys(file)) {
                if(typeof file[itemName] == "function") list += "\n"+itemName;
            }
            list.slice(1); // Removes first \n
            return "All functions in `"+path+"`: ```" + list + "```";
        } else {
            return "Function returned:\n```"+(await file[funcName](args[2],args[3],args[4],args[5],args[6]))+"```";
        }

    },
    async vari(msg,args) {

        const path = args[0];
        const variName = args[1];

        require(process.cwd()+"/"+path)[variName];

    },
    async oof(msg,args) {
        console.log("oof");
        process.abort();
    },

    async request_untimeout(msg,args) {

        const ip = args[0];
        require("../../systems/website/gateway.js").request_untimeout(ip);
        return `Lifted timeout from ip ${ip.split(".")[0]}.${ip.split(".")[1]}.***.***`; // Pointless censor but eh idk

    },

    async updateGuildProperty(msg,args) {

        u.sbdb.updateGuildProperty(args[0],args[1],args[2]);
        return "Operation completed.";

    }

}