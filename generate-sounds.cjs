/**
 * generate-sounds.cjs
 * Genera archivos MP3 de efectos de sonido para el juego Wacheck.
 * Usa lamejs para codificar PCM a MP3.
 * Todos los sonidos son < 2 segundos.
 */
const fs = require('fs');
const path = require('path');

// lamejs lame.all.js uses a self-executing function pattern.
// We inject a global 'lamejs' object and execute the bundle so it attaches Mp3Encoder.
const lameCode = fs.readFileSync(path.join(__dirname, 'node_modules', 'lamejs', 'lame.all.js'), 'utf8');
const vm = require('vm');
const sandbox = { lamejs: {}, console };
vm.createContext(sandbox);
vm.runInContext(lameCode, sandbox);
const Mp3Encoder = sandbox.lamejs.Mp3Encoder;

const SAMPLE_RATE = 44100;
const BASE = path.join(__dirname, 'sounds');

// ============================================================
// UTILIDADES DE SÍNTESIS
// ============================================================

function generateSamples(durationSec, generator) {
    const n = Math.floor(durationSec * SAMPLE_RATE);
    const buf = new Int16Array(n);
    for (let i = 0; i < n; i++) {
        const t = i / SAMPLE_RATE;
        const val = generator(t, i, n);
        buf[i] = Math.max(-32768, Math.min(32767, Math.round(val * 32767)));
    }
    return buf;
}

function encodeToMp3(samples) {
    const enc = new Mp3Encoder(1, SAMPLE_RATE, 128);
    const parts = [];
    const block = 1152;
    for (let i = 0; i < samples.length; i += block) {
        const chunk = samples.subarray(i, Math.min(i + block, samples.length));
        const mp3buf = enc.encodeBuffer(chunk);
        if (mp3buf.length > 0) parts.push(Buffer.from(mp3buf));
    }
    const end = enc.flush();
    if (end.length > 0) parts.push(Buffer.from(end));
    return Buffer.concat(parts);
}

function saveMp3(filePath, samples) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const mp3 = encodeToMp3(samples);
    fs.writeFileSync(filePath, mp3);
    console.log(`  ✓ ${path.relative(BASE, filePath)} (${(mp3.length / 1024).toFixed(1)} KB)`);
}

// --- Waveform primitives ---
const sine = (t, freq) => Math.sin(2 * Math.PI * freq * t);
const square = (t, freq) => Math.sin(2 * Math.PI * freq * t) >= 0 ? 1 : -1;
const saw = (t, freq) => 2 * ((t * freq) % 1) - 1;
const triangle = (t, freq) => 2 * Math.abs(2 * ((t * freq) % 1) - 1) - 1;
const noise = () => Math.random() * 2 - 1;

// Envelope: attack-decay
function envelope(t, attack, decay, sustain, release, total) {
    if (t < attack) return t / attack;
    if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
    if (t < total - release) return sustain;
    return sustain * (1 - (t - (total - release)) / release);
}

// Simple envelope: quick attack, exponential decay
function expDecay(t, duration, power = 3) {
    return Math.pow(Math.max(0, 1 - t / duration), power);
}

// Linear interpolation
function lerp(a, b, t) { return a + (b - a) * t; }

// ============================================================
// DEFENDER SOUND GENERATORS
// ============================================================

function generateFireSound() {
    // Whooshing flame: filtered noise + low sine sweep, 1.2s
    const dur = 1.2;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.3, 0.4, 0.4, dur);
        const freq = lerp(400, 120, t / dur);
        const flame = noise() * 0.5 + sine(t, freq) * 0.3 + sine(t, freq * 2.5) * 0.15;
        // Crackle pops
        const crackle = (Math.random() < 0.02) ? noise() * 0.8 : 0;
        return (flame + crackle) * env * 0.7;
    });
}

