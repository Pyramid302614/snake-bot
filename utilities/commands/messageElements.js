const { ButtonBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const log = () => { return require("../log/log"); }

module.exports = {
    
    elements: {},

    // Label: The text on the button
    // Style: The button style
    // Executors: The people with permission to press it
    messageElement(data,execute,executors) {

        var eid = this.newEID();
        data.setCustomId("eid:"+eid);
        const elementData = {
            eid: eid,
            executors: executors ?? "everyone",
            execute: execute ?? function() {},
            data: data,
            del: () => {
                var index = Object.keys(this.elements).indexOf(eid.toString());
                if(index == -1) return;
                delete this.elements[eid];
            }
        };
        this.elements[eid] = elementData;
        require("../../snakelet/adapter.js").intervals_or_timeouts.push(setTimeout(elementData.del,30*60*1000)); // 30 minutes
        return elementData;

    },

    newEID() {
        
        var result = null;
        for(var i = 0; !result || Object.keys(this.elements).includes(result); i++) {
            result = Math.floor(Math.random()*10_000);
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
                        .setDescription("That button has expired. It's probably because the server just restarted, so run that command again and it will work :)")
                        .setColor([255,0,0])
                ],
                flags: [MessageFlags.Ephemeral]
            })
        }

        else if(data.executors == "everyone" || data.executors.includes(interaction.user.id)) {

            data.execute(data.del,interaction,data);

        } else interaction.update({});

    }

}