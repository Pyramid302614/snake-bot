// Snake Bot Database Utility

const sbdb = require("../snakelet/adapter.js").sbsb;

module.exports = {
    
    async guild(id,then) {

        if(!prechecks(then)) return;

        then(null,sbdb.getSync()?.guilds?.[id]);
        
    },
    guildSync(id) {

        if(!prechecks()) return;

        return sbdb.getSync()?.guilds?.[id];

    },

    // Guild obj required properties:
    // - id
    async registerGuild(guildObj) {

        if(!prechecks(then)) return;

        const data = sbdb.getSync();
        if(!data.guilds) data.guilds = {};
        data.guilds[guildObj.id] = {};
        sbdb.writeSync(data);

    }

}

// Returns if it can continue, and handles 'then's if there is any
function prechecks(then) {
    if(!sbdb) {
        if(then) then("SBDB not yet configured.",null); // Assuming it's an err dat format
        return false;
    }
    return true;
}