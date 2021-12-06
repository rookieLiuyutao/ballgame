class Player extends AcGameObject {
    /**
     *
     * @param playground 该玩家在哪个地图上
     * @param x 玩家的位置坐标，将来还可能有3d的z轴和朝向坐标
     * @param y
     * @param radius 圆的半径，每个玩家用圆表示
     * @param color 圆的颜色
     * @param speed 玩家的移动速度，用每秒移动高度的百分比表示，因为每个浏览器的像素表示不一样
     * @param character
     * @param username
     * @param photo
     */
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
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
        this.eps = 0.01;
        this.friction = 0.9;
        this.spent_time = 0;
        this.status = null;
        this.fireballs = [];
        this.blink_coldtime = 5;
        this.mouseX = 0;
        this.mouseY = 0;
        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;  // 单位：秒
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }

        this.$after_die = $(`<div class = "ac_game_die_animation"></div>`);
        this.cur_skill = null;

    }

    /**
     * 只在第一帧执行
     */
    start() {
        this.check_room_status();
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            //如果是敌人，则会随机一个目标位置
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);

        }
    }


    check_room_status() {
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3   ) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

    }


    /**
     * 每一帧都执行
     */
    update() {
        //实现电脑玩家的自动攻击
        this.spent_time += this.timedelta / 1000;
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldTime();
        }

        this.update_AI();
        this.update_player_move();
        //每一帧都要渲染圆
        this.render();
    }

    /**
     * 电脑玩家的行为
     */
    update_AI() {
        if (Math.random() < gameParameters.AIs_attack_frequency) {
            let from_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let to_player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (from_player === to_player || from_player.character !== "robot" || from_player.status === "die") {
                return;
            }
            //是否开启相互攻击
            if (!gameParameters.attack_eachother) {
                to_player = this.playground.players[0];
            }
            //实现简单的移动预测
            let tx = to_player.x + to_player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = to_player.y + to_player.speed * this.vy * this.timedelta / 1000 * 0.3;
            from_player.shoot_fireball(tx, ty);
            // from_player.shoot_boss_fireball();
            //人机狂暴模式
            if (gameParameters.is_crazy && this.playground.players.length < gameParameters.crazy_min_number) {
                for (let i = 0; i < 4; i++) {
                    from_player.shoot_fireball(tx, ty);
                }
            }
        }
    }

    /**
     * 渲染每个玩家的移动效果
     */
    update_player_move() {
        //如果击退效果还没有渲染完成
        if (this.damage_speed > gameParameters.damage_speed) {
            this.update_repel_move();
        } else {
            //玩家已经走到了目标地点
            if (this.move_length < this.eps) this.update_after_moved()
            else this.update_moving();
        }
    }

    /**
     * 渲染击退时玩家的位置
     */
    update_repel_move() {
        this.vx = this.vy = 0;
        this.move_length = 0;
        this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
        this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
        // console.log("player在的地图"+this.playground.width,this.playground.height)
        //保证玩家不会被打出画面
        if (this.x < this.radius || this.x > (this.playground.width / this.playground.scale) - this.radius || this.y < this.radius || this.y > (this.playground.height / this.playground.scale) - this.radius) {
            this.damage_speed = 0;
        }
        this.damage_speed *= this.friction;
    }

    /**
     * 渲染玩家移动中的位置
     */
    update_moving() {
        //玩家没有走到目标位置，则计算新的一帧玩家的位置
        //计算出两帧间的移动距离
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        //计算这一帧位置的横纵坐标

        this.x += this.vx * moved;
        this.y += this.vy * moved;

        this.move_length -= moved;
    }

    /**
     * 更新玩家到达目标地点后的状态
     */
    update_after_moved() {
        this.move_length = 0;
        this.vx = this.vy = 0;
        if (this.character === "robot") {
            //如果是电脑玩家，在到达目标位置的帧都随机一个新的目标位置
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    update_coldTime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    /**
     * 在每一帧渲染画面
     */
    render() {
        //渲染用户头像
        if (this.character !== "robot") {
            this.render_photo();
        } else {
            this.render_radius();
        }
        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldTime();
        }
    }

    /**
     * 渲染用户头像
     */
    render_photo() {
        let scale = this.playground.scale;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
        this.ctx.restore();
    }

    /**
     * 渲染一个圆
     */
    render_radius() {
        //渲染一个圆
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    render_skill_coldTime() {

        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62;
        y = 0.9;
        r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }


    /**
     * 鼠标点击的操作
     */
    add_listening_events() {
        //禁用鼠标右键点击显示菜单的事件
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.game_mouse_operation();
        this.game_keyboard_operation();

    }

    game_mouse_operation() {
        let outer = this;
        this.playground.game_map.$canvas.mousedown(function (e) {
            // if (outer.playground.state !== "fighting")
            //     return false;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            //e.which === 3，点击鼠标右键的事件
            //e.which === 1，点击鼠标左键的事件
            outer.playground.game_map.$canvas.mousemove(function (e) {
                outer.mouseX = (e.clientX - rect.left) / outer.playground.scale;
                outer.mouseY = (e.clientY - rect.top) / outer.playground.scale;
            })
            outer.playground.game_map.$canvas.mousedown(function (e) {
                if (e.which === 3) {
                    outer.move_to(outer.mouseX, outer.mouseY);
                    if (outer.playground.mode === "multi mode") {
                        // console.log("发送了")
                        outer.playground.mps.send_move_to(outer.mouseX, outer.mouseY);
                    }
                }
            })
        });
    }

    game_keyboard_operation() {
        let outer = this;
        //监听键盘事件
        $(window).keydown(function (e) {
            if (outer.playground.state !== "fighting")
                return true;

            if (e.which === 81) {  // q
                outer.cur_skill = "fireball";
                if (outer.fireball_coldtime < outer.eps) {
                    let fireball = outer.shoot_fireball(outer.mouseX, outer.mouseY);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(outer.mouseX, outer.mouseY, fireball.uuid);
                    }

                }
            } else if (e.which === 70) {
                outer.cur_skill = "blink";
                outer.blink(outer.mouseX, outer.mouseY);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_blink(outer.mouseX, outer.mouseY);
                }

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
        let radius = gameParameters.fireball_size;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let speed = gameParameters.fire_speed;
        let move_length = this.radius * gameParameters.AIs_fireball_range;
        if (this.character !== "robot") {
            move_length = this.radius * gameParameters.fireball_range;
        }
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, speed, move_length, gameParameters.fireball_damage, gameParameters.fireball_color)
        //所有人必须在开局4秒后才能释放火球

        this.fireballs.push(fireball)

        this.fireball_coldtime = 1

        return fireball;
    }

    shoot_boss_fireball() {
        for (let i = 0; i < 8; i++) {
            let tx = this.x * Math.cos(Math.PI * i / 4) + this.playground.width / this.playground.scale,
                ty = this.y * Math.sin(Math.PI * i / 4) + this.playground.height / this.playground.scale;
            this.shoot_fireball(tx * -1, ty * -1);
        }

    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;  // 闪现完停下来
    }


    /**
     * 被攻击后的效果
     * @param angle 受到攻击后的角度，用于实现击退效果
     * @param damage 技能的伤害
     */
    is_attacked(angle, damage) {
        // console.log(this.playground.players)
        //实现被攻击后的粒子效果
        this.is_attacked_particle();
        //受到攻击的玩家，移速变快，体积变小
        this.is_attacked_player_change(damage);
        if (this.radius < this.eps) {
            this.is_attacked_after_die();
            return false;
        }
        //人数小于6时，游戏难度提升，人机攻速提升3倍

        this.is_attacked_player_repel(angle);
        this.is_attacked_game_buff();

    }

    /**
     * 玩家对战时接收到被攻击的信号后执行的函数
     * @param x 被攻击位置的x坐标
     * @param y 被攻击位置的y坐标
     * @param angle 被攻击的方向
     * @param damage 收到的伤害
     * @param skill_name 被哪个技能击中的
     * @param skill_uuid 技能的唯一id
     * @param attacker
     */
    receive_attack(x, y, angle, damage, skill_name, skill_uuid, attacker) {
        attacker.destroy_fireball(skill_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }


    /**
     * 实现了被攻击后的粒子效果
     */
    is_attacked_particle() {
        for (let i = 0; i < gameParameters.particle_number[0] + Math.random() * gameParameters.particle_number[1]; i++) {
            //这里参考了大佬的代码，比y总的传参更合理
            new Particle(this.playground, this);
        }
    }

    /**
     * 玩家被攻击后的属性变化
     */
    is_attacked_player_change(damage) {
        this.radius -= damage;
        // console.log("圆半径：" + this.radius, "伤害:" + damage)
        this.speed = gameParameters.player_speed + (gameParameters.players_size - this.radius) * 2;
    }

    /**
     * 角色死亡后的变化
     */
    is_attacked_after_die() {
        this.status = "die";
        console.log(this.status)

        if (this.character === "me") {
            $("div.ac-game-playground").append(this.$after_die);
        }
        // this.playground.$playground.$("canvas").append(this.$after_die);
        this.destroy();

    }

    /**
     * 玩家受到攻击后的击退效果
     */
    is_attacked_player_repel(angle) {
        //计算受到攻击后的击退方向
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = 1.5 + (this.radius - gameParameters.players_size);
    }

    /**
     * 游戏难度增益
     */
    is_attacked_game_buff() {
        if (gameParameters.is_crazy && this.playground.players.length < gameParameters.crazy_min_number) {
            gameParameters.AIs_attack_frequency = 1 / 60
            if (this.character !== "robot") {
                this.vx *= 2
                this.vy *= 2
            }
        }
    }

    /**
     * 计算2点间的距离
     * @returns number
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
        this.destroy_player();
    }

    destroy_player() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                return
            }
        }
    }

    destroy_fireball(ball_uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === ball_uuid) {
                fireball.destroy();
                break;
            }
        }
    }
}

