import { useTranslation } from 'react-i18next';

export function LibraryPageLoading() {
	const { t } = useTranslation('pages');
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
				<p className="text-muted-foreground font-medium">{t('library.loading')}</p>
			</div>
		</div>
	);
}
