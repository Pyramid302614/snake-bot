const { ContainerBuilder, SeparatorBuilder, TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, FileBuilder } = require("discord.js")
const wb = require("../wb")
const pets = require("../../pets/pets");
const u = require("../../../u");

module.exports = {

    async container(interaction,station,stations,dels,data) {

        if(stations[station].editting !== undefined) {
            return await editting(interaction,station,stations,dels,data);
        } else {
            return await list(interaction,station,stations,dels);
        }

    }

}

async function editting(interaction,station,stations,dels,data) {

    var selected = stations[station].shards;

    const pet = pets.getPet(interaction.guild.id,interaction.user.id,stations[station].editting);
    const shards = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.shards`);

    
    if(selected === undefined) selected = pet?.shards?.slice?.() ?? [];
    for(const shard of selected) shards[shard]--;

    // Shards: pet.shards (real)  -  selected (draft)  -  shards (inv)

    
    const options = [];
    Object.keys(shards).forEach(i => {
        if(shards[i] > 0) options.push({
            label: u.snakes.types.getTypeData(i).shardPretty + " (Available: " + shards[i] + ")",
            value: i
        });
    });
    options.push({ label: "None", value: "none" }); // Also makes sure list is always 1 in length

    var draft = false;
    for(var i = 0; i < 3; i++) {
        if(selected?.[i] != pet?.shards?.[i]) {
            draft = true;
            break;
        }
    }


    const returnToList = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("< Return to list")
            .setStyle(ButtonStyle.Secondary),
        async (del,b_interaction,d) => {

            for(const Del of dels) Del();
            dels = [];

            stations[station] = [];
            b_interaction.update(await wb.getMessage(interaction,station,stations,dels));                        

        },
        [interaction.user.id]
    );

    const shardA = u.msgelem.messageElement(
        new StringSelectMenuBuilder()
            .addOptions(options)
            .setPlaceholder(selected[0] ? (selected[0] == "none" ? "None" : ((pet?.shards?.[0] == selected[0] ? "" : "*") + u.snakes.types.getTypeData(selected[0]).shardPretty)) : "( ! ) Selected Shard A"),
        async (del,b_interaction,d) => {
            for(const Del of dels) Del();
            dels = [];
            selected[0] = b_interaction.values[0];
            stations[station].shards = selected;
            b_interaction.update(await wb.getMessage(interaction,station,stations,dels));
        },
        [interaction.user.id]
    );
    const shardB = u.msgelem.messageElement(
        new StringSelectMenuBuilder()
            .addOptions(options)
            .setPlaceholder(selected[1] ? (selected[1] == "none" ? "None" : ((pet?.shards?.[1] == selected[1] ? "" : "*") + u.snakes.types.getTypeData(selected[1]).shardPretty)) : "( ! ) Selected Shard B"),
        async (del,b_interaction,d) => {
            for(const Del of dels) Del();
            dels = [];
            selected[1] = b_interaction.values[0];
            stations[station].shards = selected;
            b_interaction.update(await wb.getMessage(interaction,station,stations,dels));
        },
        [interaction.user.id]
    );
    const shardC = u.msgelem.messageElement(
        new StringSelectMenuBuilder()
            .addOptions(options)
            .setPlaceholder(selected[2] ? (selected[2] == "none" ? "None" : ((pet?.shards?.[2] == selected[2] ? "" : "*") + u.snakes.types.getTypeData(selected[2]).shardPretty)) : "( ! ) Selected Shard C"),
        async (del,b_interaction,d) => {
            for(const Del of dels) Del();
            dels = [];
            selected[2] = b_interaction.values[0];
            stations[station].shards = selected;
            b_interaction.update(await wb.getMessage(interaction,station,stations,dels));
        },
        [interaction.user.id]
    );
    const imprint = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("IMPRINT")
            .setDisabled(selected.length < 3 || !draft)
            .setStyle((selected.length < 3 || !draft) ? ButtonStyle.Secondary : ButtonStyle.Danger),
        async (del,b_interaction,d) => {
            for(const Del of dels) Del();
            dels = [];
            await pets.editPet(interaction.guild.id,interaction.user.id,stations[station].editting,"shards",`object:["${selected.join("\",\"")}"]`);
            stations[station] = {editting:stations[station].editting};
            for(var i = 0; i < selected.length; i++) if(pet?.shards?.[i] != selected[i]) u.sbdb.updateGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.shards.${selected[i]}`,u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.shards.${selected[i]}`)-1)
            b_interaction.update(await wb.getMessage(interaction,station,stations,dels));
        },
        [interaction.user.id]
    );
    const revert = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("Revert")
            .setStyle(ButtonStyle.Secondary),
        async (del,b_interaction,d) => {
            for(const Del of dels) Del();
            dels = [];
            stations[station].shards = undefined; // Forces regrab
            b_interaction.update(await wb.getMessage(interaction,station,stations,dels));
        },
        [interaction.user.id]
    );

    dels.push(returnToList.del);
    dels.push(shardA.del);
    dels.push(shardB.del);
    dels.push(shardC.del);
    dels.push(imprint.del);
    dels.push(revert.del);

    const renderShards = selected.slice();
    for(var i = 0; i < renderShards.length; i++) {
        if(typeof renderShards[i] !== "string") renderShards[i] = "none";
    } // Prevents <1 blank item>
    const render = await pets.renderTheoreticalPet(renderShards,draft);
    const attachment = new AttachmentBuilder().setFile(render).setName("render.png").setDescription("Render"); // ig we are just assuming PNG type?
    data.files = [attachment];

    return new ContainerBuilder()

        .addActionRowComponents(await wb.fetchToolbar(interaction,station,stations,dels))
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(new ActionRowBuilder()
            .addComponents(
                returnToList.data
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder()
                        .setURL("attachment://render.png")
                        .setDescription("Render")
                )
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
`Customizing **${pet.displayName ?? "???"}**`
                )
        )
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    shardA.data
                ),
            new ActionRowBuilder()
                .addComponents(
                    shardB.data
                ),
            new ActionRowBuilder()
                .addComponents(
                    shardC.data
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
        )
        .addActionRowComponents(
            new ActionRowBuilder()
                .setComponents(
                    revert.data,
                    imprint.data
                )
        )
        .setAccentColor(u.color.rgb("#ffffff"))

}

async function list(interaction,station,stations,dels) {

    const pets = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.pets`) ?? [];

    const container = new ContainerBuilder()

        .addActionRowComponents(await wb.fetchToolbar(interaction,station,stations,dels))
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
            async (del,b_interaction,d) => {

                for(const Del of dels) Del();
                dels = [];

                stations[station].editting = i;
                b_interaction.update(await wb.getMessage(interaction,station,stations,dels));

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