function generateExplosionSound() {
    // Big boom: low freq burst + noise, 1.5s
    const dur = 1.5;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2.5);
        const freq = lerp(80, 30, t / dur);
        const boom = sine(t, freq) * 0.6 + sine(t, freq * 1.5) * 0.2;
        const noiseComp = noise() * 0.5 * expDecay(t, 0.4, 3);
        const rumble = sine(t, 25 + Math.random() * 10) * 0.15 * expDecay(t, dur, 1.5);
        return (boom + noiseComp + rumble) * env * 0.8;
    });
}

// ============================================================
// CONTAMINANT SOUND GENERATORS
// ============================================================

function generateFabricaSound() {
    // Industrial clank: metallic hit + machinery hum, 1.5s
    const dur = 1.5;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2);
        const hit = sine(t, 180) * expDecay(t, 0.1, 5) * 0.6;
        const metal = (sine(t, 1200) + sine(t, 2400) + sine(t, 3600)) / 3 * expDecay(t, 0.15, 4) * 0.5;
        const hum = saw(t, 60) * 0.15 * envelope(t, 0.2, 0.1, 0.8, 0.4, dur);
        return (hit + metal + hum) * env * 0.7;
    });
}

function generatePetroleoSound() {
    // Sludgy bubble/drip: sine pops + low gurgle, 1.3s
    const dur = 1.3;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.2, 0.5, 0.5, dur);
        const bubbleRate = 8 + Math.sin(t * 3) * 4;
        const bubble = sine(t, 200 + 100 * Math.sin(t * bubbleRate)) * 0.4;
        const drip = (Math.random() < 0.015) ? sine(t, 600 + Math.random() * 400) * 0.6 : 0;
        const low = sine(t, 50) * 0.2;
        return (bubble + drip + low) * env * 0.6;
    });
}

function generateNuclearSound() {
    // Geiger counter clicks + radiation hum, 1.5s
    const dur = 1.5;
    let lastClick = 0;
    let nextClick = 0.05;
    return generateSamples(dur, (t, i, n) => {
        const env = envelope(t, 0.1, 0.2, 0.6, 0.5, dur);
        // Radiation hum
        const hum = sine(t, 100) * 0.1 + sine(t, 200) * 0.05;
        // Geiger clicks
        let click = 0;
        if (t >= nextClick && t < nextClick + 0.005) {
            click = noise() * 0.8;
        }
        if (t >= nextClick + 0.005) {
            lastClick = nextClick;
            nextClick = lastClick + 0.03 + Math.random() * 0.12;
        }
        const alarm = sine(t, 800 + 200 * Math.sin(t * 6)) * 0.1 * Math.sin(t * 4);
        return (hum + click + alarm) * env * 0.7;
    });
}

function generateBasuraSound() {
    // Crumbling/crushing trash, 1.0s
    const dur = 1.0;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2);
        const crumble = noise() * 0.6 * expDecay(t, 0.5, 2);
        const crunch = noise() * square(t, 15) * 0.3;
        const thud = sine(t, 80) * expDecay(t, 0.2, 4) * 0.4;
        return (crumble + crunch + thud) * env * 0.6;
    });
}

function generateAutoSound() {
    // Engine rev / honk, 1.2s
    const dur = 1.2;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.08, 0.2, 0.5, 0.4, dur);
        const freq = lerp(80, 200, Math.min(1, t / 0.5));
        const engine = (saw(t, freq) * 0.3 + saw(t, freq * 2.01) * 0.15) * env;
        // Short honk at start
        const honk = sine(t, 440) * 0.4 * expDecay(t, 0.15, 5);
        const honk2 = sine(t, 554) * 0.25 * expDecay(t, 0.15, 5);
        return (engine + honk + honk2) * 0.6;
    });
}

function generateQuimicoSound() {
    // Acid bubbling / sizzle, 1.3s
    const dur = 1.3;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.15, 0.6, 0.5, dur);
        const sizzle = noise() * 0.3 * (0.5 + 0.5 * sine(t, 20));
        const bubble = sine(t, 300 + 200 * Math.abs(sine(t, 5))) * 0.35;
        const acid = sine(t, 150 + noise() * 50) * 0.2;
        return (sizzle + bubble + acid) * env * 0.6;
    });
}

