import { premiumEasing } from '@/lib/animation';

export const libraryFadeInUp = {
	initial: { y: 24, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	transition: { duration: 0.6, ease: premiumEasing },
};
