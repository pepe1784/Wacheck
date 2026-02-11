import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Cloud, Droplets, Sprout, Timer } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface RainwaterCollectionProps {
  onClose: () => void;
}

interface Collector {
  id: string;
  x: number;
  y: number;
  capacity: number;
  currentLevel: number;
  efficiency: number;
}

interface Plant {
  id: string;
  x: number;
  y: number;
  waterNeeded: number;
  currentWater: number;
  isGrown: boolean;
}

export default function RainwaterCollection({ onClose }: RainwaterCollectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isRaining, setIsRaining] = useState(false);
  const [rainIntensity, setRainIntensity] = useState(0);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [totalWaterCollected, setTotalWaterCollected] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCollector, setSelectedCollector] = useState<string | null>(null);

  const submitActivityMutation = useMutation({
    mutationFn: async (data: { activityType: string; pointsEarned: number; waterSaved: number }) => {
      return apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-challenge"] });
    }
  });

  // Initialize game
  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(300);
    setScore(0);
    setTotalWaterCollected(0);
    setIsRaining(false);
    setRainIntensity(0);
    
    // Generate collectors
    const newCollectors: Collector[] = [];
    for (let i = 0; i < 4; i++) {
      newCollectors.push({
        id: `collector-${i}`,
        x: 20 + (i * 20),
        y: 30 + Math.random() * 20,
        capacity: 50,
        currentLevel: 0,
        efficiency: 0.8 + Math.random() * 0.4 // 0.8 - 1.2
      });
    }
    setCollectors(newCollectors);

    // Generate plants
    const newPlants: Plant[] = [];
    for (let i = 0; i < 6; i++) {
      newPlants.push({
        id: `plant-${i}`,
        x: 10 + (i * 15),
        y: 70 + Math.random() * 15,
        waterNeeded: 10 + Math.random() * 20,
        currentWater: 0,
        isGrown: false
      });
    }
    setPlants(newPlants);
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  // Weather simulation
  useEffect(() => {
    if (gameStarted) {
      const weatherTimer = setInterval(() => {
        const rainChance = Math.random();
        if (rainChance > 0.7 && !isRaining) {
          // Start rain
          setIsRaining(true);
          setRainIntensity(Math.random() * 0.8 + 0.4); // 0.4 - 1.2
        } else if (rainChance < 0.3 && isRaining) {
          // Stop rain
          setIsRaining(false);
          setRainIntensity(0);
        }
      }, 3000);

      return () => clearInterval(weatherTimer);
    }
  }, [gameStarted, isRaining]);

  // Rain collection effect
  useEffect(() => {
    if (gameStarted && isRaining) {
      const collectionTimer = setInterval(() => {
        setCollectors(prev => prev.map(collector => {
          const waterToAdd = rainIntensity * collector.efficiency * 2;
          const newLevel = Math.min(collector.capacity, collector.currentLevel + waterToAdd);
          
          if (newLevel > collector.currentLevel) {
            setTotalWaterCollected(prevTotal => prevTotal + (newLevel - collector.currentLevel));
          }
          
          return { ...collector, currentLevel: newLevel };
        }));
      }, 500);

      return () => clearInterval(collectionTimer);
    }
  }, [gameStarted, isRaining, rainIntensity]);

  // Water plants
  const waterPlant = (plantId: string) => {
    if (!selectedCollector) {
      toast({
        title: "Selecciona un recolector",
        description: "Primero selecciona un recolector con agua para regar las plantas.",
        variant: "destructive"
      });
      return;
    }

    const collector = collectors.find(c => c.id === selectedCollector);
    const plant = plants.find(p => p.id === plantId);
    
    if (!collector || !plant || collector.currentLevel < 5) {
      return;
    }

    const waterToUse = Math.min(5, collector.currentLevel, plant.waterNeeded - plant.currentWater);
    
    setCollectors(prev => prev.map(c => 
      c.id === selectedCollector 
        ? { ...c, currentLevel: c.currentLevel - waterToUse }
        : c
    ));

    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        const newWaterLevel = p.currentWater + waterToUse;
        const isNowGrown = newWaterLevel >= p.waterNeeded;
        
        if (isNowGrown && !p.isGrown) {
          setScore(prevScore => prevScore + 50);
          toast({
            title: "¡Planta crecida!",
            description: "+50 puntos por hacer crecer una planta",
          });
        }
        
        return {
          ...p,
          currentWater: newWaterLevel,
          isGrown: isNowGrown
        };
      }
      return p;
    }));
  };

  // End game
  const endGame = () => {
    setGameStarted(false);
    const grownPlants = plants.filter(p => p.isGrown).length;
    const finalScore = score + Math.round(totalWaterCollected) + (grownPlants * 25);
    
    submitActivityMutation.mutate({
      activityType: "rainwater_collection",
      pointsEarned: finalScore,
      waterSaved: Math.round(totalWaterCollected)
    });

    toast({
      title: "¡Juego completado!",
      description: `Recolectaste ${totalWaterCollected.toFixed(1)}L de agua de lluvia y hiciste crecer ${grownPlants} plantas. Puntuación: ${finalScore}`,
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
          <h1 className="text-2xl font-bold">Recolector de Lluvia</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-rainwater-game"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!gameStarted ? (
          /* Game Instructions */
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border p-6 text-center">
              <Cloud className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-4">¡Recolecta agua de lluvia!</h2>
              <p className="text-muted-foreground mb-6">
                Instala recolectores de agua de lluvia y úsalos para regar tu jardín. 
                El clima cambia aleatoriamente - ¡aprovecha cuando llueva!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-sm font-medium">Recolectar Agua</div>
                  <div className="text-xs text-muted-foreground">Cuando llueva, tus recolectores se llenarán automáticamente</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Sprout className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">Regar Plantas</div>
                  <div className="text-xs text-muted-foreground">Selecciona un recolector y haz clic en las plantas para regarlas</div>
                </div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                data-testid="button-start-rainwater-game"
              >
                Comenzar Recolección
              </Button>
            </div>
          </div>
        ) : (
          /* Game Area */
          <div>
            {/* Game Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium" data-testid="text-game-time">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Puntos:</span>
                  <span className="font-semibold text-accent" data-testid="text-game-score">
                    {score}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium" data-testid="text-water-collected">
                    {totalWaterCollected.toFixed(1)}L
                  </span>
                </div>
              </div>
              <div className="p-3 bg-card rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Cloud className={`w-4 h-4 ${isRaining ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium" data-testid="text-weather-status">
                    {isRaining ? `Lloviendo (${(rainIntensity * 100).toFixed(0)}%)` : 'Despejado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Field */}
            <div className="relative bg-gradient-to-b from-sky-200 to-green-200 rounded-lg border min-h-[600px] overflow-hidden">
              {/* Weather Effect */}
              {isRaining && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-0.5 h-4 bg-blue-400 rounded-full opacity-60"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `-20px`
                      }}
                      animate={{
                        y: [0, 620],
                        opacity: [0, 0.6, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: Math.random() * 1.5,
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Water Collectors */}
              <div className="absolute inset-0 p-4">
                <h3 className="text-sm font-medium mb-2 text-white bg-black/20 rounded px-2 py-1 inline-block">
                  Recolectores de Agua
                </h3>
                {collectors.map((collector) => (
                  <motion.button
                    key={collector.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedCollector === collector.id 
                        ? 'ring-2 ring-primary' 
                        : 'hover:scale-110'
                    }`}
                    style={{ left: `${collector.x}%`, top: `${collector.y}%` }}
                    onClick={() => setSelectedCollector(
                      selectedCollector === collector.id ? null : collector.id
                    )}
                    whileHover={{ scale: 1.1 }}
                    data-testid={`collector-${collector.id}`}
                  >
                    <div className="relative">
                      {/* Collector Container */}
                      <div className="w-12 h-12 bg-gray-600 rounded-lg border-2 border-gray-800 relative overflow-hidden">
                        {/* Water Level */}
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-400"
                          animate={{ height: `${(collector.currentLevel / collector.capacity) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {/* Water Level Text */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-white rounded px-1">
                        {collector.currentLevel.toFixed(1)}L
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Plants */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-sm font-medium mb-2 text-white bg-black/20 rounded px-2 py-1 inline-block">
                  Jardín - Haz clic para regar
                </h3>
                <div className="flex justify-around">
                  {plants.map((plant) => (
                    <motion.button
                      key={plant.id}
                      className="relative hover:scale-110 transition-transform"
                      onClick={() => waterPlant(plant.id)}
                      whileHover={{ scale: 1.1 }}
                      data-testid={`plant-${plant.id}`}
                    >
                      {/* Plant */}
                      <div className={`text-3xl ${plant.isGrown ? 'filter-none' : 'filter grayscale'}`}>
                        {plant.isGrown ? '🌺' : '🌱'}
                      </div>
                      
                      {/* Water Level Bar */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded">
                        <motion.div 
                          className="h-full bg-blue-500 rounded"
                          animate={{ width: `${(plant.currentWater / plant.waterNeeded) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {selectedCollector && (
                <div className="absolute top-4 right-4 p-3 bg-white/90 rounded-lg text-sm">
                  💡 Recolector seleccionado. Haz clic en las plantas para regarlas.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
