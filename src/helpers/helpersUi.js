let buffIndicators = [];
const CHARACTER_WIDTH = 30;
const CHARACTER_HEIGHT = 30;
const createBuffIndicator = (
    character,
    text,
    color = "#00ff00"
) =>
{
    buffIndicators.push({
        x: character.x + CHARACTER_WIDTH / 2,
        y: character.y - 20,
        text,
        color,
        alpha: 1,
        dy: -1.5,
        life: 60
    });
};
const updateBuffIndicators = () =>
{
    for(let i = buffIndicators.length - 1; i >= 0; i--)
    {
        const indicator = buffIndicators[i];
        indicator.y += indicator.dy;
        indicator.alpha -= 0.01;
        indicator.life -= 0.1;
        if(
            indicator.life <= 0 ||
            indicator.alpha <= 0
        )
        {
            buffIndicators.splice(i, 1);
        }
    }
};
const drawBuffIndicators = (context) =>
{
    buffIndicators.forEach(indicator =>
    {
        context.save();

        context.globalAlpha = indicator.alpha;

        context.fillStyle = indicator.color;

        context.font = "bold 24px Arial";

        context.textAlign = "center";

        context.fillText(
            indicator.text,
            indicator.x,
            indicator.y
        );

        context.restore();
    });
};

export {drawBuffIndicators, updateBuffIndicators, createBuffIndicator}