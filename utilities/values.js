module.exports = {
    async parseValue(v) {
        var split = [v.split(":")[0],v.slice(v.split(":")[0].length+1)];
        if(split.length == 1) return v;
        if(typeof v != "string") return v;
        if(!Object.keys(parsable).includes(split[0])) return v;
        return await parsable[split[0]](split[1]);
    },
    // Obj: object
    // Path: path.to.property
    // Value: value (parsed)
    modifyObject(obj,path,value) {

        // I call it the Moonwalk algorithm
        // It dissects all the sub properties, and then moonwalks back until the original is modified
        var temp = structuredClone(obj);
        var dissected = [];
        var split = path.split(".");
        for(let i = 0; i < split.length; i++) {
            dissected.push(temp ?? {});
            if(i != split.length-1 && typeof temp?.[split[i]] != "object") temp[split[i]] = {};
            temp = temp[split[i]];
        }
        dissected.push(value);
        for(let i = split.length-1; i >= 0; i--)
            dissected[i][split[i]] = dissected[i+1];

        return dissected[0];
    
    },
    // Obj: object
    // Path: path.to.property
    objectProperty(obj,path) {

        var temp = structuredClone(obj);
        var split = path.split(".");
        for(let i = 0; i < split.length; i++) {
            if(temp == undefined || temp[split[i]] == undefined) return undefined;
            temp = temp[split[i]];
        }

        return temp;

    }
}

const parsable = {
    "number": (v) => { return parseFloat(v); },
    "string": (v) => { return v; },
    "now": (v) => { return Date.now(); },
    "boolean": (v) => { return v == "true"; },
    "object": (v) => { return JSON.parse(v); },
    "guild": async (v) => { return await require("../cache.js").client.guilds.fetch(v); },
    "channel": async (v) => { return await (await require("../cache.js").client.guilds.fetch(v.split("/")[0])).channels.fetch(v.split("/")[1]); }
}