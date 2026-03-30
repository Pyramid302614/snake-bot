const { ButtonBuilder, ButtonStyle } = require("discord.js");
const u = require("../../../u");

const wb = require("../../../commands/utilities/wb.js");

module.exports = {

    make(interaction,station,stations) {

        return [
            u.msgelem.messageElement(
                new ButtonBuilder()
                    .setLabel("Button!")
                    .setStyle(ButtonStyle.Primary),
                async (del,interaction,data) => {
                    await interaction.update({});
                    stations[station].test = (stations[station].test ?? 0) + 1;
                    await interaction.message.edit({
                        embeds: await wb.display(interaction,station,stations),
                        components: wb.fetchToolbar(interaction,station,stations)
                    });
                    del();
                },
                [interaction.user.id]
            ).data
        ];

    }

}