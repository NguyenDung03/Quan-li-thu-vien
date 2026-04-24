import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFineRules, useUpdateFineRules } from '@/hooks/use-fines'
import type { FineRulesResponse, UpdateFineRulesRequest } from '@/types/fine.types'

type FineMode = 'fixed' | 'percent'
type LostBookFineMode = 'percent' | 'fixed'

interface FormState {
  overdueFeePerDay: string
  damagedBookFineMode: FineMode
  damagedBookFineFixed: string
  damagedBookFinePercent: string
  lostBookFineMode: LostBookFineMode
  lostBookReimbursePercent: string
  lostBookProcessingFee: string
  lostBookOverdueDaysAsLost: string
}

function normalizeDamagedMode(
  raw: FineRulesResponse['damagedBookFineMode'] | string | undefined,
): FineMode {
  const s = typeof raw === 'string' ? raw.toLowerCase() : ''
  return s === 'percent' ? 'percent' : 'fixed'
}

function normalizeLostBookMode(
  raw: FineRulesResponse['lostBookFineMode'] | string | undefined,
): LostBookFineMode {
  const s = typeof raw === 'string' ? raw.toLowerCase() : ''
  return s === 'fixed' ? 'fixed' : 'percent'
}

function formFromApi(data: FineRulesResponse): FormState {
  return {
    overdueFeePerDay: String(data.overdueFeePerDay ?? ''),
    damagedBookFineMode: normalizeDamagedMode(data.damagedBookFineMode),
    damagedBookFineFixed: String(data.damagedBookFineFixed ?? ''),
    damagedBookFinePercent: String(data.damagedBookFinePercent ?? ''),
    lostBookFineMode: normalizeLostBookMode(data.lostBookFineMode),
    lostBookReimbursePercent: String(data.lostBookReimbursePercent ?? ''),
    lostBookProcessingFee: String(data.lostBookProcessingFee ?? ''),
    lostBookOverdueDaysAsLost: String(data.lostBookOverdueDaysAsLost ?? ''),
  }
}

