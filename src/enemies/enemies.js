import {pointInRect, getPlayer, deleteCharacters, normalizeAngle} from "../helpers/helper.js"
import {fireProjectile, fireCircleEnemyProjectile, fireZigZagProjectile} from "../projectile/projectiles.js";
import { createMine } from "../projectile/mines.js";
const CHARACTER_WIDTH = 30;
const CHARACTER_HEIGHT = 30;

 const enemy_types = [
            "circle_fighter",
            "regular"
        ]
const createEnemy = (x, y, label, className, nextCharacterId, classes, current_time, new_stat_bonus) => {
    return {
        id: nextCharacterId,
        x,
        y,
        color: "#34c0eb",
        label,
        class: className,
        isPlayer: false,
        type: "enemy",
        enemy_type: enemy_types[Math.floor(Math.random() * enemy_types.length)],
        team: "blue",

        // Merge class stats
        ...classes[className],

        // AI state
        moveAngle: Math.random() * Math.PI * 2,
        targetAngle: Math.random() * Math.PI * 2,
        turnTimer: 100 + Math.random() * 300,
        lastShotTime: current_time,
        animationFrame: 0,
        direction: "down",
        animationTimer: 0,
        stat_bonus: new_stat_bonus,
        zigZagPattern:
        {
            edge1: 0,
            edge2: 0,
            zigZagAngle: 0,
            forward: true
        },
    };
};
//deltatime is causing the number to become undefined .. 
const handleEnemyMovementRandomizer = (deltaTime, characters, TOO_FAR_RADIUS, TOO_CLOSE_RADIUS, context, boundaries) => {
    const player = getPlayer(characters);
    if (!player) return;

    const target =
        player.isTank && player.tank
            ? player.tank
            : player;
    if (!player) return;

    
    characters.forEach((enemy, i, arr) => {
        if (arr[i].isPlayer) return;
        if (arr[i].hp <= 0) return;
        if(arr[i].type == "ally")
            return;

        // Initialize movement state
        if (arr[i].moveAngle == undefined) {
            arr[i].moveAngle = Math.random() * Math.PI * 2;
        }

        if (arr[i].targetAngle == undefined) {
            arr[i].targetAngle = arr[i].moveAngle;
        }

        if (arr[i].turnTimer == undefined) {
            arr[i].turnTimer = 0;
        }
        // Distance and angle to player
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;

        if(Math.abs(dx) > Math.abs(dy))
        {
            enemy.direction =
            dx > 0 ? "right" : "left";
        }
        else
        {
            enemy.direction =
            dy > 0 ? "down" : "up";
}
        const distance = Math.hypot(dx, dy);
        const angleToPlayer = Math.atan2(dy, dx);

        // Countdown until choosing a new target direction
        arr[i].turnTimer --;
        if (arr[i].turnTimer <= 0) {
            if (distance > TOO_FAR_RADIUS) {
                // Too far: move directly toward player
                arr[i].targetAngle = angleToPlayer;
            } else if (distance < TOO_CLOSE_RADIUS) {
                // Too close: back away
                arr[i].targetAngle = angleToPlayer + Math.PI;
            } else {
                // Ideal range: orbit around player with randomness
                const orbitOffset =
                    (Math.random() < 0.5 ? -1 : 1) *
                    (Math.PI / 2); // 90° left or right

                const randomOffset =
                    (Math.random() - 0.5) * 0.8;

                arr[i].targetAngle =
                    angleToPlayer +
                    orbitOffset +
                    randomOffset;
            }

            // Choose a new target direction every 0.2–0.8 seconds
            arr[i].turnTimer = 200 + Math.random() * 600;
        }

        // Smoothly rotate toward targetAngle
        let angleDiff = normalizeAngle(
            arr[i].targetAngle - arr[i].moveAngle
        );

        // Turn speed (radians per frame)
        const turnSpeed = 0.05;
        arr[i].moveAngle += angleDiff * turnSpeed;

        // Move
        arr[i].x += Math.cos(arr[i].moveAngle) * arr[i].move_speed;
        arr[i].y += Math.sin(arr[i].moveAngle) * arr[i].move_speed;

        // Clamp to map bounds
        arr[i].x = Math.max(
            boundaries.b_1.x,
            Math.min(arr[i].x, boundaries.b_3.x - CHARACTER_WIDTH)
        );

        arr[i].y = Math.max(
            boundaries.b_2.y,
            Math.min(arr[i].y, boundaries.b_4.y - CHARACTER_HEIGHT)
        );
    });
};
const handleEnemyProjectiles = (gameTime, characters, projectiles) => {
    const player = getPlayer(characters);
    if (!player) return;

    const target =
        player.isTank && player.tank
            ? player.tank
            : player;
    if (!player || player.hp <= 0) return;

    characters.forEach((enemy) => {
        // Skip player, dead enemies and allies
        if (enemy.isPlayer) return;
        if (enemy.hp <= 0) return;
        if(enemy.type == "ally") return;

        // Initialize cooldown timer
        if (enemy.lastShotTime === undefined) {
            enemy.lastShotTime = 0;
        }
        // Fire when cooldown expires
        if (
            gameTime - enemy.lastShotTime >=
            enemy.projectile_delay
        ) {
            if(enemy.enemy_type == "circle_fighter")
            {
                fireCircleEnemyProjectile(
                    target.x + CHARACTER_WIDTH / 2,
                    target.y + CHARACTER_HEIGHT / 2,
                    enemy,
                    projectiles)
            }
            else if(enemy.enemy_type == "zigzag_fighter")
            {
                fireZigZagProjectile(
                    target.x + CHARACTER_WIDTH / 2,
                    target.y + CHARACTER_HEIGHT / 2,
                    enemy,
                    projectiles
                )
            }
            else
            {
                fireProjectile(
                    target.x + CHARACTER_WIDTH / 2,
                    target.y + CHARACTER_HEIGHT / 2,
                    enemy,
                    projectiles
                );

            }

            enemy.lastShotTime = gameTime;
        }
    });
};
let currentTime = 0;
let mine_spawn_rate = Math.random() * 4000 + 1000;

const handleEnemyMines = (gameTime, characters, mines, tanks) => {
    if (tanks.length <= 0) return;
    const player = getPlayer(characters);
    if(!player){
        return;
    }
    //if tank is friendly, enemies should lay mines 
    const friendlyTankExists = tanks.some(t => t.team === player.team);
    if(friendlyTankExists)
    {
        if (gameTime - currentTime > mine_spawn_rate) {
            console.log("handling enemy mine controls");
    
            characters.forEach(c => {
                if(c.type === "player")
                    return;
                const roll = Math.random();
                if(roll < 0.25)
                {
                    createMine(
                        mines,
                        c.x,
                        c.y,
                        c.team
                    );
                }
            });
    
            currentTime = gameTime;
            mine_spawn_rate = Math.random() * 4000 + 1000;
        }
    }

};
export {createEnemy, handleEnemyMovementRandomizer, handleEnemyProjectiles, handleEnemyMines}