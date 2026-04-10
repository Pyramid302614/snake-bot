window.addEventListener("DOMContentLoaded",async () => {
    
    document.getElementById("loading").innerHTML = "Playing";

    // Not for you, begone
    let secret = await (await fetch("&&cloudflared/secret:&&guildId")).text();
    await new Promise(resolve => setTimeout(resolve,5000));
    console.log(secret);
    // fetch(`&&cloudflared/close:${secret}:&&guildId:30`);

});

window.close = async () => {

    

}

