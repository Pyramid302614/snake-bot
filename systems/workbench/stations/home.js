const { ContainerBuilder, SeparatorBuilder, TextDisplayBuilder } = require("discord.js")
const wb = require("../wb")
const u = require("../../../u")

module.exports = {

    async container(interaction,station,stations,dels) {

        return new ContainerBuilder()

            .addActionRowComponents(await wb.fetchToolbar(interaction,station,stations,dels))
            .addSeparatorComponents(new SeparatorBuilder())
            
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`
                        Welcome to the workbench    
                    `)
            )

            .setAccentColor(u.color.rgb("#a78355"))

    }

}