<?php
// Panel de administración Wacheck - renderizado en servidor
// No HTML visible sin autenticación PHP primero
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Wacheck Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --surface2: #263348;
  --border: #334155;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --accent: #0891b2;
  --accent2: #06b6d4;
  --green: #10b981;
  --red: #ef4444;
  --yellow: #f59e0b;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

/* --- LOGIN --- */
#loginScreen {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% 50%, #0c3450 0%, #0f172a 70%);
}
.login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow);
}
.login-logo { text-align: center; margin-bottom: 32px; }
.login-logo svg { width: 56px; height: 56px; color: var(--accent2); }
.login-logo h1 { font-size: 1.8rem; font-weight: 700; color: var(--text); margin-top: 12px; }
.login-logo p { color: var(--text2); font-size: 0.9rem; margin-top: 4px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: var(--text2); margin-bottom: 8px; }
.form-group input {
  width: 100%; padding: 12px 16px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text); font-size: 0.95rem;
  transition: border-color 0.2s;
}
.form-group input:focus { outline: none; border-color: var(--accent2); }
.btn-primary {
  width: 100%; padding: 13px; background: var(--accent);
  color: white; border: none; border-radius: 8px; font-size: 1rem;
  font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: var(--accent2); }
.login-error { color: var(--red); font-size: 0.9rem; margin-top: 12px; text-align: center; min-height: 20px; }

/* --- DASHBOARD --- */
#dashboard { display: none; min-height: 100vh; }
.sidebar {
  position: fixed; left: 0; top: 0; bottom: 0; width: 240px;
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  z-index: 100;
}
.sidebar-logo {
  padding: 24px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 12px;
}
.sidebar-logo svg { width: 32px; height: 32px; color: var(--accent2); }
.sidebar-logo span { font-size: 1.2rem; font-weight: 700; }
.sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  color: var(--text2); font-size: 0.9rem; font-weight: 500;
  transition: all 0.2s; margin-bottom: 4px;
}
.nav-item:hover { background: var(--surface2); color: var(--text); }
.nav-item.active { background: var(--accent); color: white; }
.nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
.sidebar-footer {
  padding: 16px 20px; border-top: 1px solid var(--border);
}
.logout-btn {
  display: flex; align-items: center; gap: 8px;
  color: var(--red); cursor: pointer; font-size: 0.9rem;
  background: none; border: none; font-family: inherit;
}
.logout-btn:hover { color: #ff6b6b; }

.main { margin-left: 240px; padding: 32px; }
.page { display: none; animation: fadeIn 0.2s ease; }
.page.active { display: block; }
@keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }

.page-header { margin-bottom: 28px; }
.page-header h2 { font-size: 1.6rem; font-weight: 700; }
.page-header p { color: var(--text2); margin-top: 4px; }

/* --- STATS CARDS --- */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px;
}
.stat-card .label { font-size: 0.8rem; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
.stat-card .value { font-size: 2rem; font-weight: 700; margin-top: 4px; }
.stat-card .sub { font-size: 0.8rem; color: var(--text2); margin-top: 2px; }
.stat-card.green .value { color: var(--green); }
.stat-card.cyan .value { color: var(--accent2); }
.stat-card.yellow .value { color: var(--yellow); }

/* --- TABLE --- */
.table-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
}
.table-header h3 { font-size: 1rem; font-weight: 600; }
.search-input {
  padding: 8px 14px; background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text); font-size: 0.9rem;
}
.search-input:focus { outline: none; border-color: var(--accent2); }
table { width: 100%; border-collapse: collapse; }
th { padding: 12px 16px; text-align: left; font-size: 0.8rem; color: var(--text2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); background: var(--bg); }
td { padding: 12px 16px; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--surface2); }

.badge {
  display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
}
.badge.green { background: rgba(16,185,129,0.15); color: var(--green); }
.badge.red { background: rgba(239,68,68,0.15); color: var(--red); }
.badge.yellow { background: rgba(245,158,11,0.15); color: var(--yellow); }

