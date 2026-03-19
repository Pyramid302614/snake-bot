// Snake Bot Database Utility

var sbdb = require("../snakelet/adapter.js").sbsb;

module.exports = {
    
    async guild(id,then) {

        if(!prechecks(then)) return;

        then(null,sbdb.getSync()?.guilds?.[id]);
        
    },
    guildSync(id) {

        if(!prechecks()) return;

        return sbdb.getSync()?.guilds?.[id];

    },

    guildExists(id) {

        if(!prechecks()) return;

        return Object.keys(sbdb.getSync()).includes(id); // More efficient than fetching all of the guild data? idk

    },

    // Guild obj required properties:
    // - id
    async registerGuild(guildObj) {

        if(!prechecks()) return;

        const data = sbdb.getSync();
        if(!data.guilds) data.guilds = {};
        data.guilds[guildObj.id] = {};
        sbdb.writeSync(data);

    }

}

// Returns if it can continue, and handles 'then's if there is any
function prechecks(then) {
    if(!sbdb) {
        if(require("../snakelet/adapter.js").sbdb) {
            sbdb = require("../snakelet/adapter.js").sbdb;
            return true;
        }
        if(then) then("SBDB not yet configured.",null); // Assuming it's an err dat format
        require("../snakelet/log.js").err("%s",{
            message: "[CODE 13] SBDB not yet configured.",
            stack: new Error().stack
        },"code");
        return false;
    }
    return true;
}