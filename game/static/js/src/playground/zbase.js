class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.game_difficulty = 0;
        this.focus_player = null; // 镜头聚焦玩家
        this.game_time_obj = null; // 游戏时间
        this.players = [];
        this.fireballs = [];
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.root.$ac_game.append(this.$playground);
        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ['#00FFFF', '#00FF7F', '#8A2BE2', '#CD2990', '#7FFF00', '#FFDAB9', '#FF6437','#CD853F'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        let outer = this;
        $(window).resize(function() {
            outer.resize();

        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.unit = Math.min(this.width / 16, this.height / 9);
        this.width = this.unit * 16;
        this.height = this.unit * 9;
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();
        if (this.mini_map) this.mini_map.resize();
        if (this.chat_field) this.chat_field.resize();
    }

    re_calculate_cx_cy(x, y) {
        this.cx = x - 0.5 * this.width / this.scale;
        this.cy = y - 0.5 * this.height/ this.scale;

        let l = this.game_map.l;
        if (this.focus_player) {
            this.cx = Math.max(this.cx, -2 * l);
            this.cx = Math.min(this.cx, this.big_map_width - (this.width / this.scale - 2 * l));
            this.cy = Math.max(this.cy, -l);
            this.cy = Math.min(this.cy, this.big_map_height - (this.height / this.scale - l));
        }
    }

    show(mode) {
        let outer = this;
        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> over
        this.$playground.show();

        // 虚拟地图大小
        // this.big_map_width = Math.max(this.width, this.height) * 2;
        // this.big_map_height = this.big_map_width; // 正方形地图，方便画格子
        // 虚拟地图大小改成相对大小
        this.big_map_width = 3;
        this.big_map_height =3;

        this.game_map = new GameMap(this);
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();

        // 加入玩家

        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white",gameParameters.player_speed , "me", this.root.settings.username, this.root.settings.photo));
        // 根据玩家位置确定画布相对于虚拟地图的偏移量
        this.re_calculate_cx_cy(this.players[0].x, this.players[0].y);
        this.focus_player = this.players[0];

        if (mode === "single mode") {
            for (let i = 0; i < gameParameters.AIs_number; i ++ ) {
                let px = Math.random() * this.big_map_width, py = Math.random() * this.big_map_height;
                this.players.push(new Player(this, px, py, 0.05, this.get_random_color(), gameParameters.AI_speed, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);

            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }

        // 在地图和玩家都创建好后，创建小地图对象
        this.mini_map = new MiniMap(this, this.game_map);
        this.mini_map.resize();
    }

    hide() {
        this.$playground.hide();
    }
}
