import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section id="jugar" className="py-24 gradient-water text-accent-foreground relative overflow-hidden">
      {/* Animated bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent-foreground/10"
            style={{
              width: 20 + i * 15,
              height: 20 + i * 15,
              left: `${10 + i * 12}%`,
            }}
            animate={{ y: [0, -200], opacity: [0.3, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-6xl mb-6 animate-float inline-block">🌊</div>
          <h2 className="font-heading font-black text-4xl md:text-6xl mb-6">
            ¿Listo para defender el agua?
          </h2>
          <p className="max-w-xl mx-auto text-xl text-accent-foreground/80 mb-10">
            Entra al juego, completa misiones, gana recompensas y conviértete en un verdadero defensor del agua.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/jugar"
              className="inline-block px-10 py-5 rounded-2xl bg-primary-foreground text-primary font-heading font-bold text-xl shadow-[var(--shadow-gold-btn)] hover:brightness-95 transition-all"
            >
              🎮 ¡Jugar Ahora!
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
