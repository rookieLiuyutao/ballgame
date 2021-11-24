class Player extends AcGameObject {
    /**
     *
     * @param playground 该玩家在哪个地图上
     * @param x 玩家的位置坐标，将来还可能有3d的z轴和朝向坐标
     * @param y
     * @param radius 圆的半径，每个玩家用圆表示
     * @param color 圆的颜色
     * @param speed 玩家的移动速度，用每秒移动高度的百分比表示，因为每个浏览器的像素表示不一样
     * @param is_me 判断当前角色是自己还是敌人
     */
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        //玩家所处地图的画布
        this.ctx = this.playground.game_map.ctx;
        //x方向的速度,用于计算玩家的移动
        this.vx = 0;
        //y方向的速度，用于计算玩家的移动
        this.vy = 0;
        //被攻击后的x方向的位置偏移量
        this.damage_x = 0;
        //被攻击后的y方向的位置偏移量
        this.damage_y = 0;
        this.damage_speed = 0;
        //原位置与鼠标点击位置之间的距离
        this.move_length = 0;
        this.radius = radius;
        //表示精度，误差在eps内就算0
        this.eps = 0.1;
        this.friction = 0.9;
        this.spent_time = 0;
        this.status = null;
        this.nouseX = 0;
        this.mouseY = 0;
        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }

        this.$after_die = $(`<div class = "ac_game_die_animation"></div>`);
        this.cur_skill = null;

    }

    /**
     * 只在第一帧执行
     */
    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            //如果是敌人，则会随机一个目标位置
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);

        }
    }

    /**
     * 每一帧都执行
     */
    update() {
        //实现电脑玩家的自动攻击
        this.spent_time += this.timedelta / 1000;

        if (Math.random() < gameParameters.AIs_attack_frequency) {
            let from_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let to_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (from_player === to_player || from_player.is_me || from_player.status == "die") {
                return;
            }
            //是否开启相互攻击
            if (!gameParameters.attack_eachother) {
                to_player = this.playground.players[0];
            }
            //实现简单的移动预测
            let tx = to_player.x + to_player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = to_player.y + to_player.speed * this.vy * this.timedelta / 1000 * 0.3;
            // from_player.shoot_fireball(tx, ty);
            from_player.shoot_boss_fireball();
            //人机狂暴模式
            if (gameParameters.is_crazy && this.playground.players.length < gameParameters.crazy_min_number) {
                for (let i = 0; i < 4; i++) {
                    // console.log(4)
                    from_player.shoot_fireball(tx, ty);
                }
            }
        }
        //实现击退动画
        if (this.damage_speed > gameParameters.damage_speed) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            //保证玩家不会被打出画面
            if (this.x < this.radius || this.x > this.playground.width - this.radius || this.y < this.radius || this.y > this.playground.height - this.radius) {
                this.damage_speed = 0;
            }
            this.damage_speed *= this.friction;

        } else {
            //玩家已经走到了目标地点
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    //如果是电脑玩家，在到达目标位置的帧都随机一个新的目标位置
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;

                    this.move_to(tx, ty);
                }
            } else {
                //玩家没有走到目标位置，则计算新的一帧玩家的位置
                //计算出两帧间的移动距离
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                //计算这一帧位置的横纵坐标

                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }

        //每一帧都要渲染圆
        this.render();
    }

    /**
     * 在每一帧渲染画面
     */
    render() {
        //渲染用户头像
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            //渲染一个圆
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

    }


    /**
     * 鼠标点击的操作
     */
    add_listening_events() {
        let outer = this;
        const rect = outer.ctx.canvas.getBoundingClientRect();

        //禁用鼠标右键点击显示菜单的事件
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            //
            //e.which === 3，点击鼠标右键的事件
            //e.which === 1，点击鼠标左键的事件
            if (e.which === 3) {
                // console.log(gameParameters.AIs_attack_frequency);
                //每一次点击都要计算出当前点到点击位置的距离
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);

            }


        });
        //监听键盘事件
        $(window).keydown(function (e) {
            if (e.which === 81) {  // q
                outer.cur_skill = "fireball";
                outer.playground.game_map.$canvas.mousemove(function (e) {
                    //只有当按下键盘选中技能后，点击鼠标才能释放技能
                    if (outer.cur_skill === "fireball" && outer.status != "die") {
                        outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                    }
                    //在释放完技能后取消技能选中
                    outer.cur_skill = null;
                })
                return false;
            }
        });

    }

    /**
     * 创建一个飞行的火球技能
     * @param tx 点击位置的横坐标
     * @param ty 点击位置的纵坐标
     */
    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * gameParameters.fireball_size;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = this.playground.height * gameParameters.fire_speed;
        let mone_length = this.radius * gameParameters.fireball_range;
        if (!this.is_me) {
            mone_length = this.radius * this.playground.height;
        }
        //所有人必须在开局4秒后才能释放火球
        if (this.spent_time > gameParameters.calm_time) {
            this.playground.fireballs.push(
                new FireBall(this.playground, this, x, y, radius, vx, vy, speed, mone_length, this.playground.height * gameParameters.fireball_damage, gameParameters.fireball_color)
            )
        }
    }

    shoot_boss_fireball(){
        for (let i = 0; i <8 ; i++) {
            let tx = this.x*Math.cos(Math.PI*i/4)+this.playground.width,ty = this.y *Math.sin(Math.PI*i/4)+this.playground.height;
            this.shoot_fireball(tx,ty);
            // console.log(tx,ty)
        }
    }


    /**
     * 被攻击后的效果
     * @param angle 受到攻击后的角度，用于实现击退效果
     * @param damage 技能的伤害
     */
    is_attacked(angle, damage) {
        //实现被攻击后的粒子效果
        for (let i = 0; i < gameParameters.particle_number[0] + Math.random() * gameParameters.particle_number[1]; i++) {
            //这里参考了大佬的代码，比y总的传参更合理
            new Particle(this.playground, this);
        }
        //受到攻击的玩家，移速变快，体积变小
        this.radius -= damage;
        this.speed = this.playground.height * gameParameters.player_speed_percent + (this.playground.height * gameParameters.players_size_percent - this.radius) * 2;
        if (this.radius < gameParameters.dead_szie) {
            this.status = "die";
            if (this.is_me) {
                $("div.ac-game-playground").append(this.$after_die);
            }
            // this.playground.$playground.$("canvas").append(this.$after_die);
            this.destroy();
            return false;

        }
        //人数小于6时，游戏难度提升，人机攻速提升3倍
        if (gameParameters.is_crazy && this.playground.players.length < gameParameters.crazy_min_number) {
            gameParameters.AIs_attack_frequency = 1 / 60
            if (!this.is_me) {
                this.vx *= 2
                this.vy *= 2
            }
        }

        //计算受到攻击后的击退方向
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = this.playground.height * 2 + (this.radius - this.playground.height * gameParameters.players_size_percent) * 50;


    }

    /**
     * 计算2点间的距离
     * @returns 两点间的直线距离
     */
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }


    /**
     * 计算出移动方向的函数
     * @param tx 目标点的横坐标
     * @param ty 目标点的纵坐标
     */
    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);

    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }


}

