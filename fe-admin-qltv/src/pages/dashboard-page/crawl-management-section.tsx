import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { crawlApi } from '@/apis/crawl.api'
import type { CrawlHealthResponse, CrawlJobResponse } from '@/types/crawl.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const easeOut = [0.16, 1, 0.3, 1] as const

const surface = 'rounded-xl border border-border bg-card text-card-foreground shadow-sm'

const codeBlock =
  'max-h-72 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground'

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function axiosMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error) || !error.response?.data) return fallback
  const data = error.response.data as { message?: string | string[] }
  if (typeof data.message === 'string') return data.message
  if (Array.isArray(data.message)) return data.message.join(', ')
  return fallback
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-4 shrink-0 rounded-full border-2 border-muted-foreground/25 border-t-primary',
        'animate-spin motion-reduce:animate-none',
        className,
      )}
      aria-hidden
    />
  )
}

function StatusPill({ status }: { status: CrawlHealthResponse['status'] }) {
  const { t } = useTranslation('common')
  const styles: Record<CrawlHealthResponse['status'], string> = {
    connected:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    unhealthy:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    unreachable: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }
  const labels: Record<CrawlHealthResponse['status'], string> = {
    connected: t('dashboard.crawl.statusConnected'),
    unhealthy: t('dashboard.crawl.statusUnhealthy'),
    unreachable: t('dashboard.crawl.statusUnreachable'),
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  )
}

function SectionTitle({ step, children }: { step: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
        {step}
      </span>
      <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">{children}</h3>
    </div>
  )
}

