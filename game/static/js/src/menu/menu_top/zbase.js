class MenuTop {
    constructor(menu) {
        this.menu = menu;
        this.$menu_top = $(`
            <div class="ac-game-menu-scroll-word">
                <marquee>
                    <span style="font-weight: bolder;font-size: 2.4vw;color: white;">${this.menu.root.settings.username} 欢迎您的到来!</span>
                </marquee>
            </div>
            `);
        this.menu.$menu.append(this.$menu_top);

        this.start();
    }

    hide() {
        this.$menu_top.hide();
    }


}
