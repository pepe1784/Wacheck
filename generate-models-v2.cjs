// =============================================================================
// generate-models-v2.cjs — Genera PNGs DETALLADOS estilo PvZ para Wacheck
// 256x256 px, fondo transparente, sombreado multicapa, texturas
// Defensores miran a la DERECHA — Contaminantes miran a la IZQUIERDA
// =============================================================================
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 256;

// ─── UTILIDADES DE DIBUJO AVANZADAS ──────────────────────────────────────────

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

// ---- Geometría básica ----
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

// ---- Sombreado y Efectos ----
function dropShadow(ctx, cx, cy, rx, ry) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ellipse(ctx, cx, cy + 2, rx, ry, '#000');
    ctx.restore();
}

function innerGlow(ctx, cx, cy, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 0.3;
    const g = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    circle(ctx, cx, cy, r, g);
    ctx.restore();
}

function highlight(ctx, cx, cy, rx, ry, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 0.35;
    ellipse(ctx, cx, cy, rx, ry, '#fff');
    ctx.restore();
}

function bodyGrad(ctx, cx, cy, r, c1, c2, c3) {
    const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, c1);
    g.addColorStop(0.6, c2);
    g.addColorStop(1, c3 || c2);
    return g;
}

function linGrad(ctx, x1, y1, x2, y2, stops) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([pos, col]) => g.addColorStop(pos, col));
    return g;
}

// ---- Ojos detallados ----
// dir: 1 = mira derecha, -1 = mira izquierda
function detailEye(ctx, cx, cy, r, dir, irisColor, angry) {
    // Sombra del ojo
    ctx.save();
    ctx.globalAlpha = 0.15;
    ellipse(ctx, cx, cy + 2, r + 1, r + 1, '#000');
    ctx.restore();
    // Blanco
    const wg = ctx.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r);
    wg.addColorStop(0, '#ffffff');
    wg.addColorStop(1, '#e0e0e0');
    ellipse(ctx, cx, cy, r, r * (angry ? 0.8 : 1), wg, '#333', 2.5);
    // Iris
    const iR = r * 0.6;
    const px = cx + dir * r * 0.2;
    const ig = ctx.createRadialGradient(px - dir, cy - 1, iR * 0.15, px, cy, iR);
    ig.addColorStop(0, irisColor || '#3b82f6');
    ig.addColorStop(0.7, irisColor || '#2563eb');
    ig.addColorStop(1, '#1a1a3e');
    circle(ctx, px, cy, iR, ig, '#222', 1.5);
    // Pupila
    circle(ctx, px + dir * 1, cy, r * 0.28, '#0a0a1a');
    // Brillo grande
    ctx.save();
    ctx.globalAlpha = 0.9;
    circle(ctx, px - dir * 2, cy - r * 0.3, r * 0.18, '#fff');
    ctx.globalAlpha = 0.5;
    circle(ctx, px + dir * 1.5, cy + r * 0.2, r * 0.1, '#fff');
    ctx.restore();
    // Cejas si angry
    if (angry) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - r, cy - r * 1.1);
        ctx.lineTo(cx + r * 0.5 * dir, cy - r * 0.6);
        ctx.stroke();
    }
}

function eyePair(ctx, lx, ly, rx, ry, r, dir, irisColor, angry) {
    detailEye(ctx, lx, ly, r, dir || 1, irisColor, angry);
    detailEye(ctx, rx, ry, r, dir || 1, irisColor, angry);
}

