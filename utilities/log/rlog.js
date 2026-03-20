const adapter = require("../../snakelet/adapter.js");
const LOG = require("./log.js");

module.exports = {

    async in(msg) {

        if(!adapter.config30.chosen_ones.includes(msg.author.id)) return "Unauthorized";

        const m = msg.content.slice(msg.content.split(".")[0].length+1);

        const cmd = m.split(":")[0];
        const args = (m.split(":").length == 1)?[]:(m.slice(m.split(":")[0].length+1)).split(",");

        if(!require("./rlog-cmds.js")[cmd]) {
            msg.reply("Unknown command: " + cmd);
            return;
        }
        try {
            const ret = await require("./rlog-cmds.js")[cmd](msg,args);
            if(ret) msg.reply(ret?.toString()??ret);
        } catch(e) {
            LOG.err("Error executing RatteLog command ("+m+")"+": %s",e,"rattlelog");
        }

    }

}