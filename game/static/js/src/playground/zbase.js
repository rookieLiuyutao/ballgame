class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);



        this.hide();
        this.start();

    }

    start() {
    }

    show() {  // 打开playground界面
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //创建GameMap对象
        this.game_map = new GameMap(this);
        //创建玩家对象
        this.players = [];
        this.fireballs = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * gameParameters.players_size_percent, "white", this.height * gameParameters.player_speed_percent, true));
        //创建5个电脑玩家
        for (let i = 0; i < gameParameters.AIs_number; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * gameParameters.players_size_percent, this.get_random_color(), this.height * gameParameters.player_speed_percent, false));
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

    get_random_color(){

        return gameParameters.color_select[Math.floor((Math.random()*gameParameters.color_select.length))];
    }

    /**
     * 某玩家死亡调用的函数
     * @param player Player 对象
     */
    player_is_killed(player){
        for (let i = 0; i < this.players.length; i++) {
            if (this.player[i]===player){
                player.destroy();
                this.players.splice(i,1);
                break;
            }
        }
    }
}
