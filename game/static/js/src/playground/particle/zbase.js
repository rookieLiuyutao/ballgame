class Particle extends AcGameObject {
    /**
     * 粒子类
     * @param playground 在哪张地图上
     * @param player 哪个玩家扩散出的粒子
     */
    constructor(playground, player) {
        super();
        this.playground = playground;
        this.player = player;
        //粒子的画布
        this.ctx = this.playground.game_map.ctx;
        //粒子的位置
        this.x = player.x;
        this.y = player.y;
        //粒子的颜色应该和玩家的颜色相等
        this.color = player.color;
        // 粒子半径
        this.radius = Math.random() * player.radius * gameParameters.particle_size;
        // 释放速度
        this.speed = player.speed * gameParameters.particle_speed;

        // 固定参数，粒子的移动距离
        this.move_length = Math.max(gameParameters.particle_move_length[0], Math.random()) * player.radius * gameParameters.particle_move_length[1];
        // 减速摩擦力
        this.friction = gameParameters.particle_friction;
        // 误差范围
        this.eps = 0.01;

        // 随机参数，释放方向
        // 弧度制
        this.angle = Math.PI * 2 * Math.random();
        //粒子的随机移动方向
        this.vx = Math.cos(this.angle);
        this.vy = Math.sin(this.angle);

    }

    /**
     * 只在第一帧执行
     */
    start() {

    }

    /**
     * 每一帧都执行
     */
    update() {
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }

        this.radius *= gameParameters.particle_feed;
        //每一帧都刷新粒子的位置
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;

        this.render();
    }


    /**
     * 在每一帧渲染画面
     */
    render() {
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        //渲染一个圆
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(ctx_x, ctx_y, this.radius, 0, Math.PI * 2, false);
        // this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        //--------------------------------------------------------------
    }


}