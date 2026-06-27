//frontend
import { useRef, useEffect } from "react";
import "./canvas.css";
//js util files
import Camera from "./Camera.js"
import UI from "./UI.js"
import { pointInRect, getPlayer, deleteCharacters } from "./helpers/helper.js"
import { createEnemy, handleEnemyMovementRandomizer, handleEnemyProjectiles, handleEnemyMines } from "./enemies/enemies.js"
import { updateMines, drawMine, createMine } from "./projectile/mines.js"
import {
fireProjectile,
drawProjectile,
updateProjectiles,
drawProjectileCollision,
fireJesterProjectile,
fireZigZagProjectile,
fireHealProjectile,
updateHealProjectiles,
drawHealProjectile,
drawTankProjectile,
updateTankProjectiles,
fireTankProjectile
} from "./projectile/projectiles.js";

import {
enemyTarget,
allyApplyHeal,
handleAllyMovement,
createAlly,
}
from "./allies/allies.js"

import { createTower, getTowers } from "./towers/tower.js"
import { drawBuffIndicators, updateBuffIndicators, createBuffIndicator } from "./helpers/helpersUi.js"
import { drawTank, updateTanks, rotateTank, handlePlayerTankProjectile, createTank, pauseTankSounds } from "./vehicles/tank.js";
import { drawTankHealthBar, drawTankSelectionUi } from "./helpers/helperTankUi.js";
//assets
import background_image from "./assets/game-background-1.png";
import background_image_2 from "./assets/game-background-2.png";
import background_image_3 from "./assets/game-background-3.png"
import border_src from "./assets/border.png"

import ocean_bg_src from "./assets/ocean_bg.png"
import minecraft_death_sound from "./assets/minecraft_death.mp3";
import healing_sound from "./assets/heal.wav";
import damage_buff_sound from "./assets/damage.wav";
import fast_buff_sound from "./assets/fast.wav";
import attack_speed_sound from "./assets/AS.wav";
import health_pod_img from "./assets/med_pack.png";
import as_buff_img from "./assets/attack_speed_buff.png";
import damage_buff_img from "./assets/damage_buff.png";
import speed_buff_img from "./assets/speed_buff.png";
import health_cross from "./assets/health_cross.png";
import tower_hit_src from "./assets/tower_hit.wav";
import jester_buff_src from "./assets/Jester_Buff.png";
import jester_laugh_src from "./assets/joker_laugh.mp3";

import allies_buff_src from "./assets/alliesBuff.png";

import background_music_src from "./assets/background_music.mp3";
import background_music_src_2 from "./assets/background_music_2.mp3"

import classes_src from "./assets/classes.png";
import classes_b_w_src from "./assets/classes_black_white.png";
import menu_src from "./assets/menu_background.png";
import class_lock_in_sound from "./assets/class_lock_in_sound.wav";
import alliesOperator from "./assets/alliesbuffsound.mp3";

import assault_class_src from "./assets/spritesheets/AssaultClassShooter.png";
import recon_class_src from "./assets/spritesheets/ReconClassShooter.png";
import support_class_src from "./assets/spritesheets/SupportClassShooter.png";
import juggernaut_class_src from "./assets/spritesheets/JuggernautClassShooter.png";

import menu_music_src from "./assets/fast-glitchy-piano-progression_200bpm_B_minor.wav";
import game_music_2_src from "./assets/game_sound_track.wav";

import rain_sound_src from "./assets/rain.mp3"

import { Howl, Howler } from 'howler';

const rain_sound = new Howl({
    src: [rain_sound_src],
    html5: true,
    volume: 0.15,
    loop: true,
})

const menu_music = new Howl({
    src: [menu_music_src],
    html5: true,
    volume: 0.15,
    loop: true,
});
const menu_music_id = menu_music.play();

//sounds
const game_soundtrack = new Howl({
    src: [game_music_2_src],
    html5: true,
    volume: 0.15,
    loop: true,
})

const lock_in_sound = new Audio(class_lock_in_sound);
lock_in_sound.volume = 0.15;
lock_in_sound.preload = "auto";

const death_sound = new Audio(minecraft_death_sound);
death_sound.volume = 0.15;
death_sound.preload = "auto";

const health_sound = new Audio(healing_sound);
health_sound.volume = 0.15;
health_sound.preload = "auto";

const damage_buff_sound_effect = new Audio(damage_buff_sound);
damage_buff_sound_effect.volume = 0.15;
damage_buff_sound_effect.preload = "auto";

const speed_buff_sound = new Audio(fast_buff_sound);
speed_buff_sound.volume = 0.15;
speed_buff_sound.preload = "auto";

const as_sound = new Audio(attack_speed_sound);
as_sound.volume = 0.15;
as_sound.preload = "auto";

const tower_hit = new Audio(tower_hit_src);
tower_hit.volume = 0.15;
tower_hit.preload = "auto";

const jester_laugh = new Audio(jester_laugh_src);
jester_laugh.volume = 0.15;
jester_laugh.preload = "auto";

const alliesBuffSound = new Audio(alliesOperator);
alliesBuffSound.volume = 0.15;
alliesBuffSound.preload = "auto";

const background_music = new Audio(background_music_src);
background_music.volume = 0.4;
background_music.preload = "auto";

const background_music_2 = new Audio(background_music_src_2);
background_music_2.volume = 0.4;
background_music_2.preload = "auto";


