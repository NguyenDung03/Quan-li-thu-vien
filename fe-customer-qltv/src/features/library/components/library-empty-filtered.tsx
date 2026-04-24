import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LibraryEmptyFilteredProps = {
	onClearFilters: () => void;
};

export function LibraryEmptyFiltered({ onClearFilters }: LibraryEmptyFilteredProps) {
	const { t } = useTranslation('pages');
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="text-center py-20"
		>
			<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
				<BookOpen className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
			</div>
			<h3 className="text-lg font-bold text-foreground mb-2">{t('library.emptyTitle')}</h3>
			<p className="text-muted-foreground mb-4">
				{t('library.emptyDesc')}
			</p>
			<Button
				type="button"
				onClick={onClearFilters}
				variant="outline"
				className="border-2 border-primary text-primary font-bold rounded-md hover:bg-primary/5"
			>
				{t('library.clearAll')}
			</Button>
		</motion.div>
	);
}
