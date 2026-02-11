import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Wrench, Timer, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface LeakDetectionProps {
  onClose: () => void;
}

interface Leak {
  id: string;
  x: number;
  y: number;
  severity: "small" | "medium" | "large";
  waterLoss: number;
  isFound: boolean;
  isFixed: boolean;
}

export default function LeakDetection({ onClose }: LeakDetectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [score, setScore] = useState(0);
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [totalWaterSaved, setTotalWaterSaved] = useState(0);

  const submitActivityMutation = useMutation({
    mutationFn: async (data: { activityType: string; pointsEarned: number; waterSaved: number }) => {
      return apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge"] });
    }
  });

  // Generate random leaks
  const generateLeaks = () => {
    const newLeaks: Leak[] = [];
    for (let i = 0; i < 5; i++) {
      const severity = ["small", "medium", "large"][Math.floor(Math.random() * 3)] as "small" | "medium" | "large";
      const waterLoss = severity === "small" ? 5 : severity === "medium" ? 15 : 30;
      
      newLeaks.push({
        id: `leak-${i}`,
        x: Math.random() * 80 + 10, // 10-90% of container width
        y: Math.random() * 70 + 15, // 15-85% of container height
        severity,
        waterLoss,
        isFound: false,
        isFixed: false
      });
    }
    setLeaks(newLeaks);
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(180);
    setScore(0);
    setGameCompleted(false);
    setTotalWaterSaved(0);
    generateLeaks();
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if ((timeLeft === 0 || gameCompleted) && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft, gameCompleted]);

  // Handle leak click
  const handleLeakClick = (leakId: string) => {
    setLeaks(prev => prev.map(leak => {
      if (leak.id === leakId && !leak.isFound) {
        const points = leak.severity === "small" ? 10 : leak.severity === "medium" ? 20 : 30;
        setScore(prevScore => prevScore + points);
        setTotalWaterSaved(prev => prev + leak.waterLoss);
        
        toast({
          title: "¡Fuga encontrada!",
          description: `+${points} puntos • Ahorras ${leak.waterLoss}L/día`,
        });
        
        return { ...leak, isFound: true, isFixed: true };
      }
      return leak;
    }));

    // Check if all leaks found
    const allFound = leaks.every(leak => leak.isFound || leak.id === leakId);
    if (allFound) {
      setGameCompleted(true);
    }
  };

  // End game
  const endGame = () => {
    setGameStarted(false);
    const finalScore = score + (timeLeft > 0 ? Math.floor(timeLeft / 10) : 0); // Bonus for time left
    
    submitActivityMutation.mutate({
      activityType: "leak_detection",
      pointsEarned: finalScore,
      waterSaved: totalWaterSaved
    });

    toast({
      title: "¡Juego completado!",
      description: `Puntuación final: ${finalScore} puntos • Agua ahorrada: ${totalWaterSaved}L/día`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-2xl font-bold">Detective de Fugas</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-leak-detection"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!gameStarted ? (
          /* Game Instructions */
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border p-6 text-center">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-4">¡Encuentra las fugas de agua!</h2>
              <p className="text-muted-foreground mb-6">
                Tienes 3 minutos para encontrar todas las fugas en la casa. 
                Haz clic en las gotas de agua que veas para repararlas y ganar puntos.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="w-4 h-4 bg-blue-400 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium">Fuga Pequeña</div>
                  <div className="text-xs text-muted-foreground">5L/día • 10 pts</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="w-5 h-5 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium">Fuga Media</div>
                  <div className="text-xs text-muted-foreground">15L/día • 20 pts</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full mx-auto mb-2"></div>
                  <div className="text-sm font-medium">Fuga Grande</div>
                  <div className="text-xs text-muted-foreground">30L/día • 30 pts</div>
                </div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                data-testid="button-start-leak-game"
              >
                Comenzar Búsqueda
              </Button>
            </div>
          </div>
        ) : (
          /* Game Area */
          <div>
            {/* Game Stats */}
            <div className="flex items-center justify-between mb-4 p-4 bg-card rounded-lg border">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="font-semibold" data-testid="text-time-left">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Puntos:</span>
                  <span className="font-semibold text-accent" data-testid="text-current-score">
                    {score}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Fugas encontradas:</span>
                  <span className="font-semibold text-secondary" data-testid="text-leaks-found">
                    {leaks.filter(leak => leak.isFound).length} / {leaks.length}
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Agua ahorrada: <span className="font-semibold text-secondary">{totalWaterSaved}L/día</span>
              </div>
            </div>

            {/* House Layout with Leaks */}
            <div className="relative bg-gradient-to-b from-sky-100 to-green-100 rounded-lg border-2 border-dashed border-muted-foreground/30 min-h-[500px] overflow-hidden">
              {/* House Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-b from-blue-50 to-green-50"></div>
              </div>

              {/* Room Divisions */}
              <div className="absolute inset-4">
                <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
                  {/* Rooms */}
                  <div className="bg-white/40 rounded border border-muted-foreground/20 p-2">
                    <div className="text-xs text-muted-foreground text-center">Baño</div>
                  </div>
                  <div className="bg-white/40 rounded border border-muted-foreground/20 p-2">
                    <div className="text-xs text-muted-foreground text-center">Cocina</div>
                  </div>
                  <div className="bg-white/40 rounded border border-muted-foreground/20 p-2">
                    <div className="text-xs text-muted-foreground text-center">Lavandería</div>
                  </div>
                  <div className="bg-white/40 rounded border border-muted-foreground/20 p-2">
                    <div className="text-xs text-muted-foreground text-center">Sala</div>
                  </div>
                  <div className="bg-white/40 rounded border border-muted-foreground/20 p-2">
                    <div className="text-xs text-muted-foreground text-center">Jardín</div>
                  </div>
                  <div className="bg-white/40 rounded border border-muted-foreground/20 p-2">
                    <div className="text-xs text-muted-foreground text-center">Sótano</div>
                  </div>
                </div>
              </div>

              {/* Leaks */}
              {leaks.map((leak) => (
                <motion.button
                  key={leak.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                    leak.isFixed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                  }`}
                  style={{ left: `${leak.x}%`, top: `${leak.y}%` }}
                  onClick={() => handleLeakClick(leak.id)}
                  disabled={leak.isFixed}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: leak.isFixed ? 0.5 : 1, 
                    scale: leak.isFixed ? 0.8 : 1,
                    y: leak.isFixed ? 0 : [0, -5, 0]
                  }}
                  transition={{ 
                    y: { duration: 1, repeat: leak.isFixed ? 0 : Infinity, ease: "easeInOut" }
                  }}
                  data-testid={`leak-${leak.id}`}
                >
                  {leak.isFixed ? (
                    <CheckCircle className="w-6 h-6 text-secondary" />
                  ) : (
                    <div className={`rounded-full ${
                      leak.severity === "small" ? "w-3 h-3 bg-blue-400" :
                      leak.severity === "medium" ? "w-4 h-4 bg-blue-500" :
                      "w-5 h-5 bg-blue-600"
                    } shadow-lg animate-pulse`}>
                      <div className="absolute inset-0 rounded-full bg-blue-400/50 animate-ping"></div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {gameCompleted && (
              <motion.div 
                className="mt-4 p-4 bg-secondary/10 border border-secondary rounded-lg text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <h3 className="font-semibold text-secondary">¡Todas las fugas reparadas!</h3>
                <p className="text-sm text-muted-foreground">
                  Bonificación por tiempo: +{Math.floor(timeLeft / 10)} puntos
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
