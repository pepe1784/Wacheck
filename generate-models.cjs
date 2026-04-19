// =============================================================================
// generate-models.cjs — Genera PNGs únicos estilo PvZ para Wacheck
// Cada defensor y contaminante tiene su propio diseño acuático/ambiental
// 128x128 px, fondo transparente, mirando a la derecha
// Usa la librería 'canvas' (node-canvas) con Cairo
// =============================================================================
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 128;

// ─── UTILIDADES DE DIBUJO ────────────────────────────────────────────────────

function newCanvas() {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return { c, ctx };
}

function savePNG(canvas, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buf);
    console.log(`  ✓ ${path.relative(process.cwd(), filePath)} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// Helpers geométricos
function ellipse(ctx, cx, cy, rx, ry, fill, stroke, lw) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}

function circle(ctx, cx, cy, r, fill, stroke, lw) {
    ellipse(ctx, cx, cy, r, r, fill, stroke, lw);
}

function roundRect(ctx, x, y, w, h, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}

function eyes(ctx, lx, ly, rx, ry, r, pupilR, highlight) {
    // Eye whites
    circle(ctx, lx, ly, r, '#fff');
    circle(ctx, rx, ry, r, '#fff');
    // Pupils (ligeramente a la derecha = mirando a la derecha)
    circle(ctx, lx + 2, ly, pupilR || r * 0.55, '#1a1a2e');
    circle(ctx, rx + 2, ry, pupilR || r * 0.55, '#1a1a2e');
    // Highlights
    if (highlight !== false) {
        circle(ctx, lx + 1, ly - 2, r * 0.25, '#fff');
        circle(ctx, rx + 1, ry - 2, r * 0.25, '#fff');
    }
}

function mouth(ctx, x, y, w, type, color) {
    ctx.strokeStyle = color || '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (type === 'smile') {
        ctx.arc(x, y - 2, w, 0.1 * Math.PI, 0.9 * Math.PI);
    } else if (type === 'grin') {
        ctx.arc(x, y - 4, w, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(x, y - 4, w * 0.6, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();
    } else if (type === 'open') {
        ellipse(ctx, x, y, w, w * 0.6, color || '#1a1a2e');
        return;
    } else if (type === 'evil') {
        ctx.arc(x, y - 4, w, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Teeth
        ctx.fillStyle = '#fff';
        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(x + i * 4 - 1.5, y - 4, 3, 5);
        }
        return;
    }
    ctx.stroke();
}

function dropShadow(ctx, cx, cy, rx, ry) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ellipse(ctx, cx, cy, rx, ry, '#000');
    ctx.restore();
}

// ─── DEFENSORES ──────────────────────────────────────────────────────────────

const defenderDrawers = {

    // ---- FILTRO: Criatura tipo gota con cuerpo de filtro ----
    filter(ctx) {
        dropShadow(ctx, 64, 118, 28, 8);
        // Body - gota redondeada azul
        ctx.beginPath();
        ctx.moveTo(64, 15);
        ctx.bezierCurveTo(40, 35, 25, 60, 25, 80);
        ctx.bezierCurveTo(25, 105, 40, 115, 64, 115);
        ctx.bezierCurveTo(88, 115, 103, 105, 103, 80);
        ctx.bezierCurveTo(103, 60, 88, 35, 64, 15);
        ctx.closePath();
        const grad = ctx.createLinearGradient(25, 15, 103, 115);
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(1, '#2563eb');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Filter lines on belly
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(40, 75 + i * 8);
            ctx.lineTo(88, 75 + i * 8);
            ctx.stroke();
        }
        // Eyes
        eyes(ctx, 50, 55, 72, 55, 8, 5);
        // Cute smile
        mouth(ctx, 64, 72, 10, 'smile');
        // Arm/nozzle pointing right
        roundRect(ctx, 90, 58, 30, 12, 4, '#3b82f6', '#1e40af', 2);
        circle(ctx, 122, 64, 5, '#93c5fd', '#60a5fa', 1);
    },

    // ---- PLANTA: Plantita acuática con cara ----
    plant(ctx) {
        dropShadow(ctx, 64, 118, 25, 7);
        // Stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(64, 115);
        ctx.bezierCurveTo(64, 90, 58, 80, 60, 70);
        ctx.stroke();
        // Leaves
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(42, 88, 18, 8, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(82, 92, 16, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Head (big flower/bulb)
        const hgrad = ctx.createRadialGradient(64, 45, 5, 64, 45, 32);
        hgrad.addColorStop(0, '#4ade80');
        hgrad.addColorStop(1, '#16a34a');
        circle(ctx, 64, 45, 30, null);
        ctx.fillStyle = hgrad;
        ctx.fill();
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Petals
        const petalColors = ['#22c55e', '#4ade80', '#86efac'];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            ctx.save();
            ctx.translate(64 + Math.cos(angle) * 24, 45 + Math.sin(angle) * 24);
            ctx.rotate(angle + Math.PI / 2);
            ctx.fillStyle = petalColors[i % 3];
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        // Face
        eyes(ctx, 54, 42, 72, 42, 7, 4);
        mouth(ctx, 64, 55, 8, 'smile');
        // Tiny shooter to the right
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(94, 42);
        ctx.lineTo(115, 38);
        ctx.lineTo(115, 48);
        ctx.closePath();
        ctx.fill();
    },

    // ---- RECICLADOR: Robot reciclaje con cara amigable ----
    recycler(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Body
        roundRect(ctx, 30, 40, 55, 65, 12, '#22c55e', '#15803d', 3);
        // Recycle arrows on body
        ctx.save();
        ctx.translate(58, 75);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 3);
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.lineTo(8, -6);
            ctx.lineTo(-2, -6);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        // Head
        roundRect(ctx, 35, 12, 48, 35, 10, '#4ade80', '#16a34a', 2);
        // Antenna
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(58, 12);
        ctx.lineTo(58, 2);
        ctx.stroke();
        circle(ctx, 58, 2, 4, '#fbbf24');
        // Eyes
        eyes(ctx, 48, 28, 68, 28, 7, 4);
        // Smile
        mouth(ctx, 58, 40, 8, 'grin');
        // Arm -> cannon pointing right
        roundRect(ctx, 85, 52, 32, 14, 5, '#16a34a', '#15803d', 2);
        // Glow at tip
        circle(ctx, 120, 59, 6, '#fbbf24', null);
        ctx.globalAlpha = 0.5;
        circle(ctx, 120, 59, 10, '#fde68a', null);
        ctx.globalAlpha = 1;
    },

    // ---- PURIFICADOR: Frasco mágico con cara ----
    cleaner(ctx) {
        dropShadow(ctx, 64, 118, 24, 7);
        // Body (flask shape)
        ctx.beginPath();
        ctx.moveTo(48, 30);
        ctx.lineTo(48, 45);
        ctx.bezierCurveTo(25, 55, 22, 80, 30, 100);
        ctx.bezierCurveTo(35, 112, 50, 118, 64, 118);
        ctx.bezierCurveTo(78, 118, 93, 112, 98, 100);
        ctx.bezierCurveTo(106, 80, 103, 55, 80, 45);
        ctx.lineTo(80, 30);
        ctx.closePath();
        const fGrad = ctx.createLinearGradient(30, 30, 98, 118);
        fGrad.addColorStop(0, '#c084fc');
        fGrad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = fGrad;
        ctx.fill();
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Cork
        roundRect(ctx, 45, 18, 38, 14, 4, '#d6d3d1', '#a8a29e', 2);
        // Liquid bubbles
        ctx.globalAlpha = 0.4;
        circle(ctx, 50, 90, 6, '#e9d5ff');
        circle(ctx, 70, 95, 4, '#e9d5ff');
        circle(ctx, 60, 82, 3, '#f3e8ff');
        ctx.globalAlpha = 1;
        // Face
        eyes(ctx, 50, 62, 72, 62, 8, 5);
        mouth(ctx, 62, 78, 9, 'smile', '#4c1d95');
        // Spray nozzle pointing right
        roundRect(ctx, 95, 55, 28, 10, 3, '#a78bfa', '#7c3aed', 2);
        // Particles
        circle(ctx, 126, 55, 3, '#e9d5ff');
        circle(ctx, 124, 64, 2, '#c4b5fd');
    },

    // ---- STREAM: Chorrito de agua con cara ----
    stream(ctx) {
        dropShadow(ctx, 58, 118, 22, 6);
        // Water drop body
        ctx.beginPath();
        ctx.moveTo(58, 15);
        ctx.bezierCurveTo(38, 35, 28, 55, 28, 75);
        ctx.bezierCurveTo(28, 100, 40, 115, 58, 115);
        ctx.bezierCurveTo(76, 115, 88, 100, 88, 75);
        ctx.bezierCurveTo(88, 55, 78, 35, 58, 15);
        ctx.closePath();
        const sGrad = ctx.createRadialGradient(58, 60, 5, 58, 75, 40);
        sGrad.addColorStop(0, '#93c5fd');
        sGrad.addColorStop(1, '#2563eb');
        ctx.fillStyle = sGrad;
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Highlight
        ctx.globalAlpha = 0.3;
        ellipse(ctx, 48, 50, 12, 18, '#fff');
        ctx.globalAlpha = 1;
        // Face
        eyes(ctx, 48, 60, 66, 60, 6, 4);
        mouth(ctx, 58, 72, 7, 'smile');
        // Water jet pointing right
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(88, 68);
        ctx.bezierCurveTo(100, 65, 110, 60, 125, 58);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#93c5fd';
        ctx.beginPath();
        ctx.moveTo(88, 74);
        ctx.bezierCurveTo(100, 72, 110, 68, 122, 65);
        ctx.stroke();
    },

    // ---- BURBUJA: Bola de burbujas con cara traviesa ----
    bubble(ctx) {
        dropShadow(ctx, 64, 116, 22, 6);
        // Main bubble body
        ctx.globalAlpha = 0.7;
        circle(ctx, 64, 65, 38, null, '#38bdf8', 3);
        const bGrad = ctx.createRadialGradient(50, 50, 5, 64, 65, 38);
        bGrad.addColorStop(0, '#e0f2fe');
        bGrad.addColorStop(0.5, '#bae6fd');
        bGrad.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(64, 65, 37, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Highlight arc
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(50, 45, 15, -0.8, 0.5);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Face
        eyes(ctx, 54, 58, 72, 58, 7, 4);
        mouth(ctx, 64, 72, 8, 'smile', '#0369a1');
        // Small bubbles floating around
        ctx.globalAlpha = 0.5;
        circle(ctx, 100, 40, 10, '#e0f2fe', '#7dd3fc', 1.5);
        circle(ctx, 110, 60, 7, '#e0f2fe', '#7dd3fc', 1);
        circle(ctx, 30, 35, 8, '#e0f2fe', '#7dd3fc', 1);
        circle(ctx, 95, 85, 5, '#e0f2fe', '#7dd3fc', 1);
        ctx.globalAlpha = 1;
    },

    // ---- VIENTO: Espiral de aire con cara ----
    wind(ctx) {
        dropShadow(ctx, 64, 116, 24, 6);
        // Swirl body
        const wGrad = ctx.createRadialGradient(60, 60, 8, 64, 65, 40);
        wGrad.addColorStop(0, '#e2e8f0');
        wGrad.addColorStop(1, '#94a3b8');
        circle(ctx, 64, 65, 36, wGrad, '#64748b', 2);
        // Wind swirl lines
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(64, 65, 20, 0, Math.PI * 1.4);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 65, 28, Math.PI * 0.5, Math.PI * 1.8);
        ctx.stroke();
        // Eyes (narrow, determined)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(52, 58, 8, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(74, 58, 8, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
        circle(ctx, 54, 58, 3.5, '#334155');
        circle(ctx, 76, 58, 3.5, '#334155');
        circle(ctx, 53, 57, 1.5, '#fff');
        circle(ctx, 75, 57, 1.5, '#fff');
        mouth(ctx, 64, 74, 8, 'smile', '#475569');
        // Wind gust to the right
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(95, 52 + i * 12);
            ctx.bezierCurveTo(105, 50 + i * 12, 115, 48 + i * 11, 125, 50 + i * 11);
            ctx.stroke();
        }
    },

    // ---- TIERRA: Montículo de tierra con cara ruda ----
    earth(ctx) {
        dropShadow(ctx, 64, 118, 30, 8);
        // Body (rocky blob)
        ctx.beginPath();
        ctx.moveTo(20, 110);
        ctx.lineTo(25, 70);
        ctx.bezierCurveTo(28, 50, 40, 30, 64, 25);
        ctx.bezierCurveTo(88, 30, 100, 50, 103, 70);
        ctx.lineTo(108, 110);
        ctx.closePath();
        const eGrad = ctx.createLinearGradient(20, 25, 108, 115);
        eGrad.addColorStop(0, '#a8a29e');
        eGrad.addColorStop(1, '#57534e');
        ctx.fillStyle = eGrad;
        ctx.fill();
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Rock texture
        ctx.fillStyle = '#78716c';
        circle(ctx, 45, 85, 8);
        circle(ctx, 80, 90, 6);
        circle(ctx, 60, 95, 5);
        // Eyes (tough look)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(50, 52, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(76, 52, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        circle(ctx, 52, 53, 4, '#44403c');
        circle(ctx, 78, 53, 4, '#44403c');
        // Angry brows
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, 42);
        ctx.lineTo(56, 45);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(88, 42);
        ctx.lineTo(72, 45);
        ctx.stroke();
        mouth(ctx, 64, 68, 10, 'grin', '#44403c');
        // Rock fist to the right
        roundRect(ctx, 96, 55, 25, 20, 6, '#78716c', '#44403c', 2);
    },

    // ---- CRISTAL: Gema mágica con cara ----
    crystal(ctx) {
        dropShadow(ctx, 64, 118, 22, 6);
        // Crystal body
        ctx.beginPath();
        ctx.moveTo(64, 10);
        ctx.lineTo(95, 50);
        ctx.lineTo(85, 110);
        ctx.lineTo(43, 110);
        ctx.lineTo(33, 50);
        ctx.closePath();
        const cGrad = ctx.createLinearGradient(33, 10, 95, 110);
        cGrad.addColorStop(0, '#c4b5fd');
        cGrad.addColorStop(0.5, '#a78bfa');
        cGrad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = cGrad;
        ctx.fill();
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Facets
        ctx.strokeStyle = '#ddd6fe';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(64, 10);
        ctx.lineTo(64, 110);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(33, 50);
        ctx.lineTo(95, 50);
        ctx.stroke();
        // Eyes
        eyes(ctx, 52, 62, 72, 62, 7, 4);
        mouth(ctx, 64, 78, 8, 'smile', '#4c1d95');
        // Glow particles to the right
        ctx.globalAlpha = 0.6;
        circle(ctx, 105, 50, 5, '#e9d5ff');
        circle(ctx, 115, 60, 3, '#c4b5fd');
        circle(ctx, 110, 40, 4, '#ddd6fe');
        ctx.globalAlpha = 1;
    },

    // ---- SOLAR: Sol con cara feliz ----
    solar(ctx) {
        dropShadow(ctx, 64, 118, 24, 6);
        // Rays
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(64 + Math.cos(angle) * 32, 64 + Math.sin(angle) * 32);
            ctx.lineTo(64 + Math.cos(angle) * 48, 64 + Math.sin(angle) * 48);
            ctx.stroke();
        }
        // Body (sun)
        const sGrad = ctx.createRadialGradient(58, 58, 5, 64, 64, 30);
        sGrad.addColorStop(0, '#fde68a');
        sGrad.addColorStop(1, '#f59e0b');
        circle(ctx, 64, 64, 30, sGrad, '#d97706', 3);
        // Face
        eyes(ctx, 54, 58, 72, 58, 7, 4);
        mouth(ctx, 64, 72, 9, 'grin', '#92400e');
        // Sunglasses tint (cool!)
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(54, 58, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(72, 58, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    },

    // ---- CORAL: Coral rosado vivo ----
    coral(ctx) {
        dropShadow(ctx, 64, 118, 24, 6);
        // Base/stem
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(64, 118);
        ctx.bezierCurveTo(58, 100, 50, 90, 50, 75);
        ctx.bezierCurveTo(50, 65, 55, 60, 64, 60);
        ctx.bezierCurveTo(73, 60, 78, 65, 78, 75);
        ctx.bezierCurveTo(78, 90, 70, 100, 64, 118);
        ctx.fill();
        // Branches
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(54, 72);
        ctx.bezierCurveTo(35, 55, 30, 35, 35, 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(74, 72);
        ctx.bezierCurveTo(93, 55, 98, 35, 93, 20);
        ctx.stroke();
        ctx.strokeStyle = '#f9a8d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(45, 58);
        ctx.bezierCurveTo(30, 50, 22, 42, 20, 32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(83, 58);
        ctx.bezierCurveTo(98, 50, 106, 42, 108, 32);
        ctx.stroke();
        // Tips
        circle(ctx, 35, 20, 7, '#fda4af');
        circle(ctx, 93, 20, 7, '#fda4af');
        circle(ctx, 20, 32, 5, '#fda4af');
        circle(ctx, 108, 32, 5, '#fda4af');
        // Face on center
        eyes(ctx, 56, 72, 72, 72, 5, 3);
        mouth(ctx, 64, 82, 6, 'smile', '#9d174d');
    },

    // ---- ESCUDO: Escudo con cara protectora ----
    shield(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Shield shape
        ctx.beginPath();
        ctx.moveTo(64, 10);
        ctx.bezierCurveTo(20, 20, 15, 45, 15, 60);
        ctx.bezierCurveTo(15, 90, 35, 110, 64, 120);
        ctx.bezierCurveTo(93, 110, 113, 90, 113, 60);
        ctx.bezierCurveTo(113, 45, 108, 20, 64, 10);
        ctx.closePath();
        const shGrad = ctx.createLinearGradient(15, 10, 113, 120);
        shGrad.addColorStop(0, '#60a5fa');
        shGrad.addColorStop(1, '#2563eb');
        ctx.fillStyle = shGrad;
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Inner decoration
        ctx.beginPath();
        ctx.moveTo(64, 30);
        ctx.bezierCurveTo(40, 38, 35, 52, 35, 62);
        ctx.bezierCurveTo(35, 82, 48, 96, 64, 104);
        ctx.bezierCurveTo(80, 96, 93, 82, 93, 62);
        ctx.bezierCurveTo(93, 52, 88, 38, 64, 30);
        ctx.closePath();
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Face
        eyes(ctx, 52, 58, 74, 58, 8, 5);
        mouth(ctx, 64, 76, 10, 'grin', '#1e3a5f');
        // Tough eyebrows
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(42, 46); ctx.lineTo(58, 50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(86, 46); ctx.lineTo(70, 50); ctx.stroke();
    },

    // ---- TORNADO: Embudo de viento con cara ----
    tornado(ctx) {
        dropShadow(ctx, 64, 118, 20, 6);
        // Funnel body (wide at top, narrow at bottom)
        const torGrad = ctx.createLinearGradient(24, 20, 104, 115);
        torGrad.addColorStop(0, '#cbd5e1');
        torGrad.addColorStop(1, '#64748b');
        ctx.beginPath();
        ctx.moveTo(24, 25);
        ctx.bezierCurveTo(24, 20, 104, 20, 104, 25);
        ctx.lineTo(75, 115);
        ctx.lineTo(53, 115);
        ctx.closePath();
        ctx.fillStyle = torGrad;
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Swirl lines
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const y = 35 + i * 20;
            const w = 38 - i * 7;
            ctx.beginPath();
            ctx.moveTo(64 - w, y);
            ctx.bezierCurveTo(64 - w + 5, y - 5, 64 + w - 5, y + 5, 64 + w, y);
            ctx.stroke();
        }
        // Eyes (wide at top area)
        eyes(ctx, 50, 42, 74, 42, 7, 4);
        mouth(ctx, 64, 58, 8, 'open', '#334155');
        // Wind projectile to right
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 35);
        ctx.bezierCurveTo(110, 30, 118, 28, 126, 30);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 45);
        ctx.bezierCurveTo(112, 42, 120, 38, 126, 38);
        ctx.stroke();
    },

    // ---- BALLENA: Ballena azul amigable ----
    whale(ctx) {
        dropShadow(ctx, 64, 116, 32, 7);
        // Body
        ctx.beginPath();
        ctx.ellipse(60, 68, 42, 32, 0, 0, Math.PI * 2);
        const wGrad = ctx.createLinearGradient(18, 36, 102, 100);
        wGrad.addColorStop(0, '#3b82f6');
        wGrad.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = wGrad;
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Belly
        ctx.globalAlpha = 0.3;
        ellipse(ctx, 55, 78, 28, 15, '#93c5fd');
        ctx.globalAlpha = 1;
        // Tail
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.moveTo(18, 60);
        ctx.bezierCurveTo(5, 40, 2, 35, 8, 30);
        ctx.bezierCurveTo(12, 35, 18, 50, 22, 60);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(18, 75);
        ctx.bezierCurveTo(5, 95, 2, 100, 8, 105);
        ctx.bezierCurveTo(12, 100, 18, 85, 22, 75);
        ctx.fill();
        // Eye
        circle(ctx, 82, 58, 8, '#fff');
        circle(ctx, 84, 58, 5, '#1e1b4b');
        circle(ctx, 83, 56, 2, '#fff');
        // Mouth
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(88, 72, 10, 0, 0.4 * Math.PI);
        ctx.stroke();
        // Water spout
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 58);
        ctx.bezierCurveTo(110, 52, 118, 48, 126, 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(100, 66);
        ctx.bezierCurveTo(112, 62, 120, 60, 126, 58);
        ctx.stroke();
    },

    // ---- CAÑÓN DOBLE: Robot-cañón con dos bocas ----
    dualcannon(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Base body
        roundRect(ctx, 28, 35, 52, 70, 10, '#475569', '#334155', 3);
        // Top cannon
        roundRect(ctx, 74, 38, 40, 14, 5, '#64748b', '#475569', 2);
        circle(ctx, 116, 45, 6, '#f59e0b', '#d97706', 1);
        // Bottom cannon
        roundRect(ctx, 74, 78, 40, 14, 5, '#64748b', '#475569', 2);
        circle(ctx, 116, 85, 6, '#f59e0b', '#d97706', 1);
        // Face plate
        roundRect(ctx, 32, 48, 44, 34, 5, '#1e293b');
        // Eyes (visor style)
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.ellipse(46, 60, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(66, 60, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Mouth (LED)
        roundRect(ctx, 46, 70, 16, 4, 2, '#22d3ee');
        // Treads at bottom
        roundRect(ctx, 30, 105, 48, 10, 4, '#334155', '#1e293b', 2);
    },

    // ---- INCINERADOR: Criatura de fuego con caldero ----
    incinerator(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Cauldron body
        ctx.beginPath();
        ctx.moveTo(28, 50);
        ctx.bezierCurveTo(20, 70, 22, 100, 35, 115);
        ctx.lineTo(93, 115);
        ctx.bezierCurveTo(106, 100, 108, 70, 100, 50);
        ctx.closePath();
        const iGrad = ctx.createLinearGradient(28, 50, 100, 115);
        iGrad.addColorStop(0, '#374151');
        iGrad.addColorStop(1, '#1f2937');
        ctx.fillStyle = iGrad;
        ctx.fill();
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Rim
        roundRect(ctx, 25, 45, 78, 10, 4, '#6b7280', '#4b5563', 2);
        // Fire on top
        ctx.beginPath();
        ctx.moveTo(44, 45);
        ctx.bezierCurveTo(44, 25, 54, 10, 64, 8);
        ctx.bezierCurveTo(74, 10, 84, 25, 84, 45);
        ctx.closePath();
        const fGrad = ctx.createLinearGradient(44, 8, 84, 45);
        fGrad.addColorStop(0, '#fbbf24');
        fGrad.addColorStop(0.5, '#f97316');
        fGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = fGrad;
        ctx.fill();
        // Inner flame
        ctx.beginPath();
        ctx.moveTo(52, 45);
        ctx.bezierCurveTo(52, 32, 58, 22, 64, 18);
        ctx.bezierCurveTo(70, 22, 76, 32, 76, 45);
        ctx.closePath();
        ctx.fillStyle = '#fde68a';
        ctx.fill();
        // Face on cauldron
        eyes(ctx, 48, 72, 72, 72, 7, 4);
        mouth(ctx, 62, 90, 10, 'evil', '#9ca3af');
        // Fire jet to the right
        ctx.beginPath();
        ctx.moveTo(100, 65);
        ctx.bezierCurveTo(110, 58, 118, 55, 126, 58);
        ctx.bezierCurveTo(118, 62, 112, 68, 100, 75);
        ctx.closePath();
        const fjG = ctx.createLinearGradient(100, 55, 126, 75);
        fjG.addColorStop(0, '#ef4444');
        fjG.addColorStop(1, '#fbbf24');
        ctx.fillStyle = fjG;
        ctx.fill();
    },

    // ---- CRIOMANTE: Cristal de hielo con cara mística ----
    cryomancer(ctx) {
        dropShadow(ctx, 64, 118, 22, 6);
        // Main ice crystal body
        ctx.beginPath();
        ctx.moveTo(64, 8);
        ctx.lineTo(92, 45);
        ctx.lineTo(85, 95);
        ctx.lineTo(64, 115);
        ctx.lineTo(43, 95);
        ctx.lineTo(36, 45);
        ctx.closePath();
        const icGrad = ctx.createLinearGradient(36, 8, 92, 115);
        icGrad.addColorStop(0, '#e0f2fe');
        icGrad.addColorStop(0.5, '#67e8f9');
        icGrad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = icGrad;
        ctx.fill();
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Internal fractures
        ctx.strokeStyle = '#a5f3fc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(64, 8);
        ctx.lineTo(64, 115);
        ctx.moveTo(36, 45);
        ctx.lineTo(92, 45);
        ctx.moveTo(43, 95);
        ctx.lineTo(85, 95);
        ctx.stroke();
        // Face
        eyes(ctx, 52, 58, 72, 58, 7, 4);
        mouth(ctx, 64, 76, 7, 'smile', '#164e63');
        // Ice spike to the right
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.moveTo(92, 50);
        ctx.lineTo(125, 44);
        ctx.lineTo(92, 55);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#a5f3fc';
        ctx.beginPath();
        ctx.moveTo(92, 60);
        ctx.lineTo(118, 58);
        ctx.lineTo(92, 65);
        ctx.closePath();
        ctx.fill();
        // Snowflake particles
        ctx.globalAlpha = 0.5;
        circle(ctx, 110, 35, 3, '#ecfeff');
        circle(ctx, 120, 55, 2, '#cffafe');
        ctx.globalAlpha = 1;
    },

    // ---- GENERADOR: Fábrica de monedas estilo PvZ ----
    generator(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Body (coin machine)
        roundRect(ctx, 28, 30, 72, 80, 12, '#eab308', '#ca8a04', 3);
        // Inner panel
        roundRect(ctx, 36, 42, 56, 50, 8, '#fbbf24', '#d97706', 2);
        // Dollar sign
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.textAlign = 'center';
        ctx.fillText('$', 64, 80);
        // Face
        eyes(ctx, 48, 50, 72, 50, 6, 3);
        // Coins floating out
        circle(ctx, 105, 30, 8, '#fbbf24', '#d97706', 2);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.fillText('$', 105, 34);
        circle(ctx, 115, 50, 6, '#fbbf24', '#d97706', 1.5);
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('$', 115, 53);
        // Slot
        roundRect(ctx, 48, 95, 32, 8, 3, '#854d0e');
    },

    // ---- MORTERO: Cañón de mortero con cara ----
    mortar(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Base platform
        roundRect(ctx, 25, 85, 78, 28, 8, '#374151', '#1f2937', 3);
        // Mortar tube
        ctx.save();
        ctx.translate(64, 85);
        ctx.rotate(-0.6);
        roundRect(ctx, -15, -65, 30, 65, 8, '#4b5563', '#374151', 2);
        ctx.restore();
        // Barrel opening
        ctx.save();
        ctx.translate(64, 85);
        ctx.rotate(-0.6);
        ellipse(ctx, 0, -65, 16, 10, '#6b7280', '#4b5563', 2);
        ctx.restore();
        // Crosshair on body
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        circle(ctx, 64, 95, 8, null, '#ef4444', 2);
        ctx.beginPath(); ctx.moveTo(64, 85); ctx.lineTo(64, 105); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(54, 95); ctx.lineTo(74, 95); ctx.stroke();
        // Eyes on tube
        eyes(ctx, 48, 48, 62, 42, 5, 3);
        // Bomb projectile
        circle(ctx, 110, 20, 10, '#1f2937', '#111827', 2);
        // Fuse
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(118, 14);
        ctx.bezierCurveTo(122, 8, 126, 6, 126, 10);
        ctx.stroke();
        circle(ctx, 126, 8, 3, '#fbbf24');
    },

    // ---- AMPLIFICADOR: Altavoz de agua con cara ----
    amplifier(ctx) {
        dropShadow(ctx, 55, 118, 24, 6);
        // Speaker body
        roundRect(ctx, 20, 30, 40, 70, 8, '#1e40af', '#1e3a5f', 3);
        // Speaker cone (expanding to the right)
        ctx.beginPath();
        ctx.moveTo(60, 30);
        ctx.lineTo(100, 15);
        ctx.lineTo(100, 115);
        ctx.lineTo(60, 100);
        ctx.closePath();
        const aGrad = ctx.createLinearGradient(60, 15, 100, 115);
        aGrad.addColorStop(0, '#3b82f6');
        aGrad.addColorStop(1, '#2563eb');
        ctx.fillStyle = aGrad;
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Sound waves to the right
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(100, 65, 15, -0.5 * Math.PI, 0.5 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(100, 65, 25, -0.4 * Math.PI, 0.4 * Math.PI);
        ctx.stroke();
        // Face
        eyes(ctx, 30, 55, 48, 55, 6, 3.5);
        mouth(ctx, 40, 70, 7, 'smile', '#fff');
    },

    // ---- MAGO ELÉCTRICO: Mago con sombrero y rayo ----
    wizard(ctx) {
        dropShadow(ctx, 64, 118, 24, 7);
        // Body (robe)
        ctx.beginPath();
        ctx.moveTo(38, 60);
        ctx.lineTo(30, 115);
        ctx.lineTo(98, 115);
        ctx.lineTo(90, 60);
        ctx.closePath();
        const wGrad = ctx.createLinearGradient(30, 60, 98, 115);
        wGrad.addColorStop(0, '#7c3aed');
        wGrad.addColorStop(1, '#5b21b6');
        ctx.fillStyle = wGrad;
        ctx.fill();
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Stars on robe
        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px sans-serif';
        ctx.fillText('★', 50, 88);
        ctx.fillText('★', 72, 95);
        ctx.fillText('★', 58, 105);
        // Head
        circle(ctx, 64, 50, 20, '#a78bfa', '#7c3aed', 2);
        // Hat
        ctx.beginPath();
        ctx.moveTo(64, 5);
        ctx.lineTo(42, 38);
        ctx.lineTo(86, 38);
        ctx.closePath();
        ctx.fillStyle = '#4c1d95';
        ctx.fill();
        // Star on hat
        ctx.fillStyle = '#fbbf24';
        ctx.font = '16px sans-serif';
        ctx.fillText('★', 57, 28);
        // Hat brim
        roundRect(ctx, 36, 36, 56, 8, 4, '#6d28d9');
        // Face
        eyes(ctx, 55, 48, 71, 48, 5, 3);
        mouth(ctx, 64, 58, 5, 'smile', '#4c1d95');
        // Lightning bolt to the right
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(95, 50);
        ctx.lineTo(110, 42);
        ctx.lineTo(106, 52);
        ctx.lineTo(125, 46);
        ctx.lineTo(108, 58);
        ctx.lineTo(112, 48);
        ctx.lineTo(95, 55);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();
    },

    // ---- NUTRIA: Nutria acuática simpática ----
    otter(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Body
        ellipse(ctx, 60, 80, 30, 28, '#92400e', '#78350f', 2);
        // Belly
        ellipse(ctx, 60, 85, 20, 18, '#d6d3d1');
        // Head
        circle(ctx, 64, 42, 24, '#a16207', '#854d0e', 2);
        // Ears
        circle(ctx, 42, 25, 8, '#92400e');
        circle(ctx, 42, 25, 5, '#d6d3d1');
        circle(ctx, 86, 25, 8, '#92400e');
        circle(ctx, 86, 25, 5, '#d6d3d1');
        // Face
        eyes(ctx, 54, 38, 72, 38, 6, 4);
        // Nose
        ellipse(ctx, 64, 48, 5, 3.5, '#1c1917');
        // Whiskers
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        for (let side = -1; side <= 1; side += 2) {
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(64 + side * 8, 48 + i * 3);
                ctx.lineTo(64 + side * 22, 45 + i * 5);
                ctx.stroke();
            }
        }
        // Cute smile
        mouth(ctx, 64, 54, 6, 'smile', '#78350f');
        // Arm with fish pointing right
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(92, 72, 14, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Fish
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.ellipse(112, 68, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(122, 68);
        ctx.lineTo(128, 62);
        ctx.lineTo(128, 74);
        ctx.closePath();
        ctx.fill();
        circle(ctx, 108, 66, 2, '#fff');
    },

    // ---- KRAKEN: Pulpo acuático poderoso ----
    kraken(ctx) {
        dropShadow(ctx, 64, 118, 30, 7);
        // Head
        ctx.beginPath();
        ctx.ellipse(64, 40, 32, 28, 0, 0, Math.PI * 2);
        const kGrad = ctx.createRadialGradient(58, 34, 5, 64, 40, 30);
        kGrad.addColorStop(0, '#a78bfa');
        kGrad.addColorStop(1, '#6d28d9');
        ctx.fillStyle = kGrad;
        ctx.fill();
        ctx.strokeStyle = '#5b21b6';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Tentacles
        const tentColors = ['#7c3aed', '#8b5cf6', '#6d28d9', '#7c3aed'];
        const startX = [34, 48, 72, 86];
        for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = tentColors[i];
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(startX[i], 62);
            ctx.bezierCurveTo(
                startX[i] + (i % 2 ? 8 : -8), 85,
                startX[i] + (i % 2 ? -5 : 5), 100,
                startX[i] + (i % 2 ? 10 : -10), 115
            );
            ctx.stroke();
            // Suction cups
            circle(ctx, startX[i] + (i % 2 ? 3 : -3), 80, 3, '#c4b5fd');
            circle(ctx, startX[i] + (i % 2 ? -2 : 2), 95, 2.5, '#c4b5fd');
        }
        // Eyes
        circle(ctx, 52, 38, 9, '#fff');
        circle(ctx, 76, 38, 9, '#fff');
        circle(ctx, 54, 38, 5, '#1e1b4b');
        circle(ctx, 78, 38, 5, '#1e1b4b');
        circle(ctx, 53, 36, 2, '#fff');
        circle(ctx, 77, 36, 2, '#fff');
        // Crown
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(40, 18);
        ctx.lineTo(44, 8);
        ctx.lineTo(52, 15);
        ctx.lineTo(58, 4);
        ctx.lineTo(64, 15);
        ctx.lineTo(70, 4);
        ctx.lineTo(76, 15);
        ctx.lineTo(84, 8);
        ctx.lineTo(88, 18);
        ctx.closePath();
        ctx.fill();
        // Tentacle attack to the right
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(96, 42);
        ctx.bezierCurveTo(108, 35, 118, 40, 125, 35);
        ctx.stroke();
        // Sucker on tip
        circle(ctx, 125, 35, 4, '#c4b5fd');
    },

    // ---- GÓLEM: Robot de roca/agua pesado ----
    golem(ctx) {
        dropShadow(ctx, 64, 118, 32, 8);
        // Body (bulky)
        roundRect(ctx, 28, 40, 72, 68, 10, '#57534e', '#44403c', 3);
        // Head
        roundRect(ctx, 35, 10, 58, 36, 8, '#78716c', '#57534e', 2);
        // Eyes (glowing)
        circle(ctx, 50, 28, 8, '#22d3ee');
        circle(ctx, 78, 28, 8, '#22d3ee');
        ctx.globalAlpha = 0.4;
        circle(ctx, 50, 28, 12, '#22d3ee');
        circle(ctx, 78, 28, 12, '#22d3ee');
        ctx.globalAlpha = 1;
        // Mouth slit
        roundRect(ctx, 50, 36, 28, 5, 2, '#44403c');
        // Arms
        roundRect(ctx, 4, 45, 28, 48, 8, '#78716c', '#57534e', 2);
        roundRect(ctx, 96, 45, 28, 48, 8, '#78716c', '#57534e', 2);
        // Fist detail
        roundRect(ctx, 100, 80, 22, 14, 5, '#6b7280', '#57534e', 2);
        // Crystal core in chest
        ctx.beginPath();
        ctx.moveTo(64, 50);
        ctx.lineTo(74, 65);
        ctx.lineTo(64, 80);
        ctx.lineTo(54, 65);
        ctx.closePath();
        ctx.fillStyle = '#22d3ee';
        ctx.fill();
        ctx.globalAlpha = 0.3;
        circle(ctx, 64, 65, 18, '#22d3ee');
        ctx.globalAlpha = 1;
        // Legs
        roundRect(ctx, 34, 105, 22, 14, 5, '#57534e', '#44403c', 2);
        roundRect(ctx, 72, 105, 22, 14, 5, '#57534e', '#44403c', 2);
    },

    // ---- ANTITANQUE DE ÁREA: Torreta roja de doble disparo ----
    antiTankArea(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Base
        roundRect(ctx, 28, 80, 72, 30, 8, '#1f2937', '#111827', 3);
        // Turret base
        circle(ctx, 64, 80, 22, '#374151', '#1f2937', 2);
        // Main barrel pointing right
        roundRect(ctx, 75, 52, 45, 14, 5, '#4b5563', '#374151', 2);
        roundRect(ctx, 75, 70, 45, 14, 5, '#4b5563', '#374151', 2);
        // Muzzle flashes
        circle(ctx, 122, 59, 5, '#ef4444');
        circle(ctx, 122, 77, 5, '#ef4444');
        ctx.globalAlpha = 0.3;
        circle(ctx, 122, 59, 10, '#fca5a5');
        circle(ctx, 122, 77, 10, '#fca5a5');
        ctx.globalAlpha = 1;
        // Turret head
        roundRect(ctx, 35, 38, 55, 45, 10, '#374151', '#1f2937', 2);
        // Face (targeting system)
        circle(ctx, 52, 55, 8, null, '#ef4444', 2);
        circle(ctx, 52, 55, 3, '#ef4444');
        circle(ctx, 72, 55, 8, null, '#ef4444', 2);
        circle(ctx, 72, 55, 3, '#ef4444');
        // Antenna
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(62, 38);
        ctx.lineTo(62, 22);
        ctx.stroke();
        circle(ctx, 62, 20, 4, '#ef4444');
        // Ammo belt
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 5; i++) {
            roundRect(ctx, 30 + i * 11, 95, 8, 12, 2, '#f59e0b', '#d97706', 1);
        }
    },

    // ---- DEFENSORES ESPECIALES DE game-page ----
    'water-shield'(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Gota con escudo
        ctx.beginPath();
        ctx.moveTo(60, 18);
        ctx.bezierCurveTo(38, 38, 28, 58, 28, 78);
        ctx.bezierCurveTo(28, 102, 42, 115, 60, 115);
        ctx.bezierCurveTo(78, 115, 92, 102, 92, 78);
        ctx.bezierCurveTo(92, 58, 82, 38, 60, 18);
        ctx.closePath();
        const wsG = ctx.createRadialGradient(55, 55, 5, 60, 70, 40);
        wsG.addColorStop(0, '#93c5fd');
        wsG.addColorStop(1, '#2563eb');
        ctx.fillStyle = wsG;
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Mini shield
        ctx.beginPath();
        ctx.moveTo(100, 40);
        ctx.bezierCurveTo(80, 48, 78, 60, 78, 68);
        ctx.bezierCurveTo(78, 85, 88, 98, 100, 105);
        ctx.bezierCurveTo(112, 98, 122, 85, 122, 68);
        ctx.bezierCurveTo(122, 60, 120, 48, 100, 40);
        ctx.closePath();
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Face
        eyes(ctx, 48, 62, 66, 62, 6, 4);
        mouth(ctx, 58, 78, 7, 'grin', '#1e3a5f');
    },

    'rain-cloud'(ctx) {
        dropShadow(ctx, 64, 118, 30, 6);
        // Cloud body
        circle(ctx, 50, 45, 24, '#cbd5e1');
        circle(ctx, 75, 40, 28, '#e2e8f0');
        circle(ctx, 95, 48, 20, '#cbd5e1');
        ellipse(ctx, 72, 58, 38, 15, '#d1d5db');
        // Face
        eyes(ctx, 55, 42, 78, 42, 7, 4);
        mouth(ctx, 68, 55, 8, 'smile', '#475569');
        // Rain drops
        ctx.fillStyle = '#3b82f6';
        const rainX = [45, 58, 72, 85, 95];
        const rainY = [80, 90, 85, 92, 82];
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(rainX[i], rainY[i] - 5);
            ctx.bezierCurveTo(rainX[i] - 3, rainY[i], rainX[i] - 3, rainY[i] + 5, rainX[i], rainY[i] + 8);
            ctx.bezierCurveTo(rainX[i] + 3, rainY[i] + 5, rainX[i] + 3, rainY[i], rainX[i], rainY[i] - 5);
            ctx.fill();
        }
    },

    'water-cannon'(ctx) {
        dropShadow(ctx, 60, 118, 28, 7);
        // Body base
        roundRect(ctx, 20, 42, 55, 55, 12, '#1e40af', '#1e3a5f', 3);
        // Barrel
        roundRect(ctx, 65, 52, 50, 20, 6, '#2563eb', '#1d4ed8', 2);
        // Nozzle
        roundRect(ctx, 108, 48, 18, 28, 5, '#3b82f6', '#2563eb', 2);
        // Water burst
        ctx.globalAlpha = 0.6;
        circle(ctx, 126, 62, 6, '#93c5fd');
        circle(ctx, 126, 62, 10, '#bfdbfe');
        ctx.globalAlpha = 1;
        // Tank detail
        roundRect(ctx, 25, 50, 44, 35, 6, '#1e3a5f');
        // Face
        eyes(ctx, 36, 60, 54, 60, 6, 4);
        mouth(ctx, 46, 74, 8, 'grin', '#fff');
        // Treads
        roundRect(ctx, 22, 97, 50, 10, 4, '#334155', '#1e293b', 2);
    },

    'ice-crystal'(ctx) {
        dropShadow(ctx, 64, 118, 22, 6);
        // Crystal body (hexagonal prism)
        ctx.beginPath();
        ctx.moveTo(64, 8);
        ctx.lineTo(96, 35);
        ctx.lineTo(96, 85);
        ctx.lineTo(64, 112);
        ctx.lineTo(32, 85);
        ctx.lineTo(32, 35);
        ctx.closePath();
        const icG = ctx.createLinearGradient(32, 8, 96, 112);
        icG.addColorStop(0, '#ecfeff');
        icG.addColorStop(0.3, '#67e8f9');
        icG.addColorStop(1, '#0891b2');
        ctx.fillStyle = icG;
        ctx.fill();
        ctx.strokeStyle = '#0e7490';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner glow
        ctx.globalAlpha = 0.3;
        circle(ctx, 64, 60, 20, '#ecfeff');
        ctx.globalAlpha = 1;
        // Face
        eyes(ctx, 52, 52, 72, 52, 7, 4);
        mouth(ctx, 64, 70, 8, 'smile', '#164e63');
        // Ice shards to right
        ctx.fillStyle = '#a5f3fc';
        ctx.beginPath();
        ctx.moveTo(96, 45); ctx.lineTo(118, 38); ctx.lineTo(96, 52); ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(96, 65); ctx.lineTo(114, 62); ctx.lineTo(96, 72); ctx.closePath();
        ctx.fill();
    },

    'wave-warrior'(ctx) {
        dropShadow(ctx, 64, 118, 30, 8);
        // Armored body
        ctx.beginPath();
        ctx.moveTo(40, 50);
        ctx.lineTo(30, 115);
        ctx.lineTo(98, 115);
        ctx.lineTo(88, 50);
        ctx.closePath();
        const wwG = ctx.createLinearGradient(30, 50, 98, 115);
        wwG.addColorStop(0, '#2563eb');
        wwG.addColorStop(1, '#1e40af');
        ctx.fillStyle = wwG;
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Helmet/head
        ctx.beginPath();
        ctx.arc(64, 38, 24, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        circle(ctx, 64, 42, 22, '#60a5fa', '#3b82f6', 2);
        // Visor
        roundRect(ctx, 44, 35, 40, 14, 5, '#1e3a5f');
        // Eyes (glowing through visor)
        circle(ctx, 54, 42, 5, '#93c5fd');
        circle(ctx, 74, 42, 5, '#93c5fd');
        ctx.globalAlpha = 0.3;
        circle(ctx, 54, 42, 8, '#93c5fd');
        circle(ctx, 74, 42, 8, '#93c5fd');
        ctx.globalAlpha = 1;
        // Wave crest on chest
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, 75);
        ctx.bezierCurveTo(50, 65, 60, 75, 70, 65);
        ctx.bezierCurveTo(80, 75, 90, 65, 90, 75);
        ctx.stroke();
        // Sword/lance to the right
        roundRect(ctx, 88, 55, 35, 8, 3, '#93c5fd', '#60a5fa', 2);
        ctx.beginPath();
        ctx.moveTo(123, 52); ctx.lineTo(128, 59); ctx.lineTo(123, 66); ctx.closePath();
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
    },

    'water-lily'(ctx) {
        dropShadow(ctx, 64, 116, 28, 6);
        // Lily pad
        ellipse(ctx, 64, 90, 36, 18, '#22c55e', '#15803d', 2);
        // Pad line
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(64, 72);
        ctx.lineTo(64, 108);
        ctx.stroke();
        // Stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(64, 72);
        ctx.bezierCurveTo(64, 60, 62, 50, 64, 42);
        ctx.stroke();
        // Flower
        const petalC = ['#f472b6', '#ec4899', '#f9a8d4', '#f472b6', '#ec4899'];
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            ctx.save();
            ctx.translate(64 + Math.cos(a) * 16, 35 + Math.sin(a) * 14);
            ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = petalC[i];
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        // Center
        circle(ctx, 64, 35, 10, '#fde68a', '#fbbf24', 2);
        // Face
        eyes(ctx, 60, 33, 68, 33, 4, 2.5);
        mouth(ctx, 64, 39, 4, 'smile', '#854d0e');
        // Coins floating
        circle(ctx, 100, 30, 6, '#fbbf24', '#d97706', 1);
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = '#854d0e';
        ctx.textAlign = 'center';
        ctx.fillText('$', 100, 33);
    },

    'coral-reef'(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Base rock
        ctx.beginPath();
        ctx.moveTo(20, 115);
        ctx.bezierCurveTo(18, 95, 25, 80, 40, 75);
        ctx.bezierCurveTo(55, 72, 73, 72, 88, 75);
        ctx.bezierCurveTo(103, 80, 110, 95, 108, 115);
        ctx.closePath();
        ctx.fillStyle = '#d4a574';
        ctx.fill();
        // Coral branches
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(50, 80);
        ctx.bezierCurveTo(48, 60, 42, 40, 38, 22);
        ctx.stroke();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(78, 78);
        ctx.bezierCurveTo(80, 55, 85, 35, 90, 18);
        ctx.stroke();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(64, 75);
        ctx.bezierCurveTo(64, 55, 60, 35, 64, 15);
        ctx.stroke();
        // Coral tips
        circle(ctx, 38, 22, 8, '#fcd34d');
        circle(ctx, 90, 18, 8, '#fcd34d');
        circle(ctx, 64, 15, 7, '#fde68a');
        // Face on center branch
        eyes(ctx, 58, 45, 70, 45, 5, 3);
        mouth(ctx, 64, 55, 5, 'smile', '#92400e');
        // Small fish
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(105, 55, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(113, 55); ctx.lineTo(120, 50); ctx.lineTo(120, 60); ctx.closePath();
        ctx.fill();
        circle(ctx, 102, 53, 1.5, '#fff');
    },

    'tsunami-giant'(ctx) {
        dropShadow(ctx, 64, 118, 32, 8);
        // Massive armored body
        roundRect(ctx, 22, 40, 84, 70, 10, '#334155', '#1e293b', 3);
        // Head
        roundRect(ctx, 30, 8, 68, 38, 10, '#475569', '#374151', 2);
        // Eyes (glowing red)
        circle(ctx, 50, 25, 8, '#ef4444');
        circle(ctx, 78, 25, 8, '#ef4444');
        ctx.globalAlpha = 0.3;
        circle(ctx, 50, 25, 14, '#ef4444');
        circle(ctx, 78, 25, 14, '#ef4444');
        ctx.globalAlpha = 1;
        // Jaw
        roundRect(ctx, 42, 34, 44, 8, 3, '#374151');
        ctx.fillStyle = '#9ca3af';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(46 + i * 7, 34, 3, 6);
        }
        // Arms
        roundRect(ctx, 2, 45, 24, 52, 8, '#475569', '#374151', 2);
        roundRect(ctx, 102, 45, 24, 52, 8, '#475569', '#374151', 2);
        // Fists
        roundRect(ctx, 106, 84, 20, 16, 6, '#6b7280', '#475569', 2);
        // Wave core in chest
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(35, 65);
        ctx.bezierCurveTo(48, 55, 58, 65, 68, 55);
        ctx.bezierCurveTo(78, 65, 88, 55, 93, 65);
        ctx.stroke();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(35, 75);
        ctx.bezierCurveTo(48, 65, 58, 75, 68, 65);
        ctx.bezierCurveTo(78, 75, 88, 65, 93, 75);
        ctx.stroke();
        // Legs
        roundRect(ctx, 28, 108, 30, 14, 5, '#475569', '#374151', 2);
        roundRect(ctx, 70, 108, 30, 14, 5, '#475569', '#374151', 2);
    },
};

// ─── CONTAMINANTES ───────────────────────────────────────────────────────────

const contaminantDrawers = {

    // ---- FÁBRICA: Edificio industrial malvado ----
    Fabrica(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Building body
        roundRect(ctx, 25, 40, 52, 72, 4, '#4b5563', '#374151', 3);
        // Chimneys
        roundRect(ctx, 80, 20, 14, 92, 3, '#6b7280', '#4b5563', 2);
        roundRect(ctx, 42, 10, 12, 32, 3, '#6b7280', '#4b5563', 2);
        // Smoke
        ctx.globalAlpha = 0.5;
        circle(ctx, 87, 12, 8, '#9ca3af');
        circle(ctx, 82, 5, 6, '#d1d5db');
        circle(ctx, 92, 2, 5, '#e5e7eb');
        circle(ctx, 48, 4, 6, '#9ca3af');
        circle(ctx, 44, -2, 5, '#d1d5db');
        ctx.globalAlpha = 1;
        // Window eyes
        roundRect(ctx, 32, 52, 16, 12, 3, '#fbbf24');
        roundRect(ctx, 54, 52, 16, 12, 3, '#fbbf24');
        circle(ctx, 38, 58, 3, '#1c1917');
        circle(ctx, 62, 58, 3, '#1c1917');
        // Angry mouth
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(38, 78);
        ctx.bezierCurveTo(45, 85, 55, 85, 62, 78);
        ctx.stroke();
        // Door
        roundRect(ctx, 42, 90, 18, 22, 3, '#374151');
    },

    // ---- PETRÓLEO: Barril de petróleo malvado ----
    Petroleo(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Barrel body
        ctx.beginPath();
        ctx.ellipse(64, 65, 32, 48, 0, 0, Math.PI * 2);
        const pGrad = ctx.createLinearGradient(32, 17, 96, 113);
        pGrad.addColorStop(0, '#292524');
        pGrad.addColorStop(0.5, '#1c1917');
        pGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Barrel rings
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 3;
        ellipse(ctx, 64, 35, 30, 6, null, '#57534e', 3);
        ellipse(ctx, 64, 95, 30, 6, null, '#57534e', 3);
        // Oil drip
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(88, 50);
        ctx.bezierCurveTo(92, 55, 95, 65, 92, 75);
        ctx.bezierCurveTo(90, 80, 86, 78, 86, 72);
        ctx.bezierCurveTo(86, 65, 88, 58, 88, 50);
        ctx.fill();
        // Label
        roundRect(ctx, 42, 55, 44, 22, 3, '#78716c');
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('OIL', 64, 70);
        // Evil eyes
        circle(ctx, 50, 42, 7, '#fbbf24');
        circle(ctx, 78, 42, 7, '#fbbf24');
        circle(ctx, 52, 42, 4, '#7c2d12');
        circle(ctx, 80, 42, 4, '#7c2d12');
    },

    // ---- NUCLEAR: Bicho radiactivo ----
    Nuclear(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Body (radioactive barrel)
        circle(ctx, 64, 64, 38, '#facc15', '#ca8a04', 3);
        // Radiation symbol
        circle(ctx, 64, 64, 10, '#1c1917');
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.moveTo(64, 64);
            ctx.arc(64, 64, 28, a - 0.35, a + 0.35);
            ctx.closePath();
            ctx.fill();
        }
        // Evil face over symbol
        circle(ctx, 50, 52, 8, '#fff');
        circle(ctx, 78, 52, 8, '#fff');
        circle(ctx, 52, 53, 5, '#1c1917');
        circle(ctx, 80, 53, 5, '#1c1917');
        circle(ctx, 51, 51, 2, '#fff');
        circle(ctx, 79, 51, 2, '#fff');
        // Snarl
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(64, 68, 12, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // Glow
        ctx.globalAlpha = 0.2;
        circle(ctx, 64, 64, 48, '#fde68a');
        ctx.globalAlpha = 1;
    },

    // ---- BASURA: Bote de basura malvado ----
    Basura(ctx) {
        dropShadow(ctx, 64, 118, 26, 7);
        // Trash can body
        ctx.beginPath();
        ctx.moveTo(35, 40);
        ctx.lineTo(38, 115);
        ctx.lineTo(90, 115);
        ctx.lineTo(93, 40);
        ctx.closePath();
        ctx.fillStyle = '#78716c';
        ctx.fill();
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Lid
        roundRect(ctx, 28, 30, 72, 14, 5, '#6b7280', '#57534e', 2);
        // Handle
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 30, 12, Math.PI, 0);
        ctx.stroke();
        // Trash poking out
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.moveTo(45, 32);
        ctx.bezierCurveTo(42, 18, 50, 8, 55, 12);
        ctx.bezierCurveTo(52, 22, 48, 28, 45, 32);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(75, 32);
        ctx.bezierCurveTo(78, 20, 72, 10, 80, 15);
        ctx.bezierCurveTo(82, 22, 78, 28, 75, 32);
        ctx.fill();
        // Face
        circle(ctx, 50, 60, 7, '#fbbf24');
        circle(ctx, 78, 60, 7, '#fbbf24');
        circle(ctx, 52, 60, 4, '#44403c');
        circle(ctx, 80, 60, 4, '#44403c');
        // Grumpy mouth
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(64, 82, 12, -0.7 * Math.PI, -0.3 * Math.PI);
        ctx.stroke();
        // Vertical lines
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 1.5;
        for (let x = 48; x <= 80; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, 50);
            ctx.lineTo(x, 108);
            ctx.stroke();
        }
    },

    // ---- AUTO: Coche contaminante ----
    Auto(ctx) {
        dropShadow(ctx, 64, 118, 34, 6);
        // Car body
        roundRect(ctx, 12, 52, 104, 38, 8, '#6b7280', '#4b5563', 3);
        // Roof
        roundRect(ctx, 28, 28, 72, 28, 6, '#9ca3af', '#6b7280', 2);
        // Windows
        roundRect(ctx, 34, 32, 26, 20, 4, '#bae6fd');
        roundRect(ctx, 66, 32, 26, 20, 4, '#bae6fd');
        // Wheels
        circle(ctx, 36, 92, 14, '#1c1917', '#44403c', 2);
        circle(ctx, 36, 92, 7, '#6b7280');
        circle(ctx, 92, 92, 14, '#1c1917', '#44403c', 2);
        circle(ctx, 92, 92, 7, '#6b7280');
        // Headlights
        roundRect(ctx, 108, 56, 12, 8, 3, '#fbbf24');
        // Face on windshield
        circle(ctx, 42, 42, 4, '#1c1917');
        circle(ctx, 54, 42, 4, '#1c1917');
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(48, 48, 5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Exhaust smoke (behind)
        ctx.globalAlpha = 0.4;
        circle(ctx, 6, 72, 6, '#6b7280');
        circle(ctx, -2, 65, 5, '#9ca3af');
        circle(ctx, -6, 74, 4, '#d1d5db');
        ctx.globalAlpha = 1;
    },

    // ---- QUÍMICO: Frasco químico tóxico ----
    Quimico(ctx) {
        dropShadow(ctx, 64, 118, 24, 7);
        // Flask neck
        roundRect(ctx, 50, 10, 28, 25, 4, '#9ca3af', '#6b7280', 2);
        // Flask body (expanding)
        ctx.beginPath();
        ctx.moveTo(50, 35);
        ctx.bezierCurveTo(25, 50, 22, 75, 28, 95);
        ctx.bezierCurveTo(32, 108, 48, 118, 64, 118);
        ctx.bezierCurveTo(80, 118, 96, 108, 100, 95);
        ctx.bezierCurveTo(106, 75, 103, 50, 78, 35);
        ctx.closePath();
        const qGrad = ctx.createLinearGradient(28, 35, 100, 118);
        qGrad.addColorStop(0, '#c084fc');
        qGrad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = qGrad;
        ctx.fill();
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Bubbles
        ctx.globalAlpha = 0.5;
        circle(ctx, 48, 90, 5, '#e9d5ff');
        circle(ctx, 72, 95, 4, '#ddd6fe');
        circle(ctx, 58, 100, 3, '#f3e8ff');
        circle(ctx, 80, 85, 3.5, '#e9d5ff');
        ctx.globalAlpha = 1;
        // Evil face
        circle(ctx, 48, 65, 8, '#fff');
        circle(ctx, 78, 65, 8, '#fff');
        circle(ctx, 50, 66, 5, '#4c1d95');
        circle(ctx, 80, 66, 5, '#4c1d95');
        // Angry brows
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(38, 55); ctx.lineTo(52, 58); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(90, 55); ctx.lineTo(76, 58); ctx.stroke();
        // Evil grin
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(64, 78, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Toxic drip
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(64, 118);
        ctx.bezierCurveTo(60, 122, 62, 126, 64, 126);
        ctx.bezierCurveTo(66, 126, 68, 122, 64, 118);
        ctx.fill();
    },

    // ---- FUEGO: Llama agresiva ----
    Fuego(ctx) {
        dropShadow(ctx, 64, 118, 26, 6);
        // Outer flame
        ctx.beginPath();
        ctx.moveTo(64, 6);
        ctx.bezierCurveTo(42, 20, 24, 45, 24, 72);
        ctx.bezierCurveTo(24, 100, 40, 118, 64, 118);
        ctx.bezierCurveTo(88, 118, 104, 100, 104, 72);
        ctx.bezierCurveTo(104, 45, 86, 20, 64, 6);
        ctx.closePath();
        const fGrad = ctx.createLinearGradient(24, 6, 104, 118);
        fGrad.addColorStop(0, '#fbbf24');
        fGrad.addColorStop(0.4, '#f97316');
        fGrad.addColorStop(1, '#dc2626');
        ctx.fillStyle = fGrad;
        ctx.fill();
        // Inner flame
        ctx.beginPath();
        ctx.moveTo(64, 25);
        ctx.bezierCurveTo(48, 40, 38, 58, 38, 78);
        ctx.bezierCurveTo(38, 102, 50, 115, 64, 115);
        ctx.bezierCurveTo(78, 115, 90, 102, 90, 78);
        ctx.bezierCurveTo(90, 58, 80, 40, 64, 25);
        ctx.closePath();
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        // Core
        ellipse(ctx, 64, 88, 14, 18, '#fef3c7');
        // Angry eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(50, 65, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(78, 65, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
        circle(ctx, 52, 66, 4.5, '#7c2d12');
        circle(ctx, 80, 66, 4.5, '#7c2d12');
        // Angry brows
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(38, 55); ctx.lineTo(54, 58); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(90, 55); ctx.lineTo(74, 58); ctx.stroke();
        mouth(ctx, 64, 82, 10, 'evil', '#7c2d12');
    },

    // ---- TÓXICO: Bola tóxica con cara siniestra ----
    Toxico(ctx) {
        dropShadow(ctx, 64, 118, 30, 7);
        // Body
        circle(ctx, 64, 64, 40, null);
        const tGrad = ctx.createRadialGradient(58, 55, 8, 64, 64, 40);
        tGrad.addColorStop(0, '#86efac');
        tGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = tGrad;
        ctx.fill();
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Skull & crossbones on forehead
        circle(ctx, 64, 38, 6, '#14532d');
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(52, 42); ctx.lineTo(76, 48); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(76, 42); ctx.lineTo(52, 48); ctx.stroke();
        // Eyes (big, menacing)
        circle(ctx, 48, 60, 10, '#1c1917');
        circle(ctx, 80, 60, 10, '#1c1917');
        circle(ctx, 50, 58, 4, '#4ade80');
        circle(ctx, 82, 58, 4, '#4ade80');
        // Drooling mouth
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 78, 14, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Drip
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(72, 88);
        ctx.bezierCurveTo(74, 95, 72, 102, 70, 102);
        ctx.bezierCurveTo(68, 102, 66, 95, 68, 88);
        ctx.fill();
        // Toxic fumes
        ctx.globalAlpha = 0.3;
        circle(ctx, 30, 35, 8, '#4ade80');
        circle(ctx, 98, 30, 6, '#86efac');
        circle(ctx, 22, 50, 5, '#86efac');
        ctx.globalAlpha = 1;
    },

    // ---- HURACÁN: Remolino amenazante ----
    Huracan(ctx) {
        dropShadow(ctx, 64, 118, 28, 6);
        // Outer swirl
        const hGrad = ctx.createRadialGradient(64, 64, 5, 64, 64, 45);
        hGrad.addColorStop(0, '#e2e8f0');
        hGrad.addColorStop(0.5, '#94a3b8');
        hGrad.addColorStop(1, '#475569');
        circle(ctx, 64, 64, 42, hGrad, '#334155', 3);
        // Swirl arms
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(64, 64, 30, 0, Math.PI * 1.2);
        ctx.stroke();
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(64, 64, 20, Math.PI, Math.PI * 2.2);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 64, 12, 0.5 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
        // Eye of the storm
        circle(ctx, 64, 64, 8, '#1e293b');
        // Face
        circle(ctx, 56, 58, 6, '#fff');
        circle(ctx, 72, 58, 6, '#fff');
        circle(ctx, 58, 59, 3.5, '#1e293b');
        circle(ctx, 74, 59, 3.5, '#1e293b');
        // Wide mouth
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(64, 72, 10, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // Debris around
        ctx.fillStyle = '#78716c';
        ctx.fillRect(20, 45, 8, 4);
        ctx.fillRect(100, 72, 6, 3);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(30, 90, 5, 5);
    },

    // ---- DEMONIO: Demonio acuático malvado ----
    Demonio(ctx) {
        dropShadow(ctx, 64, 118, 28, 7);
        // Body
        circle(ctx, 64, 68, 36, null);
        const dGrad = ctx.createRadialGradient(58, 60, 5, 64, 68, 36);
        dGrad.addColorStop(0, '#ef4444');
        dGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = dGrad;
        ctx.fill();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Horns
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(38, 40);
        ctx.lineTo(28, 10);
        ctx.lineTo(48, 35);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(90, 40);
        ctx.lineTo(100, 10);
        ctx.lineTo(80, 35);
        ctx.closePath();
        ctx.fill();
        // Eyes
        circle(ctx, 50, 60, 9, '#fbbf24');
        circle(ctx, 78, 60, 9, '#fbbf24');
        circle(ctx, 52, 61, 5, '#1c1917');
        circle(ctx, 80, 61, 5, '#1c1917');
        // Evil grin
        mouth(ctx, 64, 82, 14, 'evil', '#7f1d1d');
        // Tail
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(28, 75);
        ctx.bezierCurveTo(15, 80, 8, 90, 12, 100);
        ctx.stroke();
        // Arrow tail tip
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(12, 100);
        ctx.lineTo(5, 95);
        ctx.lineTo(8, 105);
        ctx.closePath();
        ctx.fill();
    },

    // ---- FANTASMA: Espectro flotante ----
    Fantasma(ctx) {
        // No shadow (floating!)
        // Ghost body
        ctx.beginPath();
        ctx.moveTo(64, 10);
        ctx.bezierCurveTo(30, 10, 20, 35, 20, 55);
        ctx.lineTo(20, 95);
        ctx.bezierCurveTo(20, 100, 28, 95, 32, 102);
        ctx.bezierCurveTo(36, 108, 40, 100, 44, 106);
        ctx.bezierCurveTo(48, 112, 52, 102, 56, 108);
        ctx.bezierCurveTo(60, 114, 64, 104, 68, 110);
        ctx.bezierCurveTo(72, 116, 76, 106, 80, 112);
        ctx.bezierCurveTo(84, 118, 88, 108, 92, 114);
        ctx.bezierCurveTo(96, 108, 100, 102, 108, 100);
        ctx.lineTo(108, 55);
        ctx.bezierCurveTo(108, 35, 98, 10, 64, 10);
        ctx.closePath();
        const gGrad = ctx.createLinearGradient(20, 10, 108, 114);
        gGrad.addColorStop(0, '#f1f5f9');
        gGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = gGrad;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
        // Eyes (hollow)
        circle(ctx, 48, 48, 10, '#1e293b');
        circle(ctx, 80, 48, 10, '#1e293b');
        circle(ctx, 50, 46, 3, '#64748b');
        circle(ctx, 82, 46, 3, '#64748b');
        // Open mouth
        ellipse(ctx, 64, 72, 10, 12, '#64748b');
    },

    // ---- TANQUE: Vehículo blindado pesado ----
    Tanque(ctx) {
        dropShadow(ctx, 64, 118, 38, 7);
        // Tracks
        roundRect(ctx, 8, 82, 112, 28, 10, '#1c1917', '#0c0a09', 2);
        // Track wheels
        for (let i = 0; i < 5; i++) {
            circle(ctx, 22 + i * 22, 96, 8, '#44403c', '#292524', 1.5);
            circle(ctx, 22 + i * 22, 96, 3, '#57534e');
        }
        // Hull
        roundRect(ctx, 15, 52, 98, 34, 6, '#4b5563', '#374151', 3);
        // Turret
        roundRect(ctx, 35, 28, 58, 28, 8, '#6b7280', '#4b5563', 2);
        // Barrel
        roundRect(ctx, 88, 36, 36, 10, 3, '#78716c', '#6b7280', 2);
        // Muzzle
        roundRect(ctx, 120, 33, 8, 16, 3, '#9ca3af', '#78716c', 1.5);
        // Eyes on turret
        circle(ctx, 50, 42, 7, '#ef4444');
        circle(ctx, 70, 42, 7, '#ef4444');
        circle(ctx, 50, 42, 3, '#1c1917');
        circle(ctx, 70, 42, 3, '#1c1917');
        ctx.globalAlpha = 0.3;
        circle(ctx, 50, 42, 10, '#ef4444');
        circle(ctx, 70, 42, 10, '#ef4444');
        ctx.globalAlpha = 1;
        // Star emblem
        ctx.fillStyle = '#ef4444';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 60, 72);
    },

    // ---- LEVIATÁN: Boss marino gigante ----
    Leviatan(ctx) {
        dropShadow(ctx, 64, 118, 36, 8);
        // Massive body
        ctx.beginPath();
        ctx.ellipse(64, 60, 44, 36, 0, 0, Math.PI * 2);
        const lGrad = ctx.createRadialGradient(55, 50, 5, 64, 60, 44);
        lGrad.addColorStop(0, '#7c3aed');
        lGrad.addColorStop(1, '#3b0764');
        ctx.fillStyle = lGrad;
        ctx.fill();
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Crown/spines
        ctx.fillStyle = '#581c87';
        const spineX = [34, 48, 64, 80, 94];
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(spineX[i] - 5, 30);
            ctx.lineTo(spineX[i], 10 + i * 2 - 4);
            ctx.lineTo(spineX[i] + 5, 30);
            ctx.closePath();
            ctx.fill();
        }
        // Belly
        ctx.globalAlpha = 0.3;
        ellipse(ctx, 64, 70, 32, 18, '#a78bfa');
        ctx.globalAlpha = 1;
        // Eyes (huge, glowing)
        circle(ctx, 44, 50, 12, '#fbbf24');
        circle(ctx, 84, 50, 12, '#fbbf24');
        circle(ctx, 46, 51, 7, '#1e1b4b');
        circle(ctx, 86, 51, 7, '#1e1b4b');
        circle(ctx, 45, 49, 3, '#fef3c7');
        circle(ctx, 85, 49, 3, '#fef3c7');
        // Snarl with teeth
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(64, 68, 18, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(64 + i * 7, 68);
            ctx.lineTo(64 + i * 7 - 2, 78);
            ctx.lineTo(64 + i * 7 + 2, 78);
            ctx.closePath();
            ctx.fill();
        }
        // Tentacles
        const tColors = ['#6d28d9', '#7c3aed', '#5b21b6', '#6d28d9'];
        const tX = [24, 42, 82, 100];
        for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = tColors[i];
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(tX[i], 88);
            ctx.bezierCurveTo(
                tX[i] + (i < 2 ? -8 : 8), 100,
                tX[i] + (i < 2 ? -4 : 4), 112,
                tX[i] + (i < 2 ? -12 : 12), 120
            );
            ctx.stroke();
        }
    },
};

// ─── GENERACIÓN ──────────────────────────────────────────────────────────────

const BASE_DIR = path.join(__dirname, 'models');

function generateAll() {
    console.log('\n🎨 Generando modelos PNG para Wacheck...\n');

    // Defenders
    console.log('── DEFENSORES ──');
    for (const [key, drawFn] of Object.entries(defenderDrawers)) {
        const { c, ctx } = newCanvas();
        drawFn(ctx);
        const dir = path.join(BASE_DIR, 'allDefenderTypes', key);
        savePNG(c, path.join(dir, `${key}.png`));
    }

    // Contaminants
    console.log('\n── CONTAMINANTES ──');
    for (const [key, drawFn] of Object.entries(contaminantDrawers)) {
        const { c, ctx } = newCanvas();
        drawFn(ctx);
        const dir = path.join(BASE_DIR, 'allContaminatorTypes', key);
        savePNG(c, path.join(dir, `${key}.png`));
    }

    // Summary
    const defCount = Object.keys(defenderDrawers).length;
    const contCount = Object.keys(contaminantDrawers).length;
    console.log(`\n✅ Generación completa: ${defCount} defensores + ${contCount} contaminantes = ${defCount + contCount} PNGs\n`);
}

generateAll();
