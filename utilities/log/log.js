const { EmbedBuilder } = require("discord.js");

module.exports = {
    
    channel: null,
    channelObj: null,

    async fetchchannel(snakeletClient) {

        const guild = await snakeletClient.guilds.fetch(require("../../snakelet/adapter.js").config30.ids.log[require("../../snakelet/adapter.js").chip?0:1].split(":")[0]);
        this.channel = require("../../snakelet/adapter.js").config30.ids.log[require("../../snakelet/adapter.js").chip?0:1].split(":")[1];
        this.channelObj = await guild.channels.cache.get(this.channel);

    },

    log(msg,discordOnly) {

        try {
            if(!discordOnly) console.log(msg);
            if(!require("../../snakelet/adapter.js").nodisclog) this.inChannel(msg);
        } catch(ignored) {}

    },
    async inChannel(msg) {
        
        for(const match of msg.matchAll("\x1b\\[\\d*m")) {
            msg = msg.replaceAll(match[0],"**");
        }
        for(const match of msg.matchAll("[^\\/\\\\\\s]?([^\\/\\\\\\s]+[\\/\\\\])*[^\\/\\\\\\s]+\\.((json)|(js)|(txt)|(md))")) {
            msg = msg.replaceAll(match[0],"`"+match[0]+"`");
        }

        if(this.channelObj) await this.channelObj.send(msg ?? "_ _");

    },

    err(message,e,flavor) {

        // Null checking
        flavor = flavor ?? "unknown";

        console.error(message,e.stack??e);

        let pings = "";
        for(const person of require("../../snakelet/adapter.js").config30.chosen_ones) {
            pings += " <@"+person+">";
        }
        pings = pings.slice(1); // removes first space

        try {
            if(!require("../../snakelet/adapter.js").nodisclog) this.channelObj.send({
            content: (flavor=="code"?pings:""),
            embeds: [
                new EmbedBuilder()
                    .setTitle(message.replaceAll("%s",e.message??e))
                    .setDescription("```"+(e.stack ?? "No stack provided.")+"```")
                    .setColor(error_flavors[flavor] ?? [0,0,0])
            ]
        });
        } catch(ignored) {}

    }

}

const error_flavors = {
    "uncaught": [255,0,230],
    "normal": [255,0,0],
    "rattlelog": [144,0,255],
    "code": [117,8,12], // Relies on this being named "code" for pings
    "unknown": [0,0,0]
}