import { useTranslation } from 'react-i18next';
import { BookMarked, MonitorPlay } from 'lucide-react';

export type LibraryActiveSection = 'both' | 'physical' | 'ebook';

type LibrarySectionTabsProps = {
	activeSection: LibraryActiveSection;
	onSelectAll: () => void;
	onSelectPhysical: () => void;
	onSelectEbook: () => void;
};

export function LibrarySectionTabs({
	activeSection,
	onSelectAll,
	onSelectPhysical,
	onSelectEbook,
}: LibrarySectionTabsProps) {
	const { t } = useTranslation('pages');
	return (
		<div className="flex flex-wrap gap-2">
			<button
				type="button"
				onClick={onSelectAll}
				className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
					activeSection === 'both'
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'
				}`}
			>
				{t('library.tabAll')}
			</button>
			<button
				type="button"
				onClick={onSelectPhysical}
				className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
					activeSection === 'physical'
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'
				}`}
			>
				<BookMarked className="w-4 h-4" />
				{t('library.physical')}
			</button>
			<button
				type="button"
				onClick={onSelectEbook}
				className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
					activeSection === 'ebook'
						? 'bg-primary text-primary-foreground'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'
				}`}
			>
				<MonitorPlay className="w-4 h-4" />
				{t('library.ebook')}
			</button>
		</div>
	);
}