const Canvas = (props) => {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        const context = canvas.getContext("2d");


        //background_music.play();

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas(); // Set initial size
        window.addEventListener("resize", resizeCanvas);
        // =========================
        // CONSTANTS
        // =========================

        //game states
        const game_state =
        {
            menu: 1,
            game: 2,
            pause: 3,
        }
        let cur_game_state = game_state.menu;

        const menu_state =
        {
            class: 1,
            map: 2,
            next: 3
        }
        let cur_menu_state = menu_state.class;

        //buttons 

        const start_button = {
            x: canvas.width / 2 - 200,
            y: canvas.height - 200,
            width: 400,
            height: 50,
            color: '#007BFF',
            text: 'Start Game',
            textColor: '#FFFFFF'
        };

        const map_button =
        {
            x: canvas.width / 2 - 200,
            y: canvas.height - 200,
            width: 400,
            height: 50,
            color: '#007BFF',
            text: 'next',
            textColor: '#FFFFFF'
        }

        //character names add female names too
        const scavNames = [
            "Alyosha",
            "Arseniy",
            "Boris",
            "Chepushila",
            "Damir",
            "Dimka",
            "Foma",
            "Gena",
            "Gosha",
            "Grisha",
            "Igor",
            "Ilyukha",
            "Kolyan",
            "Kostya",
            "Maks",
            "Mishanya",
            "Mitya",
            "Pashka",
            "Petka",
            "Roma",
            "Ruslan",
            "Sanya",
            "Semyon",
            "Seroga",
            "Shurik",
            "Slava",
            "Styopa",
            "Tolik",
            "Vadik",
            "Valera",
            "Vanya",
            "Vasya",
            "Vitek",
            "Vovan",
            "Yarik",
            "Yegor",
            "Yurka",
            "Zhora",
            "Bandit",
            "Brawler",
            "Deadeye",
            "Drifter",
            "Ghost",
            "Knuckles",
            "Mad Dog",
            "Rat King",
            "Rook",
            "Shadow",
            "Snake",
            "Stalker",
            "Trigger",
            "Viper",
            "Wolf"
        ];
        const allyNames = [
            "Saint",
            "Jackson",
            "Menendez",
            "Wraith",
            "Monty",
        ]

        const boundaries = {
            //left edge
            b_1:
            {
                x: 300,
                y: 0,
                width: 20,
                height: canvas.height
            },
            //top edge
            b_2:
            {
                x: 0,
                y: 0,
                width: canvas.width,
                height: 20
            },
            //right edge
            b_3:
            {
                x: canvas.width - 300,
                y: 0,
                width: 20,
                height: canvas.height
            },
            //bottom edge
            b_4:
            {
                x: 0,
                y: canvas.height - 300,
                width: canvas.width,
                height: 20
            }
        }
        const CHARACTER_WIDTH = 30;
        const CHARACTER_HEIGHT = 30;
        const MOVE_SPEED = 2;
        const PROJECTILE_SPEED = 8;
        const PROJECTILE_RADIUS = 5;
        const PROJECTILE_DAMAGE = 10;
        const buff_delay = 5000;
        const healthDelay = 5000;

        //image declarations

        const image = new Image(-1000, -1000, context.canvas.width + 1000, context.canvas.height + 1000); // Using optional size for image
        const health_img = new Image();
        health_img.src = health_pod_img;
        //image buffs
        const attack_speed_buff_img = new Image();
        attack_speed_buff_img.src = as_buff_img;

        const dmg_buff_img = new Image();
        dmg_buff_img.src = damage_buff_img;

        const s_buff_img = new Image();
        s_buff_img.src = speed_buff_img;

        const jester_buff_img = new Image();
        jester_buff_img.src = jester_buff_src;
        // Load the health cross image
        const healthCrossImage = new Image();
        healthCrossImage.src = health_cross; // your imported PNG asset

        const alliesBuffImage = new Image();
        alliesBuffImage.src = allies_buff_src;

        const class_image = new Image();
        class_image.src = classes_src;

        const class_b_w_image = new Image();
        class_b_w_image.src = classes_b_w_src;

        const menu_image = new Image();
        menu_image.src = menu_src;

        //models for each class
        const border_image = new Image();
        border_image.src = border_src;

        const assault_class_shooter = new Image();
        assault_class_shooter.src = assault_class_src;

        const recon_class_shooter = new Image();
        recon_class_shooter.src = recon_class_src;

        const support_class_shooter = new Image();
        support_class_shooter.src = support_class_src;

        const juggernaut_class_shooter = new Image();
        juggernaut_class_shooter.src = juggernaut_class_src;
        const ocean_img = new Image();
        ocean_img.src = ocean_bg_src;

        // Array to store active healing visuals
        let healingEffects = [];
        let activeBuffVisuals = [];

        let playerDamageFlash = {
            alpha: 0,
            maxAlpha: 0.45,
            fadeSpeed: 0.03
        };

        const hitTimer = 8;
        //Camera
        const camera = new Camera(0, 0, canvas.width, canvas.height);
        camera.zoom = 1.5;

        // =========================
        // GAME STATE
        // =========================
        let nextCharacterId = 1;
        let nextTankId = 1;
        let lastFrameTime = 0;
        let lastHealthSpawn = 0;
        let round = 7;
        let draw_hover_character = null;
        let health_pods = [
        ]

        let buffs = [];
        let last_buff_spawn = 0;

        let balls = [];

        let Tanks = [];
        let characters = [
            {
                id: nextCharacterId++,
                x: 1000,
                y: 500,
                hp: 100,
                maxHp: 100000,
                color: "#eb4034",
                label: "You",
                class: "Assault",
                isPlayer: true,
                type: "player",
                moveAngle: 0,
                turnTimer: 0,
                targetAngle: 0,
                hitTimer: 0,
                buffTimer: 0,
                buffs: [],
                team: "red",
                jesterAngle: 0,
                animationFrame: 0,
                direction: "down",
                animationTimer: 0,
                health:
                {
                    ishealing: false,
                    heal_amount: 0
                },
                stat_bonus:
                {
                    projectile_speed: 0,
                    move_speed: 0,
                    projectile_delay: 0,
                    damage: 0
                },
                zigZagPattern:
                {
                    edge1: 0,
                    edge2: 0,
                    zigZagAngle: 0,
                    forward: true
                },
                //disable player
                isDisabled: false,
                isTank: false,
                tank: null

            },
            {
                id: nextCharacterId++,
                x: 900,
                y: 100,
                hp: 100,
                maxHp: 100,
                color: "#34c0eb",
                label: scavNames[Math.floor(Math.random() * scavNames.length)],
                class: "Juggernaut",
                isPlayer: false,
                type: "enemy",
                moveAngle: 0,
                turnTimer: 0,
                targetAngle: 0,
                hitTimer: 0,
                team: "blue",
                animationFrame: 0,
                direction: "down",
                animationTimer: 0,
                stat_bonus:
                {
                    projectile_speed: 0,
                    move_speed: 0,
                    projectile_delay: 0,
                    damage: 0,
                },
                zigZagPattern:
                {
                    edge1: 0,
                    edge2: 0,
                    zigZagAngle: 0,
                    forward: true
                },
            },
            {
                id: nextCharacterId++,
                x: 1200,
                y: 250,
                hp: 100,
                maxHp: 100,
                color: "#34c0eb",
                label: scavNames[Math.floor(Math.random() * scavNames.length)],
                class: "Support",
                isPlayer: false,
                type: "enemy",
                moveAngle: 0,
                turnTimer: 0,
                targetAngle: 0,
                hitTimer: 0,
                team: "blue",
                animationFrame: 0,
                direction: "down",
                animationTimer: 0,
                stat_bonus:
                {
                    projectile_speed: 0,
                    move_speed: 0,
                    projectile_delay: 0,
                    damage: 0
                },
                zigZagPattern:
                {
                    edge1: 0,
                    edge2: 0,
                    zigZagAngle: 0,
                    forward: true
                },
            },
            {
                id: nextCharacterId++,
                x: 600,
                y: 450,
                hp: 150,
                maxHp: 150,
                color: "#34c0eb",
                label: scavNames[Math.floor(Math.random() * scavNames.length)],
                class: "Recon",
                isPlayer: false,
                type: "enemy",
                moveAngle: 0,
                turnTimer: 0,
                targetAngle: 0,
                hitTimer: 0,
                team: "blue",
                animationFrame: 0,
                direction: "down",
                animationTimer: 0,
                stat_bonus:
                {
                    projectile_speed: 0,
                    move_speed: 0,
                    projectile_delay: 0,
                    damage: 0
                },
                zigZagPattern:
                {
                    edge1: 0,
                    edge2: 0,
                    zigZagAngle: 0,
                    forward: true
                },

            },
        ];

        let projectiles = [];
        let tank_projectiles = [];
        let mines = [];
        let healing_projectiles = [];
        let projectile_impact_visual = []

        //add more enemy types here
        const enemy_types = [
            "regular",
            "circle_fighter",
            "zigzag_fighter"
        ]
        const classes = {
            "Assault":
            {
                hp: 100,
                maxhp: 100000,
                projectile_speed: 20,
                projectile_radius: 5,
                projectile_delay: 300,
                move_speed: 1.3,
                damage: 10,
                color: "orange",
            },
            "Recon":
            {
                hp: 80,
                maxhp: 100000,
                projectile_speed: 20,
                projectile_radius: 3,
                projectile_delay: 1000,
                move_speed: 1.5,
                damage: 30,
                color: "purple",
            },
            "Support":
            {
                hp: 100,
                maxhp: 100000,
                projectile_speed: 6,
                projectile_radius: 5,
                projectile_delay: 500,
                move_speed: 1,
                damage: 5,
                color: "cyan",
            },
            "Juggernaut":
            {
                hp: 150,
                maxhp: 150000,
                projectile_speed: 10,
                projectile_radius: 10,
                projectile_delay: 500,
                move_speed: 0.8,
                damage: 10,
                color: "yellow",
            }
        }

        const buff_types =
        {
            "movement_speed":
            {
                move_speed_bonus: 2,
            },
            "damage":
            {
                damage: 2
            },
            "attack_speed":
            {
                attack_speed_bonus: 2
            },
            "Jester":
            {
                projectile_count: 6,
                rank: "legendary",
                damage: 10, //plus 10  
            },
            "allies":
            {
               rank: "legendary", 
            }
        }

        const keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            q: false,
            e: false
        };
        //Set all of the class specific values here
        characters.forEach((character, i, arr) => {
            const class_props = classes[character.class];
            arr[i] = { ...character, ...class_props };
            if (arr[i].type == "enemy") {
                //set a random enemy type
                //10% chance an enemy is a circle fighter
                //90% chance theyre a regular fighter
                const roll = Math.random();
                if (roll < .05) {
                    arr[i].enemy_type = enemy_types[0];
                }
                else if (roll < 0.10) {
                    arr[i].enemy_type = enemy_types[1];
                }
                else {
                    arr[i].enemy_type = enemy_types[2];
                }
            }
        }
        )

        let last_shot_time = 0, current_time = 0;
        //==========================
        //Round
        //==========================

        // Helper function to get a random element from an array
        const getRandomFromArray = (array) => {
            return array[Math.floor(Math.random() * array.length)];
        };
        let roundDelay = 3000;
        let roundStartTime = null;
        const spawnEnemies = (player, gameTime) =>{
             // Spawn enemies
            const minX = boundaries.b_1.x;
            const maxX = boundaries.b_3.x;

            const minY = boundaries.b_2.y;
            const maxY = boundaries.b_4.y;
            //create enemies
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * (maxX - minX) + minX;
                const y = Math.random() * (maxY - minY) + minY;

                characters.push(
                    createEnemy(
                        x,
                        y,
                        getRandomFromArray(scavNames),
                        getRandomFromArray(Object.keys(classes)),
                        nextCharacterId++,
                        classes,
                        gameTime,
                        player.stat_bonus
                    )
                );
            }
        }
        const spawnAllies = (player, gameTime) =>{
            const minX = boundaries.b_1.x;
            const maxX = boundaries.b_3.x;

            const minY = boundaries.b_2.y;
            const maxY = boundaries.b_4.y;
            //create enemies
            const allyX = Math.random() * (maxX - minX) + minX;
            const allyY = Math.random() * (maxY - minY) + minY;
            for (let i = 0; i < 3; i++) {
                //temporary
                characters.push(
                    createAlly(
                        allyX,
                        allyY,
                        getRandomFromArray(allyNames),
                        getRandomFromArray(Object.keys(classes)),
                        nextCharacterId++,
                        classes,
                        gameTime,
                        player.stat_bonus
                    )
                )
            }
        }
        const RoundController = (gameTime) => {
            const enemiesAlive = characters.some(
                character => character.type === "enemy" && character.hp > 0
            );

            const player = getPlayer(characters);

            // If enemies are alive, clear any pending round transition.
            if (enemiesAlive) {
                roundStartTime = null;
                return;
            }

            // Start countdown when last enemy dies.
            if (roundStartTime === null) {
                roundStartTime = gameTime;
                return;
            }

            // Wait for countdown to finish.
            if (gameTime - roundStartTime < roundDelay) {
                return;
            }

            // Prevent another round from starting until enemies exist.
            roundStartTime = Infinity;

            round++;

            // Heal player
            player.hp += 10;

            // Stat upgrades
            player.stat_bonus.projectile_speed += 0.5;
            player.stat_bonus.move_speed += 0.5;
            player.stat_bonus.projectile_delay -= 0.1;
            player.stat_bonus.damage += 0.5;

            player.damage += 0.5;
            player.move_speed = Math.min(3, player.move_speed + 0.5);
            player.projectile_speed += 0.5;
            player.projectile_delay -= 0.1;

            // Buff indicators
            createBuffIndicator(player, "+0.5 damage", "#00ffe5");
            createBuffIndicator(player, "+0.5 move speed", "#cbfffa");
            createBuffIndicator(player, "+0.5 bullet speed", "#6600ff");
            createBuffIndicator(player, "-0.1 attack speed", "#ffc362");

            spawnEnemies(player, gameTime);
            // Optional tower spawn
            if (Math.random() < 0.25) {
                createTower(context);
            }
            if (round >= 7 && Math.random() < 0.95) {
                const troll = Math.random();
                let isEnemyTank = false;
                if(troll <= 0.5)
                {
                    isEnemyTank = true;
                }
                createTank(Tanks, nextTankId++, boundaries, getPlayer(characters), isEnemyTank);
            }
        };

        const drawRoundUi = (gameTime) => {
            if (
                roundStartTime === null ||
                roundStartTime === Infinity
            ) {
                return;
            }

            const secondsLeft = Math.max(
                0,
                Number(
                    (
                        (roundDelay - (gameTime - roundStartTime)) /
                        1000
                    ).toFixed(2)
                )
            );

            const prefix = `Round ${round + 1} begins in`;

            context.save();

            context.font = "36px Orbitron";
            context.fillStyle = "#AFE1AF";
            context.textBaseline = "middle";

            // Fixed positions
            const centerX = canvas.width / 2;
            const y = 200;

            // Draw message
            context.textAlign = "right";
            context.fillText(
                prefix,
                centerX - 10,
                y
            );

            // Draw timer at a fixed X position
            context.textAlign = "left";
            context.fillText(
                `${secondsLeft.toFixed(2)}s`,
                centerX + 10,
                y
            );

            context.restore();
        };
        // =========================
        // DRAWING
        // =========================

        /**
   * Create the death effect once when a character dies.
   * Call this when character.hp drops to 0.
   */
        const drawDeathEffect = (character) => {
            const radius = 5;
            const rows = 4;
            const cols = 4;
            const spacing = 10;

            // Prevent spawning particles multiple times
            if (character.deathEffectSpawned) return;
            character.deathEffectSpawned = true;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    balls.push({
                        // Start near the dead character
                        x: character.x + i * spacing,
                        y: character.y + j * spacing,

                        radius,
                        color: character.color,

                        // Random horizontal velocity
                        dx: (Math.random() - 0.5) * 4,

                        // Initial upward velocity
                        dy: -(Math.random() * 4 + 2),

                        // Gravity pulls particles down
                        gravity: 0.2,

                        // Optional bounce reduction
                        bounce: 0.4,

                        // Lifetime in frames
                        time_to_despawn: 120
                    });
                }
            }
        };

        /**
         * Update and draw all balls each frame.
         */
        const updateBalls = () => {

            const groundY = canvas.height - 10;

            // Iterate backwards so splice() is safe
            for (let i = balls.length - 1; i >= 0; i--) {
                const ball = balls[i];

                // Apply gravity
                ball.dy += ball.gravity;

                // Move
                ball.x += ball.dx;
                ball.y += ball.dy;

                // Bounce off the ground
                if (ball.y + ball.radius >= groundY) {
                    ball.y = groundY - ball.radius;
                    ball.dy *= -ball.bounce;

                    // Friction on horizontal movement
                    ball.dx *= 0.9;

                    // Stop tiny bounces
                    if (Math.abs(ball.dy) < 0.3) {
                        ball.dy = 0;
                    }
                }

                // Draw
                context.fillStyle = ball.color;
                context.beginPath();
                context.arc(
                    ball.x,
                    ball.y,
                    ball.radius,
                    0,
                    Math.PI * 2
                );
                context.fill();

                // Fade out over time
                ball.time_to_despawn--;

                // Remove when expired
                if (ball.time_to_despawn <= 0) {
                    balls.splice(i, 1);
                }
            }
        };

        /**
         * Check all characters and spawn death particles if needed.
         * Call this every frame.
         */
        const checkCharacterDeaths = () => {
            const player = getPlayer(characters);

            for (let i = characters.length - 1; i >= 0; i--) {
                const character = characters[i];

                if (character.hp <= 0) {
                    // never delete player
                    if (character.isPlayer) {
                        character.hp = 0;
                        continue;
                    }

                    drawDeathEffect(character);
                    death_sound.play();

                    characters.splice(i, 1);
                }
            }

            for (let i = Tanks.length - 1; i >= 0; i--) {
                const tank = Tanks[i];

                if (tank.hp <= 0) {
                    if (player && player.tank === tank) {
                        player.tank = null;
                        player.isTank = false;
                        player.isDisabled = false;
                        player.x = tank.x;
                        player.y = tank.y;
                    }

                    drawDeathEffect(tank);
                    death_sound.play();
                    pauseTankSounds();
                    Tanks.splice(i, 1);
                }
            }
        };
        let selected_map = "map1";
        const map = {
            first:
            {
                id: "map1",
                name: "Desert Storm",
                bg_src: background_image
            },
            second:
            {
                id: "map2",
                name: "Libya",
                bg_src: background_image_2
            },
            third:
            {
                id: "map3",
                name: "North Vietnam",
                bg_src: background_image_3
            }
        }
        const drawBackground = () => {
            if (selected_map == map.first.id) {
                image.src = background_image;
            }
            else if (selected_map == map.second.id) {
                image.src = background_image_2;
            }
            else if (selected_map == map.third.id) {
                image.src = background_image_3;
            }
            context.drawImage(
                border_image,
                -1000,
                -1000,
                context.canvas.width + 2000,
                context.canvas.height + 2000
            )
            context.drawImage(
                image,
                -500,
                -500,
                context.canvas.width + 1000,
                context.canvas.height + 1000
            );

            // //draw the boundaries
            // context.fillStyle = "gray";
            // context.fillRect(
            // boundaries.b_1.x,
            // boundaries.b_1.y,
            // boundaries.b_1.width,
            // boundaries.b_1.height);

            // context.fillRect(
            // boundaries.b_2.x,
            // boundaries.b_2.y,
            // boundaries.b_2.width,
            // boundaries.b_2.height);

            // context.fillRect(
            // boundaries.b_3.x,
            // boundaries.b_3.y,
            // boundaries.b_3.width,
            // boundaries.b_3.height);

            // context.fillRect(
            // boundaries.b_4.x,
            // boundaries.b_4.y,
            // boundaries.b_4.width,
            // boundaries.b_4.height);
        }
        const drawCharacter = (character) => {
            const player = getPlayer(characters);
            if (character === player && player.isDisabled) {
                return;
            }

            character.animationTimer += 0.4;

            if (character.animationTimer > 10) {
                character.animationFrame =
                    (character.animationFrame + 1) % 4;

                character.animationTimer = 0;
            }

            const row = getDirectionRow(character.direction);

            let shooter_image = assault_class_shooter;
            switch (character.class) {
                case "Assault":
                    shooter_image = assault_class_shooter;
                    break;
                case "Recon":
                    shooter_image = recon_class_shooter;
                    break;
                case "Support":
                    shooter_image = support_class_shooter;
                    break;
                case "Juggernaut":
                    shooter_image = juggernaut_class_shooter;
                default:
                    break;
            }
            const FRAME_WIDTH = shooter_image.width / 4;
            const FRAME_HEIGHT = shooter_image.height / 4;

            const sx = character.animationFrame * FRAME_WIDTH;
            const sy = row * FRAME_HEIGHT;

            context.drawImage(
                shooter_image,
                sx,
                sy,
                FRAME_WIDTH,
                FRAME_HEIGHT,
                character.x,
                character.y,
                CHARACTER_WIDTH * 2,
                CHARACTER_HEIGHT * 2
            );

            // HP
            context.fillStyle = "red";
            context.font = "20px Arial";
            context.textAlign = "center";
            context.textBaseline = "bottom";

            context.fillText(
                `${Math.round(character.hp)}`,
                character.x + CHARACTER_WIDTH / 2,
                character.y - 30
            );

            // Label
            context.fillStyle = character.color;
            context.font = "24px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";

            context.fillText(
                character.label,
                character.x + CHARACTER_WIDTH / 2,
                character.y - 20
            );
        };

        // =========================
        // INPUT
        // =========================
        const getDirectionRow = (direction) => {
            switch (direction) {
                case "up": return 0;
                case "left": return 3;
                case "down": return 1;
                case "right": return 2;
                default: return 2;
            }
        }
        const movePlayer = () => {
            const player = getPlayer(characters);
            if (!player || player.hp <= 0 || player.isDisabled) return;

            // up 
            if (keys.w && player.y > boundaries.b_2.y) {
                player.y -= player.move_speed;
                player.direction = "up";
            }
            // down
            if
                (
                keys.s &&
                player.y < boundaries.b_4.y - CHARACTER_HEIGHT
            ) {
                player.y += player.move_speed;
                player.direction = "down";
            }
            // left
            if (keys.a && player.x > boundaries.b_1.x) {
                player.x -= player.move_speed;
                player.direction = "left";
            }
            // right
            if
                (
                keys.d &&
                player.x < boundaries.b_3.x - CHARACTER_WIDTH
            ) {
                player.x += player.move_speed;
                player.direction = "right";
            }
        };
        // Initialize enemy movement properties once (after you create characters)

        const TOO_FAR_RADIUS = 600;
        const TOO_CLOSE_RADIUS = 150;

        const addHealthPods = (gameTime) => {
            // Spawn a new health pod every healthDelay milliseconds
            const health_amount = 50;
            if (gameTime - lastHealthSpawn >= healthDelay) {
                const healthWidth = 50;
                const healthHeight = 50;

                //pos
                const minX = boundaries.b_1.x;
                const maxX = boundaries.b_3.x;

                const minY = boundaries.b_2.y;
                const maxY = boundaries.b_4.y;
                const x = Math.random() * (maxX - minX) + minX;
                const y = Math.random() * (maxY - minY) + minY;

                health_pods.push({
                    health: health_amount,
                    x: x,
                    y: y,
                    width: healthWidth,
                    height: healthHeight,
                });

                lastHealthSpawn = gameTime;
            }

            const player = getPlayer(characters);
            if (!player || player.hp <= 0) return;

            // Filter out pods that were picked up
            health_pods = health_pods.filter((pod) => {
                const playerCenterX =
                    player.x + CHARACTER_WIDTH / 2;
                const playerCenterY =
                    player.y + CHARACTER_HEIGHT / 2;

                const isColliding = pointInRect(
                    playerCenterX,
                    playerCenterY,
                    pod.x,
                    pod.y,
                    pod.width,
                    pod.height
                );

                if (isColliding) {
                    health_sound.play();
                    // Heal but do not exceed max HP
                    player.health.is_healing = true;
                    player.health.heal_amount = health_amount;
                    createBuffIndicator(
                        player,
                        `+${Math.round(health_amount)} hp`,
                        "#15fa00"
                    );
                    createHealingEffect(player, 10);
                    // Remove this pod
                    return false;
                }

                // Keep this pod
                return true;
            });
        };
        const heal_player = () => {
            const player = getPlayer(characters);
            if (player.health && player.health.is_healing) {
                if (player.health.heal_amount >= 0) {
                    player.hp = Math.min(player.maxHp, player.hp + 1)

                }
                player.health.heal_amount--;
            }
        }
        //visuals
        const createBuffVisual = (buffType) => {
            const visualSettings = {
                damage: {
                    color: "255, 137, 0",      // Orange
                    maxAlpha: 0.1
                },
                movement_speed: {
                    color: "213, 255, 255",    // White
                    maxAlpha: 0.1
                },
                attack_speed: {
                    color: "255, 255, 204",      // Yellow
                    maxAlpha: 0.1
                },
                Jester: {
                    color: "128, 0, 255",      // Purple
                    maxAlpha: 0.25
                }
            };

            const settings = visualSettings[buffType];
            if (!settings) return;

            activeBuffVisuals.push({
                buffType,
                color: settings.color,
                maxAlpha: settings.maxAlpha,
                alpha: 0,
                fadeSpeed: 0.02,
                state: "fadeIn" // fadeIn -> active -> fadeOut
            });
        };

        const drawHealthPods = () => {
            health_pods.forEach((pod) => {
                context.drawImage(health_img, pod.x, pod.y, pod.width, pod.height);
            });
        };
        const createHealingEffect = (character, amount = 8) => {
            for (let i = 0; i < amount; i++) {
                healingEffects.push({
                    // Start around the center of the character
                    x: character.x + CHARACTER_WIDTH / 2 + (Math.random() - 0.5) * 50,
                    y: character.y + CHARACTER_HEIGHT / 2 + (Math.random() - 0.5) * 20,

                    // Random size
                    width: 20 + Math.random() * 20,
                    height: 20 + Math.random() * 20,

                    // Float upward with slight horizontal drift
                    dx: (Math.random() - 0.5) * 1.5,
                    dy: -(1 + Math.random() * 2),

                    // Fade out
                    alpha: 1,

                    // Shrink slightly over time
                    scale: 1,
                    scaleSpeed: 0.005,

                    // Lifetime in frames
                    life: 60 + Math.random() * 20
                });
            }
        };

        // ========================================
        // UPDATE HEALING EFFECTS
        // ========================================
        const updateHealingEffects = () => {
            for (let i = healingEffects.length - 1; i >= 0; i--) {
                const effect = healingEffects[i];

                // Move
                effect.x += effect.dx;
                effect.y += effect.dy;

                // Fade
                effect.alpha -= 0.02;

                // Scale up slightly for a magical feel
                effect.scale += effect.scaleSpeed;

                // Decrease life
                effect.life--;

                // Remove if expired
                if (effect.life <= 0 || effect.alpha <= 0) {
                    healingEffects.splice(i, 1);
                }
            }
        };

        // ========================================
        // DRAW HEALING EFFECTS
        // ========================================
        const drawHealingEffects = (context) => {
            healingEffects.forEach(effect => {
                context.save();

                context.globalAlpha = effect.alpha;

                // Move origin to center for scaling
                context.translate(
                    effect.x + effect.width / 2,
                    effect.y + effect.height / 2
                );

                context.scale(effect.scale, effect.scale);

                // Draw centered
                context.drawImage(
                    healthCrossImage,
                    -effect.width / 2,
                    -effect.height / 2,
                    effect.width,
                    effect.height
                );

                context.restore();
            });
        };
        // =========================
        // BUFF HELPERS
        // =========================

        // Pick a random buff type
        const getRandBuff = () => {
            const buffKeys = Object.keys(buff_types);
            const randIndex = Math.floor(Math.random() * buffKeys.length);
            return buffKeys[randIndex];
        };

        const BUFF_DURATION = 5000; // 5 seconds

        // Apply a buff to the player
        const applyBuff = (player, buff, gameTime) => {
            // Store how much this specific buff changed the player
            let appliedValue = 0;

            createBuffVisual(buff.buff_type);

            switch (buff.buff_type) {
                case "movement_speed":
                    speed_buff_sound.play();
                    appliedValue = buff.bonus.move_speed_bonus;
                    player.move_speed += appliedValue;
                    createBuffIndicator(
                        player,
                        `+${Math.round(appliedValue)} Speed`,
                        "#66ccff"
                    );
                    break;

                case "damage":
                    damage_buff_sound_effect.play();
                    appliedValue = buff.bonus.damage;
                    player.damage += appliedValue;
                    createBuffIndicator(
                        player,
                        `+${Math.round(appliedValue)} Damage`,
                        "#ff8800"
                    );
                    break;

                case "attack_speed":
                    as_sound.play();

                    // Convert attack speed bonus to delay reduction
                    appliedValue = buff.bonus.attack_speed_bonus * 100;

                    // Prevent projectile delay from going below 50ms
                    const oldDelay = player.projectile_delay;
                    player.projectile_delay = Math.max(
                        50,
                        player.projectile_delay - appliedValue
                    );

                    // Store the ACTUAL amount applied after clamping
                    appliedValue = oldDelay - player.projectile_delay;

                    createBuffIndicator(
                        player,
                        `+${Math.round(appliedValue)} Damage`,
                        "#ff8800"
                    );
                    break;

                case "Jester":
                    // Start playing at 3.2 seconds
                    jester_laugh.currentTime = 3.2;
                    jester_laugh.play();
                    // Stop after 2 seconds of playback
                    setTimeout(() => {
                        jester_laugh.pause();          // Stop the audio
                        jester_laugh.currentTime = 0;  // Reset to the beginning (optional)
                    }, 3000); // 2000 ms = 2 seconds
                    appliedValue = buff.bonus.damage;
                    player.damage += appliedValue;
                    createBuffIndicator(
                        player,
                        `+${Math.round(appliedValue)} JESTER`,
                        "#b266ff"
                    );
                    break;
                
                case "allies":
                    alliesBuffSound.play();
                    spawnAllies(player, gameTime);
                    break;

            }

            // Save buff info including exact applied value
            //when i collect too many buffs at the same time, The game breaks and sometimes move_speed goes to -1
            player.buffs.push({
                buff_type: buff.buff_type,
                appliedValue: appliedValue,
                buffExpiresAt: current_time + BUFF_DURATION
            });
        };
        // Remove a buff's effect
        const removeBuffEffect = (player, buffItem) => {
            if (!buffItem) return;

            activeBuffVisuals.forEach((visual) => {
                if (
                    visual.buffType === buffItem.buff_type &&
                    visual.state !== "fadeOut"
                ) {
                    visual.state = "fadeOut";
                }
            });

            switch (buffItem.buff_type) {
                case "movement_speed":
                    player.move_speed -= buffItem.appliedValue;
                    break;

                case "damage":
                    player.damage -= buffItem.appliedValue;
                    break;

                case "attack_speed":
                    // Restore exactly what was removed
                    player.projectile_delay += buffItem.appliedValue;
                    break;

                case "Jester":
                    player.damage -= buffItem.appliedValue
                    break;
            }
        };
        const rainDrops = [];

        const initRain = () => {


            const rainCount = 300;

            for (let i = 0; i < rainCount; i++) {
                rainDrops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: 8 + Math.random() * 8,
                    length: 10 + Math.random() * 15
                });
            }
        }
        initRain();
        let isRaining = false;
        let rainEndTime = Infinity;

        const WEATHER_CHECK_INTERVAL = 60000; // check every minute
        let lastWeatherCheck = -60000;

        const RAIN_CHANCE = 0.5; // 10%
        const RAIN_DURATION = 30000; // 30 seconds
        const updateWeather = (currentTime) => {
            // Check weather once per minute
            if (currentTime - lastWeatherCheck >= WEATHER_CHECK_INTERVAL) {
                lastWeatherCheck = currentTime;

                if (!isRaining && Math.random() < RAIN_CHANCE) {
                    rain_sound.play();
                    isRaining = true;
                    rainEndTime = currentTime + RAIN_DURATION;
                }
            }

            // Stop rain
            if (isRaining && currentTime >= rainEndTime) {
                rain_sound.pause();
                isRaining = false;
            }
        }
        const updateRain = () => {
            if (performance.now() > rainEndTime) {
                isRaining = false;
                return;
            }

            for (const drop of rainDrops) {
                drop.y += drop.speed;

                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            }
        }
        const drawRain = () => {
            context.strokeStyle = "rgba(220, 230, 255, 0.8)";
            context.lineWidth = 2;

            context.beginPath();

            for (const drop of rainDrops) {
                context.moveTo(drop.x, drop.y);
                context.lineTo(drop.x - 3, drop.y + drop.length);
            }

            context.stroke();
        }
        const drawBuffVisuals = () => {
            activeBuffVisuals.forEach((visual) => {
                context.save();

                // Purple moody effect for Jester
                if (visual.buffType === "Jester") {
                    const pulse =
                        0.8 + Math.sin(current_time * 0.01) * 0.2;

                    context.fillStyle = `rgba(${visual.color}, ${visual.alpha * pulse
                        })`;
                }
                else {
                    context.fillStyle = `rgba(${visual.color}, ${visual.alpha})`;
                }

                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                context.restore();
            });
        };

        const updateBuffVisuals = () => {
            for (let i = activeBuffVisuals.length - 1; i >= 0; i--) {
                const visual = activeBuffVisuals[i];

                if (visual.buffType === "movement_speed") {
                    for (let i = 0; i < 20; i++) {
                        const x =
                            (i * 97 + current_time * 0.1) % canvas.width;
                        const y =
                            (i * 53) % canvas.height;
                        const radius =
                            80 + Math.sin(current_time * 0.01 + i) * 20;

                        context.beginPath();
                        context.fillStyle = `rgba(255,255,255,${visual.alpha * 0.4
                            })`;
                        context.arc(x, y, radius, 0, Math.PI * 2);
                        context.fill();
                    }
                }
                else {
                    context.fillStyle = `rgba(${visual.color}, ${visual.alpha})`;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                if (visual.state === "fadeIn") {
                    visual.alpha += visual.fadeSpeed;

                    if (visual.alpha >= visual.maxAlpha) {
                        visual.alpha = visual.maxAlpha;
                        visual.state = "active";
                    }
                }
                else if (visual.state === "fadeOut") {
                    visual.alpha -= visual.fadeSpeed;

                    if (visual.alpha <= 0) {
                        activeBuffVisuals.splice(i, 1);
                    }
                }
            }
        };
        // Remove expired buffs
        const updateBuffs = (player) => {
            if (!player || !player.buffs) return;

            for (let i = player.buffs.length - 1; i >= 0; i--) {
                const buffItem = player.buffs[i];

                if (current_time >= buffItem.buffExpiresAt) {
                    removeBuffEffect(player, buffItem);
                    player.buffs.splice(i, 1);
                }
            }
            for (let i = buffs.length - 1; i >= 0; i--) {
                const buff = buffs[i];
                if (current_time >= buff.expiresAt) {
                    buffs.splice(i, 1);
                }
            }
        };
        // Spawn + pickup logic
        const buffPlayer = (gameTime) => {
            // Spawn buffs only after round 2
            if (round > 2) {
                if (gameTime - last_buff_spawn >= buff_delay) {
                    const minX = boundaries.b_1.x;
                    const maxX = boundaries.b_3.x - 50;

                    const minY = boundaries.b_2.y;
                    const maxY = boundaries.b_4.y - 50;

                    const rand_x = Math.random() * (maxX - minX) + minX;
                    const rand_y = Math.random() * (maxY - minY) + minY;
                    const rand_buff = getRandBuff();

                    buffs.push({
                        x: rand_x,
                        y: rand_y,
                        width: 80,
                        height: 80,
                        buff_type: rand_buff,
                        bonus: buff_types[rand_buff],
                        expiresAt: gameTime + 10000 // 10 seconds from now // remove in 10 seconds
                    });

                    last_buff_spawn = gameTime;
                }
            }

            const player = getPlayer(characters);
            if (!player || player.hp <= 0) return;

            // Pickup detection
            buffs = buffs.filter((buff) => {
                const playerCenterX = player.x + CHARACTER_WIDTH / 2;
                const playerCenterY = player.y + CHARACTER_HEIGHT / 2;

                const isColliding = pointInRect(
                    playerCenterX,
                    playerCenterY,
                    buff.x,
                    buff.y,
                    buff.width,
                    buff.height
                );

                if (isColliding) {
                    applyBuff(player, buff, gameTime);
                    return false; // remove buff
                }

                return true; // keep buff
            });

        };
        // =========================
        // DRAW BUFFS
        // =========================
        const drawBuffs = () => {
            buffs.forEach((buff) => {
                // Choose color + label based on buff type
                let color = "yellow";
                let label = "?";

                switch (buff.buff_type) {
                    case "movement_speed":
                        context.drawImage(s_buff_img, buff.x, buff.y, buff.width, buff.height);
                        break;

                    case "damage":
                        context.drawImage(dmg_buff_img, buff.x, buff.y, buff.width, buff.height);
                        break;

                    case "attack_speed":
                        context.drawImage(attack_speed_buff_img, buff.x, buff.y, buff.width, buff.height);
                        break;
                    case "Jester":
                        context.drawImage(jester_buff_img, buff.x, buff.y, buff.width, buff.height);
                        break;
                    case "allies":
                        context.drawImage(alliesBuffImage, buff.x, buff.y, buff.width, buff.height);
                        break;
                }

                // // Draw square
                // context.fillStyle = color;
                // context.fillRect(
                //     buff.x,
                //     buff.y,
                //     buff.width,
                //     buff.height
                // );

                // // Draw text
                // context.fillStyle = "black";
                // context.font = "16px Arial";
                // context.textAlign = "center";
                // context.textBaseline = "middle";
                // context.fillText(
                //     label,
                //     buff.x + buff.width / 2,
                //     buff.y + buff.height / 2
                // );
            });
        };
        const drawBuffUI = () => {
            const player = getPlayer(characters);

            // Make sure player exists and has active buffs
            if (!player || player.hp <= 0) return;
            if (!player.buffs || player.buffs.length === 0) return;

            // Panel position
            const PANEL_X = canvas.width - 320;
            const PANEL_WIDTH = 280;
            const ROW_HEIGHT = 55;
            const PANEL_PADDING = 15;
            const HEADER_HEIGHT = 30;

            // Panel height based on number of buffs
            const panelHeight =
                HEADER_HEIGHT +
                PANEL_PADDING * 2 +
                player.buffs.length * ROW_HEIGHT;

            const PANEL_Y =
                canvas.height - panelHeight - 20;

            // Draw panel background
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(
                PANEL_X,
                PANEL_Y,
                PANEL_WIDTH,
                panelHeight
            );

            // Draw border
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.strokeRect(
                PANEL_X,
                PANEL_Y,
                PANEL_WIDTH,
                panelHeight
            );

            // Draw title
            context.fillStyle = "gold";
            context.font = "bold 22px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";

            context.fillText(
                "Active Buffs",
                PANEL_X + PANEL_WIDTH / 2,
                PANEL_Y + HEADER_HEIGHT / 2 + 2
            );

            context.textAlign = "left";
            context.textBaseline = "alphabetic";
            // Draw each buff
            player.buffs.forEach((buffItem, index) => {
                const buff = buffItem;
                const rowY =
                    PANEL_Y +
                    HEADER_HEIGHT +
                    PANEL_PADDING +
                    index * ROW_HEIGHT;

                // Time remaining
                const timeRemaining = Math.max(
                    0,
                    (buffItem.buffExpiresAt - current_time) / 1000
                );

                // Progress percentage
                const progress = Math.max(
                    0,
                    Math.min(
                        1,
                        (buffItem.buffExpiresAt - current_time) / BUFF_DURATION
                    )
                );

                // Friendly buff names
                let buffName = "";
                switch (buffItem.buff_type) {
                    case "movement_speed":
                        buffName = "Speed";
                        break;
                    case "damage":
                        buffName = "Damage";
                        break;
                    case "attack_speed":
                        buffName = "Attack Speed";
                        break;
                    default:
                        buffName = buff.buff_type;
                }

                // Draw buff name
                context.fillStyle = "white";
                context.font = "16px Arial";
                context.fillText(
                    buffName,
                    PANEL_X + PANEL_PADDING,
                    rowY + 5
                );

                // Draw time remaining
                context.fillStyle = "lightgray";
                context.font = "14px Arial";
                context.fillText(
                    `${timeRemaining.toFixed(1)}s`,
                    PANEL_X + PANEL_WIDTH - 60,
                    rowY + 5
                );

                // Progress bar settings
                const BAR_X = PANEL_X + PANEL_PADDING;
                const BAR_Y = rowY + 25;
                const BAR_WIDTH = PANEL_WIDTH - PANEL_PADDING * 2;
                const BAR_HEIGHT = 14;

                // Background bar
                context.fillStyle = "#333";
                context.fillRect(
                    BAR_X,
                    BAR_Y,
                    BAR_WIDTH,
                    BAR_HEIGHT
                );

                // Filled portion
                context.fillStyle = progress > 0.5
                    ? "#00ff00"
                    : progress > 0.25
                        ? "#ffaa00"
                        : "#ff4444";

                context.fillRect(
                    BAR_X,
                    BAR_Y,
                    BAR_WIDTH * progress,
                    BAR_HEIGHT
                );

                // Bar border
                context.strokeStyle = "white";
                context.lineWidth = 1;
                context.strokeRect(
                    BAR_X,
                    BAR_Y,
                    BAR_WIDTH,
                    BAR_HEIGHT
                );
            });
        };

        // =========================
        // DRAW EVERYTHING
        // =========================
        const draw = () => {
            // Draw living characters
            characters.forEach((character) => {
                if (character.hp > 0) {
                    drawCharacter(character);
                }
                // if(pointInRect(character.x, character.y,)
            });

            // Draw bullets
            projectiles.forEach(projectile => drawProjectile(projectile, context));
            healing_projectiles.forEach(projectile => drawHealProjectile(projectile, context));
            tank_projectiles.forEach(projectile => drawTankProjectile(projectile, context));
            drawProjectileCollision(projectile_impact_visual, context);
            //draw vehicles
            Tanks.forEach(tank => {
                drawTank(tank, context, keys)
            })

            mines.forEach(mine => {
                drawMine(context, mine);
            })
        };

        //ui
        const draw_start_button = (btn) => {
            if (btn.isHover) {
                const startColor = { r: 255, g: 0, b: 0 };   // Red
                const endColor = { r: 0, g: 0, b: 255 };     // Blue
                const currentR = Math.round(startColor.r + (endColor.r - startColor.r) * Math.cos(progress));
                const currentG = Math.round(startColor.g + (endColor.g - startColor.g) * Math.cos(progress));
                const currentB = Math.round(startColor.b + (endColor.b - startColor.b) * Math.cos(progress));
                progress += 0.01;
                context.fillStyle = `rgb(${currentR}, ${currentG}, ${currentB})`;
            }
            else {
                context.fillStyle = btn.color;
            }
            context.fillRect(btn.x, btn.y, btn.width, btn.height);
            context.fillStyle = btn.textColor;
            context.font = '20px sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(
                btn.text,
                btn.x + btn.width / 2,
                btn.y + btn.height / 2
            );
        }
        let class_hover_progress = 0;
        const draw_class = (it, x, y, width, height, info) => {
            const frameWidth = class_image.width / 2;
            const frameHeight = class_image.height / 2;

            let sx = 0;
            let sy = 0;
            class_hover_progress += 0.01;
            switch (it) {
                case "Support":
                    sx = 0;
                    sy = 0;
                    break;

                case "Assault":
                    sx = frameWidth;
                    sy = 0;
                    break;

                case "Juggernaut":
                    sx = 0;
                    sy = frameHeight;
                    break;

                case "Recon":
                    sx = frameWidth;
                    sy = frameHeight;
                    break;

                default:
                    return;
            }
            if (!info.selected) {
                context.drawImage(
                    class_b_w_image,
                    sx,                 // source x
                    sy,                 // source y
                    frameWidth,         // source width
                    frameHeight,        // source height
                    x,                  // destination x
                    y,                  // destination y
                    width,              // fit card width
                    height / 1.5              // fit card height
                );
            }
            else {
                createSparkBurst(
                    x + width / 2,
                    y + height - 200,
                    info.color
                );
                if (info.hover) {
                    context.drawImage(
                        class_image,
                        sx,                 // source x
                        sy + Math.cos(class_hover_progress * 0.8) * 5,                 // source y
                        frameWidth,         // source width
                        frameHeight,        // source height
                        x,                  // destination x
                        y,                  // destination y
                        width,              // fit card width
                        height / 1.5              // fit card height
                    );
                }
                else {
                    context.drawImage(
                        class_image,
                        sx,                 // source x
                        sy,                 // source y
                        frameWidth,         // source width
                        frameHeight,        // source height
                        x,                  // destination x
                        y,                  // destination y
                        width,              // fit card width
                        height / 1.5              // fit card height
                    );
                }
            }
        };
        const class_card_info = [
            {}, {}, {}, {}
        ]
        const cardCount = Object.keys(classes).length;
        const cardSpacing = 30;
        const sidePadding = 40;

        const cardWidth =
            (canvas.width - sidePadding * 2 - cardSpacing * (cardCount - 1))
            / cardCount;

        const cardHeight = 1000;

        let i = 0;

        for (let classIt in classes) {
            const x = sidePadding + i * (cardWidth + cardSpacing);
            const y = 50;

            //calculating these values to set hover properties instead of redifining in game loop

            class_card_info[i] = {
                x: x,
                y: y,
                width: cardWidth,
                height: cardHeight,
                selected: false,
                hover: false,
                color: classes[classIt].color,
                class: classIt
            }
            i++;
        }
        const draw_class_cards = () => {
            const cardCount = Object.keys(classes).length;
            const cardSpacing = 30;
            const sidePadding = 40;

            const cardWidth =
                (canvas.width - sidePadding * 2 - cardSpacing * (cardCount - 1))
                / cardCount;

            const cardHeight = 1000;

            let i = 0;

            for (let classIt in classes) {
                const x = sidePadding + i * (cardWidth + cardSpacing);
                const y = 50;
                draw_class(classIt, x, cardHeight / 2, cardWidth, cardHeight, class_card_info[i]);
                i++;
            }
        }
        const draw_menu_background = () => {
            context.drawImage(
                menu_image,
                0,
                0,
                canvas.width,
                canvas.height);
        }
        const draw_title_screen = (title) => {
            context.textAlign = "center";

            // Bold fantasy-style font
            context.font = "bold 56px arial";

            // Shadow effect
            context.shadowColor = "black";
            context.shadowBlur = 10;
            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;

            // Gold text
            context.fillStyle = "#ffffff";
            context.fillText(title, canvas.width / 2, 200);

            // Reset shadow so it doesn't affect other text
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
        };

        const sparks = [];

        const createSparkBurst = (x, y, color) => {
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 4;

                sparks.push({
                    x,
                    y,
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed - 1,
                    size: 2 + Math.random() * 4,
                    life: 30 + Math.random() * 20,
                    maxLife: 120,
                    color: Math.random() > 0.5 ? color : "#FFFFFF"
                });
            }
        };
        const updateSparks = () => {
            for (let i = sparks.length - 1; i >= 0; i--) {
                const spark = sparks[i];

                spark.x += spark.dx;
                spark.y += spark.dy;

                spark.dy += 0.05; // gravity

                spark.life--;

                if (spark.life <= 0) {
                    sparks.splice(i, 1);
                }
            }
        };
        const drawSparks = (context) => {
            sparks.forEach(spark => {
                const alpha = spark.life / spark.maxLife;

                context.save();

                context.globalAlpha = alpha;

                context.shadowColor = spark.color;
                context.shadowBlur = 10;

                context.fillStyle = spark.color;

                context.beginPath();
                context.arc(
                    spark.x,
                    spark.y,
                    spark.size * alpha,
                    0,
                    Math.PI * 2
                );
                context.fill();

                context.restore();
            });
        };
        const stop_playing_audio = (track, id) => {
            track.stop(id);
        };
        const map_cards = [{}, {}, {}];
        const bgs = [map.first, map.second, map.third];
        const set_map_menu = () => {
            const bg1 = new Image();
            const bg2 = new Image();
            const bg3 = new Image();
            bg1.src = background_image;
            bg2.src = background_image_2;
            bg3.src = background_image_3;
            map.first.image = bg1;
            map.second.image = bg2;
            map.third.image = bg3;

            const cardWidth = 600;
            const cardHeight = 400;
            const gap = 40;

            const totalWidth =
                (bgs.length * cardWidth) +
                ((bgs.length - 1) * gap);

            const startX = (canvas.width - totalWidth) / 2;
            const y = (canvas.height - cardHeight) / 2;

            bgs.forEach((bg, i) => {
                const x = startX + i * (cardWidth + gap);
                map_cards[i] =
                {
                    x: x,
                    y: y,
                    width: cardWidth,
                    height: cardHeight,
                    mapid: bg.id,
                }

            });
        }
        set_map_menu();
        const draw_maps = () => {
            const cardWidth = 600;
            const cardHeight = 400;
            const gap = 40;

            const totalWidth =
                (bgs.length * cardWidth) +
                ((bgs.length - 1) * gap);

            const startX = (canvas.width - totalWidth) / 2;
            const y = (canvas.height - cardHeight) / 2;

            bgs.forEach((bg, i) => {
                const x = startX + i * (cardWidth + gap);

                // Map image
                if (map_cards[i].selected) {
                    context.drawImage(bg.image, x, y, cardWidth, cardHeight);
                    context.fillText(bg.name, x + cardWidth / 2, y + cardHeight / 2);
                    createSparkBurst(
                        x + cardWidth / 2,
                        y + cardHeight + 200,
                        "#FFD700"
                    );
                }
                else {
                    context.filter = "grayscale(100%)";

                    context.drawImage(bg.image, x, y, cardWidth, cardHeight);
                    context.fillText(bg.name, x + cardWidth / 2, y + cardHeight / 2);

                    context.filter = "none";
                }

            });
        };
        // =========================
        // MAIN LOOP
        // =========================
        let animationId;
        //UI
        const ui = new UI(getPlayer(characters), context, round, characters.length - 1);
        const gameLoop = (game_time) => {

            //clear the rect at any state
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (cur_game_state == game_state.menu) {
                //create cards showing each class choice.
                //player will choose a card and the game will be played.
                //their choice will be set in the game.
                draw_menu_background();
                if (cur_menu_state == menu_state.class) {
                    draw_title_screen("Choose Your Class");
                    draw_class_cards();
                    //class button
                    draw_start_button(map_button);
                }
                else if (cur_menu_state == menu_state.map) {
                    draw_title_screen("Choose a Map");
                    draw_maps();
                    draw_start_button(start_button);

                }
                drawSparks(context);
                updateSparks();
            }
            else if (cur_game_state == game_state.game) {
                //background_music.play();
                stop_playing_audio(menu_music, menu_music_id);
                const player = getPlayer(characters);
                if (!player.isDisabled)
                    camera.follow(player);
                if (player.isTank && player.tank) {
                    camera.follow(player.tank);
                }

                camera.begin(context);

                current_time = game_time;

                const deltaTime = game_time - lastFrameTime;
                lastFrameTime = game_time;

                drawBackground();
                movePlayer();
                handleEnemyMovementRandomizer(deltaTime, characters, TOO_FAR_RADIUS, TOO_CLOSE_RADIUS, context, boundaries);
                handleAllyMovement(deltaTime, characters, boundaries)

                updateProjectiles(projectiles, canvas, characters, projectile_impact_visual, getTowers(), Tanks);
                updateTankProjectiles(tank_projectiles, canvas, characters, projectile_impact_visual, getTowers(), Tanks);
                updateHealProjectiles(healing_projectiles, canvas, characters);

                updateTanks(Tanks, keys, boundaries, getPlayer(characters), game_time, tank_projectiles);
                handleEnemyProjectiles(current_time, characters, projectiles);
                enemyTarget(characters, projectiles, game_time)

                handleEnemyMines(game_time, characters, mines, Tanks);

                updateMines(mines, Tanks);

                characters.forEach(ch => {
                    if (ch.hitTimer > 0)
                        ch.hitTimer--;
                }
                )
                //healing things
                addHealthPods(game_time);
                heal_player();
                updateHealingEffects();
                drawHealingEffects(context);
                //indicators
                updateBuffIndicators();
                drawBuffIndicators(context);

                createTower(context);
                // Buff logic
                buffPlayer(game_time);
                updateBuffs(getPlayer(characters));

                updateBuffVisuals();

                deleteCharacters(characters);
                RoundController(game_time);

                draw();
                drawHealthPods();

                // Draw buffs
                drawBuffs();

                checkCharacterDeaths();
                updateBalls();

                camera.end(context);

                updateWeather(current_time);

                if (isRaining) {
                    updateRain();
                    drawRain();
                }

                drawBuffVisuals();
                drawBuffUI();
                drawHover(draw_hover_character);
                ui.drawUI(
                    getPlayer(characters),
                    context,
                    round,
                    characters.length - 1
                );
                drawTankHealthBar(context, Tanks, game_time);
                drawTankSelectionUi(context, Tanks, keys);
                drawRoundUi(game_time);
            }
            else if (cur_game_state == game_state.pause) {

            }
            //gamestate.end
            else {

            }

            animationId = requestAnimationFrame(gameLoop);
        };

        // =========================
        // EVENT HANDLERS
        // =========================
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            if (key in keys) {
                keys[key] = true;
            }
        };

        const handleKeyUp = (event) => {
            const key = event.key.toLowerCase();
            if (key in keys) {
                keys[key] = false;
            }
        };
        const drawHover = (character) => {
            if (!character)
                return;
            // Position of the character info panel
            const panelX = canvas.width - 420;
            const panelY = canvas.height / 2 - 100;
            const panelWidth = 360;
            const panelHeight = 180;
            const padding = 20;
            const lineHeight = 40;

            // Draw black background panel
            context.fillStyle = "rgba(116, 97, 97, 0.85)";
            context.fillRect(panelX, panelY, panelWidth, panelHeight);

            // Optional border
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.strokeRect(panelX, panelY, panelWidth, panelHeight);

            // Draw character portrait square
            const portraitSize = 80;
            context.fillStyle = character.color;
            context.fillRect(
                panelX + padding,
                panelY + padding,
                portraitSize,
                portraitSize
            );

            // Text settings
            const textX = panelX + padding + portraitSize + 20;
            const textY = panelY + padding + 10;

            context.font = "22px Arial";
            context.fillStyle = "white";
            context.textBaseline = "top";

            // Character name
            context.fillText(`Name: ${character.label}`, textX, textY);

            // Character class
            context.fillText(`Class: ${character.class}`, textX, textY + lineHeight);

            // ======================
            // Stylish Health Bar
            // ======================
            const healthBarX = textX;
            const healthBarY = textY + lineHeight * 2 + 5;
            const healthBarWidth = 180;
            const healthBarHeight = 24;

            // Background of health bar
            context.fillStyle = "#333";
            context.fillRect(
                healthBarX,
                healthBarY,
                healthBarWidth,
                healthBarHeight
            );

            // Calculate health percentage
            const healthPercent = Math.max(0, character.hp / character.maxHp);

            // Dynamic color based on health
            let hpColor = "lime";
            if (healthPercent < 0.6) hpColor = "yellow";
            if (healthPercent < 0.3) hpColor = "red";

            // Filled health amount
            context.fillStyle = hpColor;
            context.fillRect(
                healthBarX,
                healthBarY,
                healthBarWidth * healthPercent,
                healthBarHeight
            );

            // Health bar border
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.strokeRect(
                healthBarX,
                healthBarY,
                healthBarWidth,
                healthBarHeight
            );

            // Health text centered in bar
            context.font = "16px Arial";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(
                `${character.hp} / ${character.maxHp}`,
                healthBarX + healthBarWidth / 2,
                healthBarY + healthBarHeight / 2
            );

            // Reset alignment settings
            context.textAlign = "left";
            context.textBaseline = "top";

        }
        let progress = 0; // Ranges from 0 to 1
        const handleHover = (event) => {
            const rect = canvas.getBoundingClientRect();

            const screenX = event.clientX - rect.left;
            const screenY = event.clientY - rect.top;
            const worldPos = camera.screenToWorld(screenX, screenY);

            const uiX = screenX;
            const uiY = screenY;
            //UI 
            for (let i = 0; i < class_card_info.length; i++) {
                if (
                    pointInRect(
                        uiX,
                        uiY,
                        class_card_info[i].x,
                        class_card_info[i].y,
                        class_card_info[i].width,
                        class_card_info[i].height
                    )
                ) {
                    class_card_info[i].hover = true;
                }
                else {
                    class_card_info[i].hover = false;
                }
            }
            //start_button at the bottom of the screen
            start_button.isHover = false;
            if (
                pointInRect(
                    uiX,
                    uiY,
                    start_button.x,
                    start_button.y,
                    start_button.width,
                    start_button.height
                )
            ) {
                start_button.isHover = true;
            }
            //world objects use objectworldpos
            draw_hover_character = null;
            characters.forEach(character => {
                if (pointInRect(
                    worldPos.x,
                    worldPos.y,
                    character.x,
                    character.y,
                    CHARACTER_WIDTH,
                    CHARACTER_HEIGHT)) {
                    draw_hover_character = character;
                }
            })
            Tanks.forEach(tank => {
                if (tank.hasPlayer)
                    rotateTank(
                        worldPos.x,
                        worldPos.y,
                        tank
                    )
            })
        }
        let selected_class = "Assault";
        const handleClick = (event) => {
            const rect = canvas.getBoundingClientRect();

            const screenX = event.clientX - rect.left;
            const screenY = event.clientY - rect.top;

            // Convert screen coordinates to world coordinates
            const worldPos = camera.screenToWorld(screenX, screenY);

            const uiX = screenX;
            const uiY = screenY;

            const player = getPlayer(characters);

            //select map card
            //ui
            if (game_state.menu == cur_game_state) {
                if (menu_state.map == cur_menu_state) {
                    for (let i = 0; i < map_cards.length; i++) {
                        if (
                            pointInRect(
                                uiX,
                                uiY,
                                map_cards[i].x,
                                map_cards[i].y,
                                map_cards[i].width,
                                map_cards[i].height
                            )
                        ) {
                            map_cards[i].selected = true;
                            selected_map = map_cards[i].mapid;
                            console.log("selected class: " + map_cards[i].mapid);
                            for (let j = 0; j < map_cards.length; j++) {
                                //deselect everything else when clicking on a new choice
                                if (map_cards[i] != map_cards[j]) {
                                    map_cards[j].selected = false;
                                }
                            }
                        }
                    }
                }
                else if (menu_state.class == cur_menu_state) {
                    //select class card
                    for (let i = 0; i < class_card_info.length; i++) {
                        if (
                            pointInRect(
                                uiX,
                                uiY,
                                class_card_info[i].x,
                                class_card_info[i].y,
                                class_card_info[i].width,
                                class_card_info[i].height
                            )
                        ) {
                            class_card_info[i].selected = true;
                            selected_class = class_card_info[i].class;
                            console.log("selected class: " + selected_class);
                            for (let j = 0; j < class_card_info.length; j++) {
                                //deselect everything else when clicking on a new choice
                                if (class_card_info[i] != class_card_info[j]) {
                                    class_card_info[j].selected = false;
                                }
                            }
                        }
                    }
                }
                //select start_button 
                if (
                    screenX >= start_button.x &&
                    screenX <= start_button.x + start_button.width &&
                    screenY >= start_button.y &&
                    screenY <= start_button.y + start_button.height
                ) {
                    //insert player props from class select
                    lock_in_sound.play();
                    characters.forEach((ch, i, arr) => {
                        if (ch.isPlayer) {
                            arr[i] = {
                                ...arr[i],
                                class: selected_class,
                                ...classes[selected_class]
                            };
                        }
                    });
                    //change the menu state here
                    if (cur_menu_state == menu_state.class) {
                        cur_menu_state = menu_state.map;
                    }
                    else if (cur_menu_state == menu_state.map) {
                        const roll = Math.random();

                        roll > 0.5 ? game_soundtrack.play() : background_music_2.play();
                        cur_game_state = game_state.game;
                    }
                }
            }
            if (player.isTank && player.tank) {
                const tank = player.tank;
                handlePlayerTankProjectile(
                    current_time,
                    tank,
                    tank_projectiles,
                    projectiles,
                    worldPos.x,
                    worldPos.y,
                    keys
                )
            }
            if (!player || player.hp <= 0 || player.isDisabled)
                return;
            if (last_shot_time === 0) {
                if (player.buffs.some(buff => buff.buff_type == "Jester")) {
                    fireJesterProjectile(getPlayer(characters), projectiles, characters);
                }
                else {
                    // only supports can heal
                    if (keys.q && player.class === "Support") {
                        fireHealProjectile(
                            worldPos.x,
                            worldPos.y,
                            player,
                            healing_projectiles);
                        //toggle healing ability
                    }
                    else {
                        fireProjectile(worldPos.x, worldPos.y, player, projectiles);
                    }
                }
                last_shot_time = current_time;
            }
            else if
                (
                current_time - last_shot_time > player.projectile_delay
            ) {
                if (player.buffs.some(buff => buff.buff_type == "Jester")) {
                    fireJesterProjectile(getPlayer(characters), projectiles, characters);
                }
                else {
                    // only supports can heal
                    if (keys.q && player.class === "Support") {
                        fireHealProjectile(
                            worldPos.x,
                            worldPos.y,
                            player,
                            healing_projectiles);
                        //toggle healing ability
                    }
                    else {
                        fireProjectile(worldPos.x, worldPos.y, player, projectiles);
                    }
                }
                last_shot_time = current_time;
            }
        };

        // =========================
        // START
        // =========================
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        canvas.addEventListener("click", handleClick);
        window.addEventListener("mousemove", handleHover);
        gameLoop();

        // =========================
        // CLEANUP
        // =========================
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            canvas.removeEventListener("click", handleClick);
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleHover);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            {...props}
        />
    );
};

export default Canvas;