function generateFuegoSound() {
    // Fire crackling, 1.2s
    const dur = 1.2;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.03, 0.2, 0.5, 0.4, dur);
        const crackle = noise() * 0.4 * (0.6 + 0.4 * Math.abs(sine(t, 12)));
        const pop = (Math.random() < 0.01) ? noise() * 0.7 : 0;
        const warmth = sine(t, lerp(200, 80, t / dur)) * 0.25;
        return (crackle + pop + warmth) * env * 0.65;
    });
}

function generateToxicoSound() {
    // Poisonous hiss + bubbling, 1.5s
    const dur = 1.5;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.1, 0.3, 0.5, 0.5, dur);
        const hiss = noise() * 0.35 * (0.7 + 0.3 * sine(t, 3));
        const bubble = sine(t, 250 + 150 * sine(t, 7)) * 0.3;
        const sweep = sine(t, lerp(600, 200, t / dur)) * 0.15;
        return (hiss + bubble + sweep) * env * 0.6;
    });
}

function generateHuracanSound() {
    // Wind howl: filtered noise + sine sweep, 1.8s
    const dur = 1.8;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.2, 0.3, 0.6, 0.6, dur);
        const wind = noise() * 0.4 * (0.5 + 0.5 * sine(t, 0.8));
        const howl = sine(t, 350 + 200 * sine(t, 1.5)) * 0.3;
        const gust = noise() * 0.3 * Math.max(0, sine(t, 2.5));
        return (wind + howl + gust) * env * 0.65;
    });
}

function generateDemonioSound() {
    // Deep growl: low sawtooth with vibrato, 1.5s
    const dur = 1.5;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.15, 0.3, 0.5, 0.5, dur);
        const vibrato = 5 * sine(t, 6);
        const growl = saw(t, 55 + vibrato) * 0.4;
        const sub = sine(t, 35 + vibrato / 2) * 0.3;
        const rasp = noise() * 0.15 * (0.5 + 0.5 * sine(t, 4));
        const harmonic = sine(t, 110 + vibrato * 2) * 0.15;
        return (growl + sub + rasp + harmonic) * env * 0.7;
    });
}

function generateFantasmaSound() {
    // Ethereal whoosh: high sine with slow vibrato, 1.5s
    const dur = 1.5;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.3, 0.2, 0.4, 0.6, dur);
        const vibrato = 30 * sine(t, 2.5);
        const ghost = sine(t, 600 + vibrato) * 0.3;
        const ghost2 = sine(t, 800 + vibrato * 1.5) * 0.2;
        const whisper = noise() * 0.1 * (0.3 + 0.7 * sine(t, 1.5));
        const sweep = sine(t, lerp(1200, 400, t / dur)) * 0.15 * expDecay(t, dur, 1);
        return (ghost + ghost2 + whisper + sweep) * env * 0.6;
    });
}

function generateTanqueSound() {
    // Heavy metal rumble + treads, 1.5s
    const dur = 1.5;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.1, 0.2, 0.6, 0.4, dur);
        const rumble = sine(t, 40) * 0.4 + sine(t, 60) * 0.2;
        const treads = noise() * 0.25 * (0.5 + 0.5 * square(t, 8));
        const impact = sine(t, 100) * expDecay(t, 0.15, 4) * 0.5;
        const metal = (sine(t, 800) + sine(t, 1600)) / 2 * expDecay(t, 0.08, 6) * 0.3;
        return (rumble + treads + impact + metal) * env * 0.65;
    });
}

function generateLeviatanSound() {
    // Deep roar: very low frequency sweep + harmonics, 2.0s
    const dur = 2.0;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.2, 0.4, 0.5, 0.6, dur);
        const freq = lerp(60, 25, t / dur);
        const vibrato = 8 * sine(t, 3);
        const roar = saw(t, freq + vibrato) * 0.35;
        const sub = sine(t, freq / 2) * 0.25;
        const harmonics = sine(t, freq * 3 + vibrato * 2) * 0.15 + sine(t, freq * 5) * 0.08;
        const rumble = noise() * 0.2 * (0.5 + 0.5 * sine(t, 2));
        return (roar + sub + harmonics + rumble) * env * 0.75;
    });
}

