import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Defensores del Agua - Universidad de Colima"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
      </div>

      {/* Floating water elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            initial={{ y: "100vh", x: `${15 + i * 15}%` }}
            animate={{ y: "-10vh" }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear",
            }}
          >
            💧
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Official UCol Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <img
              src="/images/ucol-logo.svg"
              alt="Logo Universidad de Colima"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto drop-shadow-lg"
            />
          </motion.div>

          {/* Institutional badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
            <span className="text-sm text-primary-foreground/90 font-medium">
              Universidad de Colima · Bachillerato 25
            </span>
          </div>

          <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-8xl text-primary-foreground mb-2 tracking-tight">
            Wacheck
          </h1>
          <p className="font-heading font-semibold text-xl sm:text-2xl md:text-3xl text-water-light mb-6">
            Defensores del Agua
          </p>
          <p className="max-w-2xl mx-auto text-lg text-primary-foreground/80 mb-10 leading-relaxed">
            Únete a la misión de proteger nuestras fuentes de agua de los contaminantes.
            ¡Defiende tu isla y salva el planeta en este juego educativo tipo Tower Defense!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/jugar"
                className="px-8 py-4 rounded-xl gradient-water text-accent-foreground font-heading font-bold text-lg shadow-[var(--shadow-hero-btn)] flex items-center gap-3 transition-all hover:brightness-110"
              >
                <span className="text-2xl">🎮</span>
                ¡Jugar Ahora!
              </Link>
            </motion.div>
            <motion.a
              href="#sobre"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/30 text-primary-foreground font-heading font-semibold text-lg hover:bg-primary-foreground/20 transition-all flex items-center gap-3"
            >
              <span className="text-2xl">📖</span>
              Conoce más
            </motion.a>
          </div>

          {/* Secondary buttons: Historia, Tutorial */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/jugar?tab=historia"
                className="px-6 py-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground font-heading font-medium text-sm hover:bg-primary-foreground/20 transition-all flex items-center gap-2"
              >
                📜 Modo Historia
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/jugar?tab=tutorial"
                className="px-6 py-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground font-heading font-medium text-sm hover:bg-primary-foreground/20 transition-all flex items-center gap-2"
              >
                🎓 Tutorial del Juego
              </Link>
            </motion.div>
            <motion.a
              href="#calculadora"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground font-heading font-medium text-sm hover:bg-primary-foreground/20 transition-all flex items-center gap-2"
            >
              💧 Calculadora de Agua
            </motion.a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-60">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
