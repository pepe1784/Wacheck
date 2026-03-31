// ============================================================
// js/game/sprites.js — SVG Sprite System for Wacheck
// Replaces ALL emoji with clean SVG icons
// Must load BEFORE script.js and game-page.js
// ============================================================
(function () {
    'use strict';

    const S = 32; // viewBox size

    // Helper: wrap SVG content in a standard container
    function svg(inner, vb) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb || S} ${vb || S}" width="100%" height="100%" style="display:block">${inner}</svg>`;
    }

    // ── DEFENDER SPRITES ──────────────────────────────────────
    const defenders = {
        // === BASIC DEFENDERS ===
        filter: svg(`<circle cx="16" cy="16" r="12" fill="#3b82f6"/><path d="M10 12h12l-3 10h-6z" fill="#1e40af" opacity=".7"/><line x1="16" y1="8" x2="16" y2="24" stroke="#fff" stroke-width="1.5"/>`),

        plant: svg(`<path d="M16 28V16" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/><path d="M16 16c0-8 8-10 8-10s-2 8-8 10" fill="#22c55e"/><path d="M16 20c0-6-7-8-7-8s1 6 7 8" fill="#16a34a"/><circle cx="16" cy="28" r="2" fill="#854d0e"/>`),

        recycler: svg(`<path d="M16 6l5 8h-4v6h-2v-6h-4z" fill="#22c55e"/><path d="M8 22l3-5 3 5z" fill="#16a34a" transform="rotate(-120 16 16)"/><path d="M24 22l-3-5-3 5z" fill="#15803d" transform="rotate(120 16 16)"/><circle cx="16" cy="16" r="3" fill="#fff" opacity=".3"/>`),

        cleaner: svg(`<rect x="8" y="8" width="16" height="18" rx="3" fill="#8b5cf6"/><rect x="10" y="6" width="12" height="4" rx="2" fill="#7c3aed"/><line x1="12" y1="14" x2="20" y2="14" stroke="#c4b5fd" stroke-width="1.5"/><line x1="12" y1="18" x2="20" y2="18" stroke="#c4b5fd" stroke-width="1.5"/><line x1="12" y1="22" x2="20" y2="22" stroke="#c4b5fd" stroke-width="1.5"/>`),

        stream: svg(`<path d="M16 4c-3 0-6 3-6 7 0 5 6 11 6 11s6-6 6-11c0-4-3-7-6-7z" fill="#3b82f6"/><ellipse cx="16" cy="11" rx="3" ry="3.5" fill="#93c5fd" opacity=".6"/>`),

        bubble: svg(`<circle cx="16" cy="16" r="10" fill="#bae6fd" opacity=".4" stroke="#38bdf8" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="#e0f2fe" opacity=".5"/><circle cx="20" cy="20" r="3" fill="#bae6fd" opacity=".5"/><ellipse cx="14" cy="9" rx="2" ry="1" fill="#fff" opacity=".6"/>`),

        wind: svg(`<path d="M6 12h14c3 0 3-5 0-5" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/><path d="M8 17h16c2 0 2 4 0 4" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"/><path d="M10 22h10c2 0 2-3 0-3" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>`),

        earth: svg(`<path d="M8 24l3-8 5 3 4-11 4 16z" fill="#78716c"/><path d="M8 24l3-8 5 3 4-11" fill="#a8a29e" opacity=".6"/><circle cx="14" cy="20" r="1.5" fill="#57534e"/>`),

        // === UNLOCKABLE DEFENDERS ===
        crystal: svg(`<path d="M16 4l8 12-8 12-8-12z" fill="#a78bfa"/><path d="M16 4l8 12h-16z" fill="#c4b5fd"/><line x1="16" y1="4" x2="16" y2="28" stroke="#fff" stroke-width="1" opacity=".4"/>`),

        solar: svg(`<circle cx="16" cy="16" r="7" fill="#fbbf24"/><circle cx="16" cy="16" r="4" fill="#fcd34d"/>${[0,45,90,135,180,225,270,315].map(a => `<line x1="16" y1="${16-11}" x2="16" y2="${16-8}" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" transform="rotate(${a} 16 16)"/>`).join('')}`),

        coral: svg(`<path d="M16 28v-10" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/><path d="M16 18c-2-4-6-6-6-10" stroke="#fb7185" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M16 18c2-4 6-6 6-10" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="10" cy="8" r="2" fill="#fda4af"/><circle cx="22" cy="8" r="2" fill="#fda4af"/><circle cx="16" cy="14" r="1.5" fill="#fda4af"/>`),

        shield: svg(`<path d="M16 4L6 10v8c0 6 4.5 10.5 10 12 5.5-1.5 10-6 10-12v-8z" fill="#3b82f6"/><path d="M16 4L6 10v8c0 6 4.5 10.5 10 12" fill="#60a5fa"/><path d="M16 10l-5 3v5c0 3 2 5.5 5 6.5" fill="#fff" opacity=".15"/>`),

        tornado: svg(`<ellipse cx="16" cy="6" rx="10" ry="3" fill="#64748b" opacity=".7"/><ellipse cx="16" cy="12" rx="7" ry="2.5" fill="#94a3b8"/><ellipse cx="16" cy="18" rx="5" ry="2" fill="#64748b"/><ellipse cx="16" cy="23" rx="3" ry="1.5" fill="#94a3b8"/><ellipse cx="16" cy="27" rx="1.5" ry="1" fill="#64748b"/>`),

        whale: svg(`<ellipse cx="16" cy="16" rx="12" ry="8" fill="#2563eb"/><path d="M4 16c-2-3-2-7 0-8" stroke="#3b82f6" stroke-width="2.5" fill="none"/><path d="M4 16c-2 3-2 7 0 8" stroke="#3b82f6" stroke-width="2.5" fill="none"/><circle cx="22" cy="13" r="1.5" fill="#fff"/><path d="M26 16c1 0 2 1 2 0s-1-1-2 0z" fill="#1e40af"/><ellipse cx="16" cy="20" rx="6" ry="2" fill="#93c5fd" opacity=".4"/>`),

        dualcannon: svg(`<rect x="6" y="8" width="20" height="6" rx="2" fill="#475569"/><rect x="6" y="18" width="20" height="6" rx="2" fill="#475569"/><circle cx="26" cy="11" r="2" fill="#f59e0b"/><circle cx="26" cy="21" r="2" fill="#f59e0b"/><rect x="4" y="6" width="6" height="20" rx="2" fill="#334155"/>`),

        incinerator: svg(`<path d="M16 4c-2 4-8 8-8 14 0 5 3.5 10 8 10s8-5 8-10c0-6-6-10-8-14z" fill="#ef4444"/><path d="M16 12c-1 3-4 5-4 9 0 3 1.8 5 4 5s4-2 4-5c0-4-3-6-4-9z" fill="#fbbf24"/><ellipse cx="16" cy="22" rx="2" ry="3" fill="#fef3c7"/>`),

        cryomancer: svg(`<path d="M16 2v28M4 10l24 12M4 22l24-12" stroke="#67e8f9" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="#22d3ee"/><circle cx="16" cy="16" r="2" fill="#ecfeff"/>
        <line x1="16" y1="2" x2="14" y2="5" stroke="#a5f3fc" stroke-width="1.5"/><line x1="16" y1="2" x2="18" y2="5" stroke="#a5f3fc" stroke-width="1.5"/>
        <line x1="16" y1="30" x2="14" y2="27" stroke="#a5f3fc" stroke-width="1.5"/><line x1="16" y1="30" x2="18" y2="27" stroke="#a5f3fc" stroke-width="1.5"/>`),

        generator: svg(`<circle cx="16" cy="16" r="11" fill="#eab308"/><circle cx="16" cy="16" r="8" fill="#fbbf24"/><text x="16" y="21" text-anchor="middle" font-size="14" font-weight="bold" fill="#854d0e" font-family="sans-serif">$</text>`),

        mortar: svg(`<circle cx="16" cy="18" r="10" fill="#374151"/><circle cx="16" cy="18" r="7" fill="#4b5563"/><path d="M12 8l4-4 4 4" fill="none" stroke="#9ca3af" stroke-width="2"/><circle cx="16" cy="8" r="2" fill="#ef4444"/><line x1="14" y1="18" x2="18" y2="18" stroke="#9ca3af" stroke-width="1.5"/><line x1="16" y1="16" x2="16" y2="20" stroke="#9ca3af" stroke-width="1.5"/>`),

        amplifier: svg(`<rect x="6" y="8" width="12" height="16" rx="2" fill="#1e40af"/><path d="M18 8l8-4v24l-8-4z" fill="#3b82f6"/><path d="M26 10a8 8 0 010 12" fill="none" stroke="#60a5fa" stroke-width="2"/><path d="M28 6a12 12 0 010 20" fill="none" stroke="#93c5fd" stroke-width="1.5"/>`),

        wizard: svg(`<path d="M16 2l-8 14h16z" fill="#7c3aed"/><circle cx="16" cy="20" r="7" fill="#a78bfa"/><path d="M16 2l2 6-2-1-2 1z" fill="#fbbf24"/><path d="M14 17l2 3 2-3" stroke="#fbbf24" stroke-width="2" fill="none"/><circle cx="13" cy="19" r="1" fill="#fff"/><circle cx="19" cy="19" r="1" fill="#fff"/>`),

        otter: svg(`<ellipse cx="16" cy="18" rx="9" ry="7" fill="#92400e"/><circle cx="16" cy="10" r="6" fill="#a16207"/><circle cx="13" cy="9" r="1.5" fill="#1c1917"/><circle cx="19" cy="9" r="1.5" fill="#1c1917"/><ellipse cx="16" cy="12" rx="3" ry="2" fill="#d6d3d1"/><circle cx="16" cy="11" r="1" fill="#1c1917"/><circle cx="10" cy="7" r="2" fill="#a16207"/><circle cx="22" cy="7" r="2" fill="#a16207"/>`),

        kraken: svg(`<ellipse cx="16" cy="12" rx="8" ry="7" fill="#7c3aed"/><circle cx="13" cy="11" r="2" fill="#fff"/><circle cx="19" cy="11" r="2" fill="#fff"/><circle cx="13" cy="11" r="1" fill="#1e1b4b"/><circle cx="19" cy="11" r="1" fill="#1e1b4b"/>
        <path d="M6 20q2 6 4-1" stroke="#8b5cf6" stroke-width="2" fill="none"/>
        <path d="M10 20q2 6 4-1" stroke="#7c3aed" stroke-width="2" fill="none"/>
        <path d="M18 20q2 6 4-1" stroke="#8b5cf6" stroke-width="2" fill="none"/>
        <path d="M22 20q2 6 4-1" stroke="#7c3aed" stroke-width="2" fill="none"/>`),

        golem: svg(`<rect x="10" y="4" width="12" height="10" rx="2" fill="#78716c"/><rect x="8" y="14" width="16" height="12" rx="2" fill="#57534e"/><circle cx="14" cy="9" r="2" fill="#22d3ee"/><circle cx="20" cy="9" r="2" fill="#22d3ee"/><rect x="4" y="15" width="4" height="8" rx="2" fill="#78716c"/><rect x="24" y="15" width="4" height="8" rx="2" fill="#78716c"/>`),

        antiTankArea: svg(`<circle cx="16" cy="16" r="12" fill="none" stroke="#ef4444" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="none" stroke="#ef4444" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#ef4444"/><line x1="16" y1="2" x2="16" y2="8" stroke="#ef4444" stroke-width="2"/><line x1="16" y1="24" x2="16" y2="30" stroke="#ef4444" stroke-width="2"/><line x1="2" y1="16" x2="8" y2="16" stroke="#ef4444" stroke-width="2"/><line x1="24" y1="16" x2="30" y2="16" stroke="#ef4444" stroke-width="2"/>`),

        // === GAME-PAGE SPECIAL DEFENDERS ===
        'water-shield': svg(`<path d="M16 4L6 10v8c0 6 4.5 10.5 10 12 5.5-1.5 10-6 10-12v-8z" fill="#2563eb"/><path d="M16 4L6 10v8c0 6 4.5 10.5 10 12" fill="#3b82f6"/><path d="M16 12c-2 0-3 1-3 3 0 3 3 5 3 5s3-2 3-5c0-2-1-3-3-3z" fill="#93c5fd"/>`),

        'rain-cloud': svg(`<ellipse cx="16" cy="12" rx="10" ry="6" fill="#94a3b8"/><circle cx="10" cy="10" r="5" fill="#cbd5e1"/><circle cx="20" cy="9" r="6" fill="#cbd5e1"/><line x1="10" y1="20" x2="10" y2="26" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="20" x2="16" y2="28" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="20" x2="22" y2="25" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/>`),

        'water-cannon': svg(`<rect x="4" y="12" width="18" height="8" rx="3" fill="#1e40af"/><rect x="18" y="10" width="10" height="12" rx="2" fill="#2563eb"/><circle cx="28" cy="16" r="3" fill="#60a5fa"/><circle cx="28" cy="16" r="1.5" fill="#93c5fd"/><rect x="4" y="14" width="4" height="4" rx="1" fill="#1e3a5f"/>`),

        'ice-crystal': svg(`<path d="M16 2l6 14-6 14-6-14z" fill="#22d3ee"/><path d="M16 2l6 14h-12z" fill="#67e8f9"/><path d="M10 16l6 14" stroke="#fff" stroke-width="1" opacity=".3"/><circle cx="16" cy="14" r="2" fill="#ecfeff"/>`),

        'wave-warrior': svg(`<path d="M4 18c4-6 8 0 12-6s8 0 12-6" fill="none" stroke="#2563eb" stroke-width="3"/><path d="M4 22c4-6 8 0 12-6s8 0 12-6" fill="none" stroke="#3b82f6" stroke-width="2.5"/><path d="M4 26c4-6 8 0 12-6s8 0 12-6" fill="none" stroke="#60a5fa" stroke-width="2"/><circle cx="16" cy="14" r="5" fill="#1e40af"/><path d="M14 13l4 0-2 3z" fill="#fff"/>`),

        'water-lily': svg(`<ellipse cx="16" cy="20" rx="12" ry="6" fill="#16a34a"/><ellipse cx="16" cy="20" rx="8" ry="4" fill="#22c55e"/><path d="M16 20v-8" stroke="#15803d" stroke-width="1.5"/><circle cx="16" cy="10" r="4" fill="#f472b6"/><circle cx="16" cy="10" r="2" fill="#fda4af"/>`),

        'coral-reef': svg(`<path d="M16 28v-8" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/><path d="M16 20c-2-3-5-5-5-9" stroke="#eab308" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M16 20c2-3 5-5 5-9" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="11" cy="11" r="2.5" fill="#fbbf24"/><circle cx="21" cy="11" r="2.5" fill="#fbbf24"/><circle cx="16" cy="16" r="2" fill="#fcd34d"/>`),

        'tsunami-giant': svg(`<rect x="10" y="6" width="12" height="10" rx="1" fill="#475569"/><rect x="8" y="16" width="16" height="12" rx="1" fill="#334155"/><circle cx="14" cy="11" r="2" fill="#ef4444"/><circle cx="20" cy="11" r="2" fill="#ef4444"/><rect x="4" y="17" width="5" height="9" rx="2" fill="#475569"/><rect x="23" y="17" width="5" height="9" rx="2" fill="#475569"/><path d="M12 28h8v2h-8z" fill="#1e293b"/>`),
    };

    // ── CONTAMINANT SPRITES ───────────────────────────────────
    const contaminants = {
        'Fábrica': svg(`<rect x="6" y="14" width="14" height="14" rx="1" fill="#4b5563"/><rect x="22" y="8" width="5" height="20" rx="1" fill="#6b7280"/><rect x="10" y="4" width="4" height="12" rx="1" fill="#6b7280"/><path d="M10 4c0-1 4-1 4 0" fill="#9ca3af"/><path d="M22 8c0-1 5-1 5 0" fill="#9ca3af"/><circle cx="11" cy="2" r="2" fill="#9ca3af" opacity=".5"/><circle cx="24" cy="5" r="2.5" fill="#9ca3af" opacity=".5"/><rect x="9" y="20" width="4" height="4" fill="#fbbf24" opacity=".6"/>`),

        'Petróleo': svg(`<rect x="8" y="8" width="16" height="18" rx="2" fill="#1c1917"/><rect x="10" y="4" width="12" height="6" rx="1" fill="#292524"/><ellipse cx="16" cy="8" rx="6" ry="2" fill="#44403c"/><path d="M12 16h8v6h-8z" fill="#78716c"/><text x="16" y="21" text-anchor="middle" font-size="6" fill="#fbbf24" font-family="sans-serif" font-weight="bold">OIL</text>`),

        'Nuclear': svg(`<circle cx="16" cy="16" r="12" fill="#facc15"/><circle cx="16" cy="16" r="4" fill="#1c1917"/><path d="M16 4a12 12 0 014 1l-4 7z" fill="#1c1917"/><path d="M16 4a12 12 0 00-4 1l4 7z" fill="#1c1917"/><path d="M5.7 22a12 12 0 01-1-4l7 4z" fill="#1c1917"/><path d="M26.3 22a12 12 0 001-4l-7 4z" fill="#1c1917"/><path d="M10 27a12 12 0 003 2l3-7z" fill="#1c1917"/><path d="M22 27a12 12 0 01-3 2l-3-7z" fill="#1c1917"/>`),

        'Basura': svg(`<path d="M10 10h12l-1 18h-10z" fill="#78716c"/><rect x="8" y="8" width="16" height="4" rx="1" fill="#57534e"/><line x1="13" y1="14" x2="13" y2="24" stroke="#57534e" stroke-width="1.5"/><line x1="16" y1="14" x2="16" y2="24" stroke="#57534e" stroke-width="1.5"/><line x1="19" y1="14" x2="19" y2="24" stroke="#57534e" stroke-width="1.5"/><path d="M14 8V6a2 2 0 014 0v2" fill="none" stroke="#57534e" stroke-width="1.5"/>`),

        'Auto': svg(`<rect x="4" y="14" width="24" height="10" rx="3" fill="#6b7280"/><rect x="7" y="8" width="18" height="8" rx="2" fill="#9ca3af"/><circle cx="10" cy="26" r="3" fill="#1c1917"/><circle cx="10" cy="26" r="1.5" fill="#6b7280"/><circle cx="22" cy="26" r="3" fill="#1c1917"/><circle cx="22" cy="26" r="1.5" fill="#6b7280"/><rect x="9" y="10" width="6" height="5" rx="1" fill="#bae6fd" opacity=".5"/><rect x="17" y="10" width="6" height="5" rx="1" fill="#bae6fd" opacity=".5"/>`),

        'Químico': svg(`<path d="M13 4h6v10l6 12H7l6-12z" fill="#a855f7"/><rect x="13" y="2" width="6" height="4" rx="1" fill="#9ca3af"/><ellipse cx="16" cy="24" rx="4" ry="2" fill="#c084fc" opacity=".5"/><circle cx="14" cy="20" r="1.5" fill="#e9d5ff"/><circle cx="18" cy="22" r="1" fill="#e9d5ff"/>`),

        'Fuego': svg(`<path d="M16 4c-2 4-8 8-8 14 0 5 3.5 10 8 10s8-5 8-10c0-6-6-10-8-14z" fill="#ef4444"/><path d="M16 12c-1 3-4 5-4 9 0 3 1.8 5 4 5s4-2 4-5c0-4-3-6-4-9z" fill="#f97316"/><ellipse cx="16" cy="22" rx="2" ry="3" fill="#fbbf24"/>`),

        'Tóxico': svg(`<circle cx="16" cy="14" r="10" fill="#4ade80"/><circle cx="12" cy="12" r="3.5" fill="#1c1917"/><circle cx="20" cy="12" r="3.5" fill="#1c1917"/><path d="M10 20c2 3 10 3 12 0" fill="none" stroke="#1c1917" stroke-width="2"/><line x1="9" y1="20" x2="11" y2="18" stroke="#1c1917" stroke-width="1.5"/><line x1="23" y1="20" x2="21" y2="18" stroke="#1c1917" stroke-width="1.5"/>`),

        'Huracán': svg(`<path d="M16 4c8 0 12 6 10 12" stroke="#64748b" stroke-width="2.5" fill="none"/><path d="M26 16c0 8-6 12-12 10" stroke="#94a3b8" stroke-width="2.5" fill="none"/><path d="M14 26c-6-2-10-6-8-12" stroke="#64748b" stroke-width="2.5" fill="none"/><path d="M6 14c2-6 6-10 12-8" stroke="#94a3b8" stroke-width="2.5" fill="none"/><circle cx="16" cy="16" r="3" fill="#475569"/>`),

        'Demonio': svg(`<circle cx="16" cy="16" r="11" fill="#dc2626"/><path d="M6 12l4-8 2 6z" fill="#991b1b"/><path d="M26 12l-4-8-2 6z" fill="#991b1b"/><circle cx="12" cy="15" r="2.5" fill="#fbbf24"/><circle cx="20" cy="15" r="2.5" fill="#fbbf24"/><circle cx="12" cy="15" r="1" fill="#1c1917"/><circle cx="20" cy="15" r="1" fill="#1c1917"/><path d="M11 22c2 2 8 2 10 0" fill="none" stroke="#1c1917" stroke-width="2"/>`),

        'Fantasma': svg(`<path d="M16 4c-6 0-10 5-10 11v11c0 0 2-2 4 0s3-2 5 0 3-2 5 0 4-2 4 0c1-2 2 0 2 0V15c0-6-4-11-10-11z" fill="#e2e8f0"/><circle cx="12" cy="14" r="2.5" fill="#1e293b"/><circle cx="20" cy="14" r="2.5" fill="#1e293b"/><ellipse cx="16" cy="20" rx="2.5" ry="3" fill="#64748b"/>`),

        'Tanque': svg(`<rect x="2" y="14" width="28" height="12" rx="3" fill="#374151"/><rect x="6" y="8" width="20" height="8" rx="2" fill="#4b5563"/><circle cx="8" cy="28" r="3" fill="#1c1917"/><circle cx="16" cy="28" r="3" fill="#1c1917"/><circle cx="24" cy="28" r="3" fill="#1c1917"/><ellipse cx="16" cy="12" rx="6" ry="3" fill="#6b7280"/>`),

        'El Leviatán': svg(`<ellipse cx="16" cy="14" rx="12" ry="9" fill="#581c87"/><circle cx="11" cy="12" r="3" fill="#fbbf24"/><circle cx="21" cy="12" r="3" fill="#fbbf24"/><circle cx="11" cy="12" r="1.5" fill="#1c1917"/><circle cx="21" cy="12" r="1.5" fill="#1c1917"/>
        <path d="M4 22q3 6 5-1" stroke="#7c3aed" stroke-width="2.5" fill="none"/>
        <path d="M9 22q3 6 5-1" stroke="#6d28d9" stroke-width="2.5" fill="none"/>
        <path d="M18 22q3 6 5-1" stroke="#7c3aed" stroke-width="2.5" fill="none"/>
        <path d="M23 22q3 6 5-1" stroke="#6d28d9" stroke-width="2.5" fill="none"/>
        <path d="M10 18c2 1 8 1 10 0" stroke="#a855f7" stroke-width="1.5" fill="none"/>`),
    };

    // ── UI / MISC SPRITES ─────────────────────────────────────
    const ui = {
        coin: svg(`<circle cx="16" cy="16" r="11" fill="#eab308"/><circle cx="16" cy="16" r="8" fill="#fbbf24"/><text x="16" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e" font-family="sans-serif">$</text>`),

        star: svg(`<path d="M16 4l3.5 7.5 8 1-5.8 5.5 1.4 8L16 22l-7.1 4 1.4-8L4.5 12.5l8-1z" fill="#fbbf24"/>`),

        heart: svg(`<path d="M16 28C8 22 4 17 4 12c0-4 3-7 6.5-7C13 5 15 7 16 9c1-2 3-4 5.5-4C25 5 28 8 28 12c0 5-4 10-12 16z" fill="#ef4444"/>`),

        'green-heart': svg(`<path d="M16 28C8 22 4 17 4 12c0-4 3-7 6.5-7C13 5 15 7 16 9c1-2 3-4 5.5-4C25 5 28 8 28 12c0 5-4 10-12 16z" fill="#22c55e"/>`),

        rune: svg(`<path d="M16 2l10 7v14l-10 7-10-7V9z" fill="#7c3aed"/><path d="M16 2l10 7-10 7-10-7z" fill="#a78bfa"/><path d="M16 8v10" stroke="#fff" stroke-width="2"/><path d="M12 11l4 4 4-4" stroke="#fff" stroke-width="1.5" fill="none"/>`),

        sword: svg(`<path d="M22 4l-12 12 3 3 12-12z" fill="#94a3b8"/><path d="M10 16l-3 3 6 6 3-3z" fill="#78716c"/><line x1="8" y1="24" x2="4" y2="28" stroke="#57534e" stroke-width="2"/>`),

        target: svg(`<circle cx="16" cy="16" r="12" fill="none" stroke="#ef4444" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="none" stroke="#ef4444" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#ef4444"/>`),

        lightning: svg(`<path d="M18 2l-8 14h6l-4 14 12-16h-7z" fill="#f59e0b"/>`),

        'shield-icon': svg(`<path d="M16 4L6 10v8c0 6 4.5 10.5 10 12 5.5-1.5 10-6 10-12v-8z" fill="#3b82f6"/>`),

        coins: svg(`<circle cx="12" cy="14" r="8" fill="#ca8a04" stroke="#a16207" stroke-width="1"/><circle cx="20" cy="18" r="8" fill="#eab308" stroke="#ca8a04" stroke-width="1"/><text x="20" y="22" text-anchor="middle" font-size="10" font-weight="bold" fill="#854d0e" font-family="sans-serif">$</text>`),

        explosion: svg(`<path d="M16 2l3 8 8-3-5 7 8 4-9 1 3 8-6-6-6 6 3-8-9-1 8-4-5-7 8 3z" fill="#f97316"/><circle cx="16" cy="16" r="4" fill="#fbbf24"/>`),

        'arrow-up': svg(`<path d="M16 4v20M8 14l8-10 8 10" stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),

        wave: svg(`<path d="M2 16c4-6 8 0 12-6s8 0 12-6" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/><path d="M2 22c4-6 8 0 12-6s8 0 12-6" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>`),

        // For tutorial/shop icons
        shower: svg(`<circle cx="16" cy="8" r="5" fill="#94a3b8"/><line x1="10" y1="16" x2="10" y2="24" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="16" x2="14" y2="26" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/><line x1="18" y1="16" x2="18" y2="25" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="16" x2="22" y2="23" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/>`),

        toilet: svg(`<path d="M8 18h16c0 6-4 10-8 10s-8-4-8-10z" fill="#e2e8f0"/><rect x="10" y="4" width="12" height="14" rx="2" fill="#f1f5f9"/><rect x="10" y="4" width="12" height="4" rx="2" fill="#cbd5e1"/>`),

        toothbrush: svg(`<rect x="14" y="2" width="4" height="20" rx="2" fill="#60a5fa"/><rect x="10" y="22" width="12" height="6" rx="2" fill="#94a3b8"/><line x1="12" y1="24" x2="12" y2="26" stroke="#cbd5e1" stroke-width="1"/><line x1="15" y1="24" x2="15" y2="26" stroke="#cbd5e1" stroke-width="1"/><line x1="18" y1="24" x2="18" y2="26" stroke="#cbd5e1" stroke-width="1"/><line x1="21" y1="24" x2="21" y2="26" stroke="#cbd5e1" stroke-width="1"/>`),

        dishes: svg(`<ellipse cx="16" cy="20" rx="12" ry="6" fill="#e2e8f0"/><ellipse cx="16" cy="18" rx="10" ry="5" fill="#f1f5f9"/><ellipse cx="16" cy="18" rx="6" ry="3" fill="#e2e8f0"/>`),

        laundry: svg(`<rect x="6" y="6" width="20" height="22" rx="3" fill="#94a3b8"/><circle cx="16" cy="18" r="7" fill="#e2e8f0"/><circle cx="16" cy="18" r="5" fill="#bae6fd" opacity=".5"/><rect x="8" y="8" width="16" height="4" rx="1" fill="#6b7280"/><circle cx="22" cy="10" r="1.5" fill="#22c55e"/>`),

        chart: svg(`<rect x="4" y="4" width="24" height="24" rx="2" fill="none" stroke="#64748b" stroke-width="2"/><rect x="8" y="16" width="4" height="10" fill="#3b82f6"/><rect x="14" y="10" width="4" height="16" fill="#22c55e"/><rect x="20" y="14" width="4" height="12" fill="#f59e0b"/>`),

        // Achievement categories
        trophy: svg(`<path d="M10 4h12v6c0 5-3 8-6 10v4h-1v-4c-3-2-6-5-6-10z" fill="#fbbf24"/><rect x="10" y="24" width="12" height="3" rx="1" fill="#ca8a04"/><path d="M10 6H6c0 4 2 6 4 7" fill="#fcd34d"/><path d="M22 6h4c0 4-2 6-4 7" fill="#fcd34d"/>`),

        medal: svg(`<path d="M12 2h8l-2 10h-4z" fill="#ef4444"/><circle cx="16" cy="20" r="8" fill="#fbbf24"/><circle cx="16" cy="20" r="5" fill="#fcd34d"/><text x="16" y="24" text-anchor="middle" font-size="8" font-weight="bold" fill="#854d0e" font-family="sans-serif">1</text>`),

        flame: svg(`<path d="M16 4c-2 4-8 8-8 14 0 5 3.5 10 8 10s8-5 8-10c0-6-6-10-8-14z" fill="#ef4444"/><path d="M16 14c-1 2-3 3-3 6 0 2 1.3 3.5 3 3.5s3-1.5 3-3.5c0-3-2-4-3-6z" fill="#fbbf24"/>`),

        gem: svg(`<path d="M8 12l8-8 8 8-8 16z" fill="#8b5cf6"/><path d="M8 12l8-8 0 24z" fill="#a78bfa"/><path d="M8 12h16" stroke="#c4b5fd" stroke-width="1"/>`),

        scroll: svg(`<rect x="8" y="4" width="16" height="24" rx="2" fill="#fde68a"/><circle cx="8" cy="6" r="3" fill="#fbbf24"/><circle cx="8" cy="26" r="3" fill="#fbbf24"/><line x1="12" y1="10" x2="22" y2="10" stroke="#a16207" stroke-width="1"/><line x1="12" y1="14" x2="20" y2="14" stroke="#a16207" stroke-width="1"/><line x1="12" y1="18" x2="22" y2="18" stroke="#a16207" stroke-width="1"/>`),

        crown: svg(`<path d="M4 24V12l6 4 6-10 6 10 6-4v12z" fill="#fbbf24"/><path d="M4 24h24v3H4z" fill="#ca8a04"/><circle cx="10" cy="16" r="1.5" fill="#ef4444"/><circle cx="16" cy="10" r="1.5" fill="#3b82f6"/><circle cx="22" cy="16" r="1.5" fill="#22c55e"/>`),

        sparkle: svg(`<path d="M16 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="#fbbf24"/><path d="M6 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#fcd34d"/><path d="M24 22l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#fcd34d"/>`),

        calendar: svg(`<rect x="4" y="6" width="24" height="22" rx="3" fill="#3b82f6"/><rect x="4" y="6" width="24" height="8" rx="3" fill="#2563eb"/><rect x="8" y="16" width="4" height="4" rx="1" fill="#fff" opacity=".3"/><rect x="14" y="16" width="4" height="4" rx="1" fill="#fff" opacity=".3"/><rect x="20" y="16" width="4" height="4" rx="1" fill="#fff" opacity=".3"/><rect x="8" y="22" width="4" height="4" rx="1" fill="#fff" opacity=".3"/><line x1="10" y1="4" x2="10" y2="8" stroke="#1e40af" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="4" x2="22" y2="8" stroke="#1e40af" stroke-width="2" stroke-linecap="round"/>`),

        gift: svg(`<rect x="4" y="14" width="24" height="14" rx="2" fill="#ef4444"/><rect x="4" y="14" width="24" height="5" rx="2" fill="#dc2626"/><rect x="14" y="14" width="4" height="14" fill="#fbbf24"/><rect x="14" y="14" width="4" height="5" fill="#f59e0b"/><path d="M16 14c-3-3-6-6-2-8s6 2 2 8" fill="none" stroke="#f59e0b" stroke-width="1.5"/><path d="M16 14c3-3 6-6 2-8s-6 2-2 8" fill="none" stroke="#f59e0b" stroke-width="1.5"/>`),

        lock: svg(`<rect x="8" y="14" width="16" height="14" rx="3" fill="#fbbf24"/><path d="M12 14V10c0-3 1.5-6 4-6s4 3 4 6v4" fill="none" stroke="#ca8a04" stroke-width="2.5"/><circle cx="16" cy="21" r="2" fill="#854d0e"/><line x1="16" y1="22" x2="16" y2="25" stroke="#854d0e" stroke-width="2"/>`),

        unlock: svg(`<rect x="8" y="14" width="16" height="14" rx="3" fill="#22c55e"/><path d="M12 14V10c0-3 1.5-6 4-6s4 3 4 6" fill="none" stroke="#15803d" stroke-width="2.5"/><circle cx="16" cy="21" r="2" fill="#14532d"/>`),

        speaker: svg(`<path d="M6 12h4l6-6v20l-6-6H6z" fill="#475569"/><path d="M20 10a6 6 0 010 12" fill="none" stroke="#60a5fa" stroke-width="2"/><path d="M22 6a10 10 0 010 20" fill="none" stroke="#93c5fd" stroke-width="1.5"/>`),

        'speaker-off': svg(`<path d="M6 12h4l6-6v20l-6-6H6z" fill="#475569"/><line x1="22" y1="10" x2="30" y2="22" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="10" x2="22" y2="22" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>`),

        settings: svg(`<circle cx="16" cy="16" r="5" fill="#64748b"/>${[0,60,120,180,240,300].map(a=>`<rect x="14" y="2" width="4" height="6" rx="1" fill="#94a3b8" transform="rotate(${a} 16 16)"/>`).join('')}`),

        info: svg(`<circle cx="16" cy="16" r="12" fill="#3b82f6"/><circle cx="16" cy="10" r="2" fill="#fff"/><rect x="14" y="14" width="4" height="10" rx="1" fill="#fff"/>`),

        warning: svg(`<path d="M16 2L2 28h28z" fill="#f59e0b"/><rect x="14" y="10" width="4" height="10" rx="1" fill="#fff"/><circle cx="16" cy="24" r="2" fill="#fff"/>`),

        check: svg(`<circle cx="16" cy="16" r="12" fill="#22c55e"/><path d="M10 16l4 4 8-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),

        cross: svg(`<circle cx="16" cy="16" r="12" fill="#ef4444"/><path d="M11 11l10 10M21 11l-10 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),

        play: svg(`<circle cx="16" cy="16" r="14" fill="#22c55e"/><path d="M12 8l14 8-14 8z" fill="#fff"/>`),

        map: svg(`<rect x="4" y="4" width="24" height="24" rx="2" fill="#fde68a"/><path d="M10 4v24M20 4v24" stroke="#d97706" stroke-width="1" opacity=".3"/><circle cx="16" cy="14" r="3" fill="#ef4444"/><path d="M16 14v6" stroke="#ef4444" stroke-width="2"/>`),

        book: svg(`<rect x="6" y="4" width="20" height="24" rx="2" fill="#2563eb"/><rect x="8" y="6" width="18" height="20" rx="1" fill="#3b82f6"/><line x1="12" y1="10" x2="24" y2="10" stroke="#93c5fd" stroke-width="1.5"/><line x1="12" y1="14" x2="22" y2="14" stroke="#93c5fd" stroke-width="1"/><line x1="12" y1="18" x2="20" y2="18" stroke="#93c5fd" stroke-width="1"/>`),

        users: svg(`<circle cx="12" cy="10" r="4" fill="#64748b"/><circle cx="22" cy="10" r="4" fill="#94a3b8"/><path d="M4 26c0-5 3.5-8 8-8s8 3 8 8" fill="#64748b"/><path d="M16 26c0-5 3-8 6-8s6 3 6 8" fill="#94a3b8"/>`),

        droplet: svg(`<path d="M16 4c-3 0-8 7-8 13 0 5 3.5 9 8 9s8-4 8-9c0-6-5-13-8-13z" fill="#3b82f6"/><ellipse cx="14" cy="18" rx="2" ry="3" fill="#93c5fd" opacity=".5"/>`),
    };

    // ── DAILY REWARD DAY ICONS ────────────────────────────────
    const dailyRewards = {
        day1: ui.coin,
        day2: ui.star,
        day3: ui.gift,
        day4: ui.gem,
        day5: ui.crown,
        day6: ui.rune,
        day7: defenders['tsunami-giant'],
    };

    // ── PUBLIC API ────────────────────────────────────────────
    window.GameSprites = {
        /**
         * Get SVG HTML for a defender by its type key
         * @param {string} key - e.g. 'filter', 'water-shield'
         * @returns {string} SVG HTML string
         */
        defender(key) {
            return defenders[key] || ui.droplet;
        },

        /**
         * Get SVG HTML for a contaminant by its name
         * @param {string} name - e.g. 'Fábrica', 'Petróleo'
         * @returns {string} SVG HTML string
         */
        contaminant(name) {
            return contaminants[name] || ui.warning;
        },

        /**
         * Get a UI icon SVG
         * @param {string} key - e.g. 'coin', 'star', 'heart'
         * @returns {string} SVG HTML string
         */
        ui(key) {
            return ui[key] || '';
        },

        /**
         * Get daily reward icon for a given day
         * @param {number} day - 1-7
         * @returns {string} SVG HTML string
         */
        dailyReward(day) {
            return dailyRewards[`day${day}`] || ui.gift;
        },

        /**
         * Create an inline icon element (span with SVG inside)
         * @param {string} key - any ui key
         * @param {number} size - pixel size (default 20)
         * @returns {string} HTML string with inline icon
         */
        inline(key, size) {
            const s = size || 20;
            const svgContent = ui[key] || defenders[key] || '';
            if (!svgContent) return '';
            return `<span class="sprite-icon" style="display:inline-flex;width:${s}px;height:${s}px;vertical-align:middle">${svgContent}</span>`;
        },

        // Expose maps for direct access
        _defenders: defenders,
        _contaminants: contaminants,
        _ui: ui,
    };

    console.log('[Sprites] SVG sprite system loaded');
})();
