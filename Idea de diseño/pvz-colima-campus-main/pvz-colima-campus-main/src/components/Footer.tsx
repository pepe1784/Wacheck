const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">💧</span>
              <div>
                <span className="font-heading font-bold text-lg block">Wacheck</span>
                <span className="text-xs text-primary-foreground/50 uppercase tracking-widest">Defensores del Agua</span>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Proyecto de educación ambiental del Bachillerato 25, Universidad de Colima.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-primary-foreground/80">Enlaces</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/50">
              <li><a href="#inicio" className="hover:text-primary-foreground transition-colors">Inicio</a></li>
              <li><a href="#sobre" className="hover:text-primary-foreground transition-colors">Sobre el Juego</a></li>
              <li><a href="#caracteristicas" className="hover:text-primary-foreground transition-colors">Características</a></li>
              <li><a href="#calculadora" className="hover:text-primary-foreground transition-colors">Calculadora de Agua</a></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-primary-foreground/80">Universidad de Colima</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/50">
              <li>
                <a href="https://www.ucol.mx/" target="_blank" rel="noopener" className="hover:text-primary-foreground transition-colors">
                  🌐 Sitio Oficial UdeC
                </a>
              </li>
              <li>
                <a href="https://portal.ucol.mx/bach25/" target="_blank" rel="noopener" className="hover:text-primary-foreground transition-colors">
                  🎓 Portal Bachillerato 25
                </a>
              </li>
              <li>
                <a href="https://www.ucol.mx/estudia-udec/oferta-media-superior-escolarizada.htm" target="_blank" rel="noopener" className="hover:text-primary-foreground transition-colors">
                  📚 Oferta Educativa
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/40">
          <p>© 2025 Universidad de Colima — Bachillerato 25 | Todos los derechos reservados</p>
          <p>🌍 Proyecto de Educación Ambiental</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
