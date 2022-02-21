class Grid extends AcGameObject {
    constructor(playground, ctx, i, j, l, stroke_color) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        this.i = i;
        this.j = j;
        this.l = l;
        this.x = this.i * this.l;
        this.y = this.j * this.l;

        this.stroke_color = stroke_color;
        this.has_grass = false; // 格子上有草否
        this.is_poisoned = false; // 格子是否在毒圈
        this.fill_color = "rgb(210, 222, 238)";

        this.grass_color = "rgb(213, 198, 76)"; // grass yellow
    }

    start() {}

    get_manhattan_dist(x1, y1, x2, y2) {
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }

    check_poison(x, y) {
        let nx = this.playground.game_map.nx;
        let ny = this.playground.game_map.ny;
        let d = Math.floor(this.playground.gametime_obj.gametime / 20); // 每20s毒向内扩散1格
        if (Math.min(x, y) < d || Math.min(Math.abs(x - (nx - 1)), Math.abs(y - (ny - 1))) < d) {
            return true;
        }
        return false;
    }

    update() {
        if (this.playground.gametime_obj && !this.is_poisoned && this.check_poison(this.i, this.j)) {
            this.poison = new Poison(this.playground, this);
            this.is_poisoned = true;
        }
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let cx = ctx_x + this.l * 0.5, cy = ctx_y + this.l * 0.5; // grid的中心坐标
        // 处于屏幕范围外，则不渲染
        if (cx * scale < -0.2 * this.playground.width ||
            cx * scale > 1.2 * this.playground.width ||
            cy * scale < -0.2 * this.playground.height ||
            cy * scale > 1.2 * this.playground.height) {
            return;
        }

        this.render_grid(ctx_x, ctx_y, scale);
        if (this.has_grass) {
            let player = this.playground.players[0];
            if (player.character === "me" && this.get_manhattan_dist(this.x + this.l / 2, this.y + this.l / 2, player.x, player.y) < 1.5 * this.l)
                this.grass_color = "rgba(213, 198, 76, 0.3)";
            else
                this.grass_color = "rgb(213, 198, 76)";
            this.render_grass(ctx_x, ctx_y, scale);
        }
    }

    render_grid(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.l * 0.03 * scale;
        this.ctx.strokeStyle = this.stroke_color;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.l * scale, this.l * scale);
        this.ctx.stroke();
        this.ctx.restore();
    }

    render_grass(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        // this.ctx.lineWidth = this.l * 0.03 * scale;
        this.ctx.lineWidth = 0;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.l * scale, this.l * scale);
        this.ctx.fillStyle = this.grass_color;
        this.ctx.fill();
        this.ctx.restore();
    }

    on_destroy() {
        if (this.poison) {
            this.poison.destroy();
            this.poison = null;
        }
    }
}
