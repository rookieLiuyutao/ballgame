class GameMap extends AcGameObject {
    constructor(playground) {
        //super()等价于AcGameObject.prototype.constructor.call(this)
        super();
        this.playground = playground;
        //让canvas可以监听输入事件
        this.$canvas = $(`<canvas class="ac-game-playground-game-map" tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        //这里的playground在定义时时任意值，但在调用时如果传入AcGamePlayground类就指这个类
        this.playground.$playground.append(this.$canvas);
        this.l = this.playground.big_map_height * 0.05;
        this.nx = Math.ceil(this.playground.big_map_width / this.l);
        this.ny = Math.ceil(this.playground.big_map_height / this.l)

    }


    start() {

        //为了能够让canvas获取输入信息，我们要将其聚焦：
        this.$canvas.focus();
        this.generate_grid();

    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
    }

    update() {

        this.render();

    }

    generate_grid() {
        this.grids = [];
        for (let i = 0; i < this.ny; i++) {
            for (let j = 0; j < this.nx; j++) {
                this.grids.push(new Grid(this.playground, this.ctx, j, i, this.l, "rgb(222, 237, 225)"));
            }
        }
    }



    generate_wall() {
        let wall_pic = "https://s3.bmp.ovh/imgs/2021/11/837412e46f4f61a6.jpg";
        this.walls = [];
        for (let i = 0; i < this.ny; i++) {
            for (let j = 0; j < this.nx; j++) {
                if (Math.random() < 20 / (this.nx * this.ny)) {
                    this.walls.push(new Wall(this.playground, this.ctx, j, i, this.l, wall_pic));
                }
            }
        }
    }


    render() {
        //改变背景的不透明度，以实现移动残影
        this.ctx.fillStyle = gameParameters.background_color;
        //fillRect()绘制矩形的方法
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    on_destroy() {
        for (let i = 0; i < this.grids.length; i++) {
            this.grids[i].destroy();
        }
        this.grids = [];

        for (let i = 0; i < this.eatable_skills.length; i++) {
            this.eatable_skills[i].destroy();
        }
        this.eatable_skills = [];
    }

}
