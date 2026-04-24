import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookMarked, Library, MonitorPlay } from 'lucide-react';
import { premiumEasing } from '@/lib/animation';
import type { BookDisplay } from '@/types/book.type';

type LibraryBookCardProps = {
	book: BookDisplay;
	index: number;
};

export function LibraryBookCard({ book, index }: Readonly<LibraryBookCardProps>) {
	const { t } = useTranslation('pages');
	const navigate = useNavigate();
	const isEbook = book.bookType === 'ebook';
	const isLibraryUse = book.physicalType === 'library_use';
	const hasAvailableCopies =
		!isEbook &&
		book.availableCopies !== undefined &&
		book.availableCopies > 0;
	let badgeConfig: {
		className: string;
		label: string;
		Icon: typeof MonitorPlay;
	};
	if (isEbook) {
		badgeConfig = {
			className: 'bg-library-ebook text-primary-foreground',
			label: 'Ebook',
			Icon: MonitorPlay,
		};
	} else if (isLibraryUse) {
		badgeConfig = {
			className: 'bg-library-onsite text-primary-foreground',
			label: t('library.readInLibrary'),
			Icon: Library,
		};
	} else {
		badgeConfig = {
			className: 'bg-primary text-primary-foreground',
			label: t('library.borrowHome'),
			Icon: BookMarked,
		};
	}

	return (
		<motion.div
			initial={{ y: 30, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{
				duration: 0.5,
				delay: index * 0.08,
				ease: premiumEasing,
			}}
			className="group h-full cursor-pointer"
			onClick={() => navigate(`/book/${book.id}`)}
		>
			<div className="h-full bg-card rounded-3xl p-2 shadow-sm hover:shadow-md transition-all duration-500 border border-border/80">
				<div className="h-full bg-card rounded-2xl overflow-hidden flex flex-col">
					<div className="relative aspect-3/4 rounded-2xl overflow-hidden">
						<img
							alt={book.title}
							src={book.cover}
							className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
						/>
						<div className="absolute top-3 left-3">
							<span
								className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] rounded-xl flex items-center gap-1 ${badgeConfig.className}`}
							>
								<badgeConfig.Icon className="w-3 h-3" strokeWidth={2.5} />
								{badgeConfig.label}
							</span>
						</div>
					</div>
					<div className="p-3 sm:p-4 flex flex-1 flex-col min-w-0">
						<h4 className="min-h-9 font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
							{book.title}
						</h4>
						<p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
							<span className="text-muted-foreground/80">{t('book.authorPrefix')}</span>
							{book.author}
						</p>
						<div className="mt-auto pt-2 flex min-h-5 items-center justify-between gap-2">
							<span className="text-[10px] text-primary font-medium line-clamp-1 min-w-0">
								{book.category}
							</span>
							<span
								className={`shrink-0 text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-xl ${
									hasAvailableCopies ? 'opacity-100' : 'opacity-0'
								}`}
							>
								{hasAvailableCopies
									? t('library.copies', { count: book.availableCopies ?? 0 })
									: t('library.copiesZero')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
