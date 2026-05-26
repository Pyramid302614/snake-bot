const { ButtonBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const log = () => { return require("../log/log"); }

module.exports = {
    
    elements: {},

    // Label: The text on the button
    // Style: The button style
    // Executors: The people with permission to press it
    messageElement(data,execute,executors,expire) {

        expire = expire !== false ?? true;

        var eid = this.newEID();
        data.setCustomId("eid:"+eid);
        const elementData = {
            eid: eid,
            executors: executors ?? "everyone",
            execute: execute ?? function() {},
            data: data,
            del: () => {
                if(this.elements[eid] === undefined) return;
                delete this.elements[eid];
            }
        };
        this.elements[eid] = elementData;
        if(expire) require("../../snakelet/adapter.js").timeouts.push(setTimeout(elementData.del,require("../time.js").minutes(10))); else require("../../snakelet/adapter.js").timeouts.push(setTimeout(elementData.del,require("../time.js").hours(24)));
        return elementData;

    },

    newEID() {
        
        var result = null;
        for(var i = 0; !result || Object.keys(this.elements).includes(result); i++) {
            result = Math.floor(Math.random()*10_000_000_000).toString(16);
            if(i > 1000) {
                log().err("[CODE 12] Element ID overflow","","code");
                return null;
            }
        }
        return result;

    },

    // Configured in client interaction detector
    async interaction(interaction) {

        // If not supported message element
        if(!interaction.customId.startsWith("eid:")) return;
        

        var data = this.elements[interaction.customId.slice("eid:".length)];

        if(!data) {
            const generalPack = require("../errorTitles.js").generalPack;
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(generalPack[Math.floor(Math.random()*generalPack.length)])
                        .setDescription("That message element has expired. It's probably because the server just restarted, so run that command again and it will work :)")
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            })
        }

        else if(data.executors == "everyone" || data.executors.includes(interaction.user.id)) {

            data.execute(data.del,interaction,data);

        } else interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ You can't use that")
                    .setColor([255,0,0])
            ],
            flags: [MessageFlags.Ephemeral]
        });

    }

}