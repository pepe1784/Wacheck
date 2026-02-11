import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function WelcomeSection() {
  const { data: challenge } = useQuery<any>({
    queryKey: ["/api/daily-challenge"],
  });

  const progressPercentage = challenge ? (((challenge as any).currentProgress ?? 0) / ((challenge as any).targetAmount ?? 50)) * 100 : 0;

  return (
    <motion.section 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <motion.h2 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ¡Bienvenido, Eco-Héroe!
          </motion.h2>
          <motion.p 
            className="text-lg mb-6 opacity-90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Tu misión: salvar el planeta una gota a la vez
          </motion.p>
          
          {/* Daily Challenge */}
          <motion.div 
            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold mb-2 flex items-center" data-testid="daily-challenge-title">
              <Calendar className="w-5 h-5 mr-2" />
              Desafío Diario
            </h3>
            <p className="text-sm opacity-90" data-testid="daily-challenge-description">
              Ahorra {(challenge as any)?.targetAmount ?? 50} litros de agua hoy completando actividades de conservación
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso</span>
                <span data-testid="daily-challenge-progress">
                  {(challenge as any)?.currentProgress ?? 0}/{(challenge as any)?.targetAmount ?? 50} litros
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <motion.div 
                  className="bg-accent h-2 rounded-full progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </div>
          </motion.div>

          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90 ripple-effect"
            data-testid="button-start-adventure"
          >
            Comenzar Aventura
          </Button>
        </div>
        
        {/* Animated water drops */}
        <motion.div 
          className="absolute top-4 right-4 text-6xl opacity-20"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          💧
        </motion.div>
        <motion.div 
          className="absolute bottom-4 right-16 text-4xl opacity-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          💧
        </motion.div>
      </div>
    </motion.section>
  );
}
