import { getPlayer } from "../helpers/helper";
import { fireProjectile } from "../projectile/projectiles";
import { normalizeAngle } from "../helpers/helper";
const CHARACTER_WIDTH = 30;
const CHARACTER_HEIGHT = 30;
const createAlly = (x, y, label, className, nextCharacterId, classes, current_time, new_stat_bonus) =>
{
     return {
        id: nextCharacterId,
        x,
        y,
        color: "#34c0eb",
        label,
        class: className,
        isPlayer: false,
        type: "ally",
        team: "red",

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
    };
}
const handleAllyMovement = (
    deltaTime,
    characters,
    boundaries
) => {

    const player = getPlayer(characters);
    if (!player) return;

    const target =
        player.isTank && player.tank
            ? player.tank
            : player;

    const FOLLOW_RADIUS = 200;
    const TOO_CLOSE_RADIUS = 80;

    characters.forEach(ally => {

        if (ally.type !== "ally")
            return;

        if (ally.hp <= 0)
            return;

        //---------------------------------------
        // Initialize AI
        //---------------------------------------

        ally.moveAngle ??= Math.random() * Math.PI * 2;
        ally.targetAngle ??= ally.moveAngle;
        ally.turnTimer ??= 0;

        //---------------------------------------
        // Distance to player
        //---------------------------------------

        const dx = target.x - ally.x;
        const dy = target.y - ally.y;

        const distance = Math.hypot(dx, dy);
        const angleToPlayer = Math.atan2(dy, dx);

        //---------------------------------------
        // Face movement direction
        //---------------------------------------

        if (Math.abs(dx) > Math.abs(dy))
            ally.direction = dx > 0 ? "right" : "left";
        else
            ally.direction = dy > 0 ? "down" : "up";

        //---------------------------------------
        // Pick a new movement direction
        //---------------------------------------

        ally.turnTimer--;

        if (ally.turnTimer <= 0)
        {

            if (distance > FOLLOW_RADIUS)
            {
                // Catch up
                ally.targetAngle = angleToPlayer;
            }
            else if (distance < TOO_CLOSE_RADIUS)
            {
                // Back away
                ally.targetAngle = angleToPlayer + Math.PI;
            }
            else
            {
                // Wander around the player

                const orbitAngle = Math.random() * Math.PI * 2;

                const desiredX =
                    target.x + Math.cos(orbitAngle) * FOLLOW_RADIUS;

                const desiredY =
                    target.y + Math.sin(orbitAngle) * FOLLOW_RADIUS;

                ally.targetAngle = Math.atan2(
                    desiredY - ally.y,
                    desiredX - ally.x
                );
            }

            ally.turnTimer = 100 + Math.random() * 200;
        }

        //---------------------------------------
        // Smooth turning
        //---------------------------------------

        const angleDiff = normalizeAngle(
            ally.targetAngle - ally.moveAngle
        );

        ally.moveAngle += angleDiff * 0.05;

        //---------------------------------------
        // Move
        //---------------------------------------

        ally.x += Math.cos(ally.moveAngle) * ally.move_speed;
        ally.y += Math.sin(ally.moveAngle) * ally.move_speed;

        //---------------------------------------
        // Clamp
        //---------------------------------------

        ally.x = Math.max(
            boundaries.b_1.x,
            Math.min(
                ally.x,
                boundaries.b_3.x - CHARACTER_WIDTH
            )
        );

        ally.y = Math.max(
            boundaries.b_2.y,
            Math.min(
                ally.y,
                boundaries.b_4.y - CHARACTER_HEIGHT
            )
        );
    });
};
const enemyTarget = (characters, projectiles, currentTime) =>
{
    const allies = characters.filter(c => c.type === "ally");

    allies.forEach(ally => {

        if (currentTime - ally.lastShotTime < ally.projectile_delay)
            return;

        const target = getNearestEnemy(ally, characters);

        if (!target)
            return;

        fireProjectile(
            target.x,
            target.y,
            ally,
            projectiles
        );

        ally.lastShotTime = currentTime;
    });
}
const allyApplyHeal = () =>
{
    //check for support class
    //heal player or surrounding allies if they are low
}
const getNearestEnemy = (ally, characters) => {

    let nearest = null;
    let bestDist = Infinity;

    characters.forEach(character => {

        if (character.hp <= 0)
            return;

        if (character.team === ally.team)
            return;

        const dist = Math.hypot(
            character.x - ally.x,
            character.y - ally.y
        );

        if (dist < bestDist) {
            bestDist = dist;
            nearest = character;
        }
    });

    return nearest;
};
export {createAlly, handleAllyMovement, allyApplyHeal, enemyTarget}