// ---- Boca detallada ----
function detailMouth(ctx, x, y, w, type, color) {
    const c = color || '#1a1a2e';
    ctx.lineWidth = 3;
    if (type === 'smile') {
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.arc(x, y - 3, w, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
    } else if (type === 'grin') {
        // Boca abierta sonriente
        ctx.fillStyle = '#3a0a0a';
        ctx.beginPath();
        ctx.arc(x, y - 4, w, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.stroke();
        // Dientes superiores
        ctx.fillStyle = '#fff';
        const tw = w * 0.3;
        for (let i = -1; i <= 1; i++) {
            roundRect(ctx, x + i * tw - tw / 2 + 0.5, y - 5, tw - 1, tw * 0.7, 1, '#fff');
        }
    } else if (type === 'evil') {
        ctx.fillStyle = '#2a0000';
        ctx.beginPath();
        ctx.arc(x, y - 4, w, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Colmillos
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.7, y - 3);
        ctx.lineTo(x - w * 0.5, y + 6);
        ctx.lineTo(x - w * 0.3, y - 3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y - 3);
        ctx.lineTo(x + w * 0.5, y + 6);
        ctx.lineTo(x + w * 0.7, y - 3);
        ctx.fill();
    } else if (type === 'roar') {
        ctx.fillStyle = '#2a0000';
        ellipse(ctx, x, y, w, w * 0.65, '#2a0000', c, 2.5);
        // Colmillos grandes
        ctx.fillStyle = '#fff';
        const fangW = w * 0.22;
        [-0.65, -0.35, 0.35, 0.65].forEach(pos => {
            ctx.beginPath();
            ctx.moveTo(x + pos * w - fangW / 2, y - w * 0.3);
            ctx.lineTo(x + pos * w, y + w * 0.2);
            ctx.lineTo(x + pos * w + fangW / 2, y - w * 0.3);
            ctx.fill();
        });
    } else if (type === 'determined') {
        ctx.strokeStyle = c;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - w, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
    }
}

// ---- Texturas ----
function scaleTexture(ctx, cx, cy, w, h, rows, cols, color) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = color || '#000';
    ctx.lineWidth = 1;
    const sw = w / cols;
    const sh = h / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const sx = cx - w / 2 + c * sw + (r % 2 ? sw / 2 : 0);
            const sy = cy - h / 2 + r * sh;
            ctx.beginPath();
            ctx.arc(sx + sw / 2, sy + sh / 2, sw * 0.4, 0, Math.PI, false);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function rivetRow(ctx, x1, y1, x2, y2, count, r, color) {
    ctx.save();
    for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const rx = x1 + (x2 - x1) * t;
        const ry = y1 + (y2 - y1) * t;
        circle(ctx, rx, ry, r, color || '#888', '#555', 1);
        ctx.globalAlpha = 0.4;
        circle(ctx, rx - 0.5, ry - 0.5, r * 0.4, '#fff');
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

function metalPlate(ctx, x, y, w, h, r, baseColor, darkColor) {
    const g = linGrad(ctx, x, y, x, y + h, [
        [0, baseColor || '#8899aa'],
        [0.3, baseColor || '#99aabb'],
        [0.7, darkColor || '#667788'],
        [1, darkColor || '#556677']
    ]);
    roundRect(ctx, x, y, w, h, r || 6, g, '#444', 2);
    // Highlight superior
    ctx.save();
    ctx.globalAlpha = 0.2;
    roundRect(ctx, x + 2, y + 2, w - 4, h * 0.35, r || 5, '#fff');
    ctx.restore();
}

function cracksTexture(ctx, cx, cy, r, color, count) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = color || '#000';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < (count || 4); i++) {
        const a = Math.random() * Math.PI * 2;
        const len = r * (0.3 + Math.random() * 0.5);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let px = cx, py = cy;
        for (let j = 0; j < 3; j++) {
            const na = a + (Math.random() - 0.5) * 0.8;
            px += Math.cos(na) * len / 3;
            py += Math.sin(na) * len / 3;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    ctx.restore();
}

// ---- Partes de cuerpo reutilizables ----
function drawArm(ctx, x1, y1, x2, y2, thickness, color, outlineColor) {
    ctx.strokeStyle = outlineColor || '#333';
    ctx.lineWidth = thickness + 4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function drawLeg(ctx, x, y, h, thickness, color, outlineColor, footDir) {
    // Pierna
    ctx.strokeStyle = outlineColor || '#333';
    ctx.lineWidth = thickness + 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke();
    // Pie
    const fd = footDir || 1;
    ctx.fillStyle = outlineColor || '#333';
    ctx.beginPath();
    ctx.ellipse(x + fd * thickness * 0.3, y + h, thickness * 0.7, thickness * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + fd * thickness * 0.3, y + h - 1, thickness * 0.55, thickness * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawCannon(ctx, x, y, len, thickness, angle, baseColor, darkColor, muzzleColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    // Barrel outline
    roundRect(ctx, 0, -thickness / 2 - 2, len, thickness + 4, 3, darkColor || '#333');
    // Barrel
    const bg = linGrad(ctx, 0, -thickness / 2, 0, thickness / 2, [
        [0, baseColor || '#667'],
        [0.3, baseColor || '#889'],
        [0.7, darkColor || '#556'],
        [1, darkColor || '#445']
    ]);
    roundRect(ctx, 2, -thickness / 2, len - 2, thickness, 3, bg);
    // Rings
    for (let i = 0; i < 2; i++) {
        const rx = len * 0.3 + i * len * 0.35;
        roundRect(ctx, rx, -thickness / 2 - 3, 5, thickness + 6, 2, darkColor || '#444', '#333', 1);
    }
    // Muzzle glow
    if (muzzleColor) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        circle(ctx, len + 2, 0, thickness * 0.6, muzzleColor);
        ctx.globalAlpha = 0.8;
        circle(ctx, len + 2, 0, thickness * 0.3, '#fff');
        ctx.restore();
    }
    ctx.restore();
}

// ─── DEFENSORES (miran a la DERECHA) ─────────────────────────────────────────

const defenderDrawers = {

    // ==== FILTRO — Gota con cuerpo de filtro mecánico ====
    filter(ctx) {
        dropShadow(ctx, 128, 236, 50, 14);
        // Piernas cortas
        drawLeg(ctx, 100, 195, 30, 12, '#4488cc', '#1e40af', 1);
        drawLeg(ctx, 156, 195, 30, 12, '#4488cc', '#1e40af', 1);
        // Cuerpo gota
        ctx.beginPath();
        ctx.moveTo(128, 22);
        ctx.bezierCurveTo(88, 55, 52, 100, 52, 145);
        ctx.bezierCurveTo(52, 195, 80, 210, 128, 210);
        ctx.bezierCurveTo(176, 210, 204, 195, 204, 145);
        ctx.bezierCurveTo(204, 100, 168, 55, 128, 22);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 80, '#93c5fd', '#3b82f6', '#1d4ed8');
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Líneas de filtro en el vientre
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            ctx.globalAlpha = 0.3 + i * 0.05;
            ctx.beginPath();
            ctx.moveTo(70, 140 + i * 12);
            ctx.lineTo(186, 140 + i * 12);
            ctx.stroke();
        }
        ctx.restore();
        // Placa metálica frontal
        metalPlate(ctx, 85, 130, 86, 45, 8, '#7090b0', '#506880');
        rivetRow(ctx, 92, 138, 164, 138, 4, 3, '#aabbcc');
        rivetRow(ctx, 92, 168, 164, 168, 4, 3, '#aabbcc');
        // Highlight de brillo
        highlight(ctx, 108, 65, 25, 18, 0.3);
        // Ojos
        eyePair(ctx, 100, 90, 148, 90, 16, 1, '#3b82f6');
        // Boca
        detailMouth(ctx, 128, 118, 14, 'smile', '#1e3a5f');
        // Brazo con cañón de agua
        drawArm(ctx, 190, 140, 220, 130, 10, '#3b82f6', '#1e3a5f');
        drawCannon(ctx, 215, 125, 35, 14, -0.1, '#5588bb', '#334466', '#60a5fa');
    },

    // ==== PLANTA — Planta acuática con tallo y flor detallada ====
    plant(ctx) {
        dropShadow(ctx, 128, 238, 45, 12);
        // Tallo grueso
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(128, 240);
        ctx.bezierCurveTo(125, 200, 120, 170, 128, 140);
        ctx.stroke();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(128, 240);
        ctx.bezierCurveTo(125, 200, 120, 170, 128, 140);
        ctx.stroke();
        // Hojas laterales con detalle de nervadura
        const drawLeaf = (ox, oy, angle, size) => {
            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate(angle);
            const lg = linGrad(ctx, 0, -size, 0, size, [[0, '#4ade80'], [1, '#16a34a']]);
            ctx.fillStyle = lg;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(size * 0.8, -size * 0.5, size, -size * 0.1, size * 0.6, size * 0.3);
            ctx.bezierCurveTo(size * 0.3, size * 0.5, size * 0.1, size * 0.3, 0, 0);
            ctx.fill();
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Nervadura
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size * 0.5, size * 0.05);
            ctx.stroke();
            ctx.restore();
        };
        drawLeaf(105, 195, -0.6, 45);
        drawLeaf(150, 188, 0.4, 40);
        drawLeaf(95, 170, -0.9, 35);
        // Cabeza grande (bulbo floral)
        const hg = bodyGrad(ctx, 128, 80, 55, '#86efac', '#22c55e', '#15803d');
        circle(ctx, 128, 80, 55, hg, '#166534', 4);
        // Pétalos con gradientes individuales
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const px = 128 + Math.cos(a) * 42;
            const py = 80 + Math.sin(a) * 42;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(a + Math.PI / 2);
            const pg = linGrad(ctx, 0, -14, 0, 14, [[0, '#4ade80'], [0.5, '#22c55e'], [1, '#16a34a']]);
            ctx.fillStyle = pg;
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }
        // Cara sobre el centro del bulbo
        innerGlow(ctx, 128, 75, 35, '#4ade80', 0.2);
        eyePair(ctx, 112, 72, 144, 72, 13, 1, '#15803d');
        detailMouth(ctx, 128, 97, 12, 'grin', '#166534');
        // Disparo: semilla voladora a la derecha
        circle(ctx, 210, 70, 10, '#22c55e', '#166534', 2);
        circle(ctx, 230, 68, 7, '#4ade80', '#22c55e', 1.5);
    },

    // ==== RECICLADOR — Robot reciclador con engranajes ====
    recycler(ctx) {
        dropShadow(ctx, 128, 238, 48, 13);
        // Piernas robóticas
        drawLeg(ctx, 100, 190, 35, 14, '#38bdf8', '#0c4a6e', 1);
        drawLeg(ctx, 156, 190, 35, 14, '#38bdf8', '#0c4a6e', 1);
        // Cuerpo cuadrado con bordes redondeados
        const bg = linGrad(ctx, 65, 60, 65, 195, [[0, '#38bdf8'], [0.5, '#0ea5e9'], [1, '#0369a1']]);
        roundRect(ctx, 65, 60, 126, 135, 20, bg, '#0c4a6e', 5);
        // Panza — panel metálico con símbolo ♻
        metalPlate(ctx, 85, 100, 86, 60, 10, '#e0f2fe', '#bae6fd');
        ctx.fillStyle = '#0ea5e9';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♻', 128, 143);
        // Engranaje decorativo
        ctx.save();
        ctx.translate(78, 82);
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
            ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
            ctx.stroke();
        }
        circle(ctx, 0, 0, 8, '#7dd3fc', '#0369a1', 2);
        ctx.restore();
        // Cabeza/cúpula
        ctx.beginPath();
        ctx.arc(128, 60, 40, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 88, 20, 88, 60, [[0, '#7dd3fc'], [1, '#0ea5e9']]);
        ctx.fill();
        ctx.strokeStyle = '#0c4a6e';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Antena
        ctx.strokeStyle = '#0c4a6e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(128, 22);
        ctx.lineTo(128, 6);
        ctx.stroke();
        circle(ctx, 128, 4, 5, '#38bdf8', '#0c4a6e', 2);
        // Ojos tipo visor
        roundRect(ctx, 92, 42, 72, 28, 10, '#0c4a6e', null);
        eyePair(ctx, 108, 56, 148, 56, 11, 1, '#38bdf8');
        // Boca de panel LED
        roundRect(ctx, 108, 78, 40, 6, 3, '#7dd3fc');
        // Brazo derecho con pinza
        drawArm(ctx, 191, 110, 220, 95, 10, '#0ea5e9', '#0c4a6e');
        // Pinza
        ctx.strokeStyle = '#0c4a6e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(220, 90);
        ctx.lineTo(238, 80);
        ctx.moveTo(220, 100);
        ctx.lineTo(238, 105);
        ctx.stroke();
    },

    // ==== PURIFICADOR — Entidad mística de agua pura ====
    cleaner(ctx) {
        dropShadow(ctx, 128, 238, 50, 14);
        // Aura brillante
        ctx.save();
        ctx.globalAlpha = 0.12;
        for (let i = 3; i >= 0; i--) {
            circle(ctx, 128, 120, 80 + i * 15, `hsl(210, 80%, ${70 + i * 5}%)`);
        }
        ctx.restore();
        // Cuerpo etéreo
        ctx.beginPath();
        ctx.moveTo(128, 25);
        ctx.bezierCurveTo(68, 50, 48, 110, 55, 170);
        ctx.bezierCurveTo(60, 210, 90, 235, 128, 235);
        ctx.bezierCurveTo(166, 235, 196, 210, 201, 170);
        ctx.bezierCurveTo(208, 110, 188, 50, 128, 25);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 85, '#dbeafe', '#60a5fa', '#2563eb');
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Patrones internos de flujo de agua
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const yBase = 80 + i * 28;
            ctx.moveTo(75, yBase);
            ctx.bezierCurveTo(100, yBase - 10, 156, yBase + 10, 181, yBase);
            ctx.stroke();
        }
        ctx.restore();
        // Corona/halo de purificación
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(128, 28, 30, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // Ojos serenos
        eyePair(ctx, 105, 95, 150, 95, 16, 1, '#60a5fa');
        // Boca serena
        detailMouth(ctx, 128, 125, 12, 'smile', '#1e40af');
        // Manos levantadas con esferas de agua
        drawArm(ctx, 60, 130, 35, 100, 10, '#60a5fa', '#1e40af');
        circle(ctx, 30, 95, 14, bodyGrad(ctx, 30, 95, 14, '#bfdbfe', '#60a5fa', '#2563eb'), '#1e40af', 2);
        drawArm(ctx, 196, 130, 225, 100, 10, '#60a5fa', '#1e40af');
        circle(ctx, 230, 95, 14, bodyGrad(ctx, 230, 95, 14, '#bfdbfe', '#60a5fa', '#2563eb'), '#1e40af', 2);
        highlight(ctx, 112, 55, 22, 15, 0.25);
    },

    // ==== CHORRO — Boquilla de agua con presión ====
    stream(ctx) {
        dropShadow(ctx, 128, 236, 40, 11);
        drawLeg(ctx, 105, 190, 28, 11, '#60a5fa', '#1d4ed8', 1);
        drawLeg(ctx, 151, 190, 28, 11, '#60a5fa', '#1d4ed8', 1);
        // Cuerpo cilíndrico
        const bg = linGrad(ctx, 70, 50, 186, 50, [[0, '#93c5fd'], [0.5, '#3b82f6'], [1, '#1d4ed8']]);
        roundRect(ctx, 70, 50, 116, 150, 25, bg, '#1e3a5f', 4);
        // Bandas metálicas
        for (let i = 0; i < 3; i++) {
            metalPlate(ctx, 75, 70 + i * 48, 106, 10, 4, '#7090b0', '#506070');
        }
        // Cara
        eyePair(ctx, 105, 100, 148, 100, 13, 1, '#3b82f6');
        detailMouth(ctx, 128, 130, 10, 'determined', '#1e3a5f');
        // Boquilla grande apuntando a la derecha
        drawCannon(ctx, 186, 100, 50, 20, 0, '#5588bb', '#334466', '#60a5fa');
        // Chorro de agua saliendo
        ctx.save();
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 3; i++) {
            circle(ctx, 245 - i * 5, 100 + (i - 1) * 3, 4 - i, '#bfdbfe');
        }
        ctx.restore();
        highlight(ctx, 105, 65, 20, 14, 0.25);
    },

    // ==== BURBUJA — Criatura de burbujas que ralentiza ====
    bubble(ctx) {
        dropShadow(ctx, 128, 236, 42, 12);
        // Cuerpo esférico transparente
        const bg = bodyGrad(ctx, 128, 115, 65, 'rgba(147,197,253,0.7)', 'rgba(59,130,246,0.5)', 'rgba(30,64,175,0.4)');
        circle(ctx, 128, 115, 65, bg, '#3b82f6', 3);
        // Reflejos de burbuja
        highlight(ctx, 105, 80, 25, 20, 0.4);
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(128, 115, 60, 0, Math.PI * 2);
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        // Mini burbujas orbitando
        [{ x: 70, y: 80, r: 15 }, { x: 190, y: 95, r: 12 }, { x: 85, y: 160, r: 10 }, { x: 178, y: 155, r: 13 }].forEach(b => {
            circle(ctx, b.x, b.y, b.r, 'rgba(191,219,254,0.4)', '#93c5fd', 1.5);
            highlight(ctx, b.x - 3, b.y - 3, b.r * 0.35, b.r * 0.3, 0.5);
        });
        // Cara
        eyePair(ctx, 108, 105, 148, 105, 14, 1, '#60a5fa');
        detailMouth(ctx, 128, 135, 10, 'smile', '#2563eb');
        // Piernitas
        drawLeg(ctx, 108, 175, 22, 10, '#93c5fd', '#3b82f6', 1);
        drawLeg(ctx, 148, 175, 22, 10, '#93c5fd', '#3b82f6', 1);
    },

    // ==== VIENTO — Espíritu de aire con alas ====
    wind(ctx) {
        dropShadow(ctx, 128, 236, 44, 12);
        // Cuerpo etéreo de aire
        ctx.beginPath();
        ctx.moveTo(128, 30);
        ctx.bezierCurveTo(80, 50, 60, 90, 65, 150);
        ctx.bezierCurveTo(68, 195, 95, 218, 128, 218);
        ctx.bezierCurveTo(161, 218, 188, 195, 191, 150);
        ctx.bezierCurveTo(196, 90, 176, 50, 128, 30);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 75, '#e0f2fe', '#7dd3fc', '#0ea5e9');
        ctx.fill();
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        // Líneas de viento internas
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(80, 80 + i * 30);
            ctx.bezierCurveTo(110, 75 + i * 30, 150, 85 + i * 30, 180, 80 + i * 30);
            ctx.stroke();
        }
        ctx.restore();
        // Alas translúcidas
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#bae6fd';
        // Ala izq
        ctx.beginPath();
        ctx.moveTo(65, 100);
        ctx.bezierCurveTo(20, 70, 10, 120, 50, 150);
        ctx.closePath();
        ctx.fill();
        // Ala der
        ctx.beginPath();
        ctx.moveTo(191, 100);
        ctx.bezierCurveTo(236, 70, 246, 120, 206, 150);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Ojos
        eyePair(ctx, 108, 100, 148, 100, 14, 1, '#0ea5e9');
        detailMouth(ctx, 128, 135, 10, 'smile', '#0369a1');
        // Ráfaga de empuje
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(200 + i * 12, 95 + i * 3);
            ctx.lineTo(230 + i * 12, 100);
            ctx.stroke();
        }
        ctx.restore();
        highlight(ctx, 108, 55, 20, 14, 0.3);
    },

    // ==== TIERRA — Golem de tierra con grietas ====
    earth(ctx) {
        dropShadow(ctx, 128, 236, 50, 14);
        drawLeg(ctx, 98, 195, 30, 16, '#92400e', '#451a03', 1);
        drawLeg(ctx, 158, 195, 30, 16, '#92400e', '#451a03', 1);
        // Cuerpo rocoso
        ctx.beginPath();
        ctx.moveTo(128, 25);
        ctx.bezierCurveTo(75, 40, 48, 80, 52, 140);
        ctx.bezierCurveTo(55, 195, 85, 215, 128, 215);
        ctx.bezierCurveTo(171, 215, 201, 195, 204, 140);
        ctx.bezierCurveTo(208, 80, 181, 40, 128, 25);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 85, '#d97706', '#92400e', '#78350f');
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Grietas en el cuerpo
        cracksTexture(ctx, 110, 140, 50, '#451a03', 6);
        // Piedras decorativas
        circle(ctx, 90, 160, 12, '#b45309', '#78350f', 2);
        circle(ctx, 155, 170, 10, '#a16207', '#78350f', 2);
        circle(ctx, 120, 185, 8, '#b45309', '#78350f', 1.5);
        // Ojos duros
        eyePair(ctx, 105, 85, 150, 85, 14, 1, '#f59e0b');
        detailMouth(ctx, 128, 115, 14, 'determined', '#451a03');
        // Brazo con puño rocoso
        drawArm(ctx, 195, 130, 230, 110, 14, '#92400e', '#451a03');
        circle(ctx, 235, 108, 14, bodyGrad(ctx, 235, 108, 14, '#d97706', '#92400e'), '#451a03', 3);
        highlight(ctx, 108, 50, 22, 15, 0.15);
    },

    // ==== CRISTAL — Cristal purificador prismático ====
    crystal(ctx) {
        dropShadow(ctx, 128, 236, 40, 11);
        // Aura de energía
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 3; i++) circle(ctx, 128, 120, 80 + i * 12, '#a78bfa');
        ctx.restore();
        // Cristal principal (hexagonal)
        ctx.beginPath();
        ctx.moveTo(128, 18);
        ctx.lineTo(180, 55);
        ctx.lineTo(185, 145);
        ctx.lineTo(158, 225);
        ctx.lineTo(98, 225);
        ctx.lineTo(71, 145);
        ctx.lineTo(76, 55);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 76, 18, 185, 225, [[0, '#c4b5fd'], [0.3, '#8b5cf6'], [0.7, '#6d28d9'], [1, '#4c1d95']]);
        ctx.fill();
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Facetas internas
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#ddd6fe';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(128, 18); ctx.lineTo(128, 225);
        ctx.moveTo(76, 55); ctx.lineTo(185, 145);
        ctx.moveTo(71, 145); ctx.lineTo(180, 55);
        ctx.stroke();
        ctx.restore();
        // Brillo intenso
        highlight(ctx, 105, 60, 20, 30, 0.35);
        // Ojos dentro del cristal
        eyePair(ctx, 108, 100, 148, 100, 13, 1, '#8b5cf6');
        detailMouth(ctx, 128, 130, 10, 'determined', '#4c1d95');
        // Destellos
        ctx.save();
        ctx.globalAlpha = 0.7;
        [{ x: 90, y: 45, s: 6 }, { x: 170, y: 70, s: 4 }, { x: 95, y: 180, s: 5 }, { x: 165, y: 195, s: 3 }].forEach(sp => {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sp.x - sp.s, sp.y); ctx.lineTo(sp.x + sp.s, sp.y);
            ctx.moveTo(sp.x, sp.y - sp.s); ctx.lineTo(sp.x, sp.y + sp.s);
            ctx.stroke();
        });
        ctx.restore();
    },

    // ==== SOLAR — Panel solar con brazos de energía ====
    solar(ctx) {
        dropShadow(ctx, 128, 236, 50, 14);
        drawLeg(ctx, 100, 195, 30, 12, '#eab308', '#713f12', 1);
        drawLeg(ctx, 156, 195, 30, 12, '#eab308', '#713f12', 1);
        // Cuerpo panel solar
        const panelG = linGrad(ctx, 60, 45, 196, 200, [[0, '#1e3a5f'], [0.5, '#1e40af'], [1, '#172554']]);
        roundRect(ctx, 60, 45, 136, 155, 14, panelG, '#0f172a', 4);
        // Celdas solares
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 2; c++) {
                const cx = 80 + c * 54, cy = 65 + r * 44;
                roundRect(ctx, cx, cy, 44, 36, 4, linGrad(ctx, cx, cy, cx, cy + 36, [[0, '#3b82f6'], [0.5, '#2563eb'], [1, '#1d4ed8']]), '#93c5fd', 1);
            }
        }
        // Rayos solares detrás
        ctx.save();
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(128 + Math.cos(a) * 70, 120 + Math.sin(a) * 70);
            ctx.lineTo(128 + Math.cos(a) * 100, 120 + Math.sin(a) * 100);
            ctx.stroke();
        }
        ctx.restore();
        // Cara en panel central
        eyePair(ctx, 105, 108, 150, 108, 12, 1, '#fbbf24');
        detailMouth(ctx, 128, 138, 10, 'grin', '#1e3a5f');
        // Disparo solar
        ctx.save();
        ctx.globalAlpha = 0.6;
        circle(ctx, 220, 100, 16, bodyGrad(ctx, 220, 100, 16, '#fef08a', '#fbbf24', '#f59e0b'), '#d97706', 2);
        circle(ctx, 220, 100, 8, '#fff');
        ctx.restore();
        highlight(ctx, 100, 55, 20, 12, 0.15);
    },

    // ==== CORAL — Coral viviente con aura protectora ====
    coral(ctx) {
        dropShadow(ctx, 128, 238, 50, 14);
        // Base rocosa
        ctx.beginPath();
        ctx.moveTo(50, 230);
        ctx.bezierCurveTo(50, 200, 70, 180, 128, 175);
        ctx.bezierCurveTo(186, 180, 206, 200, 206, 230);
        ctx.closePath();
        ctx.fillStyle = '#92400e';
        ctx.fill();
        // Ramas de coral
        const drawBranch = (x, y, h, w, color) => {
            const g = linGrad(ctx, x, y, x, y - h, [[0, color], [1, '#fda4af']]);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x - w, y);
            ctx.bezierCurveTo(x - w - 3, y - h * 0.5, x - w * 0.5, y - h, x, y - h);
            ctx.bezierCurveTo(x + w * 0.5, y - h, x + w + 3, y - h * 0.5, x + w, y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#9f1239';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Protuberancias
            for (let i = 0; i < 3; i++) {
                circle(ctx, x + (i - 1) * w * 0.6, y - h + 5, w * 0.35, color, '#9f1239', 1.5);
            }
        };
        drawBranch(90, 185, 90, 22, '#fb7185');
        drawBranch(128, 180, 115, 28, '#f43f5e');
        drawBranch(170, 185, 85, 20, '#fb7185');
        drawBranch(60, 200, 60, 16, '#fda4af');
        drawBranch(196, 200, 55, 15, '#fda4af');
        // Cara en rama central
        eyePair(ctx, 112, 85, 144, 85, 12, 1, '#f43f5e');
        detailMouth(ctx, 128, 108, 10, 'smile', '#9f1239');
        // Aura protectora
        ctx.save();
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 3; i++) {
            circle(ctx, 128, 130, 85 + i * 12, '#fda4af');
        }
        ctx.restore();
    },

    // ==== ESCUDO — Tanque pesado con escudo enorme ====
    shield(ctx) {
        dropShadow(ctx, 128, 238, 55, 15);
        drawLeg(ctx, 95, 195, 32, 16, '#60a5fa', '#1e40af', 1);
        drawLeg(ctx, 161, 195, 32, 16, '#60a5fa', '#1e40af', 1);
        // Escudo grande al frente
        ctx.beginPath();
        ctx.moveTo(70, 30);
        ctx.lineTo(190, 30);
        ctx.bezierCurveTo(210, 30, 215, 50, 215, 80);
        ctx.lineTo(215, 180);
        ctx.bezierCurveTo(215, 215, 180, 230, 130, 230);
        ctx.bezierCurveTo(80, 230, 45, 215, 45, 180);
        ctx.lineTo(45, 80);
        ctx.bezierCurveTo(45, 50, 50, 30, 70, 30);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 45, 30, 215, 230, [[0, '#93c5fd'], [0.3, '#3b82f6'], [0.7, '#1d4ed8'], [1, '#1e40af']]);
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Borde metálico
        rivetRow(ctx, 60, 40, 200, 40, 6, 4, '#93c5fd');
        rivetRow(ctx, 55, 210, 205, 210, 6, 4, '#93c5fd');
        // Emblema central
        circle(ctx, 130, 125, 35, linGrad(ctx, 95, 90, 165, 160, [[0, '#bfdbfe'], [1, '#60a5fa']]), '#1e40af', 3);
        // Cruz/símbolo
        ctx.fillStyle = '#1e40af';
        roundRect(ctx, 122, 100, 16, 50, 4, '#1e40af');
        roundRect(ctx, 106, 117, 48, 16, 4, '#1e40af');
        // Cara detrás del escudo (ojos asomando arriba)
        eyePair(ctx, 108, 60, 152, 60, 14, 1, '#3b82f6');
        highlight(ctx, 100, 45, 30, 18, 0.25);
    },

    // ==== TORNADO — Torbellino poderoso ====
    tornado(ctx) {
        dropShadow(ctx, 128, 238, 40, 10);
        // Cuerpo en espiral
        const layers = [
            { y: 210, w: 70, h: 35, c: '#0369a1' },
            { y: 175, w: 60, h: 30, c: '#0284c7' },
            { y: 145, w: 50, h: 28, c: '#0ea5e9' },
            { y: 115, w: 42, h: 25, c: '#38bdf8' },
            { y: 88, w: 35, h: 22, c: '#7dd3fc' },
            { y: 65, w: 28, h: 20, c: '#bae6fd' },
        ];
        layers.forEach(l => {
            ellipse(ctx, 128, l.y, l.w, l.h, l.c, '#075985', 3);
            highlight(ctx, 128 - l.w * 0.3, l.y - l.h * 0.3, l.w * 0.4, l.h * 0.3, 0.2);
        });
        // Ojos en capa superior
        eyePair(ctx, 112, 62, 144, 62, 11, 1, '#0ea5e9');
        detailMouth(ctx, 128, 80, 8, 'roar', '#075985');
        // Partículas volando
        ctx.save();
        ctx.globalAlpha = 0.4;
        [{ x: 55, y: 130, r: 6 }, { x: 200, y: 150, r: 5 }, { x: 48, y: 185, r: 7 }, { x: 210, y: 100, r: 4 }].forEach(p => {
            circle(ctx, p.x, p.y, p.r, '#bae6fd', '#0ea5e9', 1);
        });
        ctx.restore();
        // Relámpago
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(128, 42);
        ctx.lineTo(118, 28);
        ctx.lineTo(132, 22);
        ctx.lineTo(122, 8);
        ctx.stroke();
    },

    // ==== BALLENA — Gran ballena defensora ====
    whale(ctx) {
        dropShadow(ctx, 128, 236, 60, 14);
        // Cuerpo masivo
        ctx.beginPath();
        ctx.moveTo(20, 130);
        ctx.bezierCurveTo(20, 70, 60, 35, 128, 35);
        ctx.bezierCurveTo(190, 35, 230, 70, 238, 120);
        ctx.bezierCurveTo(242, 160, 230, 200, 175, 210);
        ctx.lineTo(85, 210);
        ctx.bezierCurveTo(30, 200, 18, 165, 20, 130);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 100, '#60a5fa', '#2563eb', '#1d4ed8');
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Vientre blanco
        ctx.beginPath();
        ctx.moveTo(55, 145);
        ctx.bezierCurveTo(60, 195, 190, 200, 200, 145);
        ctx.bezierCurveTo(190, 175, 70, 180, 55, 145);
        ctx.closePath();
        ctx.fillStyle = '#dbeafe';
        ctx.fill();
        // Cola
        ctx.beginPath();
        ctx.moveTo(20, 130);
        ctx.bezierCurveTo(-5, 100, -15, 60, 8, 45);
        ctx.bezierCurveTo(15, 75, 18, 100, 20, 130);
        ctx.closePath();
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Ojo grande
        detailEye(ctx, 190, 95, 18, 1, '#3b82f6');
        // Boca
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(200, 140);
        ctx.bezierCurveTo(225, 145, 240, 135, 245, 125);
        ctx.stroke();
        // Chorro de agua
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(160, 38);
        ctx.bezierCurveTo(160, 15, 170, 8, 180, 15);
        ctx.bezierCurveTo(175, 5, 185, 0, 190, 8);
        ctx.stroke();
        ctx.restore();
        // Aleta
        ctx.beginPath();
        ctx.moveTo(130, 55);
        ctx.lineTo(115, 20);
        ctx.lineTo(145, 50);
        ctx.closePath();
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 2;
        ctx.stroke();
        highlight(ctx, 170, 60, 25, 18, 0.2);
    },

    // ==== CAÑÓN DOBLE ====
    dualcannon(ctx) {
        dropShadow(ctx, 128, 238, 48, 13);
        drawLeg(ctx, 100, 195, 30, 13, '#475569', '#1e293b', 1);
        drawLeg(ctx, 156, 195, 30, 13, '#475569', '#1e293b', 1);
        // Cuerpo blindado
        roundRect(ctx, 62, 55, 132, 145, 22, linGrad(ctx, 62, 55, 194, 200, [[0, '#64748b'], [0.5, '#475569'], [1, '#334155']]), '#1e293b', 5);
        // Panel frontal
        metalPlate(ctx, 78, 80, 100, 90, 10, '#94a3b8', '#64748b');
        rivetRow(ctx, 86, 90, 170, 90, 4, 3.5, '#cbd5e1');
        rivetRow(ctx, 86, 160, 170, 160, 4, 3.5, '#cbd5e1');
        // Cara mecánica
        roundRect(ctx, 90, 100, 76, 40, 8, '#1e293b');
        eyePair(ctx, 108, 120, 150, 120, 12, 1, '#f59e0b');
        detailMouth(ctx, 128, 150, 10, 'determined', '#94a3b8');
        // Dos cañones
        drawCannon(ctx, 185, 95, 55, 16, -0.15, '#64748b', '#334155', '#f59e0b');
        drawCannon(ctx, 185, 135, 55, 16, 0.15, '#64748b', '#334155', '#f59e0b');
        highlight(ctx, 100, 65, 22, 14, 0.15);
    },

    // ==== INCINERADOR — Lanzallamas acuático ====
    incinerator(ctx) {
        dropShadow(ctx, 128, 238, 48, 13);
        drawLeg(ctx, 100, 195, 30, 13, '#dc2626', '#7f1d1d', 1);
        drawLeg(ctx, 156, 195, 30, 13, '#dc2626', '#7f1d1d', 1);
        // Cuerpo
        roundRect(ctx, 62, 50, 132, 150, 25, bodyGrad(ctx, 128, 125, 70, '#ef4444', '#dc2626', '#991b1b'), '#7f1d1d', 5);
        // Símbolo de fuego
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(128, 85);
        ctx.bezierCurveTo(115, 100, 100, 120, 108, 145);
        ctx.bezierCurveTo(112, 158, 124, 165, 128, 155);
        ctx.bezierCurveTo(132, 165, 144, 158, 148, 145);
        ctx.bezierCurveTo(156, 120, 141, 100, 128, 85);
        ctx.fill();
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(128, 110);
        ctx.bezierCurveTo(122, 120, 118, 135, 124, 145);
        ctx.bezierCurveTo(126, 148, 130, 148, 132, 145);
        ctx.bezierCurveTo(138, 135, 134, 120, 128, 110);
        ctx.fill();
        ctx.restore();
        // Cara encima del fuego
        eyePair(ctx, 105, 68, 150, 68, 13, 1, '#f59e0b', true);
        // Cañón lanzallamas
        drawCannon(ctx, 185, 100, 50, 20, 0, '#991b1b', '#7f1d1d');
        // Llamas saliendo
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(235, 88);
        ctx.bezierCurveTo(248, 85, 255, 95, 250, 100);
        ctx.bezierCurveTo(255, 105, 248, 115, 235, 112);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#fbbf24';
        circle(ctx, 240, 100, 6, '#fbbf24');
        ctx.restore();
        highlight(ctx, 100, 56, 20, 12, 0.15);
    },

    // ==== CRIOMANTE — Mago de hielo ====
    cryomancer(ctx) {
        dropShadow(ctx, 128, 238, 45, 12);
        // Capa/manto flotante
        ctx.beginPath();
        ctx.moveTo(70, 80);
        ctx.bezierCurveTo(55, 130, 50, 200, 75, 235);
        ctx.lineTo(181, 235);
        ctx.bezierCurveTo(206, 200, 201, 130, 186, 80);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 70, 80, 186, 235, [[0, '#7dd3fc'], [0.5, '#0ea5e9'], [1, '#0369a1']]);
        ctx.fill();
        ctx.strokeStyle = '#075985';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Patrón de copos en el manto
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        [{ x: 95, y: 160 }, { x: 135, y: 190 }, { x: 160, y: 150 }].forEach(p => {
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(a) * 10, p.y + Math.sin(a) * 10);
                ctx.stroke();
            }
        });
        ctx.restore();
        // Cabeza
        circle(ctx, 128, 55, 38, bodyGrad(ctx, 128, 55, 38, '#bae6fd', '#38bdf8', '#0284c7'), '#075985', 3.5);
        // Sombrero puntiagudo
        ctx.beginPath();
        ctx.moveTo(128, -15);
        ctx.lineTo(96, 38);
        ctx.lineTo(160, 38);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 96, -15, 160, 38, [[0, '#0369a1'], [1, '#0c4a6e']]);
        ctx.fill();
        ctx.strokeStyle = '#075985';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Estrella en sombrero
        ctx.fillStyle = '#7dd3fc';
        circle(ctx, 128, 15, 6, '#bae6fd', '#0ea5e9', 1.5);
        // Cara
        eyePair(ctx, 112, 50, 144, 50, 12, 1, '#0ea5e9');
        detailMouth(ctx, 128, 72, 10, 'smile', '#075985');
        // Bastón de hielo
        ctx.strokeStyle = '#075985';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(190, 90);
        ctx.lineTo(210, 230);
        ctx.stroke();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(190, 90);
        ctx.lineTo(210, 230);
        ctx.stroke();
        // Cristal de hielo en punta
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(190, 90);
        ctx.lineTo(178, 65);
        ctx.lineTo(190, 50);
        ctx.lineTo(202, 65);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    // ==== GENERADOR — Máquina de monedas ====
    generator(ctx) {
        dropShadow(ctx, 128, 238, 50, 14);
        drawLeg(ctx, 98, 196, 28, 12, '#eab308', '#854d0e', 1);
        drawLeg(ctx, 158, 196, 28, 12, '#eab308', '#854d0e', 1);
        // Cuerpo máquina
        roundRect(ctx, 58, 48, 140, 155, 18, linGrad(ctx, 58, 48, 198, 203, [[0, '#fbbf24'], [0.5, '#eab308'], [1, '#ca8a04']]), '#854d0e', 5);
        // Rendija frontal
        roundRect(ctx, 80, 70, 96, 15, 5, '#854d0e');
        roundRect(ctx, 82, 72, 92, 11, 4, '#92400e');
        // Panel de monedas
        metalPlate(ctx, 80, 100, 96, 70, 8, '#fef08a', '#fde047');
        // Símbolo $
        ctx.fillStyle = '#854d0e';
        ctx.font = 'bold 50px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', 128, 152);
        // Cara mecánica
        roundRect(ctx, 85, 175, 86, 20, 6, '#854d0e');
        eyePair(ctx, 108, 60, 148, 60, 10, 1, '#854d0e');
        // Monedas saliendo
        ctx.save();
        ctx.globalAlpha = 0.8;
        [{ x: 128, y: 25, r: 11 }, { x: 105, y: 15, r: 9 }, { x: 155, y: 20, r: 8 }].forEach(coin => {
            circle(ctx, coin.x, coin.y, coin.r, '#fbbf24', '#854d0e', 2);
            ctx.fillStyle = '#854d0e';
            ctx.font = `bold ${coin.r}px sans-serif`;
            ctx.fillText('$', coin.x, coin.y + coin.r * 0.35);
        });
        ctx.restore();
        // Engranajes laterales
        ctx.save();
        [58, 198].forEach(gx => {
            ctx.strokeStyle = '#854d0e';
            ctx.lineWidth = 2.5;
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(gx + Math.cos(a) * 8, 125 + Math.sin(a) * 8);
                ctx.lineTo(gx + Math.cos(a) * 14, 125 + Math.sin(a) * 14);
                ctx.stroke();
            }
            circle(ctx, gx, 125, 8, '#eab308', '#854d0e', 2);
        });
        ctx.restore();
    },

    // ==== MORTERO — Lanzador de explosivos ====
    mortar(ctx) {
        dropShadow(ctx, 128, 238, 50, 14);
        drawLeg(ctx, 95, 198, 28, 14, '#475569', '#1e293b', 1);
        drawLeg(ctx, 161, 198, 28, 14, '#475569', '#1e293b', 1);
        // Base/cuerpo pesado
        roundRect(ctx, 55, 75, 146, 130, 20, linGrad(ctx, 55, 75, 201, 205, [[0, '#64748b'], [0.4, '#475569'], [1, '#334155']]), '#1e293b', 5);
        metalPlate(ctx, 70, 95, 116, 30, 6, '#94a3b8', '#64748b');
        rivetRow(ctx, 78, 110, 178, 110, 5, 3.5, '#cbd5e1');
        metalPlate(ctx, 70, 150, 116, 30, 6, '#94a3b8', '#64748b');
        rivetRow(ctx, 78, 165, 178, 165, 5, 3.5, '#cbd5e1');
        // Tubo mortero apuntando arriba-derecha
        ctx.save();
        ctx.translate(155, 90);
        ctx.rotate(-0.6);
        roundRect(ctx, 0, -18, 70, 36, 6, linGrad(ctx, 0, -18, 0, 18, [[0, '#64748b'], [1, '#334155']]), '#1e293b', 3);
        // Boca del tubo
        ellipse(ctx, 70, 0, 18, 18, '#1e293b', '#475569', 3);
        ctx.restore();
        // Cara
        eyePair(ctx, 98, 135, 142, 135, 13, 1, '#f59e0b');
        detailMouth(ctx, 120, 162, 10, 'determined', '#1e293b');
        // Proyectil en el aire
        ctx.save();
        ctx.globalAlpha = 0.7;
        circle(ctx, 230, 25, 14, bodyGrad(ctx, 230, 25, 14, '#fbbf24', '#f59e0b', '#dc2626'), '#7f1d1d', 2);
        ctx.globalAlpha = 0.4;
        circle(ctx, 230, 25, 8, '#fff');
        ctx.restore();
    },

    // ==== AMPLIFICADOR — Torre de soporte ====
    amplifier(ctx) {
        dropShadow(ctx, 128, 238, 42, 12);
        // Pilares de soporte
        roundRect(ctx, 92, 180, 20, 50, 6, '#7c3aed', '#4c1d95', 3);
        roundRect(ctx, 144, 180, 20, 50, 6, '#7c3aed', '#4c1d95', 3);
        // Cuerpo tipo altavoz/amplificador
        roundRect(ctx, 58, 42, 140, 145, 16, linGrad(ctx, 58, 42, 198, 187, [[0, '#a78bfa'], [0.5, '#7c3aed'], [1, '#5b21b6']]), '#4c1d95', 5);
        // Bocina circular
        circle(ctx, 128, 110, 42, linGrad(ctx, 128, 68, 128, 152, [[0, '#c4b5fd'], [1, '#6d28d9']]), '#4c1d95', 3);
        circle(ctx, 128, 110, 28, '#5b21b6', '#4c1d95', 2);
        circle(ctx, 128, 110, 14, '#7c3aed', '#4c1d95', 1.5);
        // Ondas de sonido/energía
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(128, 110, 55 + i * 18, -0.4, 0.4);
            ctx.stroke();
        }
        ctx.restore();
        // Cara en panel superior
        eyePair(ctx, 108, 62, 148, 62, 11, 1, '#a78bfa');
        detailMouth(ctx, 128, 80, 8, 'smile', '#4c1d95');
        // LED indicators
        [{ x: 72, y: 165 }, { x: 92, y: 165 }, { x: 164, y: 165 }, { x: 184, y: 165 }].forEach(led => {
            circle(ctx, led.x, led.y, 5, '#c4b5fd', '#7c3aed', 1.5);
        });
        highlight(ctx, 108, 50, 20, 10, 0.2);
    },

    // ==== MAGO ELÉCTRICO ====
    wizard(ctx) {
        dropShadow(ctx, 128, 238, 45, 12);
        // Túnica
        ctx.beginPath();
        ctx.moveTo(80, 95);
        ctx.bezierCurveTo(60, 140, 55, 200, 70, 235);
        ctx.lineTo(186, 235);
        ctx.bezierCurveTo(201, 200, 196, 140, 176, 95);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 70, 95, 186, 235, [[0, '#6366f1'], [0.7, '#4338ca'], [1, '#312e81']]);
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        // Estrellas en túnica
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#c7d2fe';
        [{ x: 105, y: 170 }, { x: 145, y: 200 }, { x: 115, y: 210 }, { x: 160, y: 165 }].forEach(s => {
            circle(ctx, s.x, s.y, 3);
        });
        ctx.restore();
        // Cabeza
        circle(ctx, 128, 65, 38, bodyGrad(ctx, 128, 65, 38, '#a5b4fc', '#6366f1', '#4338ca'), '#1e1b4b', 3.5);
        // Sombrero de mago puntiagudo
        ctx.beginPath();
        ctx.moveTo(128, -20);
        ctx.lineTo(88, 46);
        ctx.lineTo(168, 46);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 88, -20, 168, 46, [[0, '#312e81'], [1, '#4338ca']]);
        ctx.fill();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Ala del sombrero
        ellipse(ctx, 128, 46, 50, 8, '#4338ca', '#1e1b4b', 2.5);
        // Rayo en sombrero
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(128, -8);
        ctx.lineTo(122, 6);
        ctx.lineTo(130, 3);
        ctx.lineTo(126, 18);
        ctx.lineTo(135, 5);
        ctx.lineTo(128, 8);
        ctx.closePath();
        ctx.fill();
        // Cara
        eyePair(ctx, 112, 60, 144, 60, 12, 1, '#818cf8');
        detailMouth(ctx, 128, 82, 10, 'grin', '#1e1b4b');
        // Bastón con orbe eléctrico
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(195, 85);
        ctx.lineTo(215, 235);
        ctx.stroke();
        // Orbe eléctrico
        circle(ctx, 192, 78, 18, bodyGrad(ctx, 192, 78, 18, '#fef08a', '#fbbf24', '#f59e0b'), '#92400e', 2);
        ctx.save();
        ctx.globalAlpha = 0.6;
        circle(ctx, 192, 78, 10, '#fff');
        ctx.restore();
        // Relámpago
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(208, 72);
        ctx.lineTo(225, 60);
        ctx.lineTo(218, 70);
        ctx.lineTo(235, 65);
        ctx.stroke();
    },

    // ==== NUTRIA ====
    otter(ctx) {
        dropShadow(ctx, 128, 238, 48, 13);
        // Cola
        ctx.beginPath();
        ctx.moveTo(50, 180);
        ctx.bezierCurveTo(25, 190, 15, 220, 30, 235);
        ctx.bezierCurveTo(45, 240, 60, 220, 65, 200);
        ctx.closePath();
        ctx.fillStyle = '#92400e';
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Cuerpo
        ctx.beginPath();
        ctx.moveTo(90, 55);
        ctx.bezierCurveTo(55, 70, 42, 120, 50, 175);
        ctx.bezierCurveTo(55, 210, 80, 225, 128, 225);
        ctx.bezierCurveTo(176, 225, 201, 210, 206, 175);
        ctx.bezierCurveTo(214, 120, 201, 70, 166, 55);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 140, 80, '#a16207', '#854d0e', '#78350f');
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Vientre claro
        ellipse(ctx, 128, 155, 45, 50, '#d4a574', null);
        // Cabeza redonda
        circle(ctx, 128, 62, 42, bodyGrad(ctx, 128, 62, 42, '#b45309', '#92400e', '#78350f'), '#451a03', 3.5);
        // Orejas
        circle(ctx, 92, 32, 12, '#92400e', '#451a03', 2);
        circle(ctx, 92, 32, 7, '#d4a574');
        circle(ctx, 164, 32, 12, '#92400e', '#451a03', 2);
        circle(ctx, 164, 32, 7, '#d4a574');
        // Cara
        eyePair(ctx, 112, 55, 144, 55, 12, 1, '#451a03');
        // Nariz
        ellipse(ctx, 128, 72, 8, 5, '#1a1a1a');
        // Bigotes
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        [[-1, 1], [-1, 0], [1, 1], [1, 0]].forEach(([dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(128 + dx * 10, 74 + dy * 2);
            ctx.lineTo(128 + dx * 30, 72 + dy * 8);
            ctx.stroke();
        });
        detailMouth(ctx, 128, 80, 6, 'smile', '#451a03');
        // Patitas
        drawArm(ctx, 195, 140, 225, 130, 10, '#92400e', '#451a03');
        highlight(ctx, 112, 32, 18, 12, 0.15);
    },

    // ==== KRAKEN ====
    kraken(ctx) {
        dropShadow(ctx, 128, 238, 55, 15);
        // Tentáculos
        const tentColors = ['#0e7490', '#0891b2', '#06b6d4'];
        const tentacles = [
            { sx: 55, sy: 170, ex: 20, ey: 235, c1x: 30, c1y: 180, c2x: 15, c2y: 210 },
            { sx: 80, sy: 185, ex: 55, ey: 240, c1x: 60, c1y: 200, c2x: 45, c2y: 225 },
            { sx: 176, sy: 185, ex: 201, ey: 240, c1x: 196, c1y: 200, c2x: 211, c2y: 225 },
            { sx: 201, sy: 170, ex: 236, ey: 235, c1x: 226, c1y: 180, c2x: 241, c2y: 210 },
            { sx: 105, sy: 195, ex: 85, ey: 248, c1x: 85, c1y: 215, c2x: 80, c2y: 235 },
            { sx: 151, sy: 195, ex: 171, ey: 248, c1x: 171, c1y: 215, c2x: 176, c2y: 235 },
        ];
        tentacles.forEach((t, i) => {
            ctx.strokeStyle = '#164e63';
            ctx.lineWidth = 18;
            ctx.beginPath();
            ctx.moveTo(t.sx, t.sy);
            ctx.bezierCurveTo(t.c1x, t.c1y, t.c2x, t.c2y, t.ex, t.ey);
            ctx.stroke();
            ctx.strokeStyle = tentColors[i % 3];
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(t.sx, t.sy);
            ctx.bezierCurveTo(t.c1x, t.c1y, t.c2x, t.c2y, t.ex, t.ey);
            ctx.stroke();
            // Ventosas
            for (let j = 0; j < 3; j++) {
                const tt = 0.3 + j * 0.25;
                const bx = (1 - tt) * (1 - tt) * (1 - tt) * t.sx + 3 * (1 - tt) * (1 - tt) * tt * t.c1x + 3 * (1 - tt) * tt * tt * t.c2x + tt * tt * tt * t.ex;
                const by = (1 - tt) * (1 - tt) * (1 - tt) * t.sy + 3 * (1 - tt) * (1 - tt) * tt * t.c1y + 3 * (1 - tt) * tt * tt * t.c2y + tt * tt * tt * t.ey;
                circle(ctx, bx, by, 4, '#67e8f9', '#0891b2', 1);
            }
        });
        // Cabeza/manto
        ctx.beginPath();
        ctx.moveTo(128, 15);
        ctx.bezierCurveTo(60, 25, 35, 80, 40, 150);
        ctx.bezierCurveTo(42, 185, 70, 200, 128, 200);
        ctx.bezierCurveTo(186, 200, 214, 185, 216, 150);
        ctx.bezierCurveTo(221, 80, 196, 25, 128, 15);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 100, 90, '#22d3ee', '#0891b2', '#0e7490');
        ctx.fill();
        ctx.strokeStyle = '#164e63';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Textura de manchas
        ctx.save();
        ctx.globalAlpha = 0.12;
        [{ x: 90, y: 80, r: 18 }, { x: 160, y: 95, r: 15 }, { x: 110, y: 140, r: 12 }, { x: 155, y: 150, r: 14 }].forEach(s => {
            circle(ctx, s.x, s.y, s.r, '#67e8f9');
        });
        ctx.restore();
        // Corona dorada
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(88, 30);
        ctx.lineTo(92, 8);
        ctx.lineTo(108, 22);
        ctx.lineTo(118, 0);
        ctx.lineTo(128, 22);
        ctx.lineTo(138, 0);
        ctx.lineTo(148, 22);
        ctx.lineTo(164, 8);
        ctx.lineTo(168, 30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Gemas en corona
        circle(ctx, 108, 18, 4, '#ef4444', '#991b1b', 1);
        circle(ctx, 128, 15, 5, '#3b82f6', '#1d4ed8', 1);
        circle(ctx, 148, 18, 4, '#22c55e', '#15803d', 1);
        // Ojos
        eyePair(ctx, 102, 95, 154, 95, 18, 1, '#06b6d4');
        detailMouth(ctx, 128, 135, 16, 'evil', '#164e63');
        highlight(ctx, 105, 50, 25, 18, 0.2);
    },

    // ==== GÓLEM ====
    golem(ctx) {
        dropShadow(ctx, 128, 238, 58, 16);
        drawLeg(ctx, 88, 200, 30, 20, '#475569', '#1e293b', 1);
        drawLeg(ctx, 168, 200, 30, 20, '#475569', '#1e293b', 1);
        // Cuerpo masivo
        ctx.beginPath();
        ctx.moveTo(50, 80);
        ctx.bezierCurveTo(35, 100, 30, 160, 50, 205);
        ctx.lineTo(206, 205);
        ctx.bezierCurveTo(226, 160, 221, 100, 206, 80);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 140, 95, '#94a3b8', '#64748b', '#475569');
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Grietas luminosas
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(90, 110); ctx.lineTo(75, 150); ctx.lineTo(85, 180);
        ctx.moveTo(170, 115); ctx.lineTo(180, 155); ctx.lineTo(170, 185);
        ctx.moveTo(128, 100); ctx.lineTo(128, 190);
        ctx.stroke();
        ctx.restore();
        // Cabeza cuadrada
        roundRect(ctx, 78, 30, 100, 65, 15, bodyGrad(ctx, 128, 60, 50, '#94a3b8', '#64748b', '#475569'), '#1e293b', 4);
        // Ojos brillantes
        eyePair(ctx, 105, 55, 152, 55, 14, 1, '#60a5fa');
        detailMouth(ctx, 128, 80, 12, 'determined', '#334155');
        // Hombros
        circle(ctx, 50, 100, 20, '#64748b', '#1e293b', 3);
        rivetRow(ctx, 42, 100, 58, 100, 3, 3, '#94a3b8');
        circle(ctx, 206, 100, 20, '#64748b', '#1e293b', 3);
        rivetRow(ctx, 198, 100, 214, 100, 3, 3, '#94a3b8');
        // Brazos enormes
        drawArm(ctx, 50, 115, 20, 165, 18, '#64748b', '#1e293b');
        circle(ctx, 16, 168, 16, '#475569', '#1e293b', 3);
        drawArm(ctx, 206, 115, 240, 155, 18, '#64748b', '#1e293b');
        circle(ctx, 244, 158, 16, '#475569', '#1e293b', 3);
        // Núcleo brillante en el pecho
        circle(ctx, 128, 150, 20, bodyGrad(ctx, 128, 150, 20, '#bfdbfe', '#60a5fa', '#2563eb'), '#1e40af', 3);
        ctx.save();
        ctx.globalAlpha = 0.5;
        circle(ctx, 128, 150, 10, '#fff');
        ctx.restore();
    },

    // ==== ANTITANQUE DE ÁREA ====
    antiTankArea(ctx) {
        dropShadow(ctx, 128, 238, 55, 15);
        // Base/plataforma
        roundRect(ctx, 40, 170, 176, 55, 12, linGrad(ctx, 40, 170, 216, 225, [[0, '#475569'], [0.5, '#334155'], [1, '#1e293b']]), '#0f172a', 4);
        rivetRow(ctx, 55, 180, 201, 180, 7, 3.5, '#94a3b8');
        rivetRow(ctx, 55, 215, 201, 215, 7, 3.5, '#94a3b8');
        // Torretas gemelas
        // Torreta izq (apunta atrás)
        ctx.save();
        ctx.translate(75, 155);
        ctx.rotate(Math.PI);
        roundRect(ctx, 0, -12, 60, 24, 5, linGrad(ctx, 0, -12, 0, 12, [[0, '#64748b'], [1, '#334155']]), '#1e293b', 3);
        circle(ctx, 60, 0, 8, '#f59e0b');
        ctx.restore();
        // Torreta der (apunta adelante)
        drawCannon(ctx, 160, 155, 60, 22, 0, '#64748b', '#334155', '#f59e0b');
        // Cuerpo central
        roundRect(ctx, 65, 80, 126, 95, 18, linGrad(ctx, 65, 80, 191, 175, [[0, '#64748b'], [0.5, '#475569'], [1, '#334155']]), '#1e293b', 5);
        metalPlate(ctx, 80, 95, 96, 55, 8, '#94a3b8', '#64748b');
        // Símbolo bidireccional
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⟺', 128, 130);
        // Cara
        eyePair(ctx, 108, 160, 148, 160, 10, 1, '#f59e0b', true);
        highlight(ctx, 105, 88, 20, 10, 0.15);
    },

    // ==== GOTA ESCUDO ====
    'water-shield'(ctx) {
        dropShadow(ctx, 128, 236, 44, 12);
        drawLeg(ctx, 105, 190, 28, 11, '#60a5fa', '#1d4ed8', 1);
        drawLeg(ctx, 151, 190, 28, 11, '#60a5fa', '#1d4ed8', 1);
        // Escudo frontal translúcido
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(128, 25);
        ctx.bezierCurveTo(40, 50, 30, 180, 128, 220);
        ctx.bezierCurveTo(226, 180, 216, 50, 128, 25);
        ctx.closePath();
        ctx.fillStyle = '#93c5fd';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        // Cuerpo gota
        ctx.beginPath();
        ctx.moveTo(128, 40);
        ctx.bezierCurveTo(95, 60, 72, 100, 72, 135);
        ctx.bezierCurveTo(72, 185, 95, 205, 128, 205);
        ctx.bezierCurveTo(161, 205, 184, 185, 184, 135);
        ctx.bezierCurveTo(184, 100, 161, 60, 128, 40);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 56, '#93c5fd', '#3b82f6', '#1d4ed8');
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 4;
        ctx.stroke();
        eyePair(ctx, 108, 110, 148, 110, 14, 1, '#3b82f6');
        detailMouth(ctx, 128, 140, 10, 'determined', '#1e3a5f');
        highlight(ctx, 108, 70, 20, 15, 0.3);
    },

    // ==== NUBE LLUVIOSA ====
    'rain-cloud'(ctx) {
        dropShadow(ctx, 128, 236, 55, 12);
        // Gotas de lluvia
        ctx.save();
        ctx.globalAlpha = 0.5;
        [{ x: 85, y: 175 }, { x: 110, y: 195 }, { x: 138, y: 180 }, { x: 162, y: 200 }, { x: 185, y: 185 }].forEach(d => {
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.moveTo(d.x, d.y - 8);
            ctx.bezierCurveTo(d.x - 5, d.y, d.x - 4, d.y + 6, d.x, d.y + 8);
            ctx.bezierCurveTo(d.x + 4, d.y + 6, d.x + 5, d.y, d.x, d.y - 8);
            ctx.fill();
        });
        ctx.restore();
        // Nube principal
        const cloudG = bodyGrad(ctx, 128, 90, 65, '#e0e7ff', '#a5b4fc', '#818cf8');
        ctx.beginPath();
        ctx.arc(100, 100, 45, Math.PI, 1.5 * Math.PI);
        ctx.arc(128, 70, 50, Math.PI, 0);
        ctx.arc(165, 100, 40, 1.5 * Math.PI, 0);
        ctx.lineTo(205, 130);
        ctx.arc(165, 130, 40, 0, 0.5 * Math.PI);
        ctx.lineTo(100, 145);
        ctx.arc(75, 120, 30, 0.5 * Math.PI, Math.PI);
        ctx.closePath();
        ctx.fillStyle = cloudG;
        ctx.fill();
        ctx.strokeStyle = '#4338ca';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Cara
        eyePair(ctx, 108, 95, 152, 95, 14, 1, '#6366f1');
        detailMouth(ctx, 130, 120, 12, 'smile', '#4338ca');
        // Rayito
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(145, 145);
        ctx.lineTo(138, 165);
        ctx.lineTo(148, 160);
        ctx.lineTo(140, 180);
        ctx.stroke();
        highlight(ctx, 115, 60, 28, 18, 0.3);
    },

    // ==== AQUA CAÑÓN ====
    'water-cannon'(ctx) {
        dropShadow(ctx, 128, 238, 50, 14);
        drawLeg(ctx, 95, 198, 28, 14, '#1d4ed8', '#1e3a5f', 1);
        drawLeg(ctx, 161, 198, 28, 14, '#1d4ed8', '#1e3a5f', 1);
        // Cuerpo blindado
        roundRect(ctx, 55, 55, 140, 150, 22, linGrad(ctx, 55, 55, 195, 205, [[0, '#3b82f6'], [0.5, '#2563eb'], [1, '#1d4ed8']]), '#1e3a5f', 5);
        metalPlate(ctx, 70, 80, 110, 40, 8, '#60a5fa', '#3b82f6');
        rivetRow(ctx, 78, 90, 172, 90, 5, 3, '#93c5fd');
        metalPlate(ctx, 70, 140, 110, 40, 8, '#60a5fa', '#3b82f6');
        rivetRow(ctx, 78, 150, 172, 150, 5, 3, '#93c5fd');
        // Cara
        eyePair(ctx, 100, 120, 148, 120, 13, 1, '#93c5fd', true);
        // Cañón principal ENORME
        drawCannon(ctx, 185, 110, 65, 28, 0, '#2563eb', '#1e3a5f', '#60a5fa');
        // Chorro de agua
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.moveTo(250, 95);
        ctx.bezierCurveTo(260, 100, 256, 120, 250, 125);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        highlight(ctx, 100, 62, 22, 15, 0.2);
    },

    // ==== CRISTAL DE HIELO ====
    'ice-crystal'(ctx) {
        dropShadow(ctx, 128, 236, 42, 12);
        // Aura helada
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 3; i++) circle(ctx, 128, 120, 75 + i * 12, '#bae6fd');
        ctx.restore();
        // Cristal de hielo hexagonal
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = 128 + Math.cos(a) * 70;
            const y = 120 + Math.sin(a) * 80;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 58, 40, 198, 200, [[0, '#e0f2fe'], [0.3, '#7dd3fc'], [0.7, '#0ea5e9'], [1, '#0369a1']]);
        ctx.fill();
        ctx.strokeStyle = '#075985';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Facetas
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(128, 120);
            ctx.lineTo(128 + Math.cos(a) * 70, 120 + Math.sin(a) * 80);
            ctx.stroke();
        }
        ctx.restore();
        // Escarcha
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2;
            const d = 30 + Math.random() * 35;
            circle(ctx, 128 + Math.cos(a) * d, 120 + Math.sin(a) * d, 2 + Math.random() * 3);
        }
        ctx.restore();
        // Cara dentro
        eyePair(ctx, 108, 110, 148, 110, 13, 1, '#0ea5e9');
        detailMouth(ctx, 128, 140, 10, 'smile', '#075985');
        highlight(ctx, 100, 70, 24, 20, 0.35);
    },

    // ==== GUERRERO OLA ====
    'wave-warrior'(ctx) {
        dropShadow(ctx, 128, 238, 55, 15);
        drawLeg(ctx, 90, 200, 28, 16, '#1d4ed8', '#1e3a5f', 1);
        drawLeg(ctx, 166, 200, 28, 16, '#1d4ed8', '#1e3a5f', 1);
        // Cuerpo musculoso
        ctx.beginPath();
        ctx.moveTo(60, 70);
        ctx.bezierCurveTo(35, 90, 30, 160, 55, 210);
        ctx.lineTo(201, 210);
        ctx.bezierCurveTo(226, 160, 221, 90, 196, 70);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 140, 90, '#60a5fa', '#2563eb', '#1d4ed8');
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Armadura de ola
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(55, 100 + i * 25);
            ctx.bezierCurveTo(100, 90 + i * 25, 160, 110 + i * 25, 201, 100 + i * 25);
            ctx.stroke();
        }
        ctx.restore();
        // Cabeza con casco
        ctx.beginPath();
        ctx.arc(128, 55, 42, Math.PI, 0);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 86, 13, 170, 55, [[0, '#3b82f6'], [1, '#1d4ed8']]);
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Visor
        roundRect(ctx, 88, 45, 80, 30, 10, '#1e3a5f');
        eyePair(ctx, 108, 58, 148, 58, 12, 1, '#60a5fa');
        detailMouth(ctx, 128, 85, 12, 'determined', '#1e3a5f');
        // Puños
        drawArm(ctx, 45, 120, 15, 150, 16, '#2563eb', '#1e3a5f');
        circle(ctx, 10, 153, 16, '#1d4ed8', '#1e3a5f', 3);
        drawArm(ctx, 211, 120, 241, 140, 16, '#2563eb', '#1e3a5f');
        circle(ctx, 246, 143, 16, '#1d4ed8', '#1e3a5f', 3);
        // Cresta en casco
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.moveTo(128, 14);
        ctx.lineTo(118, 30);
        ctx.lineTo(138, 30);
        ctx.closePath();
        ctx.fill();
    },

    // ==== LIRIO ACUÁTICO (generador) ====
    'water-lily'(ctx) {
        dropShadow(ctx, 128, 236, 55, 14);
        // Hoja flotante base
        ctx.beginPath();
        ctx.ellipse(128, 195, 65, 25, 0, 0, Math.PI * 2);
        ctx.fillStyle = linGrad(ctx, 63, 195, 193, 195, [[0, '#22c55e'], [1, '#16a34a']]);
        ctx.fill();
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Corte en la hoja
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(128, 175);
        ctx.lineTo(165, 195);
        ctx.stroke();
        // Pétalos de lirio
        const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];
        petalAngles.forEach(deg => {
            const a = (deg * Math.PI) / 180;
            ctx.save();
            ctx.translate(128, 130);
            ctx.rotate(a);
            const pg = linGrad(ctx, 0, -10, 0, 40, [[0, '#fbcfe8'], [0.5, '#f9a8d4'], [1, '#ec4899']]);
            ctx.fillStyle = pg;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-15, -20, -10, -45, 0, -50);
            ctx.bezierCurveTo(10, -45, 15, -20, 0, 0);
            ctx.fill();
            ctx.strokeStyle = '#be185d';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        });
        // Centro
        circle(ctx, 128, 130, 22, bodyGrad(ctx, 128, 130, 22, '#fef08a', '#fbbf24', '#f59e0b'), '#92400e', 2.5);
        // Cara tierna
        eyePair(ctx, 118, 125, 138, 125, 8, 1, '#854d0e');
        detailMouth(ctx, 128, 140, 6, 'smile', '#854d0e');
        // Partículas de monedas/polen
        ctx.save();
        ctx.globalAlpha = 0.6;
        [{ x: 105, y: 80, r: 6 }, { x: 150, y: 70, r: 5 }, { x: 128, y: 60, r: 7 }].forEach(p => {
            circle(ctx, p.x, p.y, p.r, '#fbbf24', '#854d0e', 1.5);
        });
        ctx.restore();
    },

    // ==== CORAL DORADO (soporte) ====
    'coral-reef'(ctx) {
        dropShadow(ctx, 128, 238, 55, 14);
        // Base
        ctx.beginPath();
        ctx.moveTo(40, 240);
        ctx.bezierCurveTo(40, 210, 65, 190, 128, 185);
        ctx.bezierCurveTo(191, 190, 216, 210, 216, 240);
        ctx.closePath();
        ctx.fillStyle = '#78350f';
        ctx.fill();
        // Ramas doradas
        const drawGoldBranch = (x, y, h, w, shade) => {
            const g = linGrad(ctx, x, y, x, y - h, [[0, shade || '#eab308'], [0.5, '#fbbf24'], [1, '#fef08a']]);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x - w, y);
            ctx.bezierCurveTo(x - w, y - h * 0.4, x - w * 0.3, y - h, x, y - h + 5);
            ctx.bezierCurveTo(x + w * 0.3, y - h, x + w, y - h * 0.4, x + w, y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#854d0e';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            // Bultos decorativos
            for (let i = 0; i < 4; i++) {
                const bx = x + (i - 1.5) * w * 0.4;
                circle(ctx, bx, y - h + 8, w * 0.3, shade || '#eab308', '#854d0e', 1.5);
            }
        };
        drawGoldBranch(80, 195, 100, 22, '#ca8a04');
        drawGoldBranch(128, 190, 130, 28, '#eab308');
        drawGoldBranch(176, 195, 95, 20, '#ca8a04');
        drawGoldBranch(55, 210, 60, 14, '#a16207');
        drawGoldBranch(201, 210, 55, 13, '#a16207');
        // Cara en rama central
        eyePair(ctx, 112, 78, 144, 78, 12, 1, '#854d0e');
        detailMouth(ctx, 128, 100, 10, 'smile', '#854d0e');
        // Aura dorada
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 3; i++) circle(ctx, 128, 130, 80 + i * 15, '#fbbf24');
        ctx.restore();
    },

    // ==== TITÁN TSUNAMI ====
    'tsunami-giant'(ctx) {
        dropShadow(ctx, 128, 238, 60, 16);
        drawLeg(ctx, 85, 202, 30, 20, '#1d4ed8', '#1e3a5f', 1);
        drawLeg(ctx, 171, 202, 30, 20, '#1d4ed8', '#1e3a5f', 1);
        // Cuerpo colosal
        ctx.beginPath();
        ctx.moveTo(128, 15);
        ctx.bezierCurveTo(45, 30, 20, 100, 30, 170);
        ctx.bezierCurveTo(35, 210, 65, 225, 128, 225);
        ctx.bezierCurveTo(191, 225, 221, 210, 226, 170);
        ctx.bezierCurveTo(236, 100, 211, 30, 128, 15);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 100, '#60a5fa', '#2563eb', '#1e40af');
        ctx.fill();
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineWidth = 6;
        ctx.stroke();
        // Olas internas
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 4;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const yy = 60 + i * 30;
            ctx.moveTo(50, yy);
            ctx.bezierCurveTo(90, yy - 12, 170, yy + 12, 210, yy);
            ctx.stroke();
        }
        ctx.restore();
        // Corona de olas
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
            const bx = 65 + i * 22;
            ctx.lineTo(bx, 22);
            ctx.lineTo(bx + 11, 8);
        }
        ctx.lineTo(220, 22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Ojos furiosos
        eyePair(ctx, 98, 85, 158, 85, 18, 1, '#60a5fa', true);
        detailMouth(ctx, 128, 130, 22, 'roar', '#1e3a5f');
        // Brazos masivos
        drawArm(ctx, 35, 130, 5, 180, 20, '#2563eb', '#1e3a5f');
        circle(ctx, 0, 184, 18, '#1d4ed8', '#1e3a5f', 4);
        drawArm(ctx, 221, 130, 251, 170, 20, '#2563eb', '#1e3a5f');
        circle(ctx, 256, 174, 18, '#1d4ed8', '#1e3a5f', 4);
        highlight(ctx, 105, 45, 28, 18, 0.2);
    },
};

