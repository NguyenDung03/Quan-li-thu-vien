import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Book as BookIcon, Group, AlertCircle, CalendarDays, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { CrawlManagementSection } from './crawl-management-section'
import { DashboardChartsSection } from './dashboard-charts-section'
import {
	useDashboardStats,
	useDashboardNewBooks,
	useDashboardRecentBorrows,
} from '@/hooks/use-dashboard-data'
import type { BorrowRecord, BorrowRecordStatusType } from '@/types/borrow-record.types'
import type { Book as BookEntity } from '@/types/book.types'

const formatCount = (n: number) =>
	new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)

function formatDisplayDate(dateString: string | null): string {
	if (!dateString) return '—'
	return new Date(dateString).toLocaleDateString(undefined, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})
}

function normalizeBorrowStatus(raw: string): BorrowRecordStatusType {
	const s = (raw ?? '').toLowerCase()
	if (
		s === 'borrowed' ||
		s === 'returned' ||
		s === 'overdue' ||
		s === 'renewed' ||
		s === 'lost'
	) {
		return s as BorrowRecordStatusType
	}
	return 'borrowed'
}

function bookPrimaryAuthorLine(book: BookEntity): string {
	const raw = book.bookAuthors?.map((ba) => ba.author?.authorName).filter(Boolean) as
		| string[]
		| undefined
	if (raw?.length) return raw.join(', ')
	return '—'
}

function borrowRecordBookCoverUrl(row: BorrowRecord): string | undefined {
	const direct =
		row.book?.coverImage?.trim() ||
		row.copy?.book?.coverImage?.trim() ||
		row.book?.coverImageEntity?.cloudinaryUrl?.trim() ||
		row.copy?.book?.coverImageEntity?.cloudinaryUrl?.trim()
	return direct || undefined
}

function getColorClasses(color: string) {
	switch (color) {
		case 'blue':
			return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
		case 'purple':
			return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
		case 'red':
			return 'bg-red-100 dark:bg-red-900/30 text-red-600'
		case 'amber':
			return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
		default:
			return 'bg-slate-100 text-slate-600'
	}
}

function BorrowStatusBadge({
	status,
	t,
}: {
	status: BorrowRecordStatusType
	t: (k: string) => string
}) {
	switch (status) {
		case 'borrowed':
			return (
				<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
					<span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 inline-block" />
					{t('statusBorrowed')}
				</Badge>
			)
		case 'returned':
			return (
				<Badge className="bg-green-100 text-green-700 hover:bg-green-100">
					<span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5 inline-block" />
					{t('statusReturned')}
				</Badge>
			)
		case 'overdue':
			return (
				<Badge className="bg-red-100 text-red-700 hover:bg-red-100">
					<span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 inline-block" />
					{t('statusOverdue')}
				</Badge>
			)
		case 'renewed':
			return (
				<Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
					<span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 inline-block" />
					{t('statusRenewed')}
				</Badge>
			)
		case 'lost':
			return (
				<Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">
					<span className="w-1.5 h-1.5 rounded-full bg-violet-600 mr-1.5 inline-block" />
					{t('statusLost')}
				</Badge>
			)
		default:
			return null
	}
}

type StatChangeTone = 'positive' | 'negative' | 'neutral'

