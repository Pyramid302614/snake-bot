// const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
// const u = require("../../u");

// module.exports = {

//     data: new SlashCommandBuilder()
//         .setName("types")
//         .setDescription("Gives information on types"),

//     contexts: ["absent"],

//     async execute(interaction) {

//         const type = u.snakes.types.allTypes();

//         const text = ``;

//         await interaction.reply({
//             components: [
//                 new ContainerBuilder()
//                     .addTextDisplayComponents(
//                         new TextDisplayBuilder()
//                             .setContent(text)
//                     )
//                     .setAccentColor(u.color.rgb("#snake-bot"))
//             ],
//             flags: [MessageFlags.IsComponentsV2,MessageFlags.Ephemeral]
//         });

//     }

// }