class Grid extends AcGameObject {
    constructor(playground, ctx, i, j, l, stroke_color) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        this.i = i;
        this.j = j;
        this.l = l;
        this.stroke_color = stroke_color;
        this.fill_color = "rgb(210, 222, 238)";
        this.x = this.i * this.l;
        this.y = this.j * this.l;
    }

    start() {}

    update() {
        this.render();
    }

    render() {
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let cx = ctx_x + this.l * 0.5, cy = ctx_y + this.l * 0.5;
        if (cx < -0.2 * this.playground.width || cx > 1.2 * this.playground.width || cy < -0.2 * this.playground.height || cy > 1.2 * this.playground.height) {
            return;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.l * 0.03;
        this.ctx.strokeStyle = this.stroke_color;
        this.ctx.rect(ctx_x, ctx_y, this.l, this.l);
        this.ctx.stroke();
        this.ctx.restore();
    }
}
