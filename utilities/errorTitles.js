module.exports = {

    generalPack: [
        "Bad news",
        "What????",
        "Damn",
        "That red message can't be good",
        "Welp",
        "Blame snake",
        "Oops",
        "Its not your fault... or is it?",
        ":despair:",
        "[Insert empathetic message here]",
        "Unlucky"
    ],

    newTitle(name) {
        return this[name][Math.floor(Math.random()*this[name].length)];
    }

}

function merge(arrays) {

    var newArray = [];
    for(const array of arrays) for(const item of array) newArray.push(item);
    return newArray;

}
function remove(items) {

    if(typeof items != "object") items = [items]; // Correction of usage

    var newArray = [];
    for(const item of array) if(!items.includes(item)) newArray.push(item);
    return newArray;

}