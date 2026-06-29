import { pointInRect } from "../helpers/helper";
import mineExplosionSound from "../assets/mineExplosion.mp3";
import minepngsrc from "../assets/mine.png"

const mineExplosion = new Audio();
mineExplosion.src = mineExplosionSound;
mineExplosion.volume = 0.5;
mineExplosion.loop = false;
mineExplosion.preload = "auto";

const minePng = new Image();
minePng.src = minepngsrc;

const mineW = 35;
const mineH = 35;
const explosionParticles = [];

const createExplosion = (x, y) =>
{
    // Fire
    for(let i = 0; i < 40; i++)
    {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;

        explosionParticles.push({
            x,
            y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            radius: Math.random() * 8 + 4,

            life: 20,
            maxLife: 20,

            type: "fire"
        });
    }

    // Smoke
    for(let i = 0; i < 25; i++)
    {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3;

        explosionParticles.push({
            x,
            y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,

            radius: Math.random() * 15 + 10,

            life: 60,
            maxLife: 60,

            type: "smoke"
        });
    }

    // Debris
    for(let i = 0; i < 15; i++)
    {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;

        explosionParticles.push({
            x,
            y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            radius: Math.random() * 4 + 2,

            life: 40,
            maxLife: 40,

            type: "debris"
        });
    }
};
const updateExplosionParticles = () =>
{
    for(let i = explosionParticles.length - 1; i >= 0; i--)
    {
        const p = explosionParticles[i];

        p.x += p.vx;
        p.y += p.vy;

        if(p.type === "debris")
        {
            p.vy += 0.2; // gravity
        }

        if(p.type === "smoke")
        {
            p.radius += 0.15;
        }

        p.life--;

        if(p.life <= 0)
        {
            explosionParticles.splice(i, 1);
        }
    }
};
const drawExplosionParticles = (ctx) =>
{
    explosionParticles.forEach(p =>
    {
        const alpha = p.life / p.maxLife;

        ctx.globalAlpha = alpha;

        switch(p.type)
        {
            case "fire":
                ctx.fillStyle = "orange";
                break;

            case "smoke":
                ctx.fillStyle = "#444";
                break;

            case "debris":
                ctx.fillStyle = "#222";
                break;
        }

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalAlpha = 1;
};
const circleRectCollision = (
    circleX,
    circleY,
    radius,
    rectX,
    rectY,
    rectW,
    rectH
) => {
    const closestX = Math.max(
        rectX,
        Math.min(circleX, rectX + rectW)
    );

    const closestY = Math.max(
        rectY,
        Math.min(circleY, rectY + rectH)
    );

    const dx = circleX - closestX;
    const dy = circleY - closestY;

    return dx * dx + dy * dy <= radius * radius;
};
const updateMines = (mines, tanks) => {
    updateExplosionParticles();
    for (let i = mines.length - 1; i >= 0; i--) {
        const mine = mines[i];

        for (let j = tanks.length - 1; j >= 0; j--) {
            const tank = tanks[j];
            if (
                mine.team !== tank.team &&
                circleRectCollision(
                    mine.x,
                    mine.y,
                    mine.explosion_radius,
                    tank.x,
                    tank.y,
                    tank.width,
                    tank.height
                )
            ) {
                tank.hp -= mine.damage;
                mines.splice(i, 1);
                mineExplosion.play();
                createExplosion(
                    mine.x,
                    mine.y
                );

                //create explosion
                break;
            }
        }
    }
};

const drawMine = (context, mine) => {
    context.drawImage(
        minePng,
        mine.x,
        mine.y,
        mineW,
        mineH
    )
    drawExplosionParticles(context);
};

const createMine = (mines, x_pos, y_pos, team) => {
    mines.push({
        damage: 500,
        explosion_radius: 20,
        x: x_pos,
        y: y_pos,
        team: team
    });
};

export { updateMines, drawMine, createMine };