import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Sobre el Juego", href: "#sobre" },
  { label: "Características", href: "#caracteristicas" },
  { label: "Bachillerato 25", href: "#bachillerato" },
  { label: "Calculadora", href: "#calculadora" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-primary"
      }`}
    >
      {/* Top utility bar */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 flex justify-between items-center py-1.5 text-xs text-primary-foreground/70">
          <div className="flex items-center gap-4">
            <a href="https://www.ucol.mx/" target="_blank" rel="noopener" className="hover:text-primary-foreground transition-colors">
              Sitio UdeC
            </a>
            <a href="https://portal.ucol.mx/bach25/" target="_blank" rel="noopener" className="hover:text-primary-foreground transition-colors">
              Portal Bach. 25
            </a>
          </div>
          <span className="hidden sm:block">🌍 Proyecto de Educación Ambiental</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="text-2xl">💧</span>
          <div>
            <span className="font-heading font-bold text-lg text-primary-foreground leading-none block">
              Wacheck
            </span>
            <span className="text-[10px] text-primary-foreground/60 uppercase tracking-widest">
              Universidad de Colima
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/jugar"
            className="ml-3 px-5 py-2 rounded-lg bg-accent text-accent-foreground font-heading font-semibold text-sm hover:brightness-110 transition-all shadow-md"
          >
            🎮 ¡Jugar!
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-primary-foreground p-2"
          aria-label="Menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-primary border-t border-primary-foreground/10"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 transition-all font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/jugar"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-5 py-3 rounded-lg bg-accent text-accent-foreground font-heading font-semibold text-center block"
            >
              🎮 ¡Jugar Ahora!
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
