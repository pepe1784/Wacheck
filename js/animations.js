/* ==========================================
   Wacheck – anime.js animations
   Requires: anime.min.js loaded before this
   ========================================== */
(function () {
    'use strict';
    if (typeof anime === 'undefined') {
        console.warn('[animations] anime.js not loaded');
        return;
    }

    /* ────────────────────────────
       1. Scroll Entrance Animations
       ──────────────────────────── */
    function setupScrollAnimations() {
        const targets = document.querySelectorAll(
            '.feature-card, .boss-card, .chapter-card, .calculator-results, .result-card'
        );
        if (!targets.length) return;

        // Set initial hidden state
        targets.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);

                // Stagger siblings inside same parent grid
                var parent = entry.target.parentElement;
                var siblings = Array.from(parent.children).filter(function (c) {
                    return c.style.opacity === '0';
                });

                if (siblings.length > 0) {
                    anime({
                        targets: siblings,
                        opacity: [0, 1],
                        translateY: [40, 0],
                        delay: anime.stagger(100),
                        duration: 700,
                        easing: 'easeOutCubic'
                    });
                } else {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [40, 0],
                        duration: 700,
                        easing: 'easeOutCubic'
                    });
                }
            });
        }, { threshold: 0.15 });

        targets.forEach(function (el) { observer.observe(el); });
    }

    /* ────────────────────────────
       2. Hero Section Entrance
       ──────────────────────────── */
    function animateHero() {
        var badge = document.querySelector('.hero-badge');
        var title = document.querySelector('.hero-title');
        var desc  = document.querySelector('.hero-description');
        var btns  = document.querySelector('.hero-buttons');

        var els = [badge, title, desc, btns].filter(Boolean);
        if (!els.length) return;

        els.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });

        anime({
            targets: els,
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(150, { start: 200 }),
            duration: 800,
            easing: 'easeOutQuart'
        });
    }

    /* ────────────────────────────
       3. Theme Toggle Ripple
       ──────────────────────────── */
    var _origToggleTheme = window.toggleTheme;
    if (typeof _origToggleTheme === 'function') {
        window.toggleTheme = function () {
            var btn = document.querySelector('[onclick="toggleTheme()"]');
            var willBeLight = !document.body.classList.contains('light-theme');
            var color = willBeLight ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)';

            // Create ripple overlay
            var ripple = document.createElement('div');
            ripple.style.cssText =
                'position:fixed;border-radius:50%;pointer-events:none;z-index:99998;' +
                'width:0;height:0;background:' + color + ';';

            if (btn) {
                var r = btn.getBoundingClientRect();
                ripple.style.left = (r.left + r.width / 2) + 'px';
                ripple.style.top  = (r.top + r.height / 2) + 'px';
            } else {
                ripple.style.left = '50%';
                ripple.style.top  = '50%';
            }
            document.body.appendChild(ripple);

            anime({
                targets: ripple,
                width: ['0px', '300vmax'],
                height: ['0px', '300vmax'],
                marginLeft: ['0px', '-150vmax'],
                marginTop: ['0px', '-150vmax'],
                opacity: [1, 0],
                duration: 900,
                easing: 'easeOutQuad',
                complete: function () { ripple.remove(); }
            });

            // Call original
            _origToggleTheme();
        };
    }

    /* ────────────────────────────
       4. Daily Rewards Modal – anime.js entrance
       ──────────────────────────── */
    function enhanceDailyRewardsModal() {
        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (!node.classList || !node.classList.contains('daily-reward-modal')) return;

                    // The container inside the modal
                    var container = node.querySelector('.daily-reward-container');
                    if (!container) return;

                    // Override CSS animation – remove it and use anime.js
                    container.style.animation = 'none';
                    container.style.opacity = '0';
                    container.style.transform = 'translateY(80px) scale(0.9)';

                    // Wait for the .active class (opacity transition on modal)
                    requestAnimationFrame(function () {
                        anime({
                            targets: container,
                            translateY: [80, 0],
                            scale: [0.9, 1],
                            opacity: [0, 1],
                            duration: 650,
                            easing: 'easeOutBack'
                        });

                        // Stagger reward day items
                        var dayItems = container.querySelectorAll('.daily-reward-day');
                        if (dayItems.length) {
                            anime({
                                targets: dayItems,
                                opacity: [0, 1],
                                translateY: [20, 0],
                                scale: [0.85, 1],
                                delay: anime.stagger(60, { start: 350 }),
                                duration: 500,
                                easing: 'easeOutCubic'
                            });
                        }

                        // Animate progress dots
                        var dots = container.querySelectorAll('.daily-reward-progress-dot');
                        if (dots.length) {
                            anime({
                                targets: dots,
                                scale: [0, 1],
                                delay: anime.stagger(80, { start: 500 }),
                                duration: 400,
                                easing: 'easeOutElastic(1, .6)'
                            });
                        }
                    });
                });
            });
        });
        mo.observe(document.body, { childList: true });
    }

    /* ────────────────────────────
       5. Boss Cards Hover Pulse
       ──────────────────────────── */
    function setupBossHover() {
        document.querySelectorAll('.boss-card').forEach(function (card) {
            card.addEventListener('mouseenter', function () {
                anime({
                    targets: card.querySelector('.boss-badge'),
                    scale: [1, 1.08, 1],
                    duration: 500,
                    easing: 'easeInOutQuad'
                });
            });
        });
    }

    /* ────────────────────────────
       Init on DOMContentLoaded
       ──────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        animateHero();
        setupScrollAnimations();
        setupBossHover();
        enhanceDailyRewardsModal();
    }
})();
