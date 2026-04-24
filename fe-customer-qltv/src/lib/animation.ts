import { cubicBezier, type Variants } from 'framer-motion';


export const premiumEasing = cubicBezier(0.32, 0.72, 0, 1);
export const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};


export const staggerDelay: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05,
    },
  },
};
