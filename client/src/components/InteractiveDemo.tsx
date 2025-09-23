import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DragAction {
  id: string;
  action: string;
  text: string;
  waterImpact: number;
  isGood: boolean;
  icon: string;
}

export default function InteractiveDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [placedActions, setPlacedActions] = useState<{good: DragAction[], bad: DragAction[]}>({
    good: [],
    bad: []
  });
  const [savedWater, setSavedWater] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const submitActivityMutation = useMutation({
    mutationFn: async (data: { activityType: string; pointsEarned: number; waterSaved: number }) => {
      return apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge"] });
      toast({
        title: "¡Excelente trabajo!",
        description: `Has ganado ${earnedPoints} puntos y ahorrado ${savedWater} litros de agua.`,
      });
    }
  });

  const actions: DragAction[] = [
    {
      id: "close-tap",
      action: "close_tap",
      text: "Cerrar el grifo mientras te lavas los dientes",
      waterImpact: -8,
      isGood: true,
      icon: "🚿"
    },
    {
      id: "short-shower",
      action: "short_shower", 
      text: "Ducha de 5 minutos en lugar de 15",
      waterImpact: -40,
      isGood: true,
      icon: "🚿"
    },
    {
      id: "fix-leak",
      action: "fix_leak",
      text: "Reparar fuga del inodoro",
      waterImpact: -200,
      isGood: true,
      icon: "🔧"
    },
    {
      id: "leave-tap-open",
      action: "leave_tap_open",
      text: "Dejar el grifo abierto",
      waterImpact: 15,
      isGood: false,
      icon: "💧"
    }
  ];

  const availableActions = actions.filter(action => 
    !placedActions.good.some(p => p.id === action.id) && 
    !placedActions.bad.some(p => p.id === action.id)
  );

  const handleDragStart = (e: React.DragEvent, action: DragAction) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(action));
  };

  const handleDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setDraggedOver(zone);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, zone: "good" | "bad") => {
    e.preventDefault();
    setDraggedOver(null);
    
    const actionData = JSON.parse(e.dataTransfer.getData("text/plain")) as DragAction;
    const isCorrectPlacement = (zone === "good" && actionData.isGood) || (zone === "bad" && !actionData.isGood);
    
    if (isCorrectPlacement) {
      setPlacedActions(prev => ({
        ...prev,
        [zone]: [...prev[zone], actionData]
      }));
      
      const newSavedWater = savedWater + Math.abs(actionData.waterImpact);
      const newPoints = earnedPoints + (isCorrectPlacement ? 25 : 0);
      
      setSavedWater(newSavedWater);
      setEarnedPoints(newPoints);

      // Submit to backend when all actions are placed
      if (availableActions.length === 1) {
        submitActivityMutation.mutate({
          activityType: "interactive_demo",
          pointsEarned: newPoints,
          waterSaved: newSavedWater
        });
      }
    } else {
      toast({
        title: "¡Ups! Zona incorrecta",
        description: "Intenta colocar la acción en la zona correcta.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Práctica Interactiva: Ahorro en el Baño</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <p className="text-muted-foreground mb-6">
          Arrastra las acciones correctas a las zonas correspondientes para maximizar el ahorro de agua
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Draggable Actions */}
          <div>
            <h3 className="font-semibold mb-4">Acciones Disponibles</h3>
            <div className="space-y-3">
              {availableActions.map((action) => (
                <motion.div
                  key={action.id}
                  className={`draggable-item rounded-lg p-3 flex items-center space-x-3 border ${
                    action.isGood 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, action)}
                  whileDrag={{ rotate: 5, scale: 1.05 }}
                  data-testid={`draggable-${action.id}`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="font-medium flex-1">{action.text}</span>
                  <div className={`text-sm font-semibold ${
                    action.waterImpact < 0 ? 'text-secondary' : 'text-destructive'
                  }`}>
                    {action.waterImpact > 0 ? '+' : ''}{action.waterImpact}L
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div>
            <h3 className="font-semibold mb-4">Zona de Acciones</h3>
            <div className="space-y-4">
              <motion.div
                className={`drag-zone rounded-lg p-6 text-center min-h-[100px] flex flex-col items-center justify-center transition-colors ${
                  draggedOver === "good" ? "drag-over" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "good")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "good")}
                data-testid="drop-zone-good"
              >
                <div className="text-secondary mb-2">
                  <ThumbsUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Buenas Prácticas</p>
                  <p className="text-sm text-muted-foreground">Arrastra aquí las acciones que ahorran agua</p>
                </div>
                {placedActions.good.map((action) => (
                  <div key={action.id} className="mt-2 p-2 bg-secondary/20 rounded text-sm">
                    {action.text}
                  </div>
                ))}
              </motion.div>
              
              <motion.div
                className={`drag-zone rounded-lg p-6 text-center min-h-[100px] flex flex-col items-center justify-center transition-colors ${
                  draggedOver === "bad" ? "drag-over" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, "bad")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "bad")}
                data-testid="drop-zone-bad"
              >
                <div className="text-destructive mb-2">
                  <ThumbsDown className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Malas Prácticas</p>
                  <p className="text-sm text-muted-foreground">Arrastra aquí las acciones que desperdician agua</p>
                </div>
                {placedActions.bad.map((action) => (
                  <div key={action.id} className="mt-2 p-2 bg-destructive/20 rounded text-sm">
                    {action.text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Results Display */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Resultado del Día:</h4>
              <div className="flex items-center justify-between">
                <span>Agua ahorrada:</span>
                <span className="font-bold text-secondary" data-testid="text-saved-water">
                  {savedWater} litros
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Puntos ganados:</span>
                <span className="font-bold text-accent" data-testid="text-earned-points">
                  {earnedPoints} puntos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
