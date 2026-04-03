const { ContainerBuilder, SeparatorBuilder, TextDisplayBuilder } = require("discord.js")
const wb = require("../wb")
const u = require("../../../u")

module.exports = {

    container(interaction,station,stations) {

        return new ContainerBuilder()

            .addActionRowComponents(wb.fetchToolbar(interaction,station,stations))
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