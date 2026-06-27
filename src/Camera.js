// Simple 2D camera for HTML5 Canvas games

class Camera {
    constructor(x = 0, y = 0, width, height) {
        // Top-left position of the camera in world coordinates
        this.x = x;
        this.y = y;

        // Size of the viewport (canvas size)
        this.width = width;
        this.height = height;

        // Zoom level (1 = normal size)
        this.zoom = 1;

        // Optional smoothing (0.1 = smooth follow, 1 = instant)
        this.lerp = 0.1;
    }

    // Smoothly follow a target object with x and y properties
    follow(target) {
        const targetX = target.x - this.width / 2 / this.zoom;
        const targetY = target.y - this.height / 2 / this.zoom;

        this.x += (targetX - this.x) * this.lerp;
        this.y += (targetY - this.y) * this.lerp;
    }

    // Apply camera transformation before drawing world objects
    begin(ctx) {
        ctx.save();

        // Move origin to center of screen
        ctx.translate(this.width / 2, this.height / 2);

        // Apply zoom
        ctx.scale(this.zoom, this.zoom);

        // Move world opposite camera position
        ctx.translate(-this.x - this.width / 2 / this.zoom,
                      -this.y - this.height / 2 / this.zoom);
    }

    // Restore canvas state after drawing
    end(ctx) {
        ctx.restore();
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.width / 2) / this.zoom + this.x + this.width / 2 / this.zoom,
            y: (screenY - this.height / 2) / this.zoom + this.y + this.height / 2 / this.zoom
        };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom,
            y: (worldY - this.y) * this.zoom
        };
    }
}
export default Camera;