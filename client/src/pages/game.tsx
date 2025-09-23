import { useState } from "react";
import Header from "@/components/Header";
import WelcomeSection from "@/components/WelcomeSection";
import GameDashboard from "@/components/GameDashboard";
import InteractiveDemo from "@/components/InteractiveDemo";
import ProgressTracking from "@/components/ProgressTracking";
import EducationalTips from "@/components/EducationalTips";
import Leaderboard from "@/components/Leaderboard";
import FloatingActionButton from "@/components/FloatingActionButton";
import WaterSimulator from "@/components/games/WaterSimulator";
import LeakDetection from "@/components/games/LeakDetection";
import RainwaterCollection from "@/components/games/RainwaterCollection";

export default function Game() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleGameSelect = (gameType: string) => {
    setActiveGame(gameType);
  };

  const handleGameClose = () => {
    setActiveGame(null);
  };

  if (activeGame) {
    switch (activeGame) {
      case "water_simulator":
        return <WaterSimulator onClose={handleGameClose} />;
      case "leak_detection":
        return <LeakDetection onClose={handleGameClose} />;
      case "rainwater_collection":
        return <RainwaterCollection onClose={handleGameClose} />;
      default:
        setActiveGame(null);
        break;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />
        <GameDashboard onGameSelect={handleGameSelect} />
        <InteractiveDemo />
        <ProgressTracking />
        <EducationalTips />
        <Leaderboard />
      </main>

      <FloatingActionButton onGameSelect={handleGameSelect} />
    </div>
  );
}