export function FineRulesSettings() {
  const { t, i18n } = useTranslation('common')
  const { data, isLoading, isError } = useFineRules()
  const updateMutation = useUpdateFineRules()

  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    if (data) {
      setForm(formFromApi(data))
    }
  }, [data])

  const isDirty = useMemo(() => {
    if (!data || !form) return false
    const s = formFromApi(data)
    return JSON.stringify(s) !== JSON.stringify(form)
  }, [data, form])

  const formatCurrency = (value: number) => {
    const locale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const parseIntNonNeg = (s: string) => {
    const n = Number.parseInt(s.replaceAll(/\s/g, ''), 10)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  const parseNumberNonNeg = (s: string) => {
    const n = Number.parseFloat(s.replaceAll(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  const parsePercentFine = (s: string) => {
    const n = Number.parseFloat(s.replaceAll(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null
  }

  const overduePreview = useMemo(() => {
    if (form) {
      const n = parseIntNonNeg(form.overdueFeePerDay)
      if (n === null) return '—'
      return formatCurrency(n)
    }
    return '—'
  }, [form, i18n.language])

  const handleSave = async () => {
    if (!form) return

    const overdueFeePerDay = parseIntNonNeg(form.overdueFeePerDay)
    if (overdueFeePerDay === null) {
      toast.error(t('fines.rulesInvalidAmount'))
      return
    }

    const damagedBookFineFixed = parseIntNonNeg(form.damagedBookFineFixed)
    if (damagedBookFineFixed === null) {
      toast.error(t('fines.rulesInvalidDamagedFixed'))
      return
    }

    const damagedBookFinePercent = parsePercentFine(form.damagedBookFinePercent)
    if (damagedBookFinePercent === null) {
      toast.error(t('fines.rulesInvalidDamagedPercent'))
      return
    }

    let lostBookReimbursePercent = 0
    let lostBookProcessingFee = 0

    if (form.lostBookFineMode === 'percent') {
      const pct = parseNumberNonNeg(form.lostBookReimbursePercent)
      if (pct === null || pct > 500) {
        toast.error(t('fines.rulesInvalidLostReimburse'))
        return
      }
      lostBookReimbursePercent = pct
      const feeParsed = parseIntNonNeg(form.lostBookProcessingFee)
      lostBookProcessingFee = feeParsed ?? 0
    } else {
      const feeParsed = parseIntNonNeg(form.lostBookProcessingFee)
      if (feeParsed === null) {
        toast.error(t('fines.rulesInvalidLostFee'))
        return
      }
      lostBookProcessingFee = feeParsed
      const pctParsed = parseNumberNonNeg(form.lostBookReimbursePercent)
      lostBookReimbursePercent = pctParsed ?? 0
    }

    const lostBookOverdueDaysAsLost = parseIntNonNeg(form.lostBookOverdueDaysAsLost)
    if (lostBookOverdueDaysAsLost === null || lostBookOverdueDaysAsLost < 1) {
      toast.error(t('fines.rulesInvalidLostDays'))
      return
    }

    const payload: UpdateFineRulesRequest = {
      overdueFeePerDay,
      damagedBookFineMode: form.damagedBookFineMode,
      damagedBookFineFixed,
      damagedBookFinePercent,
      lostBookFineMode: form.lostBookFineMode,
      lostBookReimbursePercent,
      lostBookProcessingFee,
      lostBookOverdueDaysAsLost,
    }

    try {
      await updateMutation.mutateAsync(payload)
      toast.success(t('fines.rulesSaved'))
    } catch {
      toast.error(t('fines.rulesSaveFailed'))
    }
  }

  const disabled = isLoading || isError || !form

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{t('fines.rulesSectionTitle')}</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('fines.rulesSectionDescription')}
        </p>
      </div>

      {isError && (
        <p className="text-destructive text-sm">{t('fines.rulesLoadFailed')}</p>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('fines.rulesOverdueTitle')}</CardTitle>
          <CardDescription>{t('fines.rulesOverdueDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="overdueFeePerDay">{t('fines.overdueFeePerDayLabel')}</Label>
            <Input
              id="overdueFeePerDay"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              disabled={disabled}
              value={form?.overdueFeePerDay ?? ''}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, overdueFeePerDay: e.target.value } : f))
              }
              placeholder={t('fines.overdueFeePerDayPlaceholder')}
            />
            <p className="text-muted-foreground text-xs">
              {t('fines.rulesPreview')}:{' '}
              <span className="text-foreground">{overduePreview}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('fines.rulesDamagedTitle')}</CardTitle>
          <CardDescription>{t('fines.rulesDamagedDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:max-w-md">
          <div className="space-y-2">
            <Label>{t('fines.damagedBookFineModeLabel')}</Label>
            <Select
              disabled={disabled}
              value={form?.damagedBookFineMode ?? 'fixed'}
              onValueChange={(v) =>
                setForm((f) =>
                  f ? { ...f, damagedBookFineMode: v as FineMode } : f,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">{t('fines.damagedBookFineModeFixed')}</SelectItem>
                <SelectItem value="percent">{t('fines.damagedBookFineModePercent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form?.damagedBookFineMode === 'fixed' ? (
            <div className="space-y-2">
              <Label htmlFor="damagedFixed">{t('fines.damagedBookFineFixedLabel')}</Label>
              <Input
                id="damagedFixed"
                type="number"
                min={0}
                step={1}
                disabled={disabled}
                value={form?.damagedBookFineFixed ?? ''}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, damagedBookFineFixed: e.target.value } : f,
                  )
                }
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="damagedPercent">{t('fines.damagedBookFinePercentLabel')}</Label>
              <Input
                id="damagedPercent"
                type="number"
                min={0}
                max={100}
                step={0.01}
                disabled={disabled}
                value={form?.damagedBookFinePercent ?? ''}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, damagedBookFinePercent: e.target.value } : f,
                  )
                }
              />
              <p className="text-muted-foreground text-xs">
                {t('fines.damagedBookFinePercentHint')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('fines.rulesLostTitle')}</CardTitle>
          <CardDescription>{t('fines.rulesLostDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:max-w-md">
          <div className="space-y-2">
            <Label>{t('fines.lostBookFineModeLabel')}</Label>
            <Select
              disabled={disabled}
              value={form?.lostBookFineMode ?? 'percent'}
              onValueChange={(v) =>
                setForm((f) =>
                  f ? { ...f, lostBookFineMode: v as LostBookFineMode } : f,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">
                  {t('fines.lostBookFineModePercent')}
                </SelectItem>
                <SelectItem value="fixed">
                  {t('fines.lostBookFineModeFixed')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {t('fines.lostBookFineModeHint')}
            </p>
          </div>

          {form?.lostBookFineMode === 'percent' ? (
            <div className="space-y-2">
              <Label htmlFor="lostReimburse">
                {t('fines.lostBookReimbursePercentLabel')}
              </Label>
              <Input
                id="lostReimburse"
                type="number"
                min={0}
                max={500}
                step={1}
                disabled={disabled}
                value={form?.lostBookReimbursePercent ?? ''}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, lostBookReimbursePercent: e.target.value } : f,
                  )
                }
              />
              <p className="text-muted-foreground text-xs">
                {t('fines.lostBookReimbursePercentHint')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="lostFee">{t('fines.lostBookProcessingFeeLabel')}</Label>
              <Input
                id="lostFee"
                type="number"
                min={0}
                step={1}
                disabled={disabled}
                value={form?.lostBookProcessingFee ?? ''}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, lostBookProcessingFee: e.target.value } : f,
                  )
                }
              />
              <p className="text-muted-foreground text-xs">
                {t('fines.lostBookProcessingFeeHint')}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="lostDays">{t('fines.lostBookOverdueDaysAsLostLabel')}</Label>
            <Input
              id="lostDays"
              type="number"
              min={1}
              step={1}
              disabled={disabled}
              value={form?.lostBookOverdueDaysAsLost ?? ''}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, lostBookOverdueDaysAsLost: e.target.value } : f,
                )
              }
            />
            <p className="text-muted-foreground text-xs">
              {t('fines.lostBookOverdueDaysAsLostHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={disabled || !isDirty || updateMutation.isPending}
      >
        {t('fines.rulesSaveAll')}
      </Button>
    </div>
  )
}
