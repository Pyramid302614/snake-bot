const { ContainerBuilder, SeparatorBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, LabelBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const wb = require("../wb");
const u = require("../../../u");
const pets = require("../../pets/pets.js");

module.exports = {
 
    container(interaction,station,stations,dels) {


        const blanks = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.snakes.blank`) ?? 0;
        const pets = (u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.pets`)??[]).length;

        const makeNewPet = u.msgelem.messageElement(
            new ButtonBuilder()
                .setLabel(blanks > 0 ? "Make new pet" : "You do not have any blank snakes! Wait for one to spawn.")
                .setStyle(blanks > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(blanks <= 0 || pets >= 10),
            async (del,b_interaction,d) => {
                for(const Del of dels) Del();
                dels = [];
                b_interaction.update(await success(b_interaction,station,stations,dels));
            },
            [interaction.user.id]
        );
        
        dels.push(makeNewPet.del);

        return new ContainerBuilder()

            .addActionRowComponents(wb.fetchToolbar(interaction,station,stations,dels))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        pets < 10?
`### Blank Snake Pet-ification
Here, you can take a blank snake you caught and turn
it into an ownable pet, and then customize it's name
and looks :)

You can have up to **10 pets** due to storage limitations,
but this may change in the future. (You have ${pets})

You have **${blanks}** blank snake${blanks==1?"":"s"}.
Pressing the below button will take from that amount.
`:
`### Uh oh! You have reached the limit of 10 pets.
If you have any pets you don't really care about, you
can delete them in the "${wb.stationNames[3]}" tab.

This limit is in place due to storage limitations, as an image of your pet is
stored at all times in the database, which can add up at times. Sorry!`
                    )
            )
            .addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        makeNewPet.data
                    )
            )
            .setAccentColor(u.color.rgb("#1d89f5"))


    }

}

async function success(interaction,station,stations,dels) {

    // If success pop-up just popped up
    if(stations[station].index === undefined) {
        
        stations[station].index = await pets.newPet(interaction.guild.id,interaction.user.id,"(Unnamed Pet)"); // Makes new pet

        const blanksAmount = u.sbdb.getGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.snakes.blank`) ?? 0; // Removes 1 blank snake from inventory
        await u.sbdb.updateGuildProperty(interaction.guild.id,`inventories.${interaction.user.id}.snakes.blank`,blanksAmount-1);
    
    }
    
    const nameInput = new TextInputBuilder()
            .setPlaceholder("e.g., sir rattles, dr. slither, 2012 Volkswagon Jetta")
            .setStyle(TextInputStyle.Short)
            .setCustomId("inputBox")
            .setRequired(true);

    const nameModal = u.msgelem.messageElement(
        new ModalBuilder()
            .setTitle("Enter name")
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Enter your new snake's name here:")
                    .setDescription("btw anything you name this little feller I am NOT responsible for")
                    .setTextInputComponent(
                        nameInput
                    )
            ),
        async (del,b_interaction,d) => {
            
            del(); // Modal
            for(const Del of dels) Del(); // Original
            dels = []; // Original
            
            var name = b_interaction.fields.getTextInputValue("inputBox") ?? "";
            await pets.editPet(interaction.guild.id,interaction.user.id,stations[station].index,"displayName",`string:${name}`);

            stations[3] = {
                editting: stations[station].index
            };
            await b_interaction.update({ // Redirects to station 3 (Pet Editting)
                components: [require("../wb.js").getContainer(b_interaction,3,stations,dels)]
            });

        },
        [interaction.user.id]
    );

    const enterName = u.msgelem.messageElement(
        new ButtonBuilder()
            .setLabel("Enter name...")
            .setStyle(ButtonStyle.Primary),
        (del,b_interaction,d) => {
            b_interaction.showModal(nameModal.data);
        },
        [interaction.user.id]
    );

    return {
        components: [
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
`### Wahoo!!!!!!
You have a new pet! What do you want to call it?`
                        )
                )
                .addActionRowComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            enterName.data
                        )
                )
                .setAccentColor(u.color.rgb("#ffee00"))
        ]
    }

}