import sound from "../assets/pop_sound.mp3";
import hit_sound from "../assets/hitmarker.mp3";
import tank_hit_sound from "../assets/Tank ricochet.mp3";
import bullet_wall from "../assets/bullet_wall.mp3";
import { pointInRect } from "../helpers/helper";
import tower_hit_src from "../assets/tower_hit.wav";
import jester_laugh_src from "../assets/joker_laugh.mp3";
import { getPlayer } from "../helpers/helper";
import {createBuffIndicator} from "../helpers/helpersUi.js";
import tank_explosion_sound from "../assets/tank_explosion.mp3";

const pop_Sound = new Audio(sound);
pop_Sound.volume = 0.15;
pop_Sound.preload = "auto";

const hit_marker = new Audio(hit_sound);
 hit_marker.volume = 0.15;
 hit_marker.preload = "auto";

const tank_hit_marker = new Audio(tank_hit_sound);
tank_hit_marker.volume = 0.15;
tank_hit_marker.preload = "auto";

const bullet_wall_sound = new Audio(bullet_wall)
bullet_wall_sound.volume = 0.1;
bullet_wall_sound.preload = "auto";

const tower_hit = new Audio(tower_hit_src);
tower_hit.volume = 0.15;
tower_hit.preload = "auto";

const jester_laugh = new Audio(jester_laugh_src);
jester_laugh.volume = 0.15;
jester_laugh.preload = "auto";

const tank_explosion = new Audio(tank_explosion_sound);
tank_explosion.volume = 0.15;
tank_explosion.preload = "auto";

const CHARACTER_WIDTH = 50;
const CHARACTER_HEIGHT = 50;
const PROJECTILE_RADIUS = 5;
const TANK_PROJECTILE_RADIUS = 30;
const EXPLOSION_WIDTH = 100;
const EXPLOSION_HEIGHT = 100;

// ======================================================
// JESTER CHAOS PROJECTILES
// Projectiles orbit around the player while moving.
// ======================================================

// Create orbiting projectiles
// ======================================================
// JESTER PROJECTILE:
// - Fires in all directions
// - After traveling 300 pixels, each projectile splits
// - Split projectiles spray in a cone toward the nearest enemy
// ======================================================
const fireJesterProjectile = (character, projectiles, characters) => {
    if (!character || character.hp <= 0) return;

    // Play sound
    const sound = pop_Sound.cloneNode();
    sound.volume = 0.01;
    sound.play().catch(() => {});

    const startX = character.x + CHARACTER_WIDTH / 2;
    const startY = character.y + CHARACTER_HEIGHT / 2;

    const projectileCount = 20;
    const angleStep = (Math.PI * 2) / projectileCount;

    if (character.jesterAngle === undefined) {
        character.jesterAngle = 0;
    }

    for (let i = 0; i < projectileCount; i++) {
        const angle = character.jesterAngle + i * angleStep;

        projectiles.push({
            x: startX,
            y: startY,

            dx: Math.cos(angle) * character.projectile_speed,
            dy: Math.sin(angle) * character.projectile_speed,

            buff: "Jester",

            ownerId: character.id,
            damage: character.damage,
            team: character.team,

            radius: 10,

            // Split settings
            traveled: 0,
            splitDistance: 300, // pixels
            hasSplit: false,
            canSplit: true
        });
    }

    // Rotate burst each shot for spiral effect
    character.jesterAngle += 0.25;
};


// ======================================================
// FIND NEAREST ENEMY
// ======================================================
const getNearestEnemy = (projectile, characters) => {
    let nearest = null;
    let nearestDist = Infinity;

    for (const character of characters) {
        if (
            character.hp <= 0 ||
            character.team === projectile.team
        ) {
            continue;
        }

        const dx = (character.x + CHARACTER_WIDTH / 2) - projectile.x;
        const dy = (character.y + CHARACTER_HEIGHT / 2) - projectile.y;
        const dist = Math.hypot(dx, dy);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = character;
        }
    }

    return nearest;
};