// ============================================================
// GAME UI SOUND GENERATORS (para sonidos faltantes)
// ============================================================

function generateHitSound() {
    // Quick impact, 0.3s
    const dur = 0.3;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 3);
        return (sine(t, 200) * 0.5 + noise() * 0.4) * env * 0.7;
    });
}

function generateCriticalSound() {
    // Sharp metallic ping + burst, 0.4s
    const dur = 0.4;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2.5);
        const ping = sine(t, 1200) * 0.4 + sine(t, 1800) * 0.2;
        const burst = noise() * 0.3 * expDecay(t, 0.1, 5);
        return (ping + burst) * env * 0.7;
    });
}

function generateKillSound() {
    // Enemy destroyed: downward sweep + pop, 0.5s
    const dur = 0.5;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2);
        const sweep = sine(t, lerp(800, 100, t / dur)) * 0.5;
        const pop = noise() * 0.4 * expDecay(t, 0.1, 5);
        return (sweep + pop) * env * 0.7;
    });
}

function generateSpawnSound() {
    // Enemy appears: rising tone, 0.5s
    const dur = 0.5;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.1, 0.5, 0.2, dur);
        const sweep = sine(t, lerp(200, 400, t / dur)) * 0.4;
        const hiss = noise() * 0.15;
        return (sweep + hiss) * env * 0.6;
    });
}

function generateWaveStartSound() {
    // Alert: ascending tones, 0.8s
    const dur = 0.8;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.1, 0.7, 0.2, dur);
        const step = Math.floor(t / 0.2);
        const freqs = [400, 500, 600, 800];
        const f = freqs[Math.min(step, freqs.length - 1)];
        return triangle(t, f) * env * 0.5;
    });
}

function generateWaveCompleteSound() {
    // Victory fanfare: chord, 1.0s
    const dur = 1.0;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.15, 0.6, 0.4, dur);
        const chord = (sine(t, 523) + sine(t, 659) + sine(t, 784)) / 3 * 0.4;
        const shimmer = sine(t, 1047) * 0.15 * (0.5 + 0.5 * sine(t, 8));
        return (chord + shimmer) * env * 0.6;
    });
}

function generateVictorySound() {
    // Grand victory: major chord ascending, 1.8s
    const dur = 1.8;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.1, 0.2, 0.6, 0.5, dur);
        const phase = Math.min(1, t / 0.6);
        const base = lerp(400, 600, phase);
        const chord = (sine(t, base) + sine(t, base * 1.25) + sine(t, base * 1.5)) / 3 * 0.4;
        const sparkle = sine(t, base * 3) * 0.1 * (0.5 + 0.5 * sine(t, 6));
        return (chord + sparkle) * env * 0.55;
    });
}

function generatePlaceDefenderSound() {
    // Placement thud + confirmation, 0.4s
    const dur = 0.4;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2.5);
        const thud = sine(t, 150) * 0.4 * expDecay(t, 0.1, 4);
        const confirm = sine(t, 500) * 0.3 * expDecay(t, dur, 2);
        return (thud + confirm) * env * 0.65;
    });
}

function generateRemoveDefenderSound() {
    // Quick descending tone, 0.3s
    const dur = 0.3;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2);
        return sine(t, lerp(500, 150, t / dur)) * env * 0.6;
    });
}

function generateUpgradeDefenderSound() {
    // Ascending chime, 0.6s
    const dur = 0.6;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.03, 0.1, 0.5, 0.3, dur);
        const freq = lerp(500, 1000, Math.min(1, t / 0.3));
        return (sine(t, freq) * 0.4 + sine(t, freq * 1.5) * 0.2) * env * 0.6;
    });
}

