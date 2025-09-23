import { useQuery } from "@tanstack/react-query";
import { Gauge, Trophy, Medal, Wrench, Leaf } from "lucide-react";
import { motion } from "framer-motion";

export default function ProgressTracking() {
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const weeklyProgress = (profile as any)?.totalWaterSaved ? Math.min((((profile as any).totalWaterSaved ?? 0) % 500) / 500 * 100, 100) : 0;
  const monthlyProgress = (profile as any)?.totalWaterSaved ? Math.min(((profile as any).totalWaterSaved ?? 0) / 2000 * 100, 100) : 0;

  const achievements = [
    {
      id: "eco_warrior",
      title: "Eco Guerrero", 
      description: "Ahorraste 100L en un día",
      icon: Medal,
      color: "bg-accent"
    },
    {
      id: "green_guardian",
      title: "Guardián Verde",
      description: "7 días consecutivos ahorrando", 
      icon: Leaf,
      color: "bg-secondary"
    },
    {
      id: "repair_expert",
      title: "Reparador Experto",
      description: "Reparaste 5 fugas",
      icon: Wrench, 
      color: "bg-primary"
    }
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Conservation Meter */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-primary" />
            Medidor de Conservación
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Agua ahorrada esta semana</span>
                <span className="font-bold" data-testid="text-weekly-progress">
                  {Math.round(weeklyProgress * 5)} / 500 litros
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                <motion.div 
                  className="water-meter h-full progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Objetivo mensual</span>
                <span className="font-bold" data-testid="text-monthly-progress">
                  {(profile as any)?.totalWaterSaved ?? 0} / 2,000 litros
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                <motion.div 
                  className="water-meter h-full progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.4 }}
                />
              </div>
            </div>

            <motion.div 
              className="grid grid-cols-3 gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="text-daily-average">
                  {(profile as any)?.totalWaterSaved ? Math.round(((profile as any).totalWaterSaved ?? 0) / 30) : 0}L
                </div>
                <div className="text-sm text-muted-foreground">Promedio diario</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary" data-testid="text-daily-streak">
                  {(profile as any)?.dailyStreak ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Días consecutivos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid="text-total-saved">
                  {(profile as any)?.totalWaterSaved ?? 0}L
                </div>
                <div className="text-sm text-muted-foreground">Total ahorrado</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-border"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-accent" />
            Logros Recientes
          </h3>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const hasAchievement = ((profile as any)?.achievements as string[])?.includes(achievement.id) ?? false;
              
              return (
                <motion.div
                  key={achievement.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    hasAchievement 
                      ? `${achievement.color}/10 border border-current achievement-badge` 
                      : 'bg-muted/50 opacity-50'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasAchievement ? achievement.color : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${hasAchievement ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                </motion.div>
              );
            })}

            <button 
              className="w-full mt-4 text-sm text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors"
              data-testid="button-view-all-achievements"
            >
              Ver todos los logros
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
