const { Events, AttachmentBuilder } = require("discord.js");
const u = require("../u");

module.exports = {
    
    data: Events.MessageCreate,
    once: false,
    
    async execute(message) {

        if(!message.author.bot && message.content == "giss") {
            const filePath = u.cache.sbdir + "/assets/images/misc/yunoball.png";
            return await message.reply({
                files: [new AttachmentBuilder().setFile(filePath)]
            });
        }

    }

}