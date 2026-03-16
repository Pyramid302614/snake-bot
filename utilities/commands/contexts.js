// Context types
// (present - If the bot is in the guild, on by default, also inclusive of bot dm channel)
// absent - If the bot is not in the guild (Like dm channels)

// Discord context types
// 0 - GUILD
// 1 - BOT_DM
// 2 - PRIVATE_CHANNEL

const { EmbedBuilder } = require("@discordjs/builders");
const { MessageFlags, ChannelType } = require("discord-api-types/v10");
const u = require("../../u");

module.exports = {
    // Converts from my custom contexts to discord's
    customToDiscord(custom) {

        const contexts = [0,1];

        if(custom.includes("absent")) contexts.push(2);

        return contexts;

    },
    // Returns weither not to NOT execute the execute function
    async processCommand(interaction,contexts) {

        if(!contexts.includes("absent") && !interaction.guild) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(errtitles0[Math.floor(Math.random()*errtitles0.length)])
                        .setDescription("You cannot use that command here, because it will not work properly.")
                        .setColor(u.color.rgb("#19b957"))
                ],
                flags: [ MessageFlags.Ephemeral ]
            })
            return true;
        }

        return false;

    }
}

// Violating absent 'absent' context guildines
const errtitles0 = [
    "I wouldn't do that if I were you...",
    "Pause",
    "Wait a minute",
    "Halt!",
    "Back!",
    "You shall not pass"
]