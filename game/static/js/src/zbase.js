 export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        //为了方便调试，不显示菜单界面
        // this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}

