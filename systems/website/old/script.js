window.addEventListener("DOMContentLoaded",() => {

    const canvas = document.getElementById("canvas");
    const c = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fps = 60;

    canvas.addEventListener("mousemove",(e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    canvas.addEventListener("mousedown",() => {
        mouseDown = true;
    });
    canvas.addEventListener("mouseup",() => {
        mouseDown = false;
    });
    window.addEventListener("keydown",(e) => {
        keysPressed.push(e.keyCode);
    });
    window.addEventListener("keyup",(e) => {
        var newKeys = [];
        for(const key of keysPressed) {
            if(e.keyCode != key) newKeys.push(key);
        }
        keysPressed = newKeys;
    });

    setInterval(() => {

        draw(c,canvas);

    },1000/fps);
    
});

var mouseX = 0;
var mouseY = 0;
var mouseDown = false;
var keysPressed = [];

const minigame = "&&minigameID";

function draw(c,canvas) {
    
    c.fillStyle = "rgb(255,255,255)";
    c.fillRect(0,0,canvas.width,canvas.height);

    // Do stuff here
    if(minigame == "**minigameID") {
        c.fillStyle = "rgb(0,0,0)";
        c.fillText("Minigame ID not provided.",50,50);
        return;
    };
    minigames[parseInt(minigame)](c,canvas,{mouseX:mouseX,mouseY:mouseY,keysPressed:keysPressed,mouseDown:mouseDown});

}

const minigames = [

    // 0
    minigame0.draw

]