(function () {
    const DEFAULT_BOARD = { rows: 5, cols: 10 };

    function computeCellSize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const landscape = w > h;

        if (w <= 420) return landscape ? 34 : 36;
        if (w <= 600) return landscape ? 36 : 40;
        if (w <= 900) return landscape ? 42 : 46;
        return landscape ? 50 : 56;
    }

    function applyLayout() {
        const container = document.getElementById('gameContainer');
        if (!container) return;

        const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
        const landscape = window.innerWidth > window.innerHeight;

        container.classList.toggle('pwa-standalone', !!standalone);
        container.classList.toggle('mobile-landscape', landscape);
        container.classList.toggle('mobile-portrait', !landscape);

        container.style.setProperty('--board-rows', String(DEFAULT_BOARD.rows));
        container.style.setProperty('--board-cols', String(DEFAULT_BOARD.cols));
        container.style.setProperty('--board-cell', computeCellSize() + 'px');
    }

    window.WacheckMobileLayout = {
        board: DEFAULT_BOARD,
        applyLayout
    };

    window.addEventListener('resize', applyLayout);
    window.addEventListener('orientationchange', applyLayout);
    window.addEventListener('load', applyLayout);
})();
