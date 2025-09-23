import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8c0 3.314 2.686 6 6 6h4c2.21 0 4-1.79 4-4 0-2.21-1.79-4-4-4h-.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5-.224.5-.5-.224-.5-.5-.5H10z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary" data-testid="logo-title">AquaSaver</h1>
          </motion.div>

          {/* User Stats */}
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2" data-testid="user-points">
              <Coins className="w-5 h-5 text-accent" />
              <span className="font-semibold">{(profile as any)?.points ?? 0}</span>
              <span className="text-sm text-muted-foreground">puntos</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="user-level">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="font-semibold">Nivel {(profile as any)?.level ?? 1}</span>
            </div>
            <div className="flex items-center space-x-2" data-testid="user-achievements">
              <Medal className="w-5 h-5 text-secondary" />
              <span className="font-semibold">{((profile as any)?.achievements as string[])?.length ?? 0}</span>
              <span className="text-sm text-muted-foreground">logros</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
