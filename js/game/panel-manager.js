(function () {
    function getOverlay() {
        return document.getElementById('menuOverlay');
    }

    function getMenus() {
        return Array.from(document.querySelectorAll('.slide-menu, .side-menu'));
    }

    function closeMenus() {
        getMenus().forEach((menu) => menu.classList.remove('active'));
        const overlay = getOverlay();
        if (overlay) overlay.classList.remove('active');
    }

    function openMenu(menuId, beforeOpen) {
        closeMenus();

        if (typeof beforeOpen === 'function') {
            beforeOpen();
        }

        const targetMenu = document.getElementById(menuId);
        if (!targetMenu) return;

        targetMenu.classList.add('active');
        const overlay = getOverlay();
        if (overlay) overlay.classList.add('active');
    }

    window.WacheckPanels = {
        openMenu,
        closeMenus
    };
})();
