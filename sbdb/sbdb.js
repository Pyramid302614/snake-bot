// Snake Bot Database Utility

const dir = process.cwd()+"/sbdb";
const sectors = 10;

const fs = require("fs");
const { objectProperty } = require("../utilities/values.js");

var requestsHeap = [];

module.exports = {
    
    async guild(id,then) {

        try {
            then(null,getSync(lookup(id))?.guilds?.[id]);
        } catch(e) {
            then(e,null);
        }
        
    },
    guildSync(id) {

        return getSync(lookup(id))?.guilds?.[id];

    },

    guildExists(id) {

       return lookup(id)!=undefined?true:false;

    },
    
    getAllIDs() {
        return Object.keys(JSON.parse(fs.readFileSync(getLookupPath(),"utf-8")??"{}"));
    },
    lookup: lookup,

    async updateGuildProperty(id,propertyPath,propertyValue) {
        await write(lookup(id),"guilds."+id+"."+propertyPath,propertyValue);
    },
    getGuildProperty(id,propertyPath) {
        if(!propertyPath) require("../utilities/log/log.js").err("%s","You didn't provide a guild id didnt you");
        return objectProperty(this.guildSync(id),propertyPath);
    },

    // Guild obj required properties:
    // - id
    async registerGuild(guildObj) {

        if(this.guildExists(guildObj.id)) return;

        var smallest;
        for(var sector = 0; sector < sectors; sector++) {
            var length = Object.keys(getSync(sector)?.guilds??{})?.length;
            if(!smallest || length < smallest.length) smallest = {
                sector: sector,
                length: length
            }
        }
        // Optimizes by not defining values until necessary, saving space
        addToLookup(guildObj.id,smallest.sector);
        await write(
            smallest.sector,
            `guilds.${guildObj.id}`,
            {
                addedTimestamp: Date.now()
            }
        );

    },
    backupAllSectors: backupAllSectors,
    restoreAllNullSectors: restoreAllNullSectors,
    forceRestore: forceRestore,
    cleanup: cleanup,

    configure() {

        require("../snakelet/adapter.js").intervals.push(setInterval(backupAllSectors,2*24*60*60*1000)); // every two days
        require("../snakelet/adapter.js").intervals.push(setInterval(processAllRequests,1000)); // every one second

    },

    regenerateLookup() {

        var newLookup = {};
        for(var sector = 0; sector < sectors; sector++)
            for(const guildId of Object.keys(getSync(sector)?.guilds ?? []))
                newLookup[guildId] = sector;
        
        fs.writeFileSync(getLookupPath(),JSON.stringify(newLookup,null,2),"utf-8");

    }

}

function lookup(guildId) {

    const data = JSON.parse(fs.readFileSync(getLookupPath(),"utf-8"));
    return data[guildId];

}
function addToLookup(guildId,sector) {

    var data = JSON.parse(fs.readFileSync(getLookupPath(),"utf-8"));
    data[guildId] = sector;
    fs.writeFileSync(getLookupPath(),JSON.stringify(data,null,2),"utf-8");

}

function getSync(sector) {
    try {
        return JSON.parse(fs.readFileSync(getSectorPath(sector),"utf-8")??"{}");
    } catch(ignored) {
        return null;
    }
}
async function get(sector,then) {
    fs.readFile(getSectorPath(sector),"utf-8",(err,dat) => then(err,JSON.parse(dat??"{}")));
}
async function write(sector,path,value) {
    await new Promise(resolve =>
        requestsHeap.push({
            sector: sector,
            data: {
                path: path,
                value: value
            },
            resolve: resolve
        })
    );
}

function getSectorPath(sector) {
    return dir+"/sectors/"+sector+".json";
}
function getLookupPath() {
    return dir+"/lookup.json";
}
function getBackupPath(sector) {
    return dir+"/backups/"+sector+".json";
}



function processAllRequests() {

    // Stores it locally before anyone changes it
    var original = requestsHeap.slice();
    var heap = []; // Reversed heap
    for(let i = original.length-1; i >= 0; i--) {
        heap.push(original[i]);
    }
    requestsHeap = []; // Clears the heap stored

    var datas = {};

    for(const request of heap)
        datas[request.sector+""] = require("../utilities/values.js").modifyObject(
                datas[request.sector+""] ?? getSync(request.sector) ?? {},
                request.data.path,
                request.data.value
        );

    for(const sector of Object.keys(datas)) {

        fs.writeFileSync(getSectorPath(sector),JSON.stringify(datas[sector],null,2),"utf-8");

    }
    
    for(const request of heap) if(request.resolve) request.resolve();
    
}

function backupAllSectors() {
    
    var backedUp = [];
    var notBackedUp = [];

    for(var sector = 0; sector < sectors; sector++) {
        var data = null;
        try {
            data = getSync(sector); // Does this so if getSync() fails (which everything uses), then it wont backup
            if(data) {
                fs.writeFileSync(getBackupPath(sector),JSON.stringify({data:data,timestamp:Date.now()},null,2),"utf-8");
                backedUp.push(sector);
            } else notBackedUp.push(sector);
        } catch(ignored) {
            notBackedUp.push(sector);
        }
    }

    return "Backed up: " + backedUp + " || Not backed up: " + notBackedUp;

}
function restoreAllNullSectors() {
    
    var restored = [];
    var notRestored = [];

    for(var sector = 0; sector < sectors; sector++) {
        var data = null;
        try {
            data = getSync(sector);
            if(!data) {
                restore(sector);
                restored.push(sector);
            } else notRestored.push("(√) " + sector);
        } catch(ignored) {
            notRestored.push("(!) " + sector)
        }
    }

    return "(!) = Error during restoration (√) = Sector was not null\nRestored: " + restored + " || Not restored: " + notRestored;

}
function forceRestore(sector,password) {

    if(!sector) return "Usage: forceRestore <sector>";

    if(password != require("../snakelet/adapter.js").config30.admin_password) return "Unauthorized";

    try {
        restore(sector);
        return "Restored sector " + sector + " ";
    } catch(e) {
        return "Error during restoration:\n```"+e+"```";
    }

}
function restore(sector) {
    var file = fs.readFileSync(getBackupPath(sector),"utf-8");
    var backup = JSON.parse(file==""||!file?"{}":file);
    fs.writeFileSync(getSectorPath(sector),JSON.stringify(backup?.data??{},null,2),"utf-8");
}

function cleanup() {

}