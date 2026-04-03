const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");

const defaultEmerge0 = `
    A <name> has spawned! Press "Catch" to catch it before it slithers away!
`;
const defaultEmerge1 = `
    A <name> has spawned! Press "Catch" to catch it!
`;
const defaultSlither = `
    A <name> has slither into <channel>! Press "Catch to catch it before it slithers away!
`;

// Key: key of snake data
// value value of snake data
function defaultArguments(key,value) {
    return {
        name: value.pretty ?? key
    }
}

module.exports = {

    emerge(guildData,snake) {

        if(!snake.type) return {
            data: "No type provided.",
            code: -1
        };

        const type = snake.type;
        const data = u.snakes.types.getTypeData(type);

        return {
            data: {
                content: evaluate(
                    guildData?.settings?.spawning?.messages?.emerge ??
                        guildData?.settings?.spawning?.slithering?.enabled ?
                            defaultEmerge0:
                            defaultEmerge1,
                    defaultArguments(type,data)
                )
            },
            code: 0
        };

    },

    slither(guildData,snake) {

        if(!snake.type) return "No type provided.";

        const type = snake.type;
        const data = u.snakes.types.getTypeData(type);

        return {
            content: evaluate(
                guildData?.settings?.spawning?.messages?.slither ??
                    defaultSlither,
                defaultArguments(type,data)
            )
        };

    }

}

function evaluate(string,args) {

    for(let i = 0; i < args.length; i++) string.replaceAll(`<${Object.keys(args)[i]}>`,Object.values(args)[i]);
    return string;

}

function catchButton(guildId,snake) {

        if(!snake.type) return "No type provided.";

        const type = snake.type;
        const data = u.snakes.types.getTypeData(type);
    
        return u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Catch me")
                .setStyle(ButtonStyle.Primary),
            async (del,interaction,data) => {

                // Updates instance asynchronously
                u.sbdb.updateGuildProperty(guildId,"spawning.instance.caught",true);

                // Updates count asynchronously
                let amount = 1; // 1 snake
                let path = `inventories.${interaction.user.id}.snakes.${type}`;
                const currentAmount = (u.sbdb.getGuildProperty(
                    guildId,
                    path
                ) ?? 0);
                u.sbdb.updateGuildProperty(
                    guildId,
                    path,
                    currentAmount + amount
                );

                // Shows that you caught it
                await interaction.message.edit({
                    content: `You have caught ${data.pretty??type}! (New amount: ${currentAmount+amount})`, // An assumption on the new value
                    components: []
                });

                // Deletes button from msgelem cache
                del();

            }
        )

}