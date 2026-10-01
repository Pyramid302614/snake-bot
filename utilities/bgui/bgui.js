const u = require("../../u");

module.exports = {

    async prompt(data) {

        const interaction = data.interaction;
        if(!interaction) return;

        const promise = new Promise();

        const yes = 
            u.msgelem.messageElement(
                new ButtonBuilder()
                    .setLabel(data?.yes?.text ?? "Yes")
                    .setStyle(data?.yes?.style ?? ButtonStyle.Success),
                (del,b_interaction,d) => {

                    for(const Del of dels) Del();
                    if(data.reply ?? true) b_interaction.message.delete();
                    else b_interaction.update(data.original);

                    promise.resolve(true);

                },
                [data.owner ?? interaction.user.id]
            );
            const no = 
                u.msgelem.messageElement(
                    new ButtonBuilder()
                        .setLabel(data?.no?.text ?? "No")
                        .setStyle(data?.no?.style ?? ButtonStyle.Danger),
                    (del,b_interaction,d) => {

                        for(const Del of dels) Del();
                        if(data.reply ?? true) b_interaction.message.delete();
                        else b_interaction.update(data.original);

                        promise.resolve(false);

                    },
                    [data.owner ?? interaction.user.id]
                );

            const dels = [yes.del,no.del];
            

        const msg = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        data.text ?? "Prompt"
                    )
            )
            .addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        yes.data,
                        no.data
                )
            )
            .setAccentColor(data.color ?? [255,255,255]);
            
        if(data.reply ?? true) interaction.reply(msg);
        else interaction.update(msg);
        
        return await promise;

    }

}