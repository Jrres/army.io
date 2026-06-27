import tankgunnericon from "../assets/tankandgunnericon.png";

const tankGunnerImg = new Image();
tankGunnerImg.src = tankgunnericon;
const barX = 240;
const barY = 90;

const topX = barX - 10;
const topY = barY - 10;

const barWidth = 330;
const barHeight = 20;

const selectionHeight = barHeight + barY + 30;

const contentWidth = 330;
const contentHeight = 600;

let current_time = 0;
let tank_damage_indicator_delay = 300;
let tankBarRed = false;
const drawTankHealthBar = (ctx, tanks, gameTime) =>
    {
        const tank = tanks.find(t => t.hasPlayer);
        if(!tank)
            return;
        const panelX = 0;
        const panelY = 0;

        const centerY =
        panelY + 100;


        const maxHP = tank.max_hp || 1000;
        const percentage = tank.hp / maxHP;

        ctx.fillStyle = "#111";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        if (tank.hp <= 500)
            {
                if (gameTime - current_time > tank_damage_indicator_delay)
                {
                    tankBarRed = !tankBarRed; // toggle
                    current_time = gameTime;
                }

                ctx.fillStyle = tankBarRed
                    ? "#ff0000"
                    : "#001bcc";
            }
            else
            {
                tankBarRed = false;
                ctx.fillStyle = "#001bcc";
            }
        ctx.fillRect(
            barX,
            barY,
            Math.min(barWidth, barWidth * percentage),
            barHeight
        );

        ctx.strokeStyle = "white";
        ctx.strokeRect(
            barX,
            barY,
            barWidth,
            barHeight
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "white";
        ctx.font = "16px Orbitron";

        ctx.fillText(
            `${tank.hp}/${maxHP}`,
            barX + barWidth / 2,
            centerY
        );
    }
const drawTankSelectionUi = (context, tanks, keys) =>
{
    const tank = tanks.find(t => t.hasPlayer);

    if (!tank || !tankGunnerImg.complete)
        return;

    const halfWidth = tankGunnerImg.width / 2;

    // -----------------------------
    // Layout
    // -----------------------------
    const iconWidth = 100;
    const iconHeight = 100;
    const gap = 40;

    const centerX = barX + barWidth / 2;

    const leftX =
        centerX - gap / 2 - iconWidth;

    const rightX =
        centerX + gap / 2;

    const iconY = barY + 40;

    const selected = keys.q ? "gunner" : "tank";

    // -----------------------------
    // Tank Selection Highlight
    // -----------------------------
    if (selected === "tank")
    {
        context.save();

        context.shadowColor = "yellow";
        context.shadowBlur = 20;

        context.strokeStyle = "yellow";
        context.lineWidth = 4;

        context.strokeRect(
            leftX - 6,
            iconY - 6,
            iconWidth + 12,
            iconHeight + 12
        );

        context.restore();
    }

    // -----------------------------
    // Draw Tank Icon
    // -----------------------------
    context.drawImage(
        tankGunnerImg,
        0,
        0,
        halfWidth,
        tankGunnerImg.height,
        leftX,
        iconY,
        iconWidth,
        iconHeight
    );

    // -----------------------------
    // Gunner Selection Highlight
    // -----------------------------
    if (selected === "gunner")
    {
        context.save();

        context.shadowColor = "yellow";
        context.shadowBlur = 20;

        context.strokeStyle = "yellow";
        context.lineWidth = 4;

        context.strokeRect(
            rightX - 6,
            iconY - 6,
            iconWidth + 12,
            iconHeight + 12
        );

        context.restore();
    }

    // -----------------------------
    // Draw Gunner Icon
    // -----------------------------
    context.drawImage(
        tankGunnerImg,
        halfWidth,
        0,
        halfWidth,
        tankGunnerImg.height,
        rightX,
        iconY,
        iconWidth,
        iconHeight
    );

    // -----------------------------
    // Labels
    // -----------------------------
    context.fillStyle = "white";
    context.font = "16px Orbitron";
    context.textAlign = "center";

    context.fillText(
        "Tank",
        leftX + iconWidth / 2,
        iconY + iconHeight + 20
    );

    context.fillText(
        "Gunner",
        rightX + iconWidth / 2,
        iconY + iconHeight + 20
    );
};
export {drawTankHealthBar, drawTankSelectionUi};