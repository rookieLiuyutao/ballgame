class acapp {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.menu = new acappMenu(this);
        this.playground = new acappPlayground(this);

        this.start();
    }

    start() {
    }
}

