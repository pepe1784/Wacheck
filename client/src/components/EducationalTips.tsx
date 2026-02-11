import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function EducationalTips() {
  const { data: tip, refetch } = useQuery<any>({
    queryKey: ["/api/tips"],
  });

  const handleNextTip = () => {
    refetch();
  };

  return (
    <motion.section 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-gradient-to-r from-secondary to-primary rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Tip Ecológico del Día
        </h3>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <motion.p 
            className="text-lg mb-3"
            key={(tip as any)?.id ?? 'default'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            data-testid="text-daily-tip"
          >
            {(tip as any)?.content ?? "Una ducha de 4 minutos usa aproximadamente 40 litros de agua. ¡Cada minuto menos son 10 litros ahorrados!"}
          </motion.p>
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90" data-testid="text-tip-category">
              <Info className="w-4 h-4 inline mr-1" />
              Categoría: {(tip as any)?.category ?? "Uso doméstico"}
            </div>
            <Button
              variant="ghost"
              size="sm" 
              className="bg-white/30 hover:bg-white/40 text-white"
              onClick={handleNextTip}
              data-testid="button-next-tip"
            >
              Siguiente tip
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
