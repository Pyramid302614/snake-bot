const u = require("../../u")

module.exports = {
    
    // Returns the index of the pet
    async newPet(guildId,userId,displayName) {

        const pets = u.sbdb.getGuildProperty(guildId,`inventories.${userId}.pets`) ?? [];

        pets.push({
            addedTimestamp: Date.now(),
            displayName: displayName
        });

        await u.sbdb.updateGuildProperty(guildId,`inventories.${userId}.pets`,pets);

        return pets.length-1;

    },

    // Returns pet data from index
    getPet(guildId,userId,index) {

        return u.sbdb.getGuildProperty(guildId,`inventories.${userId}.pets`)?.[index];

    },

    allPets(guildId,userId) {

        return u.sbdb.getGuildProperty(guildId,`inventories.${userId}.pets`) ?? [];

    },

    async updatePet(guildId,userId,index,override) {

        await u.sbdb.updateGuildProperty(guildId,`inventories.${userId}.pets.${index}`,override);

    },

    async editPet(guildId,userId,index,property,parsableValue) {

        await u.sbdb.updateGuildProperty(guildId,`inventories.${userId}.pets.${index}.${property}`,await u.values.parseValue(parsableValue));

    },

    async renderPet(guildId,userId,index) {

        return await require("./render.js").render(
            this.getCharacteristics(
                require("./pets.js").getPet(guildId,userId,index).shards
            )
        );

    },

    // Returns an array of characteristics {type:x,char:x} -> plugs into render function
    getCharacteristics(shards) { // shards: array of type names > [fire,strange,golden]

        const characteristics = [];
        const takenImprints = [];

        const requirements = ["color:body","color:tongue","color:eyes"];

        for(var lapses = 0; true; lapses++) {

            if(lapses > shards.length*10) break; // Call it a day

            var metRequirements = false;
            for(var i = 0; i <= requirements.length; i++) {
                if(i == requirements.length) metRequirements = true; 
                if(metRequirements || !takenImprints.includes(requirements[i])) break;
            }
            if(metRequirements) break;

            for(const shard of shards) {

                if(shard != "none") {

                    const data = u.snakes.types.getTypeData(shard);
                    const imprints = data.imprints;

                    if(imprints !== undefined) { // Non-outdated type

                        for(const imprint of imprints) {

                            if(!takenImprints.includes(imprint)) {
                                takenImprints.push(imprint);
                                characteristics.push({
                                    char: imprint,
                                    type: shard
                                }); // Better formatted to match render function
                                break;
                            }

                        }

                    }

                }

            }

        }

        return characteristics;

    }

}