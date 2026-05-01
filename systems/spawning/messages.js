const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../u");
const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const { newMinigame } = require("./minigame");

const defaultEmerge0 = `
A <type> has spawned! Press "Catch" to catch it before it slithers away!
`;
const defaultEmerge1 = `
A <type> has spawned! Press "Catch" to catch it!
`;
const defaultSlither = `
A <type> has slithered into <channel>! Press "Catch" to catch it before it slithers away!
`;
const defaultCatch = `
### <user> has caught a <type> in <entire-time>
Minigame round time: <round-time>
New amount: <amount> <type>s.
`;

// Key: key of snake data
// value value of snake data
function defaultArguments(key,value) {
    return {
        name: value.pretty ?? key
    }
}

module.exports = {

    async emerge(guildData,snake,guildId) {

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
                    {
                        type: (snake.data.pretty ?? snake.name).toLowerCase()
                    }
                ),
                components: [{type:1,components:[
                    new ButtonBuilder()
                        .setLabel("Catch")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("action:1092")
                ]}]
            },
            code: 0
        };

    },

    async slither(guildData,snake,channel,guildId) {

        if(!snake.name) return {data:"No type provided.",code:-1};

        return {
            data: {
                content: evaluate(
                    guildData?.settings?.spawning?.messages?.slither ??
                        defaultSlither,
                    {
                        type: (snake.data.pretty ?? snake.name).toLowerCase()
                    }
                )
            },
            code: 0
        };

    },


    // Handles message as well
    async catch(guildData,data,guildId) {

        const minigame = u.sbdb.getGuildProperty(guildId,"minigame");

        const guild = (u.cache.client.guilds.cache.get(guildId)) ?? (await u.cache.client.guilds.fetch(guildId));
        const channel = (guild.channels.cache.get(minigame.channelId)) ?? (await guild.channels.fetch(minigame.channelId));
        const message = (channel.messages.cache.get(minigame.msdId)) ?? (await channel.messages.fetch(minigame.msgId));

        const winner = (await guild.members.fetch(data.winner)).user;
        const snake = data.snake;

        const catchMessage = guildData?.settings?.spawning?.messages?.catch ?? defaultCatch;
        const evaluationArguments = {
            user: winner.displayName,
            type: (snake.data.pretty ?? snake.name ?? "unknown").toLowerCase(),
            channel: (channel.displayName ?? channel.id ?? "unknown"),
            amount: 1, // Feature foreshadowing.......
            "entire-time": data.entireTime,
            "round-time": data.roundTime
        };
        const content = evaluate(catchMessage,evaluationArguments);
        message.edit({
            components: [],
            content: "",
            components: [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(content + (data.mobile?"-# Completed on a mobile device":""))
                    )
                    .setAccentColor(u.color.rgb(u.errTitles.newTitle("successColorPack")))
            ],
            flags: [MessageFlags.IsComponentsV2]
        });

        u.sbdb.updateGuildProperty(guildId,"minigame",{});

    }

}

function evaluate(string,args) {

    for(let i = 0; i < Object.keys(args).length; i++) string = string.replaceAll(`<${Object.keys(args)[i]}>`,Object.values(args)[i]);
    return string;

}

// function catchButton(guildId,snake,catching,userCatching) {

//         catching = catching ?? false;
//         if(!snake) return "No type provided.";
    
//         return u.msgelem.messageElement(
//             new ButtonBuilder()
//                 .setLabel(catching?`${userCatching.displayName} is catching...`:"Catch me")
//                 .setStyle(ButtonStyle.Primary)
//                 .setDisabled(catching),
//             async (del,interaction,data) => {

//                 if(catching) {
//                     interaction.update({});
//                     return;
//                 }

//                 // Updates instance asynchronously
//                 u.sbdb.updateGuildProperty(guildId,"spawning.instance.caught",true);

//                 // Updates count asynchronously
//                 let amount = 1; // 1 snake
//                 let path = `inventories.${interaction.user.id}.snakes.${snake.name}`;
//                 const currentAmount = (u.sbdb.getGuildProperty(
//                     guildId,
//                     path
//                 ) ?? 0);
//                 u.sbdb.updateGuildProperty(
//                     guildId,
//                     path,
//                     currentAmount + amount
//                 );

//                 newMinigame(interaction,guildId); // Responds to the message
                
//                 del();
//                 interaction.update({
//                     components: {type:1,components:[catchButton(guildId,snake,true,interaction.user)]}
//                 });

//             },
//             catching?[userCatching.id]:"everyone"
//         )

// }

