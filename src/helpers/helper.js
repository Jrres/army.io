const getPlayer = (characters) =>
            characters.find((character) => character.isPlayer);
const pointInRect = (px, py, rx, ry, rw, rh) => {
    return (
        px >= rx &&
        px <= rx + rw &&
        py >= ry &&
        py <= ry + rh
    );
};
const deleteCharacters = (characters) => {
    characters = characters.filter(
        (character) => character.hp > 0
    );
};
const normalizeAngle = (angle) => {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
};
const pointInCircle = (
    pointX,
    pointY,
    circleX,
    circleY,
    radius
) => {

    const dx = pointX - circleX;
    const dy = pointY - circleY;

    return dx * dx + dy * dy <= radius * radius;
};

export {getPlayer, pointInRect, deleteCharacters, normalizeAngle, pointInCircle};