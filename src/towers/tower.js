// Your collision code uses:
// pointInRect(projectile.x, projectile.y,
//             tower.x, tower.y,
//             tower.width, tower.height)
//
// But your tower objects do NOT have width and height properties.
// Therefore tower.width and tower.height are undefined,
// and collision detection always fails.

// --------------------------------------------------
// FIXED TOWER DEFINITIONS
// --------------------------------------------------

import tower_src from "../assets/tower.png";
import tower_destroy_sound from "../assets/tower_destroy.mp3" 

const tower_destroy = new Audio(tower_destroy_sound );
tower_destroy.volume = 0.15;
tower_destroy.preload = "auto";
tower_destroy.currentTime = 0.2;

const tower_img = new Image();
tower_img.src = tower_src;

tower_img.onload = () => {
    console.log("Tower sprite sheet loaded.");
};

const TOWER_WIDTH = 768;
const TOWER_HEIGHT = 1024;

// Size drawn in the game world
const TOWER_DRAW_WIDTH = 200;
const TOWER_DRAW_HEIGHT = 200;

// --------------------------------------------------
// RED TOWER
// --------------------------------------------------
const RED_TOWER = {
    sx: 0,
    sy: 0,
    sw: TOWER_WIDTH,
    sh: TOWER_HEIGHT,

    x: 0,
    y: 0,
    width: TOWER_DRAW_WIDTH,     // REQUIRED FOR COLLISION
    height: TOWER_DRAW_HEIGHT,   // REQUIRED FOR COLLISION
    hp: 250,
};

// --------------------------------------------------
// BLUE TOWER
// --------------------------------------------------
const BLUE_TOWER = {
    sx: TOWER_WIDTH,
    sy: 0,
    sw: TOWER_WIDTH,
    sh: TOWER_HEIGHT,

    x: 0,
    y: 0,
    width: TOWER_DRAW_WIDTH,     // REQUIRED FOR COLLISION
    height: TOWER_DRAW_HEIGHT,   // REQUIRED FOR COLLISION
    hp: 250,
};

const towers = [RED_TOWER, BLUE_TOWER];


// --------------------------------------------------
// DRAW FUNCTIONS
// --------------------------------------------------
function drawTower(ctx, tower) {
    // Skip destroyed towers
    if (tower.hp <= 0) return;

    ctx.drawImage(
        tower_img,
        tower.sx,
        tower.sy,
        tower.sw,
        tower.sh,
        tower.x,
        tower.y,
        tower.width,
        tower.height
    );
}

// --------------------------------------------------
// RANDOMIZE POSITIONS
// --------------------------------------------------
const resetPosition = (ctx) => {
    let canvasWidth = ctx.canvas.width;
    let canvasHeight = ctx.canvas.height;
    RED_TOWER.x =
        Math.random() * (canvasWidth / 2 - TOWER_DRAW_WIDTH);

    RED_TOWER.y =
        Math.random() * (canvasHeight - TOWER_DRAW_HEIGHT);

    // ---------------------------------------------
    // BLUE TOWER: Spawn on RIGHT half of the map
    // x ranges from half-width to canvas width
    // ---------------------------------------------
    BLUE_TOWER.x =
        canvasWidth / 2 +
        Math.random() * (canvasWidth / 2 - TOWER_DRAW_WIDTH);

    BLUE_TOWER.y =
        Math.random() * (canvasHeight - TOWER_DRAW_HEIGHT);
};

// --------------------------------------------------
// DRAW BOTH TOWERS
// --------------------------------------------------
const createTower = (ctx) => {
    if (
        RED_TOWER.x === 0 &&
        RED_TOWER.y === 0 &&
        BLUE_TOWER.x === 0 &&
        BLUE_TOWER.y === 0
    ) {
        resetPosition(ctx);
    }

    drawTower(ctx, RED_TOWER);
    drawTower(ctx, BLUE_TOWER);

    updateTower();
};
const updateTower = () => 
{
    deleteTower();
}
const deleteTower = () =>
{
    towers.forEach((tower, i, arr) => 
        {
            if(tower.hp <= 0)
                {
                    tower_destroy.pause();
                    tower_destroy.currentTime = 1.0; // start after 1 second
                    tower_destroy.play();
                    towers.splice(i, 1);
                }   
        }
    )
}
// --------------------------------------------------
// RETURN TOWER ARRAY
// --------------------------------------------------
const getTowers = () => {
    return towers;
};

export { createTower, getTowers, resetPosition };