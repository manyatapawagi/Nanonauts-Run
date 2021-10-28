// CONSTANTS
var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 600;
var NANONAUT_WIDTH = 180;
var NANONAUT_HEIGHT = 230;
var GROUND_Y = 540;
var NANONAUT_Y_ACCELERATION = 1;
var nanonautYSpeed = 0;
var SPACE_KEYCODE = 32;
var spaceKeyIsPressed = false;
var NANONAUT_JUMP_SPEED = 20;
var nanonautIsInTheAir = false;
var NANONAUT_X_SPEED = 5;
var cameraX = 0;
var cameraY = 0;
var BACKGROUND_WIDTH = 1000;
var NANONAUT_NR_FRAMES_PER_ROW = 5;
var NANONAUT_NR_ANIMATION_FRAMES = 7;
var nanonautFrameNr = 0;
var NANONAUT_ANIMATION_SPEED = 3;
var gameFrameCounter = 0;
var ROBOT_WIDTH = 141;
var ROBOT_HEIGHT = 139;
var ROBOT_NR_ANIMATION_FRAMES = 9;
var ROBOT_ANIMATION_SPEED = 5;
var ROBOT_X_SPEED = 4;
var MIN_DISTANCE_BETWEEN_ROBOTS = 400;
var MAX_DISTANCE_BETWEEN_ROBOTS = 1200;
var MAX_ACTIVE_ROBOTS = 3;
var screenshake = false;
var SCREENSHAKE_RADIUS = 16;
var NANONAUT_MAX_HEALTH = 100;
var nanonautHealth = NANONAUT_MAX_HEALTH;
var PLAY_GAME_MODE = 0;
var GAME_OVER_GAME_MODE = 1;
var gameMode = PLAY_GAME_MODE;

// SETUP
var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
document.getElementById("wrap").appendChild(canvas);

var nanonautImage = new Image();
nanonautImage.src = 'animatedNanonaut.png';

var nanonautSpriteSheet = {
    nrFramesPerRow: 5,
    spriteWidth: NANONAUT_WIDTH,
    spriteHeight: NANONAUT_HEIGHT,
    image: nanonautImage
};

var nanonautCollisionRectangle = {
    xOffset: 60,
    yOffset: 20,
    width: 50,
    height: 200
};

var robotCollisionRectangle = {
    xOffset: 50,
    yOffset: 20,
    width: 50,
    height: 100
};

var robotImage = new Image();
robotImage.src = 'animatedRobot.png';

var robotSpriteSheet = {
    nrFramesPerRow: 3,
    spriteWidth: ROBOT_WIDTH,
    spriteHeight: ROBOT_HEIGHT,
    image: robotImage
};

var robotData = [];

var nanonautX = CANVAS_WIDTH / 2;
var nanonautY = GROUND_Y - NANONAUT_HEIGHT;

var backgroundImage = new Image();
backgroundImage.src = 'background.png';