// ======================================================
// SPLIT PROJECTILE INTO CONE TOWARD TARGET
// ======================================================
const splitJesterProjectile = (projectile, projectiles, characters) => {
    const target = getNearestEnemy(projectile, characters);

    if (!target) return;

    const targetX = target.x + CHARACTER_WIDTH / 2;
    const targetY = target.y + CHARACTER_HEIGHT / 2;

    const baseAngle = Math.atan2(
        targetY - projectile.y,
        targetX - projectile.x
    );

    const splitCount = 7;             // Number of child projectiles
    const coneAngle = Math.PI / 4;    // 45 degree cone
    const speed = Math.max(
        4,
        Math.hypot(projectile.dx, projectile.dy)
    );

    for (let i = 0; i < splitCount; i++) {
        const t =
            splitCount === 1
                ? 0.5
                : i / (splitCount - 1);

        const angle =
            baseAngle - coneAngle / 2 + t * coneAngle;

        projectiles.push({
            x: projectile.x,
            y: projectile.y,

            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,

            ownerId: projectile.ownerId,
            damage: projectile.damage * 0.5,
            team: projectile.team,

            radius: 6,

            // Child projectiles do NOT split again
            traveled: 0,
            splitDistance: 999999,
            hasSplit: true,
            canSplit: false
        });
    }
};
// ======================================================
// CALL THIS INSIDE YOUR updateProjectiles() LOOP
// ======================================================
// ======================================================
// JESTER PROJECTILE MOVEMENT
// Spirals around the player while expanding outward
// ======================================================
const updateJesterProjectile = (
    projectile,
    projectiles,
    characters
) => {
    const player = getPlayer(characters);
    if (!player) return;

    // Initialize spiral properties once
    if (projectile.spiralAngle === undefined) {
        projectile.spiralAngle = Math.atan2(
            projectile.dy,
            projectile.dx
        );

        projectile.spiralRadius = 10;     // start close to player
        projectile.spiralSpeed = 0.20;    // rotation speed
        projectile.radiusGrowth = 2.5;    // how fast spiral expands
    }

    // Increase angle (rotation)
    projectile.spiralAngle += projectile.spiralSpeed;

    // Increase radius (outward movement)
    projectile.spiralRadius += projectile.radiusGrowth;

    // Center of player
    const centerX = player.x + CHARACTER_WIDTH / 2;
    const centerY = player.y + CHARACTER_HEIGHT / 2;

    // Spiral position
    projectile.x =
        centerX +
        Math.cos(projectile.spiralAngle) *
            projectile.spiralRadius;

    projectile.y =
        centerY +
        Math.sin(projectile.spiralAngle) *
            projectile.spiralRadius;

    // Track travel distance
    projectile.traveled =
        (projectile.traveled || 0) +
        projectile.radiusGrowth;

    // Split after traveling enough distance
    if (
        projectile.canSplit &&
        !projectile.hasSplit &&
        projectile.traveled >= projectile.splitDistance
    ) {
        projectile.hasSplit = true;

        splitJesterProjectile(
            projectile,
            projectiles,
            characters
        );

        projectile.dead = true;
    }
};
const fireCircleEnemyProjectile = (targetX, targetY, character, projectiles) =>
{
    if (!character || character.hp <= 0) return;

    // play sound
    const sound = pop_Sound.cloneNode();
    sound.volume = 0.01;
    sound.play().catch(() => {});

    // projectile start position
    const startX = character.x + CHARACTER_WIDTH / 2;
    const startY = character.y + CHARACTER_HEIGHT / 2;

    // direction to target
    const dxRaw = targetX - startX;
    const dyRaw = targetY - startY;

    const distance = Math.sqrt(dxRaw * dxRaw + dyRaw * dyRaw);

    if (distance === 0) return;

    // angle toward target
    const baseAngle = Math.atan2(dyRaw, dxRaw);

    // -----------------------------
    // CONE SETTINGS
    // -----------------------------
    const projectileCount = 5;      // how many bullets
    const coneAngle = Math.PI / 3;  // pi/3 degrees total spread

    for (let i = 0; i < projectileCount; i++)
    {
        // spread bullets evenly across cone
        const angleOffset =
            (-coneAngle / 2) +
            (coneAngle / (projectileCount - 1)) * i;

        const angle = baseAngle + angleOffset;

        // convert angle into velocity
        const dx = Math.cos(angle) * character.projectile_speed;
        const dy = Math.sin(angle) * character.projectile_speed;

        projectiles.push({
            x: startX,
            y: startY,
            dx: dx,
            dy: dy,
            ownerId: character.id,
            damage: character.damage,
            team: character.team
        });
    }
};
const fireZigZagProjectile = (targetX, targetY, character, projectiles) =>
{
    if (!character || character.hp <= 0) return;

    // Play sound
    const sound = pop_Sound.cloneNode();
    sound.volume = 0.01;
    sound.play().catch(() => {});

    // Projectile start position
    const startX = character.x + CHARACTER_WIDTH / 2;
    const startY = character.y + CHARACTER_HEIGHT / 2;

    // Direction to player
    const dxRaw = targetX - startX;
    const dyRaw = targetY - startY;

    const distance = Math.sqrt(dxRaw * dxRaw + dyRaw * dyRaw);

    if (distance === 0) return;

    // Initialize zig-zag pattern
    if (!character.zigZagPattern)
    {
        character.zigZagPattern = {};
    }

    const pattern = character.zigZagPattern;

    if (pattern.shotIndex === undefined)
    {
        pattern.shotIndex = 0;
    }

    // Width of the zig-zag (15 degrees)
    const spread = Math.PI / 12;

    // How quickly the zig-zag oscillates
    const frequency = 1.2;

    // Current angle directly toward player
    const targetAngle = Math.atan2(dyRaw, dxRaw);

    // Advance zig-zag
    pattern.shotIndex++;

    // Zig-zag around the player's current position
    const zigZagOffset =
        Math.sin(pattern.shotIndex * frequency) *
        spread;

    const angle = targetAngle + zigZagOffset;

    // Velocity
    const dx =
        Math.cos(angle) *
        character.projectile_speed;

    const dy =
        Math.sin(angle) *
        character.projectile_speed;

    projectiles.push({
        x: startX,
        y: startY,
        dx,
        dy,
        ownerId: character.id,
        damage: character.damage,
        team: character.team
    });
};
const fireTankProjectile = (targetX, targetY, tank, projectiles) => {
    if (!tank || tank.hp <= 0) return;

    //play shoot tank sound

    //change to barrel position
    const startX = tank.x + CHARACTER_WIDTH / 2;
    const startY = tank.y + CHARACTER_HEIGHT / 2;

    // Direction vector
    const dxRaw = targetX - startX;
    const dyRaw = targetY - startY;

    const distance = Math.sqrt(dxRaw * dxRaw + dyRaw * dyRaw);

    if (distance === 0) return;

    // Create projectile

    //calculate critical strike here
    const roll = Math.random();
    let damage_multiplier = 1;
    //crit based on actual crit chance not hardcoded value fix - 
    //this needs to be moved to the collision not on the player
    if(roll < 0.25)
    {
        damage_multiplier = 1.15;
        createBuffIndicator(
            tank,
            `+${Math.round(tank.damage * damage_multiplier)} Crit`
        )
    }
    projectiles.push({
        x: startX,
        y: startY,

        directionX: dxRaw / distance,
        directionY: dyRaw / distance,

        speed: tank.projectile_speed,
        acceleration: 1.001, // 5% increase per frame

        ownerId: tank.id,
        damage: tank.damage * damage_multiplier,
        team: tank.team,

        distance_traveled: 0
    });

    const sound = tank_explosion.cloneNode();
    sound.volume = 0.3;
    sound.play();
}
const updateTankProjectiles = (
    projectiles,
    canvas,
    characters,
    projectile_impact_visual,
    towers,
    tanks
) => {
    // ==================================================
    // MOVE PROJECTILES
    // ==================================================
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        projectile.speed *= projectile.acceleration;

        projectile.x +=
            projectile.directionX * projectile.speed;

        projectile.y +=
            projectile.directionY * projectile.speed;

        projectile.distance_traveled += projectile.speed;

        if (projectile.distance_traveled >= 1000) {
            projectiles.splice(i, 1);
        }
    }

    // ==================================================
    // COLLISIONS
    // ==================================================
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        // --------------------------------------------------
        // OFFSCREEN
        // --------------------------------------------------
        if (
            projectile.x < 0 ||
            projectile.x > canvas.width ||
            projectile.y < 0 ||
            projectile.y > canvas.height
        ) {
            setTimeout(() => {
                bullet_wall_sound.pause();
                bullet_wall_sound.currentTime = 0;
                bullet_wall_sound.preservesPitch = false;
                bullet_wall_sound.playbackRate = 0.8;
                bullet_wall_sound.play();
            }, 500);

            projectile_impact_visual.push({
                x: projectile.x,
                y: projectile.y,
                life: 15,
                maxLife: 15
            });

            projectiles.splice(i, 1);
            continue;
        }

        let projectileRemoved = false;

        // ==================================================
        // CHARACTER COLLISION (TRIGGERS EXPLOSION)
        // ==================================================
        for (const character of characters) {
            if (
                character.isTank &&
                character.tank?.id === projectile.ownerId
            ) {
                continue;
            }

            if (
                character.isTank &&
                character.tank?.team === projectile.team
            ) {
                continue;
            }

            if (
                character.isTank &&
                character.tank?.hp <= 0
            ) {
                continue;
            }

            if (
                pointInRect(
                    projectile.x,
                    projectile.y,
                    character.x,
                    character.y,
                    CHARACTER_WIDTH,
                    CHARACTER_HEIGHT
                )
            ) {
                const EXPLOSION_RADIUS = 200;

                // ------------------------------
                // DAMAGE CHARACTERS
                // ------------------------------
                for (const c of characters) {
                    if (c.team === projectile.team)
                        continue;

                    const dx =
                        (c.x + CHARACTER_WIDTH / 2) -
                        projectile.x;

                    const dy =
                        (c.y + CHARACTER_HEIGHT / 2) -
                        projectile.y;

                    const distance = Math.hypot(dx, dy);

                    if (distance <= EXPLOSION_RADIUS) {
                        c.hp = Math.max(
                            0,
                            c.hp - projectile.damage
                        );

                        createBuffIndicator(
                            c,
                            `Kaboooooom! -${Math.round(projectile.damage)} hp`,
                            "#ff00ae"
                        );

                        c.hitTimer = 10;
                    }
                }

                // ------------------------------
                // DAMAGE TANKS
                // ------------------------------
                for (const tank of tanks) {
                    if (tank.team === projectile.team)
                        continue;

                    if (tank.hp <= 0)
                        continue;

                    const dx =
                        (tank.x + tank.width / 2) -
                        projectile.x;

                    const dy =
                        (tank.y + tank.height / 2) -
                        projectile.y;

                    const distance = Math.hypot(dx, dy);

                    if (distance <= EXPLOSION_RADIUS) {
                        tank.hp = Math.max(
                            0,
                            tank.hp - projectile.damage
                        );

                        tank.hitTimer = 10;

                        createBuffIndicator(
                            tank,
                            `Kaboooooom! -${Math.round(projectile.damage)} hp`,
                            "#ff00ae"
                        );
                    }
                }

                // ------------------------------
                // EXPLOSION EFFECT
                // ------------------------------
                projectile_impact_visual.push({
                    x: projectile.x,
                    y: projectile.y,
                    radius: 0,
                    maxRadius: EXPLOSION_RADIUS,
                    life: 30,
                    maxLife: 30
                });

                const sound = tank_explosion.cloneNode();
                sound.volume = tank_explosion.volume;
                sound.play().catch(() => {});

                projectiles.splice(i, 1);
                projectileRemoved = true;
                break;
            }
        }

        if (projectileRemoved) {
            continue;
        }

        // ==================================================
        // DIRECT TANK HIT
        // ==================================================
        for (const tank of tanks) {
            if (tank.team === projectile.team)
                continue;

            if (tank.hp <= 0)
                continue;

            if (
                pointInRect(
                    projectile.x,
                    projectile.y,
                    tank.x,
                    tank.y,
                    tank.width,
                    tank.height
                )
            ) {
                tank.hp = Math.max(
                    0,
                    tank.hp - projectile.damage
                );

                const sound = tank_hit_marker.cloneNode();
                sound.volume = tank_hit_marker.volume;
                sound.play().catch(() => {});

                createBuffIndicator(
                    tank,
                    `-${Math.round(projectile.damage)} hp`,
                    "#ff00ae"
                );

                tank.hitTimer = 10;

                projectile_impact_visual.push({
                    x: projectile.x,
                    y: projectile.y,
                    life: 15,
                    maxLife: 15
                });

                projectiles.splice(i, 1);
                projectileRemoved = true;
                break;
            }
        }

        if (projectileRemoved) {
            continue;
        }

        // ==================================================
        // TOWER COLLISION
        // ==================================================
        for (const tower of towers) {
            if (tower.hp <= 0)
                continue;

            if (
                pointInRect(
                    projectile.x,
                    projectile.y,
                    tower.x,
                    tower.y,
                    tower.width,
                    tower.height
                )
            ) {
                tower.hp = Math.max(
                    0,
                    tower.hp - projectile.damage
                );

                tower_hit.play();
                tower.hitTimer = 10;

                projectile_impact_visual.push({
                    x: projectile.x,
                    y: projectile.y,
                    life: 15,
                    maxLife: 15
                });

                projectiles.splice(i, 1);
                break;
            }
        }
    }
};
const drawTankProjectile = (projectile, context) => {

    context.fillStyle =
        projectile.team === "blue"
            ? "lightblue"
            : "red";
    // Draw projectile
    context.beginPath();
    context.arc(
        projectile.x,
        projectile.y,
        20 * 1.5,
        0,
        Math.PI * 2
    );
    context.lineWidth = 4;

    context.stroke();
};
const drawProjectileCollision = (
    projectile_impact_visual,
    context
) =>
{
    for(let i = projectile_impact_visual.length - 1; i >= 0; i--)
    {
        const effect = projectile_impact_visual[i];

        const progress =
            1 - effect.life / effect.maxLife;

        const radius =
            effect.maxRadius * progress;

        const alpha =
            effect.life;

        context.save();

        // Outer blast ring
        context.beginPath();
        context.arc(
            effect.x,
            effect.y,
            radius,
            0,
            Math.PI * 2
        );

        context.strokeStyle =
            `rgba(255,150,0,${alpha})`;

        context.lineWidth = 8;

        context.stroke();

        // Inner flash
        context.beginPath();
        context.arc(
            effect.x,
            effect.y,
            radius * 0.6,
            0,
            Math.PI * 2
        );

        context.fillStyle =
            `rgba(255,220,100,${alpha * 0.5})`;

        context.fill();

        context.restore();

        effect.life--;

        if(effect.life <= 0)
        {
            projectile_impact_visual.splice(i, 1);
        }
    }
    projectile_impact_visual.forEach((visual, i, arr) => {
        const age = visual.maxLife - visual.life;
        const progress = age / visual.maxLife; // 0 -> 1

        // Save canvas state so transforms don't affect future drawings
        context.save();

        // Move to impact center
        context.translate(visual.x, visual.y);

        // Rotate effect over time
        context.rotate(progress * Math.PI * 2);

        // Fade out as it ages
        context.globalAlpha = 1 - progress;

        // Draw a starburst instead of a plain square
        const size = 20 + progress * 20;

        for (let i = 0; i < 4; i++) {
            context.rotate(Math.PI / 4);

            context.fillStyle = "gold";
            context.fillRect(size / 2, -2, size, 4);
        }

        // Bright center flash
        context.beginPath();
        context.fillStyle = "white";
        context.arc(0, 0, 6 + progress * 4, 0, Math.PI * 2);
        context.fill();

        // Restore canvas state
        context.restore();
        setTimeout(
            ()=>
            {
                projectile_impact_visual.splice(i, 1);  
            },
            200
        )
    });
};
const fireProjectile = (targetX, targetY, character, projectiles) => {
    // Make sure the shooter exists and is alive
    if (!character || character.hp <= 0) return;

    //play pop sound
    const sound = pop_Sound.cloneNode();
    sound.volume = .01;
    sound.play().catch(() => {});
    // Starting position = center of shooter
    const startX = character.x + CHARACTER_WIDTH / 2;
    const startY = character.y + CHARACTER_HEIGHT / 2;

    // Direction vector
    const dxRaw = targetX - startX;
    const dyRaw = targetY - startY;

    const distance = Math.sqrt(dxRaw * dxRaw + dyRaw * dyRaw);

    if (distance === 0) return;

    // Create projectile

    //calculate critical strike here
    const roll = Math.random();
    let damage_multiplier = 1;
    //crit based on actual crit chance not hardcoded value fix - 
    //this needs to be moved to the collision not on the player
    if(roll < 0.25)
    {
        damage_multiplier = 1.15;
        createBuffIndicator(
            character,
            `+${Math.round(character.damage * damage_multiplier)} Crit`
        )
    }
    projectiles.push({
        x: startX,
        y: startY,
        dx: (dxRaw / distance) * character.projectile_speed,
        dy: (dyRaw / distance) * character.projectile_speed,
        ownerId: character.id,
        damage: character.damage * damage_multiplier,
        team: character.team,
    });
};
const fireHealProjectile = (targetX, targetY, character, projectiles) => {
    // Make sure the shooter exists and is alive
    if (!character || character.hp <= 0) return;

    //play pop sound
    //change to heal sound
    const sound = pop_Sound.cloneNode();
    sound.volume = .01;
    sound.play().catch(() => {});
    // Starting position = center of shooter
    const startX = character.x + CHARACTER_WIDTH / 2;
    const startY = character.y + CHARACTER_HEIGHT / 2;

    // Direction vector
    const dxRaw = targetX - startX;
    const dyRaw = targetY - startY;

    const distance = Math.sqrt(dxRaw * dxRaw + dyRaw * dyRaw);

    if (distance === 0) return;

    // Create projectile

    //add heal values to support class
    projectiles.push({
        x: startX,
        y: startY,
        dx: (dxRaw / distance) * character.projectile_speed,
        dy: (dyRaw / distance) * character.projectile_speed,
        ownerId: character.id,
        heal: 5,
        team: character.team,

        spawnTime: performance.now(),
        collectable: false,
        speedMultiplier: 1
    });
};
const drawHealProjectile = (projectile, context) =>
{
    if (!projectile.rotation)
    {
        projectile.rotation = 0;
    }

    projectile.rotation += 0.15;

    context.save();

    context.translate(
        projectile.x,
        projectile.y
    );

    // Orb
    context.beginPath();
    context.fillStyle = "#7dff9c";
    context.arc(
        0,
        0,
        PROJECTILE_RADIUS,
        0,
        Math.PI * 2
    );
    context.fill();

    // Rotating Cross
    context.rotate(projectile.rotation);

    context.fillStyle = "white";

    // Horizontal bar
    if (!projectile.angle)
    {
        projectile.angle = 0;
    }

    projectile.angle += 0.2;

    const orbitRadius = 2;

    const crossX =
        Math.cos(projectile.angle) *
        orbitRadius;

    const crossY =
        Math.sin(projectile.angle) *
        orbitRadius;

    context.fillRect(
        -4,
        -1,
        8,
        2
    );

    // Vertical bar
    context.fillRect(
        -1,
        -4,
        2,
        8
    );

    context.restore();
};
const drawProjectile = (projectile, context) => {
    // --------------------------------------------------
    // JESTER PROJECTILES:
    // Cycle colors: purple -> black -> red
    // --------------------------------------------------
    if (projectile.buff === "Jester") {
        // Use current time to animate color changes
        const time = Date.now();

        // Change color every 150 ms
        const colors = ["purple", "black", "red"];
        const index = Math.floor(time / 150) % colors.length;

        context.fillStyle = colors[index];
    }
    // --------------------------------------------------
    // NORMAL PROJECTILES
    // --------------------------------------------------
    else {
        context.fillStyle =
            projectile.team === "blue"
                ? "lightblue"
                : "red";
    }

    // Draw projectile
    context.beginPath();
    context.arc(
        projectile.x,
        projectile.y,
        PROJECTILE_RADIUS,
        0,
        Math.PI * 2
    );
    context.fill();
};
const updateHealProjectiles = (
    projectiles,
    canvas,
    characters,) =>
{
    
    // Move bullets
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        const age = performance.now() - projectile.spawnTime;

        // Cannot be collected for first second
        if (age > 1000)
        {
            projectile.collectable = true;
        }
        const ageSeconds = age / 1000;

        projectile.dx *= 0.98;
        projectile.dy *= 0.98;

        projectile.x += projectile.dx;
        projectile.y += projectile.dy;

        if (
            Math.abs(projectile.dx) < 0.05 &&
            Math.abs(projectile.dy) < 0.05
        )
        {
            projectile.dx = 0;
            projectile.dy = 0;
            projectile.collectable = true;
        }
    }
    // Check collisions and remove heal bullets
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        // --------------------------------------------------
        // CHARACTER COLLISION
        // --------------------------------------------------
        for (const character of characters) 
            {
            // allow owner to be self healed
            if (
                character.id !== projectile.ownerId ||
                !projectile.collectable
            )
            {
                continue;
            }

            // Ignore different team
            if (character.team !== projectile.team) {
                continue;
            }

            // Ignore dead targets
            if (character.hp <= 0) {
                continue;
            }

            if (
                pointInRect(
                    projectile.x,
                    projectile.y,
                    character.x,
                    character.y,
                    CHARACTER_WIDTH,
                    CHARACTER_HEIGHT
                )
            ) {
                //can only heal up to max health
                character.hp = Math.min(
                    character.maxHp,
                    character.hp + projectile.heal
                );
                //change sound to heal sound
                hit_marker.play();
                createBuffIndicator(
                    character,
                    `+${Math.round(projectile.heal)} hp`,
                    "#00ff3c"
                );
                character.hitTimer = 10;
                projectiles.splice(i, 1);
                break;
            }
        }
    }
}
const updateProjectiles = (
    projectiles,
    canvas,
    characters,
    projectile_impact_visual,
    towers,
    tanks
) => {
    // Move bullets
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        if (projectile.orbiting) {
            updateJesterProjectile(
                projectile,
                projectiles,
                characters
            );
        } else {
            // Normal projectile movement
            projectile.x += projectile.dx * 0.5;
            projectile.y += projectile.dy * 0.5;
        }

        if (projectile.dead) {
            projectiles.splice(i, 1);
        }
    }

    // Check collisions and remove bullets
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        // --------------------------------------------------
        // OFFSCREEN COLLISION
        // --------------------------------------------------
        if (
            projectile.x < 0 ||
            projectile.x > canvas.width ||
            projectile.y < 0 ||
            projectile.y > canvas.height
        ) {
            // Save impact position
            setTimeout(() => {
                bullet_wall_sound.pause();
                bullet_wall_sound.play();
                bullet_wall_sound.currentTime = 0;
                bullet_wall_sound.preservesPitch = false; // Essential for changing pitch
                bullet_wall_sound.playbackRate = 0.8;  
            }, 500);
            
            projectile_impact_visual.push({
                x: projectile.x,
                y: projectile.y,
                life: 15,      // frames remaining
                maxLife: 15
            });

            // Remove projectile
            projectiles.splice(i, 1);
            continue;
        }

        // --------------------------------------------------
        // CHARACTER COLLISION
        // --------------------------------------------------
        const player = getPlayer(characters);
        let projectileHit = false;
        for (const character of characters) {
        // Ignore owner

         if (
        player.isTank &&
        character === player
        )
        {
            continue;
        }
        if (character.id === projectile.ownerId) {
            continue;
        }

        // Ignore same team
        if (character.team === projectile.team) {
            continue;
        }

        // Ignore dead targets
        if (character.hp <= 0) {
            continue;
        }


        if (
            pointInRect(
                projectile.x,
                projectile.y,
                character.x,
                character.y,
                CHARACTER_WIDTH,
                CHARACTER_HEIGHT
            )
        ) {
            if(projectile.ownerId == player.id)
            {
                player.player_stats.damage_done += projectile.damage;
            }
            character.hp = Math.max(
                0,
                character.hp - projectile.damage
            );
            hit_marker.play();
            createBuffIndicator(
                character,
                `-${Math.round(projectile.damage)} hp`,
                "#ff00ae"
            );
            character.hitTimer = 10;

            projectile_impact_visual.push({
                x: projectile.x,
                y: projectile.y,
                life: 15,
                maxLife: 15
            });

            projectiles.splice(i, 1);
            break;
        }
        }
        for(const tank of tanks)
        {
            
            // Ignore same team
            if (tank.team === projectile.team) {
                continue;
            }
            // Ignore dead targets
            if (tank.hp <= 0) {
                continue;
            }
            if (
                pointInRect(
                    projectile.x,
                    projectile.y,
                    tank.x,
                    tank.y,
                    tank.width,
                    tank.height
                )
            ) {
                if(projectile.ownerId == player.id)
                {
                    player.player_stats.damage_done += projectile.damage;
                }
                tank.hp = Math.max(
                    0,
                    tank.hp - projectile.damage
                );
                const sound = tank_hit_marker.cloneNode();
                sound.volume = tank_hit_marker.volume;
                sound.play().catch(() => {});
                createBuffIndicator(
                    tank,
                    `-${Math.round(projectile.damage)} hp`,
                    "#ff00ae"
                );
                tank.hitTimer = 10;

                projectile_impact_visual.push({
                    x: projectile.x,
                    y: projectile.y,
                    life: 15,
                    maxLife: 15
                });

                projectiles.splice(i, 1);
                projectileHit = true;
                break;
            }
        }
        if (projectileHit)
        {
            continue;
        }
        
        // --------------------------------------------------
        // TOWER COLLISION
        // --------------------------------------------------
        for (const tower of towers) {
            // Ignore destroyed towers
            if (tower.hp <= 0) {
                continue;
            }

            // Detect hit
            if (
                pointInRect(
                    projectile.x,
                    projectile.y,
                    tower.x,
                    tower.y,
                    tower.width,
                    tower.height
                )
            ) {
                // Damage tower
                tower.hp = Math.max(
                    0,
                    tower.hp - projectile.damage   // <-- FIXED
                );

                // Optional hit flash effect
                tower_hit.play();
                tower.hitTimer = 10;

                // Create impact effect
                projectile_impact_visual.push({
                    x: projectile.x,
                    y: projectile.y,
                    life: 15,
                    maxLife: 15
                });

                // Remove projectile
                projectiles.splice(i, 1);

                // Stop checking other towers
                break;
            }
        }
    }
};

export {
    fireProjectile,
    drawProjectile,
    updateProjectiles,
    drawProjectileCollision,
    fireJesterProjectile, 
    fireCircleEnemyProjectile, 
    fireZigZagProjectile,
    fireHealProjectile,
    drawHealProjectile,
    updateHealProjectiles,
    fireTankProjectile,
    updateTankProjectiles,
    drawTankProjectile
};