.btn-sm {
  padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 500;
  cursor: pointer; border: none; transition: all 0.15s;
}
.btn-edit { background: rgba(8,145,178,0.15); color: var(--accent2); }
.btn-edit:hover { background: var(--accent); color: white; }
.btn-delete { background: rgba(239,68,68,0.15); color: var(--red); }
.btn-delete:hover { background: var(--red); color: white; }
.btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: var(--accent); color: white;
  border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.btn-add:hover { background: var(--accent2); }

/* --- MODAL --- */
.modal-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.6); z-index: 1000;
  align-items: center; justify-content: center;
}
.modal-overlay.open { display: flex; }
.modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 28px; width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow);
}
.modal-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.modal-grid.single { grid-template-columns: 1fr; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.btn-cancel {
  padding: 9px 18px; background: var(--surface2); color: var(--text2);
  border: 1px solid var(--border); border-radius: 8px; cursor: pointer;
}
.btn-save {
  padding: 9px 18px; background: var(--green); color: white;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
}

/* --- CONFIG FORM --- */
.config-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* --- PAGINATION --- */
.pagination { display: flex; gap: 8px; align-items: center; padding: 16px 20px; justify-content: flex-end; }
.page-btn {
  padding: 6px 12px; border-radius: 6px; cursor: pointer;
  background: var(--surface2); border: 1px solid var(--border); color: var(--text);
  font-size: 0.9rem;
}
.page-btn.active { background: var(--accent); border-color: var(--accent); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* --- TOAST --- */
#toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--green); color: white;
  padding: 12px 20px; border-radius: 8px; font-size: 0.9rem;
  font-weight: 500; opacity: 0; transform: translateY(10px);
  transition: all 0.3s; z-index: 9999;
  box-shadow: var(--shadow);
}
#toast.error { background: var(--red); }
#toast.show { opacity: 1; transform: translateY(0); }

/* Loader */
.loader { text-align: center; padding: 40px; color: var(--text2); }
.loading-spinner {
  display: inline-block; width: 24px; height: 24px;
  border: 3px solid var(--border); border-top-color: var(--accent2);
  border-radius: 50%; animation: spin 0.8s linear infinite;
  margin-right: 10px; vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile responsive */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
  .sidebar.open { transform: translateX(0); }
  .main { margin-left: 0; padding: 16px; }
  .modal-grid { grid-template-columns: 1fr; }
  .config-form { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>
</head>
<body>

<!-- LOGIN SCREEN -->
<div id="loginScreen">
  <div class="login-card">
    <div class="login-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C6.5 8 2 12.5 2 16a10 10 0 0020 0c0-3.5-4.5-8-10-14z"/>
        <path d="M9 16a3 3 0 006 0"/>
      </svg>
      <h1>Wacheck Admin</h1>
      <p>Panel de Administración</p>
    </div>
    <div class="form-group">
      <label for="adminEmail">Correo Electrónico</label>
      <input type="email" id="adminEmail" placeholder="faguilar@ucol.mx" autocomplete="username">
    </div>
    <div class="form-group">
      <label for="adminPassword">Contraseña</label>
      <input type="password" id="adminPassword" placeholder="••••••••" autocomplete="current-password">
    </div>
    <button class="btn-primary" onclick="adminLogin()">Iniciar Sesión</button>
    <div class="login-error" id="loginError"></div>
  </div>
</div>

<!-- DASHBOARD -->
<div id="dashboard">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2C6.5 8 2 12.5 2 16a10 10 0 0020 0c0-3.5-4.5-8-10-14z"/>
      </svg>
      <span>Wacheck</span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-item active" onclick="showPage('overview')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Resumen
      </div>
      <div class="nav-item" onclick="showPage('users')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        Usuarios
      </div>
      <div class="nav-item" onclick="showPage('defenders')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Defensores
      </div>
      <div class="nav-item" onclick="showPage('contaminants')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        Contaminantes
      </div>
      <div class="nav-item" onclick="showPage('config')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93L4.93 19.07M4.93 4.93l14.14 14.14"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3"/></svg>
        Configuración
      </div>
      <div class="nav-item" onclick="showPage('logs')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Actividad
      </div>
    </nav>
    <div class="sidebar-footer">
      <button class="logout-btn" onclick="adminLogout()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Cerrar sesión
      </button>
    </div>
  </aside>

  <main class="main">

    <!-- OVERVIEW -->
    <div class="page active" id="page-overview">
      <div class="page-header">
        <h2>Resumen General</h2>
        <p>Estado actual del juego y la plataforma</p>
      </div>
      <div class="stats-grid" id="statsGrid">
        <div class="loader"><span class="loading-spinner"></span> Cargando...</div>
      </div>
      <div id="topUsersTable"></div>
    </div>

    <!-- USUARIOS -->
    <div class="page" id="page-users">
      <div class="page-header">
        <h2>Gestión de Usuarios</h2>
        <p>Visualizar y editar cuentas de jugadores</p>
      </div>
      <div class="table-card">
        <div class="table-header">
          <h3>Usuarios Registrados</h3>
          <input type="search" class="search-input" id="userSearch" placeholder="Buscar usuario..." oninput="searchUsers(this.value)">
        </div>
        <div id="usersTableContainer"><div class="loader"><span class="loading-spinner"></span> Cargando...</div></div>
        <div class="pagination" id="userPagination"></div>
      </div>
    </div>

    <!-- DEFENSORES -->
    <div class="page" id="page-defenders">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h2>Defensores del Juego</h2>
          <p>Crear, editar y configurar estadísticas de defensores</p>
        </div>
        <button class="btn-add" onclick="openDefenderModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Defensor
        </button>
      </div>
      <div class="table-card">
        <div id="defendersTableContainer"><div class="loader"><span class="loading-spinner"></span> Cargando...</div></div>
      </div>
    </div>

    <!-- CONTAMINANTES -->
    <div class="page" id="page-contaminants">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h2>Contaminantes</h2>
          <p>Configurar enemigos y jefes del juego</p>
        </div>
        <button class="btn-add" onclick="openContaminantModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Contaminante
        </button>
      </div>
      <div class="table-card">
        <div id="contaminantsTableContainer"><div class="loader"><span class="loading-spinner"></span> Cargando...</div></div>
      </div>
    </div>

    <!-- CONFIG -->
    <div class="page" id="page-config">
      <div class="page-header">
        <h2>Configuración Global del Juego</h2>
        <p>Parámetros que controlan el balance del juego en el servidor</p>
      </div>
      <div class="table-card" style="padding:24px;">
        <div id="gameConfigForm"><div class="loader"><span class="loading-spinner"></span> Cargando...</div></div>
      </div>
    </div>

    <!-- LOGS -->
    <div class="page" id="page-logs">
      <div class="page-header">
        <h2>Registro de Actividad</h2>
        <p>Auditoría de acciones en la plataforma</p>
      </div>
      <div class="table-card">
        <div id="logsTableContainer"><div class="loader"><span class="loading-spinner"></span> Cargando...</div></div>
        <div class="pagination" id="logsPagination"></div>
      </div>
    </div>

  </main>
</div>

<!-- MODAL DEFENSOR -->
<div class="modal-overlay" id="defenderModal">
  <div class="modal">
    <h3 class="modal-title" id="defenderModalTitle">Nuevo Defensor</h3>
    <input type="hidden" id="defId">
    <div class="modal-grid">
      <div class="form-group"><label>Key (único)</label><input id="defKey" placeholder="filter, plant..."></div>
      <div class="form-group"><label>Nombre</label><input id="defName" placeholder="Filtro"></div>
      <div class="form-group"><label>Daño</label><input type="number" id="defDamage" min="0" value="25"></div>
      <div class="form-group"><label>Costo (monedas)</label><input type="number" id="defCost" min="1" value="50"></div>
      <div class="form-group"><label>Vida (HP)</label><input type="number" id="defHealth" min="1" value="100"></div>
      <div class="form-group"><label>Rango (celdas)</label><input type="number" id="defRange" min="1" max="10" value="4"></div>
      <div class="form-group"><label>Intervalo disparo (ms)</label><input type="number" id="defInterval" min="100" value="1200"></div>
      <div class="form-group"><label>Proyectil</label>
        <select id="defProjectile" style="background:var(--bg);border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;width:100%;">
          <option value="water">Agua</option><option value="nature">Naturaleza</option>
          <option value="energy">Energía</option><option value="pure">Puro</option>
          <option value="fire">Fuego</option><option value="ice">Hielo</option>
          <option value="explosion">Explosión</option>
        </select>
      </div>
      <div class="form-group"><label>¿Desbloqueable?</label>
        <select id="defUnlockable" style="background:var(--bg);border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;width:100%;">
          <option value="0">No (básico)</option><option value="1">Sí (con estrellas)</option>
        </select>
      </div>
      <div class="form-group"><label>Costo desbloqueo (estrellas)</label><input type="number" id="defUnlockCost" min="0" value="0"></div>
    </div>
    <div class="form-group" style="margin-top:12px;"><label>URL Imagen/Icono (opcional)</label><input id="defIcon" placeholder="img/filter.png o URL"></div>
    <div class="form-group"><label>Descripción</label><input id="defDesc" placeholder="Descripción para la tienda"></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeDefenderModal()">Cancelar</button>
      <button class="btn-save" onclick="saveDefender()">Guardar</button>
    </div>
  </div>
</div>

<!-- MODAL CONTAMINANTE -->
<div class="modal-overlay" id="contaminantModal">
  <div class="modal">
    <h3 class="modal-title" id="contModalTitle">Nuevo Contaminante</h3>
    <input type="hidden" id="contId">
    <div class="modal-grid">
      <div class="form-group"><label>Nombre</label><input id="contName" placeholder="Fábrica"></div>
      <div class="form-group"><label>Vida (HP)</label><input type="number" id="contHealth" min="1" value="100"></div>
      <div class="form-group"><label>Velocidad (0.1–5.0)</label><input type="number" id="contSpeed" min="0.1" max="5" step="0.1" value="1.0"></div>
      <div class="form-group"><label>Monedas al morir</label><input type="number" id="contCoins" min="0" value="10"></div>
      <div class="form-group"><label>¿Es Jefe?</label>
        <select id="contBoss" style="background:var(--bg);border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;width:100%;">
          <option value="0">No</option><option value="1">Sí (Jefe)</option>
        </select>
      </div>
      <div class="form-group"><label>URL Imagen/Icono</label><input id="contIcon" placeholder="img/boss.png o URL"></div>
    </div>
    <div class="form-group" style="margin-top:12px;"><label>Descripción</label><input id="contDesc" placeholder="Descripción del contaminante"></div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="document.getElementById('contaminantModal').classList.remove('open')">Cancelar</button>
      <button class="btn-save" onclick="saveContaminant()">Guardar</button>
    </div>
  </div>
</div>

<!-- MODAL EDITAR USUARIO -->
<div class="modal-overlay" id="editUserModal">
  <div class="modal">
    <h3 class="modal-title">Editar Usuario</h3>
    <input type="hidden" id="editUserId">
    <div class="modal-grid">
      <div class="form-group"><label>Monedas Especiales</label><input type="number" id="editSpecialCoins" min="0"></div>
      <div class="form-group"><label>Monedas</label><input type="number" id="editCoins" min="0"></div>
      <div class="form-group"><label>Estrellas</label><input type="number" id="editStars" min="0"></div>
      <div class="form-group"><label>Runas</label><input type="number" id="editRunes" min="0"></div>
      <div class="form-group"><label>Email verificado</label>
        <select id="editVerified" style="background:var(--bg);border:1px solid var(--border);color:var(--text);padding:12px 16px;border-radius:8px;width:100%;">
          <option value="1">Sí</option><option value="0">No</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="document.getElementById('editUserModal').classList.remove('open')">Cancelar</button>
      <button class="btn-save" onclick="saveUser()">Guardar Cambios</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>
const API = '../api/admin_handler.php';
let adminToken = sessionStorage.getItem('wacheck_admin_token') || '';
let currentUsersPage = 1;
let currentLogsPage = 1;
let userSearchTimeout = null;

// --- AUTO LOGIN SI HAY TOKEN ---
if (adminToken) tryAutoLogin();

async function adminLogin() {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if (!email || !password) { errEl.textContent = 'Completa todos los campos'; return; }

  try {
    const r = await fetch(`${API}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (data.success) {
      adminToken = data.token;
      sessionStorage.setItem('wacheck_admin_token', adminToken);
      showDashboard();
    } else {
      errEl.textContent = data.error || 'Credenciales incorrectas';
    }
  } catch (e) {
    errEl.textContent = 'Error de conexión';
  }
}

async function tryAutoLogin() {
  try {
    const r = await fetch(`${API}?action=stats`, { headers: { 'X-Admin-Token': adminToken } });
    if (r.ok) showDashboard();
    else { sessionStorage.removeItem('wacheck_admin_token'); adminToken = ''; }
  } catch(e) {}
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  loadOverview();
}

function adminLogout() {
  sessionStorage.removeItem('wacheck_admin_token');
  adminToken = '';
  location.reload();
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  document.querySelectorAll('.nav-item')[['overview','users','defenders','contaminants','config','logs'].indexOf(name)].classList.add('active');
  if (name === 'users') loadUsers();
  if (name === 'defenders') loadDefenders();
  if (name === 'contaminants') loadContaminants();
  if (name === 'config') loadGameConfig();
  if (name === 'logs') loadLogs();
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken };
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = isError ? 'error show' : 'show';
  setTimeout(() => t.className = isError ? 'error' : '', 3000);
}

// === OVERVIEW ===
async function loadOverview() {
  const r = await fetch(`${API}?action=stats`, { headers: authHeaders() });
  const data = await r.json();
  if (!data.success) return;
  const s = data.data;
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card green"><div class="label">Usuarios Totales</div><div class="value">${s.users.total}</div><div class="sub">${s.users.today} hoy</div></div>
    <div class="stat-card cyan"><div class="label">Verificados</div><div class="value">${s.users.verified}</div><div class="sub">de ${s.users.total} registrados</div></div>
    <div class="stat-card"><div class="label">Defensores</div><div class="value">${s.defenders_count}</div></div>
    <div class="stat-card yellow"><div class="label">Contaminantes</div><div class="value">${s.contaminants_count}</div></div>
  `;
  document.getElementById('topUsersTable').innerHTML = `
    <div class="table-card" style="margin-top:20px">
      <div class="table-header"><h3>Top 10 Jugadores</h3></div>
      <table><thead><tr><th>Usuario</th><th>Email</th><th>Monedas Esp.</th><th>Monedas</th><th>Estrellas</th><th>Último acceso</th></tr></thead>
      <tbody>${s.top_users.map(u=>`<tr><td><strong>${u.username}</strong></td><td style="color:var(--text2)">${u.email}</td><td style="color:var(--yellow)">${u.special_coins}</td><td>${u.coins}</td><td>${u.stars}</td><td style="color:var(--text2);font-size:0.8rem">${u.last_login||'-'}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  `;
}

// === USERS ===
async function loadUsers(page = 1, search = '') {
  currentUsersPage = page;
  const r = await fetch(`${API}?action=list_users&page=${page}&search=${encodeURIComponent(search)}`, { headers: authHeaders() });
  const data = await r.json();
  if (!data.success) return;
  const container = document.getElementById('usersTableContainer');
  container.innerHTML = `<table><thead><tr><th>ID</th><th>Usuario</th><th>Email</th><th>Verificado</th><th>Mon. Esp.</th><th>Monedas</th><th>Estrellas</th><th>Acciones</th></tr></thead>
  <tbody>${data.users.map(u=>`<tr>
    <td style="color:var(--text2)">#${u.id}</td>
    <td><strong>${u.username}</strong></td>
    <td style="color:var(--text2);font-size:0.85rem">${u.email}</td>
    <td><span class="badge ${u.email_verified?'green':'red'}">${u.email_verified?'Sí':'No'}</span></td>
    <td style="color:var(--yellow)">${u.special_coins}</td>
    <td>${u.coins}</td><td>${u.stars}</td>
    <td><button class="btn-sm btn-edit" onclick='openEditUser(${JSON.stringify(u)})'>Editar</button>
    <button class="btn-sm btn-delete" onclick="deleteUser(${u.id},'${u.username}')">Eliminar</button></td>
  </tr>`).join('')}</tbody></table>`;
  
  // Pagination
  const pages = data.pages;
  const pag = document.getElementById('userPagination');
  pag.innerHTML = '';
  if (pages > 1) {
    const prev = document.createElement('button');
    prev.className = 'page-btn'; prev.textContent = '←'; prev.disabled = page <= 1;
    prev.onclick = () => loadUsers(page - 1);
    pag.appendChild(prev);
    for (let i = 1; i <= Math.min(pages, 7); i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn ${i === page ? 'active' : ''}`;
      btn.textContent = i; btn.onclick = () => loadUsers(i);
      pag.appendChild(btn);
    }
    const next = document.createElement('button');
    next.className = 'page-btn'; next.textContent = '→'; next.disabled = page >= pages;
    next.onclick = () => loadUsers(page + 1);
    pag.appendChild(next);
  }
}

function searchUsers(val) {
  clearTimeout(userSearchTimeout);
  userSearchTimeout = setTimeout(() => loadUsers(1, val), 400);
}

function openEditUser(user) {
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editSpecialCoins').value = user.special_coins;
  document.getElementById('editCoins').value = user.coins;
  document.getElementById('editStars').value = user.stars;
  document.getElementById('editRunes').value = user.runes;
  document.getElementById('editVerified').value = user.email_verified;
  document.getElementById('editUserModal').classList.add('open');
}

async function saveUser() {
  const id = +document.getElementById('editUserId').value;
  const body = {
    id,
    special_coins: +document.getElementById('editSpecialCoins').value,
    coins: +document.getElementById('editCoins').value,
    stars: +document.getElementById('editStars').value,
    runes: +document.getElementById('editRunes').value,
    email_verified: +document.getElementById('editVerified').value
  };
  const r = await fetch(`${API}?action=edit_user`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await r.json();
  document.getElementById('editUserModal').classList.remove('open');
  if (data.success) { showToast('Usuario actualizado'); loadUsers(currentUsersPage); }
  else showToast(data.error || 'Error', true);
}

async function deleteUser(id, name) {
  if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción es IRREVERSIBLE.`)) return;
  const r = await fetch(`${API}?action=delete_user`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ id }) });
  const data = await r.json();
  if (data.success) { showToast('Usuario eliminado'); loadUsers(currentUsersPage); }
  else showToast(data.error || 'Error', true);
}

// === DEFENDERS ===
async function loadDefenders() {
  const r = await fetch(`${API}?action=list_defenders`, { headers: authHeaders() });
  const data = await r.json();
  if (!data.success) return;
  document.getElementById('defendersTableContainer').innerHTML = `
    <table><thead><tr><th>Key</th><th>Nombre</th><th>Daño</th><th>Costo</th><th>Vida</th><th>Rango</th><th>Intervalo</th><th>Tipo</th><th>Acciones</th></tr></thead>
    <tbody>${data.defenders.map(d=>`<tr>
      <td style="font-family:monospace;color:var(--accent2)">${d.key}</td>
      <td><strong>${d.name}</strong></td>
      <td style="color:var(--red)">${d.damage}</td>
      <td style="color:var(--yellow)">${d.cost}</td>
      <td style="color:var(--green)">${d.health}</td>
      <td>${d.range}</td>
      <td style="color:var(--text2)">${d.shoot_interval}ms</td>
      <td><span class="badge ${d.is_unlockable?'yellow':'green'}">${d.is_unlockable?'Desbloqueable':'Básico'}</span></td>
      <td><button class="btn-sm btn-edit" onclick='openDefenderModal(${JSON.stringify(d)})'>Editar</button>
      <button class="btn-sm btn-delete" onclick="deleteDefender(${d.id},'${d.name}')">Eliminar</button></td>
    </tr>`).join('')}</tbody></table>`;
}

function openDefenderModal(d = null) {
  document.getElementById('defId').value = d ? d.id : '';
  document.getElementById('defenderModalTitle').textContent = d ? 'Editar Defensor' : 'Nuevo Defensor';
  document.getElementById('defKey').value = d ? d.key : '';
  document.getElementById('defName').value = d ? d.name : '';
  document.getElementById('defDamage').value = d ? d.damage : 25;
  document.getElementById('defCost').value = d ? d.cost : 50;
  document.getElementById('defHealth').value = d ? d.health : 100;
  document.getElementById('defRange').value = d ? d.range : 4;
  document.getElementById('defInterval').value = d ? d.shoot_interval : 1200;
  document.getElementById('defProjectile').value = d ? d.projectile : 'water';
  document.getElementById('defUnlockable').value = d ? d.is_unlockable : 0;
  document.getElementById('defUnlockCost').value = d ? d.unlock_cost : 0;
  document.getElementById('defIcon').value = d ? (d.icon_url || '') : '';
  document.getElementById('defDesc').value = d ? (d.description || '') : '';
  document.getElementById('defenderModal').classList.add('open');
}

function closeDefenderModal() { document.getElementById('defenderModal').classList.remove('open'); }

async function saveDefender() {
  const body = {
    id: document.getElementById('defId').value ? +document.getElementById('defId').value : undefined,
    key: document.getElementById('defKey').value.trim(),
    name: document.getElementById('defName').value.trim(),
    damage: +document.getElementById('defDamage').value,
    cost: +document.getElementById('defCost').value,
    health: +document.getElementById('defHealth').value,
    range: +document.getElementById('defRange').value,
    shoot_interval: +document.getElementById('defInterval').value,
    projectile: document.getElementById('defProjectile').value,
    is_unlockable: +document.getElementById('defUnlockable').value,
    unlock_cost: +document.getElementById('defUnlockCost').value,
    icon_url: document.getElementById('defIcon').value.trim(),
    description: document.getElementById('defDesc').value.trim()
  };
  const r = await fetch(`${API}?action=save_defender`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await r.json();
  closeDefenderModal();
  if (data.success) { showToast(data.message); loadDefenders(); }
  else showToast(data.error || 'Error', true);
}

async function deleteDefender(id, name) {
  if (!confirm(`¿Eliminar al defensor "${name}"?`)) return;
  const r = await fetch(`${API}?action=delete_defender`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ id }) });
  const data = await r.json();
  if (data.success) { showToast('Defensor eliminado'); loadDefenders(); }
  else showToast(data.error || 'Error', true);
}

// === CONTAMINANTES ===
async function loadContaminants() {
  const r = await fetch(`${API}?action=list_contaminants`, { headers: authHeaders() });
  const data = await r.json();
  if (!data.success) return;
  document.getElementById('contaminantsTableContainer').innerHTML = `
    <table><thead><tr><th>Nombre</th><th>Vida</th><th>Velocidad</th><th>Monedas</th><th>Tipo</th><th>Acciones</th></tr></thead>
    <tbody>${data.contaminants.map(c=>`<tr>
      <td><strong>${c.name}</strong></td>
      <td style="color:var(--red)">${c.health}</td>
      <td>${c.speed}x</td>
      <td style="color:var(--yellow)">${c.coins}</td>
      <td><span class="badge ${c.is_boss?'red':'yellow'}">${c.is_boss?'JEFE':'Normal'}</span></td>
      <td><button class="btn-sm btn-edit" onclick='openContaminantModal(${JSON.stringify(c)})'>Editar</button>
      <button class="btn-sm btn-delete" onclick="deleteContaminant(${c.id},'${c.name}')">Eliminar</button></td>
    </tr>`).join('')}</tbody></table>`;
}

function openContaminantModal(c = null) {
  document.getElementById('contId').value = c ? c.id : '';
  document.getElementById('contModalTitle').textContent = c ? 'Editar Contaminante' : 'Nuevo Contaminante';
  document.getElementById('contName').value = c ? c.name : '';
  document.getElementById('contHealth').value = c ? c.health : 100;
  document.getElementById('contSpeed').value = c ? c.speed : 1.0;
  document.getElementById('contCoins').value = c ? c.coins : 10;
  document.getElementById('contBoss').value = c ? c.is_boss : 0;
  document.getElementById('contIcon').value = c ? (c.icon_url || '') : '';
  document.getElementById('contDesc').value = c ? (c.description || '') : '';
  document.getElementById('contaminantModal').classList.add('open');
}

async function saveContaminant() {
  const body = {
    id: document.getElementById('contId').value ? +document.getElementById('contId').value : undefined,
    name: document.getElementById('contName').value.trim(),
    health: +document.getElementById('contHealth').value,
    speed: +document.getElementById('contSpeed').value,
    coins: +document.getElementById('contCoins').value,
    is_boss: +document.getElementById('contBoss').value,
    icon_url: document.getElementById('contIcon').value.trim(),
    description: document.getElementById('contDesc').value.trim()
  };
  const r = await fetch(`${API}?action=save_contaminant`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await r.json();
  document.getElementById('contaminantModal').classList.remove('open');
  if (data.success) { showToast(data.message); loadContaminants(); }
  else showToast(data.error || 'Error', true);
}

async function deleteContaminant(id, name) {
  if (!confirm(`¿Eliminar el contaminante "${name}"?`)) return;
  const r = await fetch(`${API}?action=delete_contaminant`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ id }) });
  const data = await r.json();
  if (data.success) { showToast('Contaminante eliminado'); loadContaminants(); }
  else showToast(data.error || 'Error', true);
}

// === GAME CONFIG ===
async function loadGameConfig() {
  const r = await fetch(`${API}?action=get_game_config`, { headers: authHeaders() });
  const data = await r.json();
  if (!data.success) return;
  const cfg = data.config;
  const labels = {
    max_waves: 'Oleadas máximas',
    base_health: 'Salud base del jugador',
    base_coins: 'Monedas iniciales',
    wave_difficulty_multiplier: 'Multiplicador dificultad por oleada',
    defenders_per_row: 'Celdas por fila',
    grid_rows: 'Filas de la grilla',
    coin_generation_rate: 'Generación de monedas (ms)',
    maintenance_mode: 'Modo mantenimiento (true/false)',
    game_version: 'Versión del juego'
  };
  const inputs = Object.entries(labels).map(([k, label]) => `
    <div class="form-group">
      <label>${label}</label>
      <input id="cfg_${k}" value="${cfg[k] || ''}" placeholder="${label}">
    </div>
  `).join('');
  document.getElementById('gameConfigForm').innerHTML = `
    <div class="config-form">${inputs}</div>
    <div style="margin-top:24px;">
      <button class="btn-save" onclick="saveGameConfig()" style="width:auto;padding:10px 24px;">Guardar Configuración</button>
    </div>
  `;
}

async function saveGameConfig() {
  const keys = ['max_waves','base_health','base_coins','wave_difficulty_multiplier','defenders_per_row','grid_rows','coin_generation_rate','maintenance_mode','game_version'];
  const body = {};
  keys.forEach(k => { const el = document.getElementById(`cfg_${k}`); if(el) body[k] = el.value; });
  const r = await fetch(`${API}?action=save_game_config`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await r.json();
  if (data.success) showToast('Configuración guardada');
  else showToast(data.error || 'Error', true);
}

// === LOGS ===
async function loadLogs(page = 1) {
  currentLogsPage = page;
  const r = await fetch(`${API}?action=activity_logs&page=${page}`, { headers: authHeaders() });
  const data = await r.json();
  if (!data.success) return;
  document.getElementById('logsTableContainer').innerHTML = `
    <table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>IP</th><th>Detalles</th></tr></thead>
    <tbody>${data.logs.map(l=>`<tr>
      <td style="font-size:0.8rem;color:var(--text2)">${l.created_at}</td>
      <td>${l.username || `#${l.user_id||'–'}`}</td>
      <td><span class="badge ${l.action.includes('fail')||l.action.includes('FAIL')?'red':'green'}">${l.action}</span></td>
      <td style="font-family:monospace;font-size:0.8rem">${l.ip_address}</td>
      <td style="font-size:0.8rem;color:var(--text2);max-width:200px;overflow:hidden;text-overflow:ellipsis">${l.details||''}</td>
    </tr>`).join('')}</tbody></table>`;
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});

// Login on Enter
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') adminLogin();
});
</script>
</body>
</html>
