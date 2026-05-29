const { EmbedBuilder } = require("@discordjs/builders");
const u = require("../../../u");
const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, ContainerBuilder, TextDisplayBuilder, MessageFlags, AttachmentBuilder } = require("discord.js");
const { newMinigame } = require("../minigame");
const fs = require("fs");
const messagesDir = "snake-bot/systems/spawning/messages";

const emerge_noslithers = fs.readFileSync(messagesDir + "/emerge-noslither.txt","utf-8").split(">>");
const emerge_slithers = fs.readFileSync(messagesDir + "/emerge-slither.txt","utf-8").split(">>");
const slithers = fs.readFileSync(messagesDir + "/slither.txt","utf-8").split(">>");
const catches = fs.readFileSync(messagesDir + "/catch.txt","utf-8").split(">>");

const newM = (array) => {
    return array[Math.floor(Math.random()*array.length)];
};

const minigames = [
    "Snake"
];

module.exports = {

    async emerge(guildData,snake,channel,guildId) {

        if(!snake.name) return {
            data: "No type provided.",
            code: -1
        };

        return {
            data: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            evaluate(
                                guildData?.settings?.spawning?.slithering?.enabled ?
                                    newM(emerge_slithers):
                                    newM(emerge_noslithers),
                                {
                                    type: (snake.data.pretty ?? snake.name).toLowerCase(),
                                    channel: `<#${channel.id}>`
                                }
                            )
                        )
                        .setColor(u.color.rgb("#snake-bot"))
                ],
                components: [{type:1,components:[
                    new ButtonBuilder()
                        .setLabel("Catch")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("action:1092")
                ]}],
                files: [
                    new AttachmentBuilder(u.cache.sbdir+"/assets/"+require("../types.json").assetsdir+"/snakes/"+snake.name+".png",{ name: snake.name+".png" })
                ]
            },
            code: 0
        };

    },

    async slither(guildData,snake,channel,guildId) {

        if(!snake.name) return {data:"No type provided.",code:-1};
        return {
            data: {
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            evaluate(
                                newM(slithers),
                                {
                                    type: (snake.data.pretty ?? snake.name).toLowerCase(),
                                    channel: `<#${channel.id}>`
                                }
                            )
                        )
                        .setColor(u.color.rgb("#snake-bot"))
                ],
                components: [{type:1,components:[
                    new ButtonBuilder()
                        .setLabel("Catch")
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId("action:1092")
                ]}],
                files: [
                    new AttachmentBuilder(u.cache.sbdir+"/assets/"+require("../types.json").assetsdir+"/snakes/"+snake.name+".png",{ name: snake.name+".png" })
                ]
            },
            code: 0
        };

    },


    // Handles message as well
    async catch(guildData,data,guild,channel) {

        const guildId = guild.id;

       try {

            const winner = (await guild.members.fetch(data.winner));
            const snake = data.snake;

            const catchMessage = newM(catches);
            const evaluationArguments = {
                user: winner.displayName,
                type: (snake.data.pretty ?? snake.name ?? "unknown").toLowerCase(),
                channel: `<#${channel.id}>`,
                amount: (u.sbdb.getGuildProperty(guildId,`inventories.${winner.user.id}.snakes.${data.snake.name}`)??0) + data.amount, // Feature foreshadowing.......
                "entire-time": u.time.format(data.entireTime*1000), // Uses default time format
                "round-time": u.time.format(data.roundTime*1000),
                minigame: minigames[data.id],
                "social-credit": data.socialCredit,
                "score": data.score
            };
            const content = evaluate(catchMessage,evaluationArguments);
            
            const image = new AttachmentBuilder(`${u.cache.sbdir}/assets/${require("../types.json").assetsdir}/snakes/${data.snake.name}.png`,`${data.snake.name}.png`);

            return {

                data: {
                    components: [],
                    content: "",
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(content + (data.mobile?"\n-# Completed on a mobile device":""))
                            .setColor(u.color.rgb(u.errTitles.newTitle("successColorPack")))
                            .setThumbnail(`attachment://${data.snake.name}.png`)
                    ],
                    files: [image]
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