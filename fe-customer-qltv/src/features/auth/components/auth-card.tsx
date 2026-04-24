import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.main
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={cn("w-full max-w-[440px] relative z-10", className)}
    >
      <Card className="bg-white rounded-[2.5rem] p-2 shadow-[0_20px_60px_rgb(0,0,0,0.06)]">
        <CardContent className="p-2">
          <div className="bg-white rounded-[2rem] overflow-hidden border border-border">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.main>
  );
}
