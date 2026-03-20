module.exports = {
    parseValue(v) {
        if(v.split(":").length == 1) return v;
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
            temp = temp[split[i]]
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
            temp = temp[split[i]];
        }

        return temp;

    }
}