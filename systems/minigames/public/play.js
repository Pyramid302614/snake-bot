window.addEventListener("DOMContentLoaded",() => {
    
    document.getElementById("loading").innerHTML = "Playing";

});

window.close = () => {

    fetch("&&cloudflared/close:&&guildId");

}

console.log("Pyramid30 was here");