function generateCoinSound() {
    // Coin pickup ding, 0.3s
    const dur = 0.3;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 2.5);
        return (sine(t, 800) * 0.35 + sine(t, 1200) * 0.25) * env * 0.6;
    });
}

function generateUnlockSound() {
    // Unlock fanfare, 0.8s
    const dur = 0.8;
    return generateSamples(dur, (t) => {
        const env = envelope(t, 0.05, 0.1, 0.6, 0.3, dur);
        const step = Math.floor(t / 0.15);
        const freqs = [523, 659, 784, 1047, 1318];
        const f = freqs[Math.min(step, freqs.length - 1)];
        return sine(t, f) * env * 0.5;
    });
}

function generateShootGeneric() {
    // Quick pew, 0.15s
    const dur = 0.15;
    return generateSamples(dur, (t) => {
        const env = expDecay(t, dur, 3);
        return (sine(t, lerp(600, 200, t / dur)) * 0.5 + noise() * 0.2) * env * 0.6;
    });
}

// ============================================================
// MAIN: Generate all sounds
// ============================================================

console.log('\n=== Generando sonidos para Wacheck ===\n');

// --- Defender category sounds (empty folders) ---
console.log('>> Sonidos de defensores (por categoría):');
saveMp3(path.join(BASE, 'allDefenderTypes', 'fire', 'fire.mp3'), generateFireSound());
saveMp3(path.join(BASE, 'allDefenderTypes', 'explosion', 'explosion.mp3'), generateExplosionSound());

// --- Contaminant sounds ---
console.log('\n>> Sonidos de contaminantes:');
saveMp3(path.join(BASE, 'allContaminatorTypes', 'fabrica.mp3'), generateFabricaSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'petroleo.mp3'), generatePetroleoSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'nuclear.mp3'), generateNuclearSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'basura.mp3'), generateBasuraSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'auto.mp3'), generateAutoSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'quimico.mp3'), generateQuimicoSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'fuego.mp3'), generateFuegoSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'toxico.mp3'), generateToxicoSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'huracan.mp3'), generateHuracanSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'demonio.mp3'), generateDemonioSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'fantasma.mp3'), generateFantasmaSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'tanque.mp3'), generateTanqueSound());
saveMp3(path.join(BASE, 'allContaminatorTypes', 'leviatan.mp3'), generateLeviatanSound());

// --- Game UI / event sounds ---
console.log('\n>> Sonidos de juego (UI y eventos):');
saveMp3(path.join(BASE, 'game_ui', 'hit.mp3'), generateHitSound());
saveMp3(path.join(BASE, 'game_ui', 'critical.mp3'), generateCriticalSound());
saveMp3(path.join(BASE, 'game_ui', 'kill.mp3'), generateKillSound());
saveMp3(path.join(BASE, 'game_ui', 'spawn.mp3'), generateSpawnSound());
saveMp3(path.join(BASE, 'game_ui', 'wave_start.mp3'), generateWaveStartSound());
saveMp3(path.join(BASE, 'game_ui', 'wave_complete.mp3'), generateWaveCompleteSound());
saveMp3(path.join(BASE, 'game_ui', 'victory.mp3'), generateVictorySound());
saveMp3(path.join(BASE, 'game_ui', 'place_defender.mp3'), generatePlaceDefenderSound());
saveMp3(path.join(BASE, 'game_ui', 'remove_defender.mp3'), generateRemoveDefenderSound());
saveMp3(path.join(BASE, 'game_ui', 'upgrade_defender.mp3'), generateUpgradeDefenderSound());
saveMp3(path.join(BASE, 'game_ui', 'coin.mp3'), generateCoinSound());
saveMp3(path.join(BASE, 'game_ui', 'unlock.mp3'), generateUnlockSound());
saveMp3(path.join(BASE, 'game_ui', 'shoot_generic.mp3'), generateShootGeneric());

console.log('\n=== ¡Generación completa! ===\n');
