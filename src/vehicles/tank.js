import { pointInRect } from "../helpers/helper";
import { fireProjectile, fireTankProjectile } from "../projectile/projectiles";
import tank_shoot_sound from "../assets/tank_shot.mp3"
import tank_driving_sound from "../assets/tank_driving_sound.mp3"
import tank_idle_sound from "../assets/tank_idle.mp3";
import tank_reload_sound from "../assets/tank_reload.mp3";
const tank_width = 160;
const tank_height = 120;

const barel_width = 150;
const barel_height = 20;

const gunner_width = 50;
const gunner_height = 10;

const tankParticles = [];

const tank_shoot = new Audio(tank_shoot_sound);
tank_shoot.volume = 0.004;
tank_shoot.preload = "auto";

const tank_reload = new Audio(tank_reload_sound);
tank_reload.volume = 0.4;
tank_reload.preload = "auto";

const tank_driving = new Audio(tank_driving_sound);
tank_driving.volume = 0.4;
tank_driving.loop = true;
tank_driving.preload = "auto";

const tank_idle = new Audio(tank_idle_sound);
tank_idle.volume = 0.4;
tank_idle.loop = true;
tank_idle.preload = "auto";

const createFireParticle = (tank) =>
{
    tankParticles.push({
        x: tank.x + tank.width / 2 + (Math.random() - 0.5) * 20,
        y: tank.y + tank.height / 2,

        vx: (Math.random() - 0.5),
        vy: -2,

        radius: 5 + Math.random() * 8,

        life: 25,
        maxLife: 25,

        type: "fire"
    });
};
const createSmokeParticle = (tank) =>
{
    tankParticles.push({
        x: tank.x + tank.width / 2 + (Math.random() - 0.5) * 40,
        y: tank.y + tank.height / 2,

        vx: (Math.random() - 0.5) * 0.5,
        vy: -1 - Math.random(),

        radius: 10 + Math.random() * 10,

        life: 60,
        maxLife: 60,

        type: "smoke"
    });
};
const updateTankParticles = () =>
{
    for(let i = tankParticles.length - 1; i >= 0; i--)
    {
        const p = tankParticles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life--;

        if(p.life <= 0)
        {
            tankParticles.splice(i, 1);
        }
    }
};
const drawTankParticles = (context) =>
{
    tankParticles.forEach(p =>
    {
        const alpha = p.life / p.maxLife;

        context.globalAlpha = alpha;

        if(p.type === "smoke")
        {
            context.fillStyle = "gray";
        }
        else
        {
            context.fillStyle = "orange";
        }

        context.beginPath();

        context.arc(
            p.x,
            p.y,
            p.radius,
            0,
            Math.PI * 2
        );

        context.fill();
    });

    context.globalAlpha = 1;
};
const pauseTankSounds = () =>
{
    tank_driving.pause();
    tank_driving.currentTime = 0;

    tank_idle.pause();
    tank_idle.currentTime = 0;
}
const createTank = (tanks, nextTankId, boundaries, player, isEnemy) =>
{
    const minX = boundaries.b_1.x;
    const maxX = boundaries.b_3.x - tank_width;

    const minY = boundaries.b_2.y;
    const maxY = boundaries.b_4.y - tank_height;

    let color = "#ff0000"
    let team = player.team;
    if(isEnemy)
    {
        //or get enemy team data and set here
        color = "#0088ff"
        team = "blue"
    }

    tanks.push({
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
        team: team,
        width: tank_width,
        height: tank_height,
        hp: 1000,
        maxHp: 1000,
        color: color,
        label: "vehicle",
        move_speed: 1.5,
        hasPlayer: false,
        bodyAngle: 0,
        barrelAngle: 0,
        lastShotTime: 0,
        projectile_delay: 3500,
        projectile_speed: 8,
        id: nextTankId,
        damage: 100,
        hitTimer: 0,
        moveAngle: Math.random() * Math.PI * 2,
        turnTimer: 0,
        lastShot: 0
    });
}
const drawTank = (tank, context, keys) =>
{
    let selected = "tank";
    if(keys.q)
    {
        selected = "gunner"
    }
    else
    {
        selected = "tank";
    }
    let color = tank.team;
    if(tank.hp <= 0 )
    {
        color = "black";
    }
    const centerX =
        tank.x + tank_width / 2;

    const centerY =
        tank.y + tank_height / 2;

    const hp = tank.hp
    const team_color = color;
    const y_OFFSET = tank.y - 60; 

    context.fillStyle = team_color;

    context.fillText(
        hp,
        centerX,
        y_OFFSET //above the tank
        )

    //-----------------------------------
    // BODY
    //-----------------------------------
    context.save();

    context.translate(
        centerX,
        centerY
    );

    context.rotate(
        tank.bodyAngle
    );
    let body_color = team_color; 
    if( tank.hp <= 0)
    {
        body_color = "black;"
    }
    context.fillStyle =
        body_color;

    context.fillRect(
        -tank_width / 2,
        -tank_height / 2,
        tank_width,
        tank_height
    );

    // Tracks
    context.fillStyle =
        "rgb(10,60,10)";

    context.fillRect(
        -tank_width / 2,
        -tank_height / 2,
        20,
        tank_height
    );

    context.fillRect(
        tank_width / 2 - 20,
        -tank_height / 2,
        20,
        tank_height
    );

    // Turret base
    context.fillStyle =
        "black";

    context.beginPath();

    context.arc(
        0,
        0,
        35,
        0,
        Math.PI * 2
    );

    context.fill();

    context.restore();

    drawTankParticles(context);
    //draw particles after the body

    //-----------------------------------
    // BARREL
    //-----------------------------------
    context.save();

    context.translate(
        centerX,
        centerY
    );
    if(selected == "tank")
    context.rotate(
        tank.barrelAngle
    );

    context.fillStyle =
        "rgb(31,179,38)";

    context.fillRect(
        0,
        -barel_height / 2,
        barel_width,
        barel_height
    );

    //-----------------------------------
    // MACHINE GUN
    //-----------------------------------
    context.fillStyle =
        "black";
    if(selected == "gunner")
    context.rotate(
        tank.barrelAngle
    );

    context.fillRect(
        20,
        -gunner_height / 2,
        gunner_width,
        gunner_height
    );
    context.restore();
};
const handleEnemyTankAI = (
    tank,
    player,
    boundaries,
    gameTime,
    projectiles
) =>
{
    if (!player)
    return;

    const dx =
        player.x -
        (tank.x + tank_width / 2);

    const dy =
        player.y -
        (tank.y + tank_height / 2);

    tank.barrelAngle =
        Math.atan2(dy, dx);
    

    const dist = Math.hypot(
        player.x - tank.x,
        player.y - tank.y
    );

    if (dist > 500)
    {
        // move toward player
    }
    else if (dist < 250)
    {
        // back away
    }
    else
    {
        // strafe around player
    }
    tank.turnTimer -= 0.5;

    if (tank.turnTimer <= 0)
    {
        tank.moveAngle +=
            (Math.random() - 0.5) * Math.PI;

        tank.turnTimer =
            Math.random() * 120 + 60;
    }

    const moveX = Math.cos(tank.moveAngle);
    const moveY = Math.sin(tank.moveAngle);

    tank.x += moveX * tank.move_speed;
    tank.y += moveY * tank.move_speed;

    tank.bodyAngle = tank.moveAngle;

    // bounce off map edges
    if (
        tank.x <= boundaries.b_1.x ||
        tank.x >= boundaries.b_3.x - tank_width
    )
    {
        tank.moveAngle = Math.PI - tank.moveAngle;
    }

    if (
        tank.y <= boundaries.b_2.y ||
        tank.y >= boundaries.b_4.y - tank_height
    )
    {
        tank.moveAngle = -tank.moveAngle;
    }

    // shoot target
    const target = player.hasTank ? player.tank : player;
    if (
        gameTime - tank.lastShot > tank.projectile_delay
    )
    {
        fireTankProjectile(
            target.x,
            target.y,
            tank,
            projectiles
        );

        tank.lastShot = gameTime;
    }

    return;

}
const updateTanks = (
    Tanks,
    keys,
    boundaries,
    player,
    gameTime,
    projectiles
) =>
{
    updateTankParticles();

    Tanks.forEach(tank =>
    {
        const isMoving =
        keys.w ||
        keys.s ||
        keys.a ||
        keys.d;

        const hpPercent = tank.hp / tank.maxHp;

        if(hpPercent < 0.75 && Math.random() < 0.1)
        {
            createSmokeParticle(tank);
        }

        if(hpPercent < 0.3 && Math.random() < 0.15)
        {
            createFireParticle(tank);
        }

        if (isMoving && player.isTank)
        {
            if (tank_driving.paused)
            {
                tank_idle.currentTime = 0;
                tank_idle.pause();
                tank_driving.currentTime = 0;
                tank_driving.play();
            }
        }
        else
        {
            if (!tank_driving.paused)
            {
                tank_driving.pause();
                tank_driving.currentTime = 0;
                tank_idle.play();
                tank_idle.currentTime = 0;
            }
        }
        //check if player exists, player and tank colliding, e is pressed, and same team
        if (
            player 
            &&
            pointInRect(
                player.x,
                player.y,
                tank.x,
                tank.y,
                tank_width,
                tank_height
            ) &&
            keys.e
            &&
            player.team == tank.team
        )
        {
            tank.hasPlayer = true;
            //disable player targetting, movement, and visiblity
            //enable it back when tank is destroyed or player exits the vehicle
            player.isDisabled = true;
            player.isTank = true;
            player.tank = tank;
        }
        //tank.team is a color where blue is the enemy
        if (tank.team === "blue")
        {
            handleEnemyTankAI(
                tank,
                player,
                boundaries,
                gameTime,
                projectiles
            );
            return;
        }

        if (!tank.hasPlayer)
            return;

        let moveX = 0;
        let moveY = 0;

        //move tank here
        if (keys.w)
        {
            moveY -= 1;
        }

        if (keys.s)
        {
            moveY += 1;
        }

        if (keys.a)
        {
            moveX -= 1;
        }

        if (keys.d)
        {
            moveX += 1;
        }

        if (moveX !== 0 || moveY !== 0)
        {

            const centerX = tank.x + tank_width / 2;
            const centerY = tank.y + tank_height / 2;

            const length = Math.hypot(
                moveX,
                moveY
            );

            moveX /= length;
            moveY /= length;

            tank.x +=
                moveX *
                tank.move_speed;

            tank.y +=
                moveY *
                tank.move_speed;

            const targetAngle = Math.atan2(moveY, moveX);
            const diff =
                ((targetAngle - tank.bodyAngle + Math.PI * 3) %
                    (Math.PI * 2)) -
                Math.PI;

            tank.bodyAngle += diff * 0.05; // increase for faster turning
        }

        tank.x = Math.max(
            boundaries.b_1.x,
            Math.min(
                tank.x,
                boundaries.b_3.x - tank_width
            )
        );

        tank.y = Math.max(
            boundaries.b_2.y,
            Math.min(
                tank.y,
                boundaries.b_4.y - tank_height
            )
        );
    });
};
const rotateTank = (mouseX, mouseY, tank) =>
{
    const centerX = tank.x + tank_width / 2;
    const centerY = tank.y + tank_height / 2;

    tank.barrelAngle = Math.atan2(
        mouseY - centerY,
        mouseX - centerX
    );
};
const handlePlayerTankProjectile = (
    gameTime,
    tank,
    projectiles,
    projectiles2,
    targetX,
    targetY,
    keys
) => {
    const selected = keys.q ? "gunner" : "tank";

    if (
        gameTime - tank.lastShotTime <
        tank.projectile_delay
    ) {
        return;
    }

    if (selected === "tank") {
        fireTankProjectile(
            targetX,
            targetY,
            tank,
            projectiles
        );

        tank.projectile_delay = 2000;

        console.log("Tank shot fired");
    } else {
        const tankCopy = {
            ...tank,
            projectile_speed: 20,
        };

        console.log("Gunner shot fired");
        console.log("Projectile speed:", tankCopy.projectile_speed);

        fireProjectile(
            targetX,
            targetY,
            tankCopy,
            projectiles2
        );

        tank.projectile_delay = 20;
    }

    // Fire sound
    const shootSound = tank_shoot.cloneNode();
    shootSound.volume = 0.3;
    shootSound.currentTime = 0;
    shootSound.play().catch(() => {});

    // Reload sound
    const reloadSound = tank_reload.cloneNode();
    reloadSound.volume = 0.3;
    reloadSound.play().catch(() => {});

    tank.lastShotTime = gameTime;
};
export {drawTank, updateTanks, rotateTank, handlePlayerTankProjectile, createTank, pauseTankSounds};