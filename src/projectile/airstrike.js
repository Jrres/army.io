import { getPlayer } from "../helpers/helper";
import { pointInCircle } from "../helpers/helper";
import airstrikesoundsrc from "../assets/airstrikesound.mp3";

const airStrikeSound = new Audio(airstrikesoundsrc);
airStrikeSound.volume = 0.15;
airStrikeSound.preload = "auto";

let airStrikes = [];
let bombs = [];
let explosionParticles = [];
let astrk_spawn_duration = Math.random() * 10000 + 10000;
let curr_spawn_duration = 0;

export const createAirStrike = (characters, gameTime) => {

    const player = getPlayer(characters);
    if (!player) return;

    if(gameTime - curr_spawn_duration >= astrk_spawn_duration)
    {
        airStrikeSound.play();

        curr_spawn_duration = gameTime;
        astrk_spawn_duration = 10000 + Math.random() * 10000;

        const offset = 250;
        const angle = Math.random() * Math.PI * 2;

        airStrikes.push({
            x: player.x + Math.cos(angle) * offset - 250,
            y: player.y + Math.sin(angle) * offset - 120,

            width: 1000,
            height: 240,

            angle: angle,

            alpha: 0.6,

            startTime: gameTime,

            warningDuration: 1500,

            bombsToDrop: 8,

            bombsDropped: 0,

            bombDelay: 200,

            nextBombTime: gameTime + 1500

        });
    }
}
const explodeBomb = (bomb) =>
{
    createFireParticles(bomb);
    createSmokeParticles(bomb);
    createSparkParticles(bomb);
    createDebrisParticles(bomb);
    createShockwave(bomb);
}
const createFireParticles = (bomb) =>
{
    for(let i = 0; i < 20; i++)
    {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;

        explosionParticles.push({

            x: bomb.x,
            y: bomb.y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            radius: Math.random()*8 + 3,

            gravity: 0.08,

            life: 25,
            maxLife:25,

            color:"orange",

            type:"fire"

        });
    }
}
const createSmokeParticles = (bomb)=>
{
    for(let i=0;i<15;i++)
    {
        const angle=Math.random()*Math.PI*2;
        const speed=Math.random()*2+0.5;

        explosionParticles.push({

            x:bomb.x,
            y:bomb.y,

            vx:Math.cos(angle)*speed,
            vy:Math.sin(angle)*speed,

            radius:15,

            gravity:-0.03,

            growth:0.4,

            life:60,
            maxLife:60,

            color:"gray",

            type:"smoke"

        });
    }
}
const createSparkParticles = (bomb)=>
{
    for(let i=0;i<30;i++)
    {
        const angle=Math.random()*Math.PI*2;
        const speed=Math.random()*12+6;

        explosionParticles.push({

            x:bomb.x,
            y:bomb.y,

            vx:Math.cos(angle)*speed,
            vy:Math.sin(angle)*speed,

            radius:2,

            gravity:0.12,

            life:15,
            maxLife:15,

            color:"yellow",

            type:"spark"

        });
    }
}
const createDebrisParticles = (bomb)=>
{
    for(let i=0;i<12;i++)
    {
        const angle=Math.random()*Math.PI*2;
        const speed=Math.random()*7+2;

        explosionParticles.push({

            x:bomb.x,
            y:bomb.y,

            vx:Math.cos(angle)*speed,
            vy:Math.sin(angle)*speed,

            width:4,
            height:4,

            gravity:0.2,

            rotation:Math.random()*Math.PI*2,

            rotationSpeed:(Math.random()-0.5)*0.3,

            life:40,
            maxLife:40,

            color:"#555",

            type:"debris"

        });
    }
}
const createShockwave = (bomb)=>
{
    explosionParticles.push({

        x:bomb.x,
        y:bomb.y,

        radius:20,

        growth:5,

        life:18,
        maxLife:18,

        color:"white",

        type:"shockwave"

    });
}
export const updateAirStrikes = (gameTime, characters) => {

    const player = getPlayer(characters);
    if (!player) return;

    //----------------------------------------
    // Airstrikes
    //----------------------------------------

    for (let i = airStrikes.length - 1; i >= 0; i--) {

        const strike = airStrikes[i];
        strike.alpha = Math.max(0, strike.alpha - 0.002);
        //if dur to spawn next bomb has elapsed and not all bombs have been dropps
        if (
            strike.bombsDropped < strike.bombsToDrop &&
            gameTime >= strike.nextBombTime
        ) {

            //---------------------------------------
            // Compute bomb position along rectangle
            //---------------------------------------

            const t = strike.bombsDropped / (strike.bombsToDrop - 1);

            // Start at left side of rectangle
            const localX = -strike.width / 2 + t * strike.width;
            //-250 + 0
            //-250 + 71 = - 179

            // Middle of rectangle
            const localY = 0;
            //creating 8 bomb particles per bomb
            const speed = Math.random() * 1 + 0.1

            const cos = Math.cos(strike.angle);
            const sin = Math.sin(strike.angle);

            const centerX = strike.x + strike.width / 2;
            const centerY = strike.y + strike.height / 2;

            const worldX =
                centerX +
                localX * cos -
                localY * sin;

            const worldY =
                centerY +
                localX * sin +
                localY * cos;

            bombs.push({

                x: worldX,
                y: worldY,

                vx: cos * speed,
                vy: sin * speed,

                radius: 12,

                explosionRadius: 60,

                damage: 50,

                exploded: false,

                spawnTime: gameTime,

                explodeDelay: 500

            });
            strike.bombsDropped++;

            strike.nextBombTime += strike.bombDelay;
        }

        if (strike.bombsDropped >= strike.bombsToDrop) {

            airStrikes.splice(i, 1);

        }
    }
    //----------------------------------------
    // Bombs
    //----------------------------------------

    for (let i = bombs.length - 1; i >= 0; i--) {

        const bomb = bombs[i];
        
        bomb.x += bomb.vx;
        
        bomb.y += bomb.vy;
        
        bomb.radius += 0.15

        if 
        (
            !bomb.exploded &&
            gameTime - bomb.spawnTime >= bomb.explodeDelay
        ) 
        {

            bomb.exploded = true;

            explodeBomb(bomb);
            for (let j = characters.length - 1; j >= 0; j--) {
                const character = characters[j];

                if (character.type !== "enemy")
                    continue;

                if (
                    pointInCircle(
                        character.x,
                        character.y,
                        bomb.x,
                        bomb.y,
                        bomb.explosionRadius + 20
                    )
                ) {
                    character.hp = Math.max(
                        0,
                        character.hp - bomb.damage
                    );
                }
            }

        }

        if (gameTime >= bomb.removeTime) {

            bombs.splice(i, 1);

        }

    }

    //explosion particles
    for(let i = explosionParticles.length-1;i>=0;i--)
    {
        const p=explosionParticles[i];

        p.life--;

        if(p.vx!==undefined)
        {
            p.x+=p.vx;
            p.y+=p.vy;

            p.vy+=p.gravity;
        }

        if(p.growth)
            p.radius+=p.growth;

        if(p.rotation!==undefined)
            p.rotation+=p.rotationSpeed;

        if(p.type=="fire")
            p.radius*=0.97;

        if(p.type=="smoke")
            p.radius+=0.15;

        if(p.life<=0)
            explosionParticles.splice(i,1);
    }

}
export const drawAirStrikes = (context, gameTime) => {

    //------------------------------------
    // Warning rectangles
    //------------------------------------

    for (const strike of airStrikes) {

        context.save();

        context.translate(
            strike.x + strike.width / 2,
            strike.y + strike.height / 2
        );

        context.rotate(strike.angle);

        context.globalAlpha = strike.alpha;

        context.fillStyle = "red";

        context.fillRect(
            -strike.width / 2,
            -strike.height / 2,
            strike.width,
            strike.height
        );

        context.restore();

    }

    //------------------------------------
    // Bombs
    //------------------------------------

    for (const bomb of bombs) {
        
        const explosionAlpha = Math.max(
            0,
            1 - (gameTime - (bomb.spawnTime + bomb.explodeDelay)) / 300
        );
        const shellAlpha = Math.max(
            0,
            1 - (gameTime - bomb.spawnTime) / bomb.explodeDelay
        );

        context.save();

        if (!bomb.exploded) {
            
            context.globalAlpha = shellAlpha;

            context.fillStyle = "orange";

            context.beginPath();

            context.arc(
                bomb.x,
                bomb.y,
                bomb.explosionRadius,
                0,
                Math.PI * 2
            );

            context.fill();

        }
        else {
            //drawing all the particles 
            context.globalAlpha = explosionAlpha;

            context.fillStyle = "yellow";

            context.beginPath();

            context.arc(
                bomb.x,
                bomb.y,
                60,
                0,
                Math.PI * 2
            );

            context.fill();

        }

        context.restore();

    }
    context.globalAlpha = 1;
    for(const p of explosionParticles)
    {
        context.save();

        context.globalAlpha = p.life / p.maxLife;

        switch(p.type)
        {
            case "fire":

                context.fillStyle=p.color;

                context.beginPath();
                context.arc(p.x,p.y,p.radius,0,Math.PI*2);
                context.fill();

                break;

            case "smoke":

                context.fillStyle=p.color;

                context.beginPath();
                context.arc(p.x,p.y,p.radius,0,Math.PI*2);
                context.fill();

                break;

            case "spark":

                context.strokeStyle=p.color;

                context.beginPath();
                context.moveTo(p.x,p.y);
                context.lineTo(
                    p.x-p.vx*2,
                    p.y-p.vy*2
                );
                context.stroke();

                break;

            case "debris":

                context.translate(p.x,p.y);
                context.rotate(p.rotation);

                context.fillStyle=p.color;

                context.fillRect(
                    -2,
                    -2,
                    4,
                    4
                );

                break;

            case "shockwave":

                context.strokeStyle="white";
                context.lineWidth=4;

                context.beginPath();
                context.arc(
                    p.x,
                    p.y,
                    p.radius,
                    0,
                    Math.PI*2
                );

                context.stroke();

                break;
        }

        context.restore();
    }

}

export const getAirStrikes = () => airStrikes;

export const clearAirStrikes = () => {

    airStrikes = [];
    bombs = [];

}