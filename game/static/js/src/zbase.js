 export class AcGame {
     /**
      *
      * @param id
      * @param AcWiingOs 传入acwnig接口，为了支持多端，用来判断是在哪个端执行的
      */
    constructor(id,AcWingOs) {
        this.id = id;
        this.AcwingOs = AcWingOs
        this.$ac_game = $('#' + id);

        this.settings = new Settings(this);
        //为了方便调试，不显示菜单界面
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}

