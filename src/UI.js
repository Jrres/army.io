import ui_assault_face_src from "../src/assets/UI_assault_Face.png"
class UI
{
    constructor(player, context, round, number_of_enemies)
    {
        this.player = player;
        this.context = context;
        this.round = round;
        this.num = number_of_enemies;

        this.panelWidth = 650;
        this.panelHeight = 200;

        this.panelX = 0;
        this.panelY = 0;

        // Round animation
        this.previousRound = round;
        this.roundFontSize = 22;
        this.roundCircleRadius = 30;
        this.assault_face_image = new Image();
        this.assault_face_image.src = ui_assault_face_src;
    }
    drawUI(player, context, round, number_of_enemies)
    {
        this.player = player;
        this.context = context;
        this.round = round;
        this.num = number_of_enemies;

        this.updatePanelPosition();

        // Trigger animation when round changes
        if(this.round !== this.previousRound)
        {
            this.previousRound = this.round;

            // Pop effect
            this.roundFontSize = 40;
            this.roundCircleRadius = 40;
        }

        // Smoothly shrink back to normal
        if(this.roundFontSize > 22)
        {
            this.roundFontSize -= 0.6;
        }

        if(this.roundCircleRadius > 30)
        {
            this.roundCircleRadius -= 0.4;
        }

        this.drawPanel();
        this.drawRoundCounter();
        this.drawCharacterIcon();
        this.drawStatBar()
        this.drawHealthBar();
        this.drawNumberOfEnemies();
    }
    drawCharacterIcon()
    {
        const ctx = this.context;

        const centerY =
            this.panelY + 100;

        // Position between round circle and HP bar
        const iconSize = 60;
        const iconX = this.panelX + 150;
        const iconY = centerY - iconSize / 2;

        // Only draw once image is loaded
        if (this.assault_face_image.complete)
        {
            // Circular clip
            ctx.save();

            ctx.beginPath();
            ctx.arc(
                iconX + iconSize / 2,
                iconY + iconSize / 2,
                iconSize / 2,
                0,
                Math.PI * 2
            );
            ctx.clip();

            ctx.drawImage(
                this.assault_face_image,
                iconX,
                iconY,
                iconSize,
                iconSize
            );

            ctx.restore();

     
        }
    }
    drawHealthBar()
    {
        const ctx = this.context;

        const centerY =
            this.panelY + 100;

        const barX = this.panelX + 240;
        const barY = centerY - 10;

        const barWidth = 330;
        const barHeight = 20;

        const maxHP = this.player.max_hp || 100;
        const percentage = this.player.hp / maxHP;

        ctx.fillStyle = "#111";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = "#00cc44";
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
            `${this.player.hp}/${maxHP}`,
            barX + barWidth / 2,
            centerY
        );
    }
    drawStatBar()
    {
        if(!this.player)
        {
            console.log("player DNE")
            return
        }
        //this is returning an error about the move_speed being undefined sometimes when being inside a tank
        const ctx = this.context;

        const statY = this.panelY + this.panelHeight / 2 - 20;

        const iconX = this.panelX + 50;
        const valueX = this.panelX + 90; // fixed position for all values

        const spacing = 30;

        const stats = [
            { icon: "👟", value: this.player.move_speed },
            { icon: "💥", value: this.player.damage },
            { icon: "⏱", value: this.player.projectile_delay },
            { icon: "➤", value: this.player.projectile_speed }
        ];

        ctx.font = "20px Orbitron";
        ctx.textAlign = "left";

        stats.forEach((stat, i) =>
        {
            const y = statY + i * spacing;

            // icon
            ctx.fillStyle = "#ffffff";
            ctx.fillText(stat.icon, iconX, y);

            // value
            ctx.fillStyle = "#e1ff00";
            const factor = Math.pow(10, 2);
            ctx.fillText( (Math.round(stat.value * factor) / factor).toString(), valueX, y);
        });
    }
    drawRoundCounter()
    {
        const ctx = this.context;

        const centerY =
            60;

        const circleX =60;

        // Circle
        ctx.beginPath();
        ctx.arc(
            circleX,
            centerY,
            this.roundCircleRadius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#181818";
        ctx.fill();

        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Small R label
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Orbitron";

        ctx.fillText(
            "Round",
            circleX + 60,
            centerY - 10
        );

        // Animated round number
        ctx.fillStyle = "#00ffff";
        ctx.font = `${this.roundFontSize}px Orbitron`;

        ctx.fillText(
            this.round,
            circleX,
            centerY + 1
        );

        ctx.textAlign = "left";
    }
    drawNumberOfEnemies()
    {
        const ctx = this.context;

        const centerY =
            60    ;

        const x = this.context.canvas.width - 60;
        const y = centerY;

        ctx.strokeStyle = "#ff4444";
        ctx.lineWidth = 2;

        // outer circle
        ctx.beginPath();
        ctx.arc(x, y, 26, 0, Math.PI * 2);
        ctx.stroke();

        // crosshair
        ctx.beginPath();
        ctx.moveTo(x - 26, y);
        ctx.lineTo(x + 26, y);
        ctx.moveTo(x, y - 26);
        ctx.lineTo(x, y + 26);
        ctx.stroke();

        // center dot
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#000000";
        ctx.font = "38px Orbitron";

        ctx.fillText(
            this.num,
            x,
            centerY
        );
    }
    drawPanel()
    {
        const ctx = this.context;
        
        ctx.fillStyle = "rgba(20,20,20,.5)";
        ctx.fillRect(
            this.panelX,
            this.panelY,
            this.panelWidth,
            this.panelHeight
        );

        ctx.strokeStyle = "#44444400";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            this.panelX,
            this.panelY,
            this.panelWidth,
            this.panelHeight
        );
    }
    updatePanelPosition()
    {
        this.panelX =
            (this.context.canvas.width - this.panelWidth) / 2;

        this.panelY =
            this.context.canvas.height -
            this.panelHeight -
            20;
    }

}
export default UI;