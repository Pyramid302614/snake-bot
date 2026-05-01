const { SlashCommandBuilder, EmbedBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const u = require("../../u");

const factsFile = "snake-bot/assets/facts.txt";

module.exports = {
    
    data: new SlashCommandBuilder()
        .setName("fact")
        .setDescription("Gives a random Snake Bot fact"),

    context: ["absent"],

    async execute(interaction) {

        const facts = require("fs").readFileSync(factsFile).toString().split("\n");

        await interaction.reply({
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(facts[Math.floor(Math.random()*facts.length)])
                    )
                    .setAccentColor(u.color.rgb(u.errTitles.newTitle("successColorPack")))
            ],
            flags: [MessageFlags.IsComponentsV2]
        })

    }

}