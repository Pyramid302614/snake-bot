const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, ContainerBuilder, TextDisplayBuilder } = require("discord.js");
const { newMinigame } = require("./minigame");

const defaultEmerge0 = `
    A <name> has spawned! Press "Catch" to catch it before it slithers away!
`;
const defaultEmerge1 = `
    A <name> has spawned! Press "Catch" to catch it!
`;
const defaultSlither = `
    A <name> has slithered into <channel>! Press "Catch" to catch it before it slithers away!
`;
const defaultCatch = `
    <user> has caught a <type> after <entire-time>

    New amount: <amount>
`;

// Key: key of snake data
// value value of snake data
function defaultArguments(key,value) {
    return {
        name: value.pretty ?? key
    }
}

module.exports = {

    emerge(guildData,snake,guildId) {

        if(!snake.name) return {
            data: "No type provided.",
            code: -1
        };

        return {
            data: {
                content: evaluate(
                    guildData?.settings?.spawning?.messages?.emerge ??
                        guildData?.settings?.spawning?.slithering?.enabled ?
                            defaultEmerge0:
                            defaultEmerge1,
                    defaultArguments(snake.name,snake.data)
                ),
                components: [{type:1,components:[catchButton(guildId,snake)]}]
            },
            code: 0
        };

    },

    slither(guildData,snake) {

        if(!snake.name) return {data:"No type provided.",code:-1};

        return {
            data: {
                content: evaluate(
                    guildData?.settings?.spawning?.messages?.slither ??
                        defaultSlither,
                    defaultArguments((snake.data.pretty??snake.name).toLowerCase(),snake.data)
                )
            },
            code: 0
        };

    },

    async catch(guildData,snake,guildId) {

        const guild = await u.cache.client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(u.sbdb.getGuildProperty(guildId,"minigame.channelId"));
        const message = await channel.messages.fetch(u.sbdb.getGuildProperty(guildId,"minigame.msgId"));

        // message.update()

    }

}

function evaluate(string,args) {

    for(let i = 0; i < args.length; i++) string = string.replaceAll(`<${Object.keys(args)[i]}>`,Object.values(args)[i]);
    return string;

}

function catchButton(guildId,snake,catching,userCatching) {

        catching = catching ?? false;
        if(!snake) return "No type provided.";
    
        return u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel(catching?`${userCatching.displayName} is catching...`:"Catch me")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(catching),
            async (del,interaction,data) => {

                if(catching) {
                    interaction.update({});
                    return;
                }

                // Updates instance asynchronously
                u.sbdb.updateGuildProperty(guildId,"spawning.instance.caught",true);

                // Updates count asynchronously
                let amount = 1; // 1 snake
                let path = `inventories.${interaction.user.id}.snakes.${snake.name}`;
                const currentAmount = (u.sbdb.getGuildProperty(
                    guildId,
                    path
                ) ?? 0);
                u.sbdb.updateGuildProperty(
                    guildId,
                    path,
                    currentAmount + amount
                );

                newMinigame(interaction,guildId); // Responds to the message
                
                del();
                interaction.update({
                    components: {type:1,components:[catchButton(guildId,snake,true,interaction.user)]}
                });

            },
            catching?[userCatching.id]:"everyone"
        )

}