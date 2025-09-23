import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface GameDashboardProps {
  onGameSelect: (gameType: string) => void;
}

export default function GameDashboard({ onGameSelect }: GameDashboardProps) {
  const games = [
    {
      id: "water_simulator",
      title: "Simulador de Uso Diario",
      description: "Aprende cuánta agua usas lavándote los dientes, duchándote y lavando platos",
      points: 50,
      duration: "5 min",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      buttonColor: "bg-primary text-primary-foreground hover:bg-primary/90"
    },
    {
      id: "leak_detection",
      title: "Detective de Fugas",
      description: "Encuentra y repara fugas de agua en la casa antes de que se desperdicien litros",
      points: 75,
      duration: "3 min",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      buttonColor: "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    },
    {
      id: "rainwater_collection",
      title: "Recolector de Lluvia",
      description: "Instala sistemas de recolección de agua de lluvia y riega tu jardín ecológico",
      points: 100,
      duration: "7 min",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      buttonColor: "bg-accent text-accent-foreground hover:bg-accent/90"
    }
  ];

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Actividades de Conservación</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            className="game-card bg-white rounded-xl p-6 shadow-sm border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <img 
              src={game.image} 
              alt={game.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
              data-testid={`img-game-${game.id}`}
            />
            
            <h3 className="text-lg font-semibold mb-2" data-testid={`text-game-title-${game.id}`}>
              {game.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4" data-testid={`text-game-description-${game.id}`}>
              {game.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium" data-testid={`text-game-points-${game.id}`}>
                  +{game.points} puntos
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground" data-testid={`text-game-duration-${game.id}`}>
                  {game.duration}
                </span>
              </div>
            </div>
            
            <Button
              className={`w-full ${game.buttonColor} transition-colors`}
              onClick={() => onGameSelect(game.id)}
              data-testid={`button-play-${game.id}`}
            >
              Jugar Ahora
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