export function CrawlManagementSection() {
  const { t } = useTranslation('common')
  const { isAdmin } = useAuth()

  const [health, setHealth] = useState<CrawlHealthResponse | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const [urlsText, setUrlsText] = useState('')
  const [priority, setPriority] = useState(10)
  const [crawlLoading, setCrawlLoading] = useState(false)
  const [crawlResponse, setCrawlResponse] = useState<CrawlJobResponse | null>(null)

  const [taskId, setTaskId] = useState('')
  const [taskLoading, setTaskLoading] = useState(false)
  const [taskResponse, setTaskResponse] = useState<Record<string, unknown> | null>(null)

  const handleHealth = async () => {
    setHealthLoading(true)
    try {
      const res = await crawlApi.checkHealth()
      setHealth(res)
      toast.success(t('dashboard.crawl.healthChecked'))
    } catch (e) {
      toast.error(axiosMessage(e, t('dashboard.crawl.healthFailed')))
    } finally {
      setHealthLoading(false)
    }
  }

  const parseUrls = (): string[] =>
    urlsText
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter(Boolean)

  const handleCrawl = async () => {
    const urls = parseUrls()
    if (urls.length === 0) {
      toast.error(t('dashboard.crawl.urlsRequired'))
      return
    }
    setCrawlLoading(true)
    setCrawlResponse(null)
    try {
      const res = await crawlApi.crawl({
        urls,
        priority: Number.isFinite(priority) ? priority : 10,
      })
      setCrawlResponse(res)
      toast.success(t('dashboard.crawl.crawlSuccess'))
    } catch (e) {
      toast.error(axiosMessage(e, t('dashboard.crawl.crawlFailed')))
    } finally {
      setCrawlLoading(false)
    }
  }

  const handleTask = async () => {
    const id = taskId.trim()
    if (!id) {
      toast.error(t('dashboard.crawl.taskIdRequired'))
      return
    }
    setTaskLoading(true)
    setTaskResponse(null)
    try {
      const res = await crawlApi.getTaskResult(id)
      setTaskResponse(res)
      toast.success(t('dashboard.crawl.taskFetchSuccess'))
    } catch (e) {
      toast.error(axiosMessage(e, t('dashboard.crawl.taskFetchFailed')))
    } finally {
      setTaskLoading(false)
    }
  }

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: easeOut },
    },
  }

  const labelClass = 'text-xs font-medium text-muted-foreground'

  return (
    <motion.article
      id="crawl-management"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOut }}
      className={cn(surface, 'overflow-hidden')}
    >
      <header className="border-b border-border px-6 py-6 sm:px-8 sm:py-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {t('dashboard.crawl.title')}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {t('dashboard.crawl.subtitle')}
        </p>
      </header>

      <motion.div
        className="divide-y divide-border"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={itemVariants} className="space-y-4 px-6 py-6 sm:px-8 sm:py-6">
          <SectionTitle step="01">{t('dashboard.crawl.healthSection')}</SectionTitle>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t('dashboard.crawl.healthDescription')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={handleHealth} disabled={healthLoading}>
              {healthLoading ? <Spinner className="mr-2" /> : null}
              {t('dashboard.crawl.checkHealth')}
            </Button>
            {health ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs">{health.service}</span>
                <StatusPill status={health.status} />
              </div>
            ) : null}
          </div>
        </motion.section>

        {isAdmin ? null : (
          <motion.div
            variants={itemVariants}
            className="border-l-4 border-amber-500 bg-amber-50 px-6 py-4 text-sm leading-relaxed text-amber-950 dark:border-amber-600 dark:bg-amber-950/30 dark:text-amber-100 sm:px-8"
          >
            {t('dashboard.crawl.adminOnly')}
          </motion.div>
        )}

        <motion.section
          variants={itemVariants}
          className={cn('space-y-4 px-6 py-6 sm:px-8 sm:py-6', !isAdmin && 'pointer-events-none opacity-50')}
        >
          <SectionTitle step="02">{t('dashboard.crawl.sendSection')}</SectionTitle>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t('dashboard.crawl.sendDescription')}
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,11rem)] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="crawl-urls" className={labelClass}>
                {t('dashboard.crawl.urlsLabel')}
              </Label>
              <Textarea
                id="crawl-urls"
                rows={4}
                placeholder={t('dashboard.crawl.urlsPlaceholder')}
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                className="min-h-[108px] resize-y font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crawl-priority" className={labelClass}>
                {t('dashboard.crawl.priority')}
              </Label>
              <Input
                id="crawl-priority"
                type="number"
                min={0}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="font-mono tabular-nums"
              />
            </div>
          </div>
          <Button type="button" onClick={handleCrawl} disabled={crawlLoading || !isAdmin}>
            {crawlLoading ? (
              <Spinner className="mr-2 border-primary-foreground/35 border-t-primary-foreground" />
            ) : null}
            {t('dashboard.crawl.submitCrawl')}
          </Button>
          {crawlResponse ? (
            <div className="space-y-2 pt-2">
              <Label className={labelClass}>{t('dashboard.crawl.responsePreview')}</Label>
              <pre className={codeBlock}>{formatJson(crawlResponse)}</pre>
            </div>
          ) : null}
        </motion.section>

        <motion.section
          variants={itemVariants}
          className={cn('space-y-4 px-6 py-6 sm:px-8 sm:py-6', !isAdmin && 'pointer-events-none opacity-50')}
        >
          <SectionTitle step="03">{t('dashboard.crawl.taskSection')}</SectionTitle>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t('dashboard.crawl.taskDescription')}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="crawl-task-id" className={labelClass}>
                {t('dashboard.crawl.taskIdLabel')}
              </Label>
              <Input
                id="crawl-task-id"
                placeholder={t('dashboard.crawl.taskIdPlaceholder')}
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTask}
              disabled={taskLoading || !isAdmin}
              className="sm:shrink-0"
            >
              {taskLoading ? <Spinner className="mr-2" /> : null}
              {t('dashboard.crawl.fetchTask')}
            </Button>
          </div>
          {taskResponse ? (
            <div className="space-y-2 pt-2">
              <Label className={labelClass}>{t('dashboard.crawl.responsePreview')}</Label>
              <pre className={codeBlock}>{formatJson(taskResponse)}</pre>
            </div>
          ) : null}
        </motion.section>
      </motion.div>
    </motion.article>
  )
}
