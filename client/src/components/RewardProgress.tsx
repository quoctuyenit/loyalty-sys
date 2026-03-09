import { Gift } from "lucide-react";
import clsx from "clsx";

interface RewardProgressProps {
  points: number;
  target?: number;
  showGiftAnimation?: boolean;
}

export function RewardProgress({ 
  points, 
  target = 100,
  showGiftAnimation = true 
}: RewardProgressProps) {
  const isEligible = points >= target;
  const percentage = Math.min(100, (points / target) * 100);

  return (
    <div className="w-full bg-card rounded-3xl p-6 shadow-xl shadow-black/5 border border-border/50">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reward Progress</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h2 className="text-4xl font-display font-bold text-foreground leading-none">{points}</h2>
            <span className="text-lg text-muted-foreground font-medium">/ {target}</span>
          </div>
        </div>
        
        <div className={clsx(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500",
          isEligible ? "bg-accent shadow-lg shadow-accent/30" : "bg-secondary"
        )}>
          <Gift 
            className={clsx(
              "w-7 h-7 transition-all duration-500",
              isEligible ? "text-accent-foreground" : "text-primary/40",
              (isEligible && showGiftAnimation) && "animate-shake-gift"
            )} 
          />
        </div>
      </div>

      <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-400 rounded-full animate-progress transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-sm font-medium mt-3 text-center transition-colors duration-300">
        {isEligible ? (
          <span className="text-accent font-bold">🎉 Reward available!</span>
        ) : (
          <span className="text-muted-foreground">{target - points} points away from next reward</span>
        )}
      </p>
    </div>
  );
}
