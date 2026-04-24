import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardSummary } from '@/hooks/use-dashboard-data'
import type { DashboardActivityDay, DashboardNamedCount } from '@/types/dashboard-summary.types'

/** Dùng token `--chart-1`…`--chart-5` trong `index.css` (khớp primary / sidebar theme) */
const CHART_SERIES_FILLS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

const vndFull = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatMoneyAxis(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(Math.round(n))
}

function DashboardChartsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-[300px] rounded-xl border border-border bg-muted/50 animate-pulse" />
        <div className="h-[300px] rounded-xl border border-border bg-muted/50 animate-pulse" />
      </div>
      <div className="h-[350px] rounded-xl border border-border bg-muted/50 animate-pulse" />
    </div>
  )
}

function BorrowStatusBarChart({
  data,
  title,
}: {
  data: DashboardNamedCount[]
  title: string
}) {
  const chartData = useMemo(
    () => data.map((d) => ({ ...d, shortLabel: d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label })),
    [data],
  )

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-0 pb-3">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/80"
              />
              <XAxis
                dataKey="shortLabel"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
                interval={0}
                angle={-28}
                textAnchor="end"
                height={56}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0]?.payload as DashboardNamedCount
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                      <p className="font-semibold">{row.label}</p>
                      <p className="text-muted-foreground tabular-nums">{row.count}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="count" name="count" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={CHART_SERIES_FILLS[i % CHART_SERIES_FILLS.length]}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function BooksTypePieChart({
  data,
  title,
}: {
  data: DashboardNamedCount[]
  title: string
}) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-0 pb-3">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2.5}
              >
                {data.map((_, i) => (
                  <Cell
                    key={`slice-${i}`}
                    fill={CHART_SERIES_FILLS[i % CHART_SERIES_FILLS.length]}
                    stroke="var(--card)"
                    strokeWidth={2}
                    fillOpacity={0.92}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0]
                  const name = String(item.name ?? '')
                  const value = Number(item.value ?? 0)
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                      <p className="font-semibold">{name}</p>
                      <p className="text-muted-foreground tabular-nums">{value}</p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityComposedChart({
  data,
  title,
  legendBorrow,
  legendReturn,
  legendFine,
}: {
  data: DashboardActivityDay[]
  title: string
  legendBorrow: string
  legendReturn: string
  legendFine: string
}) {
  const fineGradientId = `db-fine-${useId().replace(/:/g, '')}`

  const chartRows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        dayLabel: d.date.slice(5),
      })),
    [data],
  )

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-0 pb-3">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[350px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartRows} margin={{ top: 8, right: 12, left: 0, bottom: 52 }}>
              <defs>
                <linearGradient id={fineGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.88} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.82} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/80"
              />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-muted-foreground"
                interval="preserveStartEnd"
                angle={-32}
                textAnchor="end"
                height={48}
              />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} width={40} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatMoneyAxis}
                tick={{ fontSize: 11 }}
                width={44}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0]?.payload as DashboardActivityDay
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md min-w-[200px]">
                      <p className="font-semibold mb-2 border-b border-border pb-1">{row.date}</p>
                      <ul className="space-y-1.5">
                        {payload.map((p) => {
                          const key = String(p.dataKey ?? '')
                          const color = p.color ?? 'var(--muted-foreground)'
                          const isMoney = key === 'finesAmount'
                          const display =
                            typeof p.value === 'number'
                              ? isMoney
                                ? vndFull.format(p.value)
                                : String(p.value)
                              : '—'
                          return (
                            <li key={key} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                {p.name}
                              </span>
                              <span className="tabular-nums font-medium text-foreground">{display}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 8 }}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <Bar
                yAxisId="right"
                dataKey="finesAmount"
                name={legendFine}
                fill={`url(#${fineGradientId})`}
                radius={[6, 6, 0, 0]}
                maxBarSize={30}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="borrows"
                name={legendBorrow}
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="returns"
                name={legendReturn}
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardChartsSection() {
  const { t } = useTranslation('common')
  const summary = useDashboardSummary()

  if (summary.isPending) {
    return (
      <section className="space-y-4" aria-busy="true">
        <p className="text-sm text-muted-foreground leading-relaxed">{t('dashboard.charts.loadingHint')}</p>
        <DashboardChartsSkeleton />
      </section>
    )
  }

  if (summary.isError || !summary.data) {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">
          {t('dashboard.charts.error')}
        </CardContent>
      </Card>
    )
  }

  const d = summary.data

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
        {t('dashboard.charts.sectionLead', { days: d.range.days })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BorrowStatusBarChart data={d.borrowRecordsByStatus} title={t('dashboard.charts.borrowTitle')} />
        <BooksTypePieChart data={d.booksByType} title={t('dashboard.charts.booksTypeTitle')} />
      </div>
      <ActivityComposedChart
        data={d.activityByDay}
        title={t('dashboard.charts.activityTitle')}
        legendBorrow={t('dashboard.charts.legendBorrow')}
        legendReturn={t('dashboard.charts.legendReturn')}
        legendFine={t('dashboard.charts.legendFine')}
      />
    </section>
  )
}
