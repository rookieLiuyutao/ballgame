class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();

    }

    start() {
        this.add_listening_events();
    }

    /**
     * 实现统一大小的函数
     */
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //统一游戏地图比例为16:9，若浏览器窗口比例不符，则按照窗口长宽中的较小者作为地图的长
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        //把地图的高度设为单位1
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
        if (this.mini_map) this.mini_map.resize();
        if (this.chat_field) this.chat_field.resize();

    }

    /**
     * 根据大地图坐标算出当前canvas坐标
     * @param x
     * @param y
     */
    re_calculate_cx_cy(x, y) {
        this.cx = x - 0.5 * this.width / this.scale;
        this.cy = y - 0.5 * this.height / this.scale;

        let l = this.game_map.l;
        if (this.focus_player) {
            this.cx = Math.max(this.cx, -2 * l);
            this.cx = Math.min(this.cx, this.virtual_map_width - (this.width / this.scale - 2 * l));
            this.cy = Math.max(this.cy, -l);
            this.cy = Math.min(this.cy, this.virtual_map_height - (this.height / this.scale - l));
        }
    }

    add_listening_events() {
        let outer = this;
        //$(window).resize()在浏览器窗口大小改变时调用
        $(window).resize(function () {
            outer.resize();
        });
    }

    /**
     * 根据模式打开对应界面
     * @param mode
     */
    show(mode) {
        // 打开playground界面
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.virtual_map_width = 3;
        this.big_map_height = 3; // 正方形地图，方便画格子
        //创建GameMap对象
        this.game_map = new GameMap(this);
        this.resize();

        this.mode = mode;
        this.state = "waiting";  // waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.create_player(mode);

    }

    /**
     * 根据模式在地图中创建玩家
     */
    create_player(mode) {
        //创建玩家对象
        let outer = this;

        this.players = [];
        this.fireballs = [];
        // 根据玩家位置确定画布相对于虚拟地图的偏移量
        this.cx = this.players[0].x - 0.5 * this.width / 2;
        this.cy = this.players[0].y - 0.5 * this.height / 2;

        //创建自己
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        //单人模式就生成ai
        if (mode === "single mode") {
            for (let i = 0; i < gameParameters.AIs_number; i++) {
                let px = Math.random() * this.big_map_width, py = Math.random() * this.big_map_height;
                this.players.push(new Player(this, px, py, gameParameters.players_size, this.get_random_color(), gameParameters.player_speed, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
        // 在地图和玩家都创建好后，创建小地图对象
        this.mini_map = new MiniMap(this, this.game_map);
        this.mini_map.resize();

    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

    get_random_color() {
        return gameParameters.color_select[Math.floor((Math.random() * gameParameters.color_select.length))];
    }

    /**
     * 某玩家死亡调用的函数
     * @param player Player 对象
     */
    player_is_killed(player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === player) {
                player.destroy();
                this.players.splice(i, 1);
                break;
            }
        }
    }
}
