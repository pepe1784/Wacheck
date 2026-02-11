# 🌊 Wacheck - Landing Page Moderna

## 📋 Descripción

Este es el diseño moderno para la landing page de Wacheck, adaptado desde React/TypeScript a HTML/CSS/JavaScript puro. Incluye una interfaz moderna, responsiva y animada que sirve como página de presentación del proyecto.

## 📁 Archivos Creados

### 1. `landing.html`
- **Ubicación:** Raíz del proyecto
- **Descripción:** Página HTML principal con estructura completa de landing page
- **Secciones incluidas:**
  - Navbar fijo con scroll effect
  - Hero Section con animaciones
  - About Section (Sobre el proyecto)
  - Features Section (Características del juego)
  - Bachillerato Section (Información institucional)
  - Water Calculator (Calculadora de consumo de agua)
  - CTA Section (Call to action)
  - Footer completo

### 2. `css/landing.css`
- **Ubicación:** `css/landing.css`
- **Descripción:** Estilos CSS puros adaptados desde Tailwind CSS
- **Características:**
  - Variables CSS para colores y estilos
  - Diseño responsivo (mobile-first)
  - Animaciones y transiciones suaves
  - Efectos hover en tarjetas
  - Sistema de grid moderno

### 3. `js/landing.js`
- **Ubicación:** `js/landing.js`
- **Descripción:** JavaScript para interactividad
- **Funcionalidades:**
  - Menú móvil hamburguesa
  - Efecto de scroll en navbar
  - Smooth scroll para enlaces
  - Calculadora de agua funcional
  - Animaciones al hacer scroll (Intersection Observer)
  - Efecto parallax en el hero
  - Easter egg (Konami Code)

## 🎨 Características del Diseño

### Colores Institucionales
- **Verde UCol:** `hsl(145, 45%, 22%)` - Color principal institucional
- **Azul Agua:** `hsl(200, 85%, 50%)` - Color de acento (agua)
- **Verde Claro:** `hsl(140, 20%, 94%)` - Color secundario
- **Oro:** `hsl(42, 90%, 55%)` - Acentos dorados

### Tipografía
- **Encabezados:** Montserrat (font-weight: 400-900)
- **Cuerpo:** Open Sans (font-weight: 400-700)

### Breakpoints Responsivos
- **Mobile:** < 640px
- **Tablet:** 640px - 768px
- **Desktop:** > 768px
- **Large Desktop:** > 1024px

## 🚀 Cómo Usar

### Opción 1: Como Landing Page Principal
1. Renombra tu `index.html` actual a `game.html`
2. Renombra `landing.html` a `index.html`
3. Actualiza el enlace del botón "Jugar" en el navbar para que apunte a `game.html`

### Opción 2: Como Página Separada
1. Mantén `landing.html` como está
2. Accede a través de `landing.html` en tu navegador
3. El botón "¡Jugar Ahora!" redirige a `index.html` (tu juego actual)

### Opción 3: Integración Completa
```html
<!-- En tu index.html actual, puedes agregar un enlace: -->
<a href="landing.html">Ver Página de Inicio</a>
```

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `css/landing.css`:
```css
:root {
    --color-primary: hsl(145, 45%, 22%); /* Tu color aquí */
    --color-accent: hsl(200, 85%, 50%);  /* Tu color aquí */
}
```

### Modificar Contenido
Edita directamente `landing.html`:
- Títulos y textos están en español
- Emojis pueden ser reemplazados por iconos SVG
- Imágenes pueden agregarse en las secciones correspondientes

### Ajustar Animaciones
En `js/landing.js` puedes modificar:
- Velocidad de animaciones (duration)
- Tipo de efectos (ease, linear)
- Condiciones de activación

## 📊 Calculadora de Agua

La calculadora incluida estima el consumo diario de agua basado en:
- **Ducha:** 12 litros/minuto
- **Lavado de platos:** 30 litros/vez
- **Lavadora:** 50 litros/carga
- **Agua bebida:** Directo del input

### Mensajes de Retroalimentación:
- < 100L: "¡Excelente! Tienes un consumo muy responsable."
- 100-200L: "Buen trabajo. Estás dentro del promedio."
- 200-300L: "Consumo moderado. Hay oportunidades de mejora."
- > 300L: "Alto consumo. Considera reducir el tiempo de ducha."

## ✨ Efectos Especiales

### 1. Gotas de Agua Flotantes
- Animación continua en el hero section
- Se generan nuevas gotas cada 3 segundos

### 2. Parallax en Hero
- El fondo se mueve más lento que el scroll
- Efecto de profundidad

### 3. Fade-in al Scroll
- Las secciones aparecen al hacer scroll
- Usa Intersection Observer para mejor rendimiento

### 4. Easter Egg
- Código Konami: ↑ ↑ ↓ ↓ ← → ← → B A
- Activa "lluvia de agua" especial

## 🌐 Compatibilidad

### Navegadores Soportados:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Características Modernas Usadas:
- CSS Grid & Flexbox
- CSS Variables (Custom Properties)
- Intersection Observer API
- ES6+ JavaScript
- CSS Animations

## 📱 Responsividad

El diseño es completamente responsivo:
- **Mobile:** Menú hamburguesa, columnas apiladas
- **Tablet:** Grid de 2 columnas en features
- **Desktop:** Grid de 3 columnas, navbar completo

## 🔗 Integración con el Juego Actual

### Enlaces Importantes:
1. **Navbar → "¡Jugar!"** → Apunta a `index.html`
2. **Hero Section → "¡Jugar Ahora!"** → Apunta a `index.html`
3. **CTA Section → "Comenzar Ahora"** → Apunta a `index.html`

### Para Integrar Completamente:
```javascript
// En tu script.js principal, puedes agregar:
const gameBtn = document.getElementById('startGame');
if (gameBtn) {
    gameBtn.addEventListener('click', () => {
        window.location.href = 'landing.html';
    });
}
```

## 🎯 Próximos Pasos Sugeridos

1. **Agregar Imágenes Reales:**
   - Logo de la Universidad de Colima
   - Screenshots del juego
   - Foto del Bachillerato 25

2. **Conectar con Backend:**
   - Guardar resultados de calculadora
   - Sistema de registro/login
   - Estadísticas de usuarios

3. **Mejorar SEO:**
   - Meta tags descriptivos
   - Open Graph tags
   - Schema markup

4. **Analytics:**
   - Google Analytics
   - Hotjar para mapas de calor
   - Tracking de conversiones

## 📞 Soporte

Para dudas o sugerencias sobre el diseño:
- Revisa los comentarios en el código
- Los estilos están organizados por secciones
- JavaScript está bien documentado

## 📄 Licencia

Este diseño es parte del proyecto educativo Wacheck del Bachillerato 25 - Universidad de Colima.

---

**Desarrollado con 💧 para la conservación del agua**
