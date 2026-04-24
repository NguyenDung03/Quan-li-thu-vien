import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguageStore } from '@/stores/language-store';
import { useThemeStore } from '@/stores/theme-store';
import { Bell, Bookmark, Globe, Moon, Search, Settings, Sun } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
	useAdminReservationNotify,
	type ReservationCreatedEvent,
} from '@/hooks/use-admin-reservation-notify';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const MAX_RESERVATION_NOTIFICATIONS = 30;

type ReservationNotificationEntry = ReservationCreatedEvent & {
	receivedAt: number;
};

function formatReceivedAt(ts: number) {
	return new Date(ts).toLocaleString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

interface HeaderProps {
	className?: string;
}

export function Header({ className }: HeaderProps) {
	const { theme, toggleTheme } = useThemeStore();
	const { setLanguage } = useLanguageStore();
	const { t } = useTranslation('common');
	const [hasNewReservationNotify, setHasNewReservationNotify] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [reservationNotifications, setReservationNotifications] = useState<
		ReservationNotificationEntry[]
	>([]);

	const onReservationCreated = useCallback((payload: ReservationCreatedEvent) => {
		setHasNewReservationNotify(true);
		setReservationNotifications((prev) => {
			const entry: ReservationNotificationEntry = {
				...payload,
				receivedAt: Date.now(),
			};
			const next = [entry, ...prev];
			return next.slice(0, MAX_RESERVATION_NOTIFICATIONS);
		});
	}, []);

	useAdminReservationNotify({
		onReservationCreated,
	});

	const onNotificationsOpenChange = useCallback((open: boolean) => {
		setNotificationsOpen(open);
		if (open) {
			setHasNewReservationNotify(false);
		}
	}, []);

	return (
		<header
			className={`h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 ${className}`}
		>
			
			<div className="flex items-center flex-1 max-w-xl">
				<div className="relative w-full">
					<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
						<Search className="w-5 h-5" />
					</span>
					<Input
						className="block w-full pl-10 pr-3 py-2 border-none bg-slate-100 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all"
						placeholder={t('common.searchPlaceholder')}
						type="text"
					/>
				</div>
			</div>

			
			<div className="flex items-center gap-2">
				
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<Globe className="w-5 h-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setLanguage('vn')}>
							{t('language.vi')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setLanguage('en')}>
							{t('language.en')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				
				<Button variant="ghost" size="icon" onClick={toggleTheme}>
					{theme === 'light' ? (
						<Moon className="w-5 h-5" />
					) : (
						<Sun className="w-5 h-5" />
					)}
				</Button>
				<Popover open={notificationsOpen} onOpenChange={onNotificationsOpenChange}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={`relative ${hasNewReservationNotify ? 'animate-pulse ring-2 ring-red-400/60 rounded-md' : ''}`}
							aria-label="Thông báo đặt trước"
						>
							<Bell className="w-5 h-5" />
							<span
								className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white dark:border-slate-800 ${
									hasNewReservationNotify
										? 'bg-red-500 animate-ping'
										: 'bg-slate-300 dark:bg-slate-500'
								}`}
							/>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-96 p-0">
						<div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<Bookmark className="w-4 h-4 shrink-0 text-emerald-600" />
								<p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
									Đặt trước mới
								</p>
							</div>
							<Button variant="outline" size="sm" className="shrink-0 text-xs h-8" asChild>
								<Link to="/dashboard/reservations" onClick={() => setNotificationsOpen(false)}>
									Mở trang quản lý
								</Link>
							</Button>
						</div>
						<div className="max-h-[min(60vh,320px)] overflow-y-auto">
							{reservationNotifications.length === 0 ? (
								<p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
									Chưa có thông báo đặt trước. Khi độc giả tạo đặt trước, tin sẽ hiện ở đây.
								</p>
							) : (
								<ul className="divide-y divide-slate-100 dark:divide-slate-700">
									{reservationNotifications.map((item) => (
										<li key={`${item.reservationId}-${item.receivedAt}`}>
											<Link
												to="/dashboard/reservations"
												onClick={() => setNotificationsOpen(false)}
												className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
											>
												<p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
													{item.message}
												</p>
												<p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 space-x-2">
													<span className="font-mono">
														ID: {item.reservationId.slice(0, 8)}…
													</span>
													<span>·</span>
													<span>{formatReceivedAt(item.receivedAt)}</span>
												</p>
											</Link>
										</li>
									))}
								</ul>
							)}
						</div>
					</PopoverContent>
				</Popover>
				<Button variant="ghost" size="icon">
					<Settings className="w-5 h-5" />
				</Button>
			</div>
		</header>
	);
}
