const { ContainerBuilder, SeparatorBuilder, TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const wb = require("../wb")
const pets = require("../../pets/pets");
const u = require("../../../u");

module.exports = {

    container(interaction,station,stations,dels) {

        if(stations[station].editting !== undefined) {
            return editting(interaction,station,stations,dels);
        } else {
            return list(interaction,station,stations,dels);
        }

    }

}

function editting(interaction,station,stations,dels) {

    const pet = pets.getPet(interaction.guild.id,interaction.user.id,stations[station].editting);

    return new ContainerBuilder()

        .addActionRowComponents(wb.fetchToolbar(interaction,station,stations,dels))
        .addSeparatorComponents(new SeparatorBuilder())

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
`Customizing **${pet.displayName ?? "???"}**`
                )
        );

}

function list(interaction,station,stations,dels) {

    const pets = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.pets`) ?? [];

    const container = new ContainerBuilder()

        .addActionRowComponents(wb.fetchToolbar(interaction,station,stations,dels))
        .addSeparatorComponents(new SeparatorBuilder())

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    pets.length>0?
`### All pets:`:
`You don't have any pets! :(

You can make one in the "${wb.stationNames[2]}" tab!`
                )
        )

        .setAccentColor(u.color.rgb("#snake-bot"));
    

    for(let i = 0; i < pets.length; i++) {

        const pet = pets[i];

        const editButton = u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel("Edit >")
                .setStyle(ButtonStyle.Secondary),
            (del,b_interaction,d) => {

                for(const Del of dels) Del();
                dels = [];

                stations[station].editting = i;
                b_interaction.update({
                    components: [
                        require("./petEditting.js").container(b_interaction,station,stations,dels)
                    ]
                });
            },
            [interaction.user.id]
        );

        dels.push(editButton.del);

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${pet.displayName ?? "???"}`)
                )
                .setButtonAccessory(editButton.data)
        );

    }

    return container;

}