export function DashboardPage() {
	const { t } = useTranslation('common')
	const { t: tb } = useTranslation('borrowRecord')
	const statsData = useDashboardStats()
	const recentBorrows = useDashboardRecentBorrows()
	const newBooks = useDashboardNewBooks()

	const statCards: {
		title: string
		value: string
		change: string
		changeType: StatChangeTone
		icon: typeof BookIcon
		color: string
	}[] = [
		{
			title: t('dashboard.statBooksTitle'),
			value: statsData.loading ? '—' : formatCount(statsData.bookTitles),
			change: t('dashboard.statBooksBadge'),
			changeType: 'neutral',
			icon: BookIcon,
			color: 'blue',
		},
		{
			title: t('dashboard.statReadersTitle'),
			value: statsData.loading ? '—' : formatCount(statsData.readers),
			change: t('dashboard.statReadersBadge'),
			changeType: 'neutral',
			icon: Group,
			color: 'purple',
		},
		{
			title: t('dashboard.statOverdueTitle'),
			value: statsData.loading ? '—' : formatCount(statsData.overdue),
			change:
				statsData.overdue > 0
					? t('dashboard.statOverdueBadgeUrgent')
					: t('dashboard.statOverdueBadgeOk'),
			changeType: statsData.overdue > 0 ? 'negative' : 'neutral',
			icon: AlertCircle,
			color: 'red',
		},
		{
			title: t('dashboard.statReservationsTitle'),
			value: statsData.loading ? '—' : formatCount(statsData.reservationsPending),
			change:
				statsData.reservationsPending > 0
					? t('dashboard.statReservationsBadgeUrgent')
					: t('dashboard.statReservationsBadgeOk'),
			changeType: statsData.reservationsPending > 0 ? 'negative' : 'neutral',
			icon: CalendarDays,
			color: 'amber',
		},
	]

	const borrowRows = recentBorrows.data?.data ?? []
	const bookRows = newBooks.data?.data ?? []

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					{t('dashboard.title')}
				</h1>
				<p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
					<span className="text-foreground/90 font-medium">{t('dashboard.welcome')}</span>
					{' — '}
					{t('dashboard.pageLead')}
				</p>
			</header>

			{/* 1. KPI — con số tổng quan trước */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{statCards.map((stat) => (
					<Card key={stat.title} className="hover:shadow-md transition-shadow">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
									<stat.icon className="w-5 h-5" />
								</div>
								<span
									className={`text-xs font-medium px-2 py-0.5 rounded-full ${
										stat.changeType === 'positive'
											? 'text-green-600 bg-green-100'
											: stat.changeType === 'negative'
												? 'text-red-600 bg-red-100'
												: 'text-slate-500 bg-slate-100'
									}`}
								>
									{stat.change}
								</span>
							</div>
							<p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
								{stat.title}
							</p>
							<h3 className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</h3>
						</CardContent>
					</Card>
				))}
			</div>

			{/* 2. Biểu đồ — xu hướng / phân bổ sau KPI */}
			<DashboardChartsSection />

			{/* 3. Phiếu gần đây — vận hành cụ thể */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-4">
					<CardTitle className="text-lg font-bold">{t('dashboard.recentBorrowTableTitle')}</CardTitle>
					<Button variant="ghost" className="text-sm font-semibold" asChild>
						<Link to="/dashboard/borrow">{t('dashboard.viewAllBorrow')}</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
								<TableHead className="font-semibold">{t('dashboard.colBook')}</TableHead>
								<TableHead className="font-semibold">{t('dashboard.colBorrower')}</TableHead>
								<TableHead className="font-semibold">{t('dashboard.colBorrowDate')}</TableHead>
								<TableHead className="font-semibold">{t('dashboard.colStatus')}</TableHead>
								<TableHead className="text-right font-semibold">{t('dashboard.colAction')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{recentBorrows.isPending ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center text-slate-500 py-8">
										{t('dashboard.borrowTableLoading')}
									</TableCell>
								</TableRow>
							) : borrowRows.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center text-slate-500 py-8">
										{t('dashboard.borrowTableEmpty')}
									</TableCell>
								</TableRow>
							) : (
								borrowRows.map((row: BorrowRecord) => {
									const st = normalizeBorrowStatus(row.status)
									const bookTitle = row.book?.title ?? row.copy?.book?.title ?? '—'
									const readerLabel =
										row.reader?.fullName ??
										row.reader?.cardNumber ??
										'—'
									const coverUrl = borrowRecordBookCoverUrl(row)
									return (
										<TableRow key={row.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-3 min-w-0">
													{coverUrl ? (
														<img
															src={coverUrl}
															alt=""
															className="w-8 h-10 shrink-0 rounded object-cover border border-border bg-muted"
															loading="lazy"
															decoding="async"
														/>
													) : (
														<div
															className="w-8 h-10 shrink-0 rounded bg-gradient-to-br from-indigo-500 to-purple-600"
															aria-hidden
														/>
													)}
													<span className="truncate">{bookTitle}</span>
												</div>
											</TableCell>
											<TableCell className="font-medium">{readerLabel}</TableCell>
											<TableCell className="text-slate-500">
												{formatDisplayDate(row.borrowDate)}
											</TableCell>
											<TableCell>
												<BorrowStatusBadge status={st} t={tb} />
											</TableCell>
											<TableCell className="text-right">
												<Button variant="ghost" size="sm" asChild>
													<Link to="/dashboard/borrow">{t('dashboard.openBorrowPage')}</Link>
												</Button>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* 4. Sách mới + tóm tắt hệ thống */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card>
					<CardHeader>
						<CardTitle className="font-bold">{t('dashboard.newBooksTitle')}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{newBooks.isPending ? (
							<p className="text-sm text-slate-500 py-4">{t('dashboard.newBooksLoading')}</p>
						) : bookRows.length === 0 ? (
							<p className="text-sm text-slate-500 py-4">{t('dashboard.newBooksEmpty')}</p>
						) : (
							bookRows.map((book: BookEntity) => {
								const newBookCover =
									book.coverImage?.trim() ||
									book.coverImageEntity?.cloudinaryUrl?.trim() ||
									undefined
								return (
								<div
									key={book.id}
									className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-all"
								>
									{newBookCover ? (
										<img
											src={newBookCover}
											alt=""
											className="w-12 h-16 shrink-0 rounded object-cover border border-border bg-muted"
											loading="lazy"
											decoding="async"
										/>
									) : (
										<div
											className="w-12 h-16 shrink-0 rounded bg-gradient-to-br from-indigo-500 to-purple-600"
											aria-hidden
										/>
									)}
									<div className="flex-1 min-w-0">
										<p className="font-semibold truncate">{book.title}</p>
										<p className="text-xs text-slate-500">
											{t('dashboard.authorPrefix')}: {bookPrimaryAuthorLine(book)}
										</p>
									</div>
									<Badge className="bg-primary/10 text-primary hover:bg-primary/10 shrink-0">
										{t('dashboard.newBadge')}
									</Badge>
								</div>
								)
							})
						)}
					</CardContent>
				</Card>

				<Card className="overflow-hidden rounded-2xl border-primary bg-primary text-primary-foreground shadow-md ring-1 ring-primary-foreground/10">
					<CardContent className="relative p-6 sm:p-8 space-y-6">
						<div
							className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(255,255,255,0.14),transparent_55%)]"
							aria-hidden
						/>
						<div className="relative space-y-3">
							<h4 className="text-xl font-bold tracking-tight sm:text-2xl">
								{t('dashboard.summaryTitle')}
							</h4>
							<p className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/[0.08] px-4 py-3.5 text-sm leading-relaxed text-primary-foreground/95 sm:text-[15px]">
								{t('dashboard.summaryDescription', {
									borrowTotal: statsData.loading ? '—' : formatCount(statsData.borrowRecordsTotal),
									books: statsData.loading ? '—' : formatCount(statsData.bookTitles),
									readers: statsData.loading ? '—' : formatCount(statsData.readers),
									overdue: statsData.loading ? '—' : formatCount(statsData.overdue),
									pendingRes: statsData.loading ? '—' : formatCount(statsData.reservationsPending),
								})}
							</p>
						</div>
						<div className="relative rounded-xl border border-primary-foreground/12 bg-primary-foreground/[0.06] p-4 sm:p-5">
							<div className="mb-4 flex items-center gap-2.5">
								<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/12">
									<Lightbulb className="h-4 w-4 text-primary-foreground/90" aria-hidden />
								</span>
								<span className="text-sm font-semibold tracking-tight text-primary-foreground">
									{t('dashboard.summaryTipsLead')}
								</span>
							</div>
							<ol className="m-0 list-none space-y-3 p-0">
								{(
									[
										'dashboard.summaryTip1',
										'dashboard.summaryTip2',
										'dashboard.summaryTip3',
									] as const
								).map((key, index) => (
									<li key={key} className="flex gap-3 text-sm leading-relaxed text-primary-foreground/90">
										<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/14 text-xs font-bold tabular-nums text-primary-foreground">
											{index + 1}
										</span>
										<span className="min-w-0 pt-0.5">{t(key)}</span>
									</li>
								))}
							</ol>
						</div>
						<div className="relative pt-1">
							<Button variant="secondary" className="w-full shadow-sm sm:w-auto" asChild>
								<Link to="/dashboard/borrow">{t('dashboard.summaryCta')}</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 5. Crawl — công cụ kỹ thuật, đặt cuối */}
			<CrawlManagementSection />
		</div>
	)
}
