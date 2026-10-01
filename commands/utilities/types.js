const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const u = require("../../u");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("types")
        .setDescription("Gives information on types"),

    contexts: ["absent"],

    async execute(interaction) {

        const types = u.snakes.types.allTypeDatas();
        var text = "### All snake types:\n";
        var multiplier = 1;
        for(const type of Object.values(types)) {
            text += type.pretty + " : " + (Math.round(type.chance*multiplier*100)) + "%\n";
            multiplier *= 1-type.chance;
        }

        await interaction.reply({
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(text)
                    )
                    .setAccentColor(u.color.rgb("#snake-bot"))
            ],
            flags: [MessageFlags.IsComponentsV2,MessageFlags.Ephemeral]
        });

    }

}