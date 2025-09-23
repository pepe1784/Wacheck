import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onGameSelect: (gameType: string) => void;
}

export default function FloatingActionButton({ onGameSelect }: FloatingActionButtonProps) {
  const handleQuickPlay = () => {
    // Randomly select a game for quick play
    const games = ["water_simulator", "leak_detection", "rainwater_collection"];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    onGameSelect(randomGame);
  };

  return (
    <motion.div 
      className="fixed bottom-6 right-6"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
    >
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground w-14 h-14 rounded-full shadow-lg ripple-effect"
        onClick={handleQuickPlay}
        data-testid="button-quick-play"
      >
        <Play className="w-6 h-6" />
      </Button>
    </motion.div>
  );
}
