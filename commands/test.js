// const { SlashCommandBuilder, ButtonStyle } = require("discord.js");
// const u = require("../u");
// const { ButtonBuilder } = require("@discordjs/builders");

// module.exports = {
    
//     data: new SlashCommandBuilder()
//         .setName("test")
//         .setDescription("Test command"),
//     contexts: [],
//     async execute(interaction) {

//         const button = u.msgelem.messageElement(
//             new ButtonBuilder()
//                 .setLabel("test")
//                 .setStyle(ButtonStyle.Primary),
//             () => {},
//             [interaction.user.id]
//         );

//         interaction.reply({
//             components: [
//                 {
//                     type: 1,
//                     components: [
//                         button.data
//                     ]
//                 }
//             ]
//         });

//         await new Promise(resolve => {
//             button.execute = (del,interaction,data) => {
//                 interaction.update({});
//                 resolve();
//                 del();
//             }
//         });

//         console.log(12);

//     }

// }