window.addEventListener("load", start);
function start() {
    window.requestAnimationFrame(mainLoop);
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

window.addEventListener("click", onClick);

var Bush1Image = new Image();
Bush1Image.src = 'bush1.png';

var Bush2Image = new Image();
Bush2Image.src = 'bush2.png';


var bushData = generateBushes()

function generateBushes() {
    var generatedBushData = [];
    var bushX = 0;
    //for (var i = 0; i < 10; i++) 
    while (bushX < (2 * CANVAS_WIDTH)) {
        var bushImage;
        if (Math.random() >= 0.5) {
            bushImage = Bush1Image;
        }
        else {
            bushImage = Bush2Image;
        }
        generatedBushData.push({
            x: bushX,
            y: 80 + Math.random() * 20,
            image: bushImage
        });
        bushX += 150 + Math.random() * 200;
    }
    return generatedBushData;
}

// MAIN LOOP
function mainLoop() {
    update();
    draw();
    window.requestAnimationFrame(mainLoop);
};

// PLAYER INPUT
function onKeyDown(event) {
    if (event.keyCode === SPACE_KEYCODE) {
        spaceKeyIsPressed = true;
    }
};
function onKeyUp(event) {
    if (event.keyCode === SPACE_KEYCODE) {
        spaceKeyIsPressed = false;
    }
};
function onClick(event) {
    spaceKeyIsPressed = true;
    setTimeout(function () {
        spaceKeyIsPressed = false;
    }, 50);
};

// UPDATING
function update() {

    if (gameMode != PLAY_GAME_MODE) return;

    nanonautX = nanonautX + NANONAUT_X_SPEED;
    if (spaceKeyIsPressed && !nanonautIsInTheAir) {
        nanonautYSpeed = -NANONAUT_JUMP_SPEED;
        nanonautIsInTheAir = true;
    }
    nanonautY = nanonautY + nanonautYSpeed;
    nanonautYSpeed = nanonautYSpeed + NANONAUT_Y_ACCELERATION;
    if (nanonautY > (GROUND_Y - NANONAUT_HEIGHT)) {
        nanonautY = GROUND_Y - NANONAUT_HEIGHT;
        nanonautYSpeed = 0;
        nanonautIsInTheAir = false;
    }

    cameraX = nanonautX - 150;

    gameFrameCounter = gameFrameCounter + 1;
    if ((gameFrameCounter % NANONAUT_ANIMATION_SPEED) === 0) {
        nanonautFrameNr = nanonautFrameNr + 1;
    }
    if (nanonautFrameNr >= NANONAUT_NR_ANIMATION_FRAMES) {
        nanonautFrameNr = 0;
    }

    for (var i = 0; i < bushData.length; i++) {
        if ((bushData[i].x - cameraX) < -CANVAS_WIDTH) {
            bushData[i].x += (2 * CANVAS_WIDTH) + 150;
        }
    }

    screenshake = false;
    var nanonautTouchedARobot = updateRobots();
    if (nanonautTouchedARobot) {
        screenshake = true;
        if (nanonautHealth > 0) nanonautHealth -= 1;
    }

    if (nanonautHealth <= 0) {
        gameMode = GAME_OVER_GAME_MODE;
        screenshake = false;
    }
}

function updateRobots() {
    var nanonautTouchedARobot = false;
    for (var i = 0; i < robotData.length; i++) {
        if (doesNanonautOverlapRobot(
            nanonautX + nanonautCollisionRectangle.xOffset,
            nanonautY + nanonautCollisionRectangle.yOffset,
            nanonautCollisionRectangle.width,
            nanonautCollisionRectangle.height,
            robotData[i].x + robotCollisionRectangle.xOffset,
            robotData[i].y + robotCollisionRectangle.yOffset,
            robotCollisionRectangle.width,
            robotCollisionRectangle.height
        )) {
            nanonautTouchedARobot = true;
        }
        robotData[i].x -= ROBOT_X_SPEED;
        if ((gameFrameCounter % ROBOT_ANIMATION_SPEED) === 0) {
            robotData[i].frameNr = robotData[i].frameNr + 1;
            if (robotData[i].frameNr >= ROBOT_NR_ANIMATION_FRAMES) {
                robotData[i].frameNr = 0;
            }
        }
    }

    var robotIndex = 0;
    while (robotIndex < robotData.length) {
        if (robotData[robotIndex].x < cameraX - ROBOT_WIDTH) {
            robotData.splice(robotIndex, 1);
        }
        else {
            robotIndex += 1;
        }
    }

    if (robotData.length < MAX_ACTIVE_ROBOTS) {
        var lastRobotX = CANVAS_WIDTH;

        if (robotData.length > 0) {
            var lastRobotX = robotData[robotData.length - 1].x;
        }
        var newRobotX = lastRobotX + MIN_DISTANCE_BETWEEN_ROBOTS + Math.random() * (MAX_DISTANCE_BETWEEN_ROBOTS - MIN_DISTANCE_BETWEEN_ROBOTS);
        robotData.push({
            x: newRobotX,
            y: GROUND_Y - ROBOT_HEIGHT,
            frameNr: 0
        });
    }
    return nanonautTouchedARobot;
}
function doesNanonautOverlapRobotAlongOneAxis(nanonautNearX, nanonautFarX,
    robotNearX, robotFarX) {
    var nanonautOverlapsNearRobotEdge = (nanonautFarX >= robotNearX) &&
        (nanonautFarX <= robotFarX);
    var nanonautOverlapsFarRobotEdge = (nanonautNearX >= robotNearX) &&
        (nanonautNearX <= robotFarX);
    var nanonautOverlapsEntireRobot = (nanonautNearX <= robotNearX) &&
        (nanonautFarX >= robotFarX);
    return nanonautOverlapsNearRobotEdge || nanonautOverlapsFarRobotEdge ||
        nanonautOverlapsEntireRobot;
}
function doesNanonautOverlapRobot(nanonautX, nanonautY, nanonautWidth,
    nanonautHeight, robotX, robotY, robotWidth, robotHeight) {
    var nanonautOverlapsRobotOnXAxis = doesNanonautOverlapRobotAlongOneAxis(
        nanonautX,
        nanonautX + nanonautWidth,
        robotX,
        robotX + robotWidth
    );
    var nanonautOverlapsRobotOnYAxis = doesNanonautOverlapRobotAlongOneAxis(
        nanonautY,
        nanonautY + nanonautHeight,
        robotY,
        robotY + robotHeight
    );
    return nanonautOverlapsRobotOnXAxis && nanonautOverlapsRobotOnYAxis;
};

// DRAWING
function draw() {

    var shakenCameraX = cameraX;
    var shakenCameraY = cameraY;
    if (screenshake) {
        shakenCameraX += (Math.random() - .5) * SCREENSHAKE_RADIUS;
        shakenCameraY += (Math.random() - .5) * SCREENSHAKE_RADIUS;
    }

    c.fillStyle = 'LightSkyBlue';
    c.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y - 40);

    var backgroundX = - (cameraX % BACKGROUND_WIDTH);
    c.drawImage(backgroundImage, backgroundX, -210);
    c.drawImage(backgroundImage, backgroundX + BACKGROUND_WIDTH, -210);

    c.fillStyle = 'ForestGreen';
    c.fillRect(0, GROUND_Y - 40, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y + 40);

    for (var i = 0; i < bushData.length; i++) {
        c.drawImage(bushData[i].image, bushData[i].x -
            shakenCameraX, GROUND_Y - bushData[i].y - shakenCameraY);
    }

    for (var i = 0; i < robotData.length; i++) {
        drawAnimatedSprite(robotData[i].x - cameraX,
            robotData[i].y - cameraY, robotData[i].frameNr, robotSpriteSheet);
    }

    drawAnimatedSprite(nanonautX - cameraX, nanonautY - cameraY,
        nanonautFrameNr, nanonautSpriteSheet);

    var nanonautSpriteSheetRow = Math.floor(nanonautFrameNr / NANONAUT_NR_FRAMES_PER_ROW);
    var nanonautSpriteSheetColumn = nanonautFrameNr % NANONAUT_NR_FRAMES_PER_ROW;
    var nanonautSpriteSheetX = nanonautSpriteSheetColumn * NANONAUT_WIDTH;
    var nanonautSpriteSheetY = nanonautSpriteSheetRow * NANONAUT_HEIGHT;
    c.drawImage(nanonautImage, nanonautSpriteSheetX, nanonautSpriteSheetY, NANONAUT_WIDTH, NANONAUT_HEIGHT, nanonautX - cameraX, nanonautY - cameraY, NANONAUT_WIDTH, NANONAUT_HEIGHT);

    function drawAnimatedSprite(screenX, screenY, frameNr, spriteSheet) {
        var spriteSheetRow = Math.floor(frameNr / spriteSheet.nrFramesPerRow);
        var spriteSheetColumn = frameNr % spriteSheet.nrFramesPerRow;
        var spriteSheetX = spriteSheetColumn * spriteSheet.spriteWidth;
        var spriteSheetY = spriteSheetRow * spriteSheet.spriteHeight;
        c.drawImage(
            spriteSheet.image,
            spriteSheetX, spriteSheetY,
            spriteSheet.spriteWidth,
            spriteSheet.spriteHeight,
            screenX, screenY,
            spriteSheet.spriteWidth,
            spriteSheet.spriteHeight,
        );
    }

    var nanonautDistance = nanonautX / 100;
    c.fillStyle = "black";
    c.font = "48px Urbanist";
    c.fillText(nanonautDistance.toFixed(0) + 'm', 860, 40);

    c.fillStyle = 'red';
    c.fillRect(310, 10, nanonautHealth / NANONAUT_MAX_HEALTH * 380, 20);
    c.strokeStyle = 'black';
    c.strokeRect(310, 10, 380, 20);

    if (gameMode == GAME_OVER_GAME_MODE) {
        c.fillStyle = "black";
        c.font = "95px Indie Flower";
        c.fillText("Game Over!", 280, 200);
        c.fillStyle = "white";
        c.font = "95px Urbanist";
        c.fillText("You ran " + nanonautDistance.toFixed(0) + "m", 300, 300);
        document.getElementById("replay").style.display = "block";
    }
};

var loader = document.getElementById("loader");
var blacker = document.getElementById("container");
var body = document.getElementsByTagName("body");
function onloadFunction() {
    loader.style.animation = "none";
    blacker.style.display = "none";
};