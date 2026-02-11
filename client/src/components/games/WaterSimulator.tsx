import { useState } from "react";
import { motion } from "framer-motion";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface WaterSimulatorProps {
  onClose: () => void;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  waterPerSecond: number;
  icon: string;
  color: string;
}

export default function WaterSimulator({ onClose }: WaterSimulatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [waterUsed, setWaterUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [conservationMode, setConservationMode] = useState(false);

  const activities: Activity[] = [
    {
      id: "brushing_teeth",
      name: "Lavarse los dientes",
      description: "Simula el uso de agua al lavarse los dientes",
      waterPerSecond: conservationMode ? 0.1 : 2,
      icon: "🦷",
      color: "bg-blue-500"
    },
    {
      id: "shower",
      name: "Ducharse", 
      description: "Simula el uso de agua en la ducha",
      waterPerSecond: conservationMode ? 5 : 10,
      icon: "🚿",
      color: "bg-cyan-500"
    },
    {
      id: "washing_dishes",
      name: "Lavar platos",
      description: "Simula el uso de agua lavando platos",
      waterPerSecond: conservationMode ? 1 : 4,
      icon: "🍽️", 
      color: "bg-teal-500"
    }
  ];

  const submitActivityMutation = useMutation({
    mutationFn: async (data: { activityType: string; pointsEarned: number; waterSaved: number }) => {
      return apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge"] });
    }
  });

  const startActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsRunning(true);
    setWaterUsed(0);
    setTimeElapsed(0);

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 0.1);
      setWaterUsed(prev => prev + activity.waterPerSecond * 0.1);
    }, 100);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      setIsRunning(false);
      clearInterval(interval);
    }, 30000);
  };

  const stopActivity = () => {
    setIsRunning(false);
    
    if (selectedActivity && waterUsed > 0) {
      const waterSaved = conservationMode ? Math.max(0, (selectedActivity.waterPerSecond * 2 - selectedActivity.waterPerSecond) * timeElapsed) : 0;
      const points = Math.round(waterSaved * 2 + timeElapsed * 5);
      
      submitActivityMutation.mutate({
        activityType: "water_simulator",
        pointsEarned: points,
        waterSaved: Math.round(waterSaved)
      });

      toast({
        title: "¡Simulación completada!",
        description: `Usaste ${waterUsed.toFixed(1)}L de agua en ${timeElapsed.toFixed(1)} segundos. ${conservationMode ? `¡Ahorraste ${waterSaved.toFixed(1)}L con buenas prácticas!` : 'Intenta activar el modo conservación.'}`,
      });
    }
  };

  const resetSimulation = () => {
    setSelectedActivity(null);
    setIsRunning(false);
    setWaterUsed(0);
    setTimeElapsed(0);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-background z-50 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Simulador de Uso Diario</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-simulator"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Conservation Mode Toggle */}
        <div className="mb-6 p-4 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Modo Conservación</h3>
              <p className="text-sm text-muted-foreground">
                Simula buenas prácticas de ahorro de agua
              </p>
            </div>
            <Button
              variant={conservationMode ? "default" : "outline"}
              onClick={() => setConservationMode(!conservationMode)}
              data-testid="button-toggle-conservation"
            >
              {conservationMode ? "Activado" : "Desactivado"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Selecciona una Actividad</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <motion.button
                  key={activity.id}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedActivity?.id === activity.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => startActivity(activity)}
                  disabled={isRunning}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`button-activity-${activity.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-primary">
                        {activity.waterPerSecond}L/segundo {conservationMode && "(modo ahorro)"}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Simulation Display */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Simulación en Tiempo Real</h2>
            
            {selectedActivity ? (
              <div className="space-y-6">
                {/* Water Meter */}
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <span className="mr-2">{selectedActivity.icon}</span>
                    {selectedActivity.name}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Agua usada</span>
                        <span className="font-bold" data-testid="text-water-used">
                          {waterUsed.toFixed(1)}L
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4">
                        <motion.div 
                          className="bg-primary h-4 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(waterUsed / 50 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary" data-testid="text-time-elapsed">
                          {timeElapsed.toFixed(1)}s
                        </div>
                        <div className="text-sm text-muted-foreground">Tiempo</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary" data-testid="text-flow-rate">
                          {selectedActivity.waterPerSecond}L/s
                        </div>
                        <div className="text-sm text-muted-foreground">Flujo</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex space-x-3">
                  <Button
                    onClick={stopActivity}
                    disabled={!isRunning}
                    className="flex-1"
                    data-testid="button-stop-activity"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Detener
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetSimulation}
                    data-testid="button-reset-simulation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tips */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Consejos de Ahorro</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cierra el grifo mientras te enjabonas</li>
                    <li>• Usa duchas cortas de 5 minutos o menos</li>
                    <li>• Llena el lavaplatos antes de lavarlo</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-card rounded-lg border border-dashed">
                <div className="text-center text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-2" />
                  <p>Selecciona una actividad para comenzar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
