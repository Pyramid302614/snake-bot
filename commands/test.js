const { SlashCommandBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const u = require("../u");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("test"),
    contexts: ["absent"],
    async execute(interaction) {
        await interaction.reply({
            components: [
                {
                    type: 1,
                    components: [
                        u.msgelem.messageElement(
                            new ButtonBuilder()
                                .setLabel("Open")
                                .setStyle(ButtonStyle.Primary),
                            async (del,interaction,data) => {
                                await require("../systems/website/website.js").init(interaction.guild.id,interaction.user.id);
                                await interaction.launchActivity({
                                    "application_id": u.cache.client.user.id
                                });
                                del();
                            },
                            [interaction.user.id]
                        ).data
                    ]
                }
            ]
        });
    }
}