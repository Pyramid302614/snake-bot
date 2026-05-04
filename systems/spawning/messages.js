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

module.exports = {

    async emerge(guildData,snake,guildId) {

        if(!snake.name) return {
            data: "No type provided.",
            code: -1
        };

        return {
            data: {
                content: evaluate(
                    guildData?.settings?.spawning?.slithering?.enabled ?
                        newEmerge0Message():
                        newEmerge1Message(),
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
                    newSlitherMessage(),
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


    // Handles message as well
    async catch(guildData,data,guild,channel) {

        const guildId = guild.id;

       try {

            const winner = (await guild.members.fetch(data.winner)).user;
            const snake = data.snake;

            const catchMessage = newCatchMessage();
            const evaluationArguments = {
                user: winner.displayName,
                type: (snake.data.pretty ?? snake.name ?? "unknown").toLowerCase(),
                channel: (channel.displayName ?? channel.id ?? "unknown"),
                amount: data.amount, // Feature foreshadowing.......
                "entire-time": u.time.format(data.entireTime), // Uses default time format
                "round-time": u.time.format(data.roundTime)
            };
            const content = evaluate(catchMessage,evaluationArguments);
            
            return {

                data: {
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
                },
                code: 0

            };

        } catch(e) {

            return {

                data: e,
                code: -1

            }

        }

    }

}

function evaluate(string,args) {

    for(let i = 0; i < Object.keys(args).length; i++) string = string.replaceAll(`<${Object.keys(args)[i]}>`,Object.values(args)[i]);
    return string;

}

function newCatchMessage() {
    return defaultCatch;
}
function newEmerge0Message() {
    return defaultEmerge0;
}
function newEmerge1Message() {
    return defaultEmerge1;
}
function newSlitherMessage() {
    return defaultSlither;
}