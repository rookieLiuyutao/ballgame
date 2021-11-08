class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //创建GameMap对象
        this.game_map = new GameMap(this);
        //创建玩家对象
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        //创建5个电脑玩家
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
        this.start();

    }

    start() {
    }

    show() {  // 打开playground界面
        this.$playground.show();
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }

    get_random_color(){
        let color_select = ["red","gree","#c0d6cb","#1cce31","#9fa0d7","#cc99ff"];
        return color_select[Math.floor((Math.random()*6))];
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