// ─── CONTAMINANTES (miran a la IZQUIERDA) ────────────────────────────────────

const contaminantDrawers = {

    // ==== FÁBRICA — Edificio industrial con chimeneas ====
    Fabrica(ctx) {
        dropShadow(ctx, 128, 238, 52, 14);
        // Edificio principal
        roundRect(ctx, 55, 80, 146, 155, 8, linGrad(ctx, 55, 80, 201, 235, [[0, '#78716c'], [0.5, '#57534e'], [1, '#44403c']]), '#292524', 5);
        // Ventanas contaminadas
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 3; c++) {
                roundRect(ctx, 70 + c * 42, 100 + r * 50, 28, 30, 4, '#fbbf24', '#854d0e', 2);
                // Cruz en ventana
                ctx.strokeStyle = '#44403c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(84 + c * 42, 100 + r * 50);
                ctx.lineTo(84 + c * 42, 130 + r * 50);
                ctx.moveTo(70 + c * 42, 115 + r * 50);
                ctx.lineTo(98 + c * 42, 115 + r * 50);
                ctx.stroke();
            }
        }
        // Chimeneas
        [{ x: 75, h: 65 }, { x: 128, h: 80 }, { x: 175, h: 55 }].forEach(ch => {
            roundRect(ctx, ch.x - 10, 80 - ch.h, 20, ch.h, 4, linGrad(ctx, ch.x - 10, 80 - ch.h, ch.x + 10, 80, [[0, '#57534e'], [1, '#44403c']]), '#292524', 3);
            // Humo
            ctx.save();
            ctx.globalAlpha = 0.35;
            [0, -15, -30, -45].forEach((dy, i) => {
                circle(ctx, ch.x + (i % 2 ? 5 : -5), 80 - ch.h + dy - 12, 10 + i * 4, '#a8a29e');
            });
            ctx.restore();
        });
        // Ojos malvados — miran a la IZQUIERDA
        eyePair(ctx, 100, 125, 155, 125, 14, -1, '#f59e0b', true);
        detailMouth(ctx, 128, 155, 14, 'evil', '#292524');
    },

    // ==== PETRÓLEO — Mancha de petróleo viviente ====
    Petroleo(ctx) {
        dropShadow(ctx, 128, 238, 55, 14);
        // Charco base
        ctx.save();
        ctx.globalAlpha = 0.4;
        ellipse(ctx, 128, 225, 65, 18, '#1c1917');
        ctx.restore();
        // Cuerpo viscoso
        ctx.beginPath();
        ctx.moveTo(128, 25);
        ctx.bezierCurveTo(65, 40, 38, 100, 45, 165);
        ctx.bezierCurveTo(48, 205, 80, 230, 128, 230);
        ctx.bezierCurveTo(176, 230, 208, 205, 211, 165);
        ctx.bezierCurveTo(218, 100, 191, 40, 128, 25);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 130, 90, '#44403c', '#1c1917', '#0c0a09');
        ctx.fill();
        ctx.strokeStyle = '#0c0a09';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Brillo aceitoso
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.ellipse(145, 90, 35, 50, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = linGrad(ctx, 110, 50, 180, 140, [[0, '#4c1d95'], [0.5, '#7c3aed'], [1, 'transparent']]);
        ctx.fill();
        ctx.restore();
        // Goteo
        ctx.fillStyle = '#1c1917';
        [{ x: 60, y: 195 }, { x: 195, y: 200 }].forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.bezierCurveTo(d.x - 6, d.y + 10, d.x - 4, d.y + 22, d.x, d.y + 25);
            ctx.bezierCurveTo(d.x + 4, d.y + 22, d.x + 6, d.y + 10, d.x, d.y);
            ctx.fill();
        });
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 98, 100, 155, 100, 16, -1, '#a16207', true);
        detailMouth(ctx, 128, 150, 16, 'evil', '#0c0a09');
    },

    // ==== NUCLEAR — Barril radiactivo ====
    Nuclear(ctx) {
        dropShadow(ctx, 128, 238, 48, 13);
        // Aura radiactiva
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 4; i++) circle(ctx, 128, 125, 80 + i * 15, '#4ade80');
        ctx.restore();
        // Barril
        roundRect(ctx, 58, 42, 140, 190, 20, linGrad(ctx, 58, 42, 198, 232, [[0, '#65a30d'], [0.3, '#4d7c0f'], [0.7, '#3f6212'], [1, '#365314']]), '#1a2e05', 5);
        // Bandas metálicas
        for (let i = 0; i < 3; i++) {
            const by = 55 + i * 72;
            roundRect(ctx, 60, by, 136, 12, 3, '#475569', '#1e293b', 2);
            rivetRow(ctx, 70, by + 6, 186, by + 6, 5, 2.5, '#94a3b8');
        }
        // Símbolo radiactivo
        ctx.fillStyle = '#fbbf24';
        circle(ctx, 128, 130, 10, '#fbbf24');
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(128, 130);
            ctx.arc(128, 130, 35, a - 0.35, a + 0.35);
            ctx.closePath();
            ctx.fill();
        }
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 98, 85, 155, 85, 14, -1, '#84cc16', true);
        detailMouth(ctx, 128, 165, 14, 'evil', '#1a2e05');
        // Goteo tóxico
        ctx.fillStyle = '#4ade80';
        ctx.save();
        ctx.globalAlpha = 0.6;
        [{ x: 65, y: 230 }, { x: 190, y: 228 }].forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.bezierCurveTo(d.x - 5, d.y + 8, d.x - 3, d.y + 18, d.x, d.y + 20);
            ctx.bezierCurveTo(d.x + 3, d.y + 18, d.x + 5, d.y + 8, d.x, d.y);
            ctx.fill();
        });
        ctx.restore();
    },

    // ==== BASURA — Bolsa de basura con patas ====
    Basura(ctx) {
        dropShadow(ctx, 128, 238, 45, 12);
        drawLeg(ctx, 100, 195, 30, 12, '#57534e', '#292524', -1);
        drawLeg(ctx, 156, 195, 30, 12, '#57534e', '#292524', -1);
        // Cuerpo bolsa
        ctx.beginPath();
        ctx.moveTo(128, 28);
        ctx.bezierCurveTo(78, 38, 50, 80, 55, 145);
        ctx.bezierCurveTo(58, 200, 85, 215, 128, 215);
        ctx.bezierCurveTo(171, 215, 198, 200, 201, 145);
        ctx.bezierCurveTo(206, 80, 178, 38, 128, 28);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 80, '#78716c', '#57534e', '#44403c');
        ctx.fill();
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Nudo superior
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.moveTo(110, 35);
        ctx.bezierCurveTo(110, 18, 128, 12, 128, 12);
        ctx.bezierCurveTo(128, 12, 146, 18, 146, 35);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Arrugas de la bolsa
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(70 + Math.random() * 20, 70 + i * 28);
            ctx.bezierCurveTo(100, 65 + i * 28, 160, 75 + i * 28, 186 - Math.random() * 20, 70 + i * 28);
            ctx.stroke();
        }
        ctx.restore();
        // Basura saliendo
        ctx.fillStyle = '#fbbf24';
        roundRect(ctx, 68, 130, 12, 20, 2, '#fbbf24', '#854d0e', 1.5);
        ctx.fillStyle = '#ef4444';
        circle(ctx, 180, 145, 8, '#ef4444', '#991b1b', 1.5);
        ctx.fillStyle = '#22c55e';
        roundRect(ctx, 90, 160, 15, 8, 2, '#22c55e', '#15803d', 1);
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 100, 80, 155, 80, 14, -1, '#a16207', true);
        detailMouth(ctx, 128, 112, 12, 'evil', '#292524');
    },

    // ==== AUTO — Carro contaminante ====
    Auto(ctx) {
        dropShadow(ctx, 128, 238, 60, 12);
        // Humo del escape (lado izquierdo = frente para contaminante)
        ctx.save();
        ctx.globalAlpha = 0.3;
        [0, -12, -28].forEach((dy, i) => {
            circle(ctx, 30 - i * 10, 180 + dy, 8 + i * 5, '#a8a29e');
        });
        ctx.restore();
        // Cuerpo del carro
        roundRect(ctx, 35, 120, 186, 75, 15, linGrad(ctx, 35, 120, 221, 195, [[0, '#57534e'], [0.5, '#44403c'], [1, '#292524']]), '#1c1917', 4);
        // Techo/cabina
        ctx.beginPath();
        ctx.moveTo(85, 120);
        ctx.lineTo(100, 68);
        ctx.lineTo(180, 68);
        ctx.lineTo(200, 120);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 85, 68, 200, 120, [[0, '#44403c'], [1, '#292524']]);
        ctx.fill();
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Ventanas
        roundRect(ctx, 105, 76, 35, 36, 4, '#1c1917', null);
        roundRect(ctx, 148, 76, 40, 36, 4, '#1c1917', null);
        // Parachoques
        roundRect(ctx, 30, 185, 196, 18, 6, '#78716c', '#292524', 2);
        // Ruedas
        circle(ctx, 82, 200, 22, '#1c1917', '#44403c', 3);
        circle(ctx, 82, 200, 12, '#44403c', '#78716c', 2);
        circle(ctx, 176, 200, 22, '#1c1917', '#44403c', 3);
        circle(ctx, 176, 200, 12, '#44403c', '#78716c', 2);
        // Ojos en parabrisas — miran a la IZQUIERDA
        eyePair(ctx, 120, 90, 165, 90, 12, -1, '#ef4444', true);
        // Tubo de escape
        roundRect(ctx, 20, 175, 20, 10, 3, '#78716c', '#292524', 2);
    },

    // ==== QUÍMICO — Frasco de químicos tóxicos ====
    Quimico(ctx) {
        dropShadow(ctx, 128, 238, 45, 12);
        // Aura tóxica
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 3; i++) circle(ctx, 128, 130, 75 + i * 14, '#a855f7');
        ctx.restore();
        // Cuello del frasco
        roundRect(ctx, 108, 18, 40, 50, 6, linGrad(ctx, 108, 18, 148, 68, [[0, '#d4d4d8'], [1, '#a1a1aa']]), '#71717a', 3);
        // Corcho/tapa
        roundRect(ctx, 105, 10, 46, 16, 5, '#92400e', '#78350f', 2);
        // Cuerpo del frasco (más ancho)
        ctx.beginPath();
        ctx.moveTo(108, 68);
        ctx.lineTo(55, 120);
        ctx.bezierCurveTo(45, 135, 45, 200, 55, 225);
        ctx.lineTo(201, 225);
        ctx.bezierCurveTo(211, 200, 211, 135, 201, 120);
        ctx.lineTo(148, 68);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 55, 68, 201, 225, [[0, 'rgba(168,85,247,0.7)'], [0.5, 'rgba(126,34,206,0.8)'], [1, 'rgba(88,28,135,0.9)']]);
        ctx.fill();
        ctx.strokeStyle = '#581c87';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Burbujas internas
        ctx.save();
        ctx.globalAlpha = 0.3;
        [{ x: 95, y: 155, r: 10 }, { x: 165, y: 170, r: 8 }, { x: 128, y: 200, r: 12 }, { x: 80, y: 190, r: 6 }].forEach(b => {
            circle(ctx, b.x, b.y, b.r, '#d8b4fe', '#a855f7', 1);
        });
        ctx.restore();
        // Etiqueta con calavera
        roundRect(ctx, 90, 125, 76, 50, 6, '#fef3c7', '#854d0e', 2);
        ctx.fillStyle = '#7c2d12';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☠', 128, 160);
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 98, 95, 155, 95, 12, -1, '#a855f7', true);
    },

    // ==== FUEGO — Llama viviente ====
    Fuego(ctx) {
        dropShadow(ctx, 128, 236, 45, 12);
        // Aura de calor
        ctx.save();
        ctx.globalAlpha = 0.06;
        for (let i = 0; i < 3; i++) circle(ctx, 128, 130, 80 + i * 15, '#f97316');
        ctx.restore();
        // Llama exterior
        ctx.beginPath();
        ctx.moveTo(128, 10);
        ctx.bezierCurveTo(65, 50, 40, 100, 50, 165);
        ctx.bezierCurveTo(55, 210, 85, 240, 128, 240);
        ctx.bezierCurveTo(171, 240, 201, 210, 206, 165);
        ctx.bezierCurveTo(216, 100, 191, 50, 128, 10);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 130, 95, '#fbbf24', '#f97316', '#dc2626');
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Llama interior
        ctx.beginPath();
        ctx.moveTo(128, 55);
        ctx.bezierCurveTo(95, 80, 78, 120, 85, 175);
        ctx.bezierCurveTo(88, 205, 105, 220, 128, 220);
        ctx.bezierCurveTo(151, 220, 168, 205, 171, 175);
        ctx.bezierCurveTo(178, 120, 161, 80, 128, 55);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 130, 60, '#fef08a', '#fbbf24', '#f97316');
        ctx.fill();
        // Núcleo brillante
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(128, 100);
        ctx.bezierCurveTo(112, 120, 108, 160, 118, 195);
        ctx.lineTo(138, 195);
        ctx.bezierCurveTo(148, 160, 144, 120, 128, 100);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 100, 120, 155, 120, 15, -1, '#dc2626', true);
        detailMouth(ctx, 128, 160, 14, 'evil', '#7f1d1d');
        // Chispas
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#fbbf24';
        [{ x: 68, y: 50 }, { x: 188, y: 60 }, { x: 55, y: 100 }, { x: 201, y: 90 }].forEach(s => {
            circle(ctx, s.x, s.y, 4);
        });
        ctx.restore();
    },

    // ==== TÓXICO — Gran monstruo de residuos tóxicos ====
    Toxico(ctx) {
        dropShadow(ctx, 128, 238, 58, 16);
        drawLeg(ctx, 88, 202, 28, 18, '#15803d', '#052e16', -1);
        drawLeg(ctx, 168, 202, 28, 18, '#15803d', '#052e16', -1);
        // Cuerpo masivo y deforme
        ctx.beginPath();
        ctx.moveTo(128, 20);
        ctx.bezierCurveTo(55, 30, 22, 95, 30, 165);
        ctx.bezierCurveTo(35, 215, 70, 230, 128, 230);
        ctx.bezierCurveTo(186, 230, 221, 215, 226, 165);
        ctx.bezierCurveTo(234, 95, 201, 30, 128, 20);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 125, 100, '#4ade80', '#22c55e', '#15803d');
        ctx.fill();
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Pústulas/burbujas tóxicas
        ctx.save();
        ctx.globalAlpha = 0.3;
        [{ x: 80, y: 100, r: 16 }, { x: 175, y: 115, r: 14 }, { x: 100, y: 175, r: 12 }, { x: 160, y: 180, r: 15 }].forEach(p => {
            circle(ctx, p.x, p.y, p.r, '#86efac', '#22c55e', 2);
            highlight(ctx, p.x - 3, p.y - 3, p.r * 0.3, p.r * 0.25, 0.3);
        });
        ctx.restore();
        // Goteo tóxico
        ctx.fillStyle = '#4ade80';
        ctx.save();
        ctx.globalAlpha = 0.5;
        [{ x: 48, y: 160 }, { x: 208, y: 170 }, { x: 70, y: 210 }].forEach(d => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.bezierCurveTo(d.x - 5, d.y + 12, d.x - 3, d.y + 24, d.x, d.y + 28);
            ctx.bezierCurveTo(d.x + 3, d.y + 24, d.x + 5, d.y + 12, d.x, d.y);
            ctx.fill();
        });
        ctx.restore();
        // Ojos deformes — miran a la IZQUIERDA
        detailEye(ctx, 95, 90, 18, -1, '#84cc16', true);
        detailEye(ctx, 160, 85, 14, -1, '#84cc16', true);
        detailMouth(ctx, 128, 140, 20, 'roar', '#052e16');
        // Brazos
        drawArm(ctx, 35, 130, 8, 170, 16, '#22c55e', '#052e16');
        drawArm(ctx, 221, 135, 248, 165, 14, '#22c55e', '#052e16');
    },

    // ==== HURACÁN — Torbellino destructivo ====
    Huracan(ctx) {
        dropShadow(ctx, 128, 238, 50, 12);
        // Espiral de viento destructivo
        const sLayers = [
            { y: 218, w: 68, h: 30, c: '#64748b' },
            { y: 185, w: 58, h: 26, c: '#78716c' },
            { y: 155, w: 48, h: 24, c: '#7c3aed' },
            { y: 128, w: 40, h: 22, c: '#8b5cf6' },
            { y: 102, w: 34, h: 20, c: '#a78bfa' },
            { y: 78, w: 28, h: 18, c: '#c4b5fd' },
            { y: 58, w: 22, h: 15, c: '#ddd6fe' },
        ];
        sLayers.forEach(l => {
            ellipse(ctx, 128, l.y, l.w, l.h, l.c, '#4c1d95', 3);
            highlight(ctx, 128 - l.w * 0.2, l.y - l.h * 0.3, l.w * 0.4, l.h * 0.3, 0.15);
        });
        // Escombros volando
        ctx.save();
        ctx.globalAlpha = 0.5;
        [{ x: 45, y: 140, s: 8 }, { x: 210, y: 160, s: 6 }, { x: 55, y: 195, s: 7 }, { x: 200, y: 110, s: 5 }].forEach(d => {
            ctx.fillStyle = '#78716c';
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.s * 0.5);
            ctx.fillRect(-d.s / 2, -d.s / 2, d.s, d.s);
            ctx.restore();
        });
        ctx.restore();
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 112, 72, 144, 72, 12, -1, '#7c3aed', true);
        detailMouth(ctx, 128, 95, 10, 'roar', '#4c1d95');
    },

    // ==== DEMONIO — Demonio de contaminación ====
    Demonio(ctx) {
        dropShadow(ctx, 128, 238, 52, 14);
        drawLeg(ctx, 95, 200, 28, 14, '#991b1b', '#450a0a', -1);
        drawLeg(ctx, 161, 200, 28, 14, '#991b1b', '#450a0a', -1);
        // Cuerpo
        ctx.beginPath();
        ctx.moveTo(128, 40);
        ctx.bezierCurveTo(65, 50, 42, 110, 48, 170);
        ctx.bezierCurveTo(52, 215, 82, 230, 128, 230);
        ctx.bezierCurveTo(174, 230, 204, 215, 208, 170);
        ctx.bezierCurveTo(214, 110, 191, 50, 128, 40);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 130, 85, '#ef4444', '#dc2626', '#991b1b');
        ctx.fill();
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 5;
        ctx.stroke();
        // Marcas demoníacas
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 120); ctx.lineTo(85, 160); ctx.lineTo(100, 180);
        ctx.moveTo(156, 120); ctx.lineTo(171, 160); ctx.lineTo(156, 180);
        ctx.stroke();
        ctx.restore();
        // Cuernos
        const drawHorn = (x, dir) => {
            ctx.beginPath();
            ctx.moveTo(x, 55);
            ctx.bezierCurveTo(x + dir * 15, 25, x + dir * 25, 0, x + dir * 20, -15);
            ctx.bezierCurveTo(x + dir * 10, 5, x + dir * 5, 25, x - dir * 5, 55);
            ctx.closePath();
            ctx.fillStyle = linGrad(ctx, x, 55, x + dir * 20, -15, [[0, '#450a0a'], [1, '#78350f']]);
            ctx.fill();
            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        };
        drawHorn(98, -1);
        drawHorn(158, 1);
        // Alas murciélago
        ctx.save();
        ctx.globalAlpha = 0.7;
        // Ala izq
        ctx.beginPath();
        ctx.moveTo(48, 100);
        ctx.bezierCurveTo(8, 70, -5, 110, 15, 140);
        ctx.bezierCurveTo(5, 120, 10, 95, 28, 105);
        ctx.bezierCurveTo(20, 85, 25, 70, 48, 100);
        ctx.closePath();
        ctx.fillStyle = '#7f1d1d';
        ctx.fill();
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Ala der
        ctx.beginPath();
        ctx.moveTo(208, 100);
        ctx.bezierCurveTo(248, 70, 261, 110, 241, 140);
        ctx.bezierCurveTo(251, 120, 246, 95, 228, 105);
        ctx.bezierCurveTo(236, 85, 231, 70, 208, 100);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 100, 95, 156, 95, 16, -1, '#fbbf24', true);
        detailMouth(ctx, 128, 140, 18, 'roar', '#450a0a');
        // Cola puntiaguda
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(128, 225);
        ctx.bezierCurveTo(140, 240, 155, 248, 170, 238);
        ctx.stroke();
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.moveTo(170, 238);
        ctx.lineTo(180, 230);
        ctx.lineTo(175, 245);
        ctx.closePath();
        ctx.fill();
    },

    // ==== FANTASMA — Espectro intangible ====
    Fantasma(ctx) {
        dropShadow(ctx, 128, 238, 45, 10);
        // Aura fantasmal
        ctx.save();
        ctx.globalAlpha = 0.06;
        for (let i = 0; i < 4; i++) circle(ctx, 128, 120, 80 + i * 12, '#c4b5fd');
        ctx.restore();
        // Cuerpo fantasmal
        ctx.beginPath();
        ctx.moveTo(128, 20);
        ctx.bezierCurveTo(70, 30, 48, 80, 52, 150);
        ctx.bezierCurveTo(54, 185, 55, 210, 55, 230);
        // Ondulación inferior
        ctx.bezierCurveTo(70, 220, 80, 235, 95, 225);
        ctx.bezierCurveTo(105, 240, 120, 222, 128, 235);
        ctx.bezierCurveTo(136, 222, 151, 240, 161, 225);
        ctx.bezierCurveTo(176, 235, 186, 220, 201, 230);
        ctx.bezierCurveTo(201, 210, 202, 185, 204, 150);
        ctx.bezierCurveTo(208, 80, 186, 30, 128, 20);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 120, 80, 'rgba(233,230,255,0.85)', 'rgba(196,181,253,0.7)', 'rgba(139,92,246,0.5)');
        ctx.fill();
        ctx.strokeStyle = 'rgba(109,40,217,0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Cadenas
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(70, 140);
        for (let i = 0; i < 5; i++) {
            ctx.bezierCurveTo(70 + i * 20, 135, 70 + i * 20 + 10, 145, 70 + (i + 1) * 20, 140);
        }
        ctx.stroke();
        ctx.restore();
        // Ojos fantasmales — miran a la IZQUIERDA
        // Ojos huecos brillantes
        ellipse(ctx, 100, 90, 18, 22, '#1a1a2e', '#6d28d9', 2);
        ctx.save();
        ctx.globalAlpha = 0.8;
        ellipse(ctx, 98, 90, 10, 13, '#c4b5fd');
        ctx.globalAlpha = 0.9;
        circle(ctx, 96, 88, 4, '#fff');
        ctx.restore();
        ellipse(ctx, 158, 88, 16, 20, '#1a1a2e', '#6d28d9', 2);
        ctx.save();
        ctx.globalAlpha = 0.8;
        ellipse(ctx, 156, 88, 9, 12, '#c4b5fd');
        ctx.globalAlpha = 0.9;
        circle(ctx, 154, 86, 4, '#fff');
        ctx.restore();
        // Boca abierta
        ellipse(ctx, 128, 135, 14, 18, '#1a1a2e', 'rgba(109,40,217,0.5)', 2);
    },

    // ==== TANQUE — Tanque pesado blindado ====
    Tanque(ctx) {
        dropShadow(ctx, 128, 238, 65, 14);
        // Orugas
        roundRect(ctx, 25, 190, 206, 45, 15, '#292524', '#1c1917', 4);
        // Ruedas de oruga
        for (let i = 0; i < 6; i++) {
            const wx = 45 + i * 36;
            circle(ctx, wx, 212, 14, '#44403c', '#292524', 2);
            circle(ctx, wx, 212, 7, '#57534e', '#44403c', 1.5);
        }
        // Casco blindado
        ctx.beginPath();
        ctx.moveTo(30, 195);
        ctx.lineTo(35, 120);
        ctx.lineTo(65, 95);
        ctx.lineTo(201, 95);
        ctx.lineTo(226, 120);
        ctx.lineTo(226, 195);
        ctx.closePath();
        ctx.fillStyle = linGrad(ctx, 30, 95, 226, 195, [[0, '#57534e'], [0.3, '#44403c'], [0.7, '#292524'], [1, '#1c1917']]);
        ctx.fill();
        ctx.strokeStyle = '#0c0a09';
        ctx.lineWidth = 4;
        ctx.stroke();
        // Remaches
        rivetRow(ctx, 45, 105, 211, 105, 8, 3.5, '#78716c');
        rivetRow(ctx, 40, 185, 216, 185, 8, 3.5, '#78716c');
        // Torreta
        roundRect(ctx, 70, 50, 120, 50, 12, linGrad(ctx, 70, 50, 190, 100, [[0, '#44403c'], [1, '#292524']]), '#0c0a09', 3);
        metalPlate(ctx, 80, 58, 100, 35, 6, '#57534e', '#44403c');
        // Cañón — apunta a la IZQUIERDA
        drawCannon(ctx, 70, 75, 65, 20, Math.PI, '#44403c', '#292524', '#ef4444');
        // Ojos — miran a la IZQUIERDA
        eyePair(ctx, 108, 140, 155, 140, 14, -1, '#ef4444', true);
        detailMouth(ctx, 132, 170, 14, 'determined', '#0c0a09');
        // Antena
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(170, 50);
        ctx.lineTo(175, 22);
        ctx.stroke();
        circle(ctx, 175, 20, 4, '#ef4444', '#991b1b', 1.5);
        // Estrella roja
        ctx.fillStyle = '#ef4444';
        circle(ctx, 130, 75, 12, '#ef4444', '#991b1b', 1.5);
    },

    // ==== LEVIATÁN — Jefe final colosal ====
    Leviatan(ctx) {
        dropShadow(ctx, 128, 238, 65, 16);
        // Cuerpo serpentino colosal
        ctx.beginPath();
        ctx.moveTo(128, 8);
        ctx.bezierCurveTo(35, 18, 5, 90, 12, 170);
        ctx.bezierCurveTo(16, 220, 55, 248, 128, 248);
        ctx.bezierCurveTo(201, 248, 240, 220, 244, 170);
        ctx.bezierCurveTo(251, 90, 221, 18, 128, 8);
        ctx.closePath();
        ctx.fillStyle = bodyGrad(ctx, 128, 130, 120, '#1e3a5f', '#0f172a', '#020617');
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 6;
        ctx.stroke();
        // Escamas
        scaleTexture(ctx, 128, 130, 160, 180, 8, 6, '#1e40af');
        // Vientre más claro
        ctx.save();
        ctx.globalAlpha = 0.15;
        ellipse(ctx, 128, 160, 55, 65, '#3b82f6');
        ctx.restore();
        // Corona/cresta en la cabeza
        ctx.fillStyle = '#dc2626';
        for (let i = 0; i < 7; i++) {
            const cx = 68 + i * 24;
            ctx.beginPath();
            ctx.moveTo(cx - 8, 22);
            ctx.lineTo(cx, -5 - (i === 3 ? 10 : 0));
            ctx.lineTo(cx + 8, 22);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
            const cx = 68 + i * 24;
            ctx.moveTo(cx - 8, 22);
            ctx.lineTo(cx, -5 - (i === 3 ? 10 : 0));
            ctx.lineTo(cx + 8, 22);
        }
        ctx.stroke();
        // Ojos enormes — miran a la IZQUIERDA
        detailEye(ctx, 88, 75, 22, -1, '#dc2626', true);
        detailEye(ctx, 168, 75, 22, -1, '#dc2626', true);
        // Boca gigante con colmillos
        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.arc(128, 130, 40, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Colmillos enormes
        ctx.fillStyle = '#fff';
        [{ x: 95, d: -1 }, { x: 108, d: -1 }, { x: 148, d: 1 }, { x: 161, d: 1 }].forEach(f => {
            ctx.beginPath();
            ctx.moveTo(f.x - 6, 128);
            ctx.lineTo(f.x, 155);
            ctx.lineTo(f.x + 6, 128);
            ctx.closePath();
            ctx.fill();
        });
        // Tentáculos/aletas laterales
        ctx.save();
        ctx.globalAlpha = 0.7;
        // Aleta izq
        ctx.beginPath();
        ctx.moveTo(12, 130);
        ctx.bezierCurveTo(-20, 100, -25, 150, -5, 175);
        ctx.bezierCurveTo(-15, 140, -10, 115, 12, 130);
        ctx.closePath();
        ctx.fillStyle = '#1e3a5f';
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Aleta der
        ctx.beginPath();
        ctx.moveTo(244, 130);
        ctx.bezierCurveTo(276, 100, 281, 150, 261, 175);
        ctx.bezierCurveTo(271, 140, 266, 115, 244, 130);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        // Marcas luminosas
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        [{ x: 75, y: 175 }, { x: 128, y: 200 }, { x: 181, y: 175 }].forEach(m => {
            ctx.beginPath();
            ctx.moveTo(m.x - 12, m.y);
            ctx.lineTo(m.x, m.y - 8);
            ctx.lineTo(m.x + 12, m.y);
            ctx.stroke();
        });
        ctx.restore();
        highlight(ctx, 100, 35, 30, 20, 0.12);
    },
};

// ─── GENERACIÓN ──────────────────────────────────────────────────────────────

const BASE_DIR = path.join(__dirname, 'models');

function generateAll() {
    console.log('\n🎨 Generando modelos PNG v2 (detallados) para Wacheck...\n');

    console.log('── DEFENSORES (→ derecha) ──');
    for (const [key, drawFn] of Object.entries(defenderDrawers)) {
        const { c, ctx } = newCanvas();
        drawFn(ctx);
        const dir = path.join(BASE_DIR, 'allDefenderTypes', key);
        savePNG(c, path.join(dir, `${key}.png`));
    }

    console.log('\n── CONTAMINANTES (← izquierda) ──');
    for (const [key, drawFn] of Object.entries(contaminantDrawers)) {
        const { c, ctx } = newCanvas();
        drawFn(ctx);
        const dir = path.join(BASE_DIR, 'allContaminatorTypes', key);
        savePNG(c, path.join(dir, `${key}.png`));
    }

    const defCount = Object.keys(defenderDrawers).length;
    const contCount = Object.keys(contaminantDrawers).length;
    console.log(`\n✅ Generación completa: ${defCount} defensores + ${contCount} contaminantes = ${defCount + contCount} PNGs (256x256, detallados)\n`);
}

generateAll();
