import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Leaderboard() {
  const { data: leaderboard = [] } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Mock additional users for demo
  const mockUsers = [
    {
      id: "user1",
      username: "EcoMaster2024",
      level: 8,
      points: 15420,
      totalWaterSaved: 3840
    },
    {
      id: "user2", 
      username: "AquaSaver Pro",
      level: 7,
      points: 12890,
      totalWaterSaved: 3200
    }
  ];

  const combinedLeaderboard = [...mockUsers, ...((leaderboard as any[]) || [])].slice(0, 3);

  return (
    <motion.section 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary" />
          Ranking de Eco-Héroes
        </h3>
        
        <div className="space-y-3">
          {combinedLeaderboard.map((user, index) => {
            const isCurrentUser = user.username?.includes("EcoWarrior") || index === 2;
            const position = index + 1;
            
            return (
              <motion.div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isCurrentUser 
                    ? 'bg-accent/10 border border-accent' 
                    : 'hover:bg-muted/50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`leaderboard-row-${position}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    position === 1 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-muted text-foreground'
                  }`}>
                    {position}
                  </div>
                  <div>
                    <div className="font-semibold" data-testid={`text-username-${position}`}>
                      {isCurrentUser ? "Tú • " : ""}{user.username || "EcoWarrior"}
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-user-stats-${position}`}>
                      Nivel {user.level} • {user.points?.toLocaleString() || "0"} puntos
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-secondary" data-testid={`text-water-saved-${position}`}>
                    {user.totalWaterSaved?.toLocaleString() || "0"}L
                  </div>
                  <div className="text-xs text-muted-foreground">ahorrados</div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          className="w-full mt-4 text-primary hover:bg-primary/5"
          data-testid="button-view-full-leaderboard"
        >
          Ver ranking completo
        </Button>
      </div>
    </motion.section>
  );
}
