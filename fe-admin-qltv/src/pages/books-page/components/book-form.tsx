import { useEffect, useRef } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, FileText } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Book, CreateBookRequest, BookType, PhysicalType } from '@/types/book.types'
import type { Location } from '@/types/location.types'
import { useUploadFile } from '@/hooks/use-upload'
import { usePublishers } from '@/hooks/use-publishers'
import { useBookCategories } from '@/hooks/use-book-categories'
import { useLocations } from '@/hooks/use-locations'
import { useAuthors } from '@/hooks/use-authors'
import { useGradeLevels } from '@/hooks/use-grade-levels'
import { useBookAuthorLinks } from '@/hooks/use-book-author-links'
import { useBookGradeLevelLinks } from '@/hooks/use-book-grade-level-links'
import { Badge } from '@/components/ui/badge'


const LIST_PAGE_SIZE = 100

const LOCATIONS_LIST_LIMIT = 500


const SEL_REQ = '__bf_required_placeholder__'
const SEL_LOC_NONE = '__bf_location_none__'

interface BookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: Book | null
  isSubmitting?: boolean
  onSubmit: (data: CreateBookRequest) => Promise<void>
}

const bookFormSchema = z.object({
  title: z.string().min(1, 'Tên sách là bắt buộc'),
  isbn: z.string().min(1, 'ISBN là bắt buộc'),
  publishYear: z.number().min(1000).max(9999),
  edition: z.string().optional(),
  description: z.string().optional(),
  coverImageId: z.string().optional(),
  coverImage: z.string().optional(),
  language: z.string().min(1),
  pageCount: z.number().min(1),
  bookType: z.enum(['physical', 'ebook']),
  physicalType: z.enum(['borrowable', 'library_use']).optional(),
  publisherId: z.string().min(1, 'Nhà xuất bản là bắt buộc'),
  mainCategoryId: z.string().min(1, 'Danh mục là bắt buộc'),
  physicalCopiesQuantity: z.number().min(1).max(100).optional(),
  uploadId: z.string().optional(),
  defaultLocationCode: z.string().optional(),
  authorIds: z.array(z.string()).optional(),
  gradeLevelIds: z.array(z.string()).optional(),
  physicalCopyPrice: z.number().min(0).optional(),
})

type BookFormValues = z.infer<typeof bookFormSchema>

const initialFormData: BookFormValues = {
  title: '',
  isbn: '',
  publishYear: new Date().getFullYear(),
  edition: '',
  description: '',
  coverImageId: undefined,
  coverImage: undefined,
  language: 'vi',
  pageCount: 0,
  bookType: 'physical',
  physicalType: 'borrowable',
  publisherId: '',
  mainCategoryId: '',
  physicalCopiesQuantity: undefined,
  uploadId: undefined,
  defaultLocationCode: undefined,
  authorIds: [],
  gradeLevelIds: [],
  physicalCopyPrice: undefined,
}

export function BookForm({
  open,
  onOpenChange,
  book,
  isSubmitting = false,
  onSubmit,
}: BookFormProps) {
  const { t } = useTranslation('common')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadFile()

  
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: initialFormData,
  })

  const { control, watch, setValue, reset, handleSubmit } = form

  const listQueryParams = { page: 1, limit: LIST_PAGE_SIZE } as const
  const linkListParams = React.useMemo(
    () => ({ page: 1, limit: 100, bookId: book?.id }),
    [book?.id],
  )

  const publishersQuery = usePublishers(listQueryParams, { enabled: open })
  const categoriesQuery = useBookCategories(listQueryParams, { enabled: open })
  const locationsQuery = useLocations(
    { page: 1, limit: LOCATIONS_LIST_LIMIT },
    { enabled: open },
  )
  const authorsQuery = useAuthors(listQueryParams, { enabled: open })
  const gradeLevelsQuery = useGradeLevels(listQueryParams, { enabled: open })

  const linkedAuthorsQuery = useBookAuthorLinks(linkListParams, {
    enabled: open && !!book?.id,
  })
  const linkedGradeLevelsQuery = useBookGradeLevelLinks(linkListParams, {
    enabled: open && !!book?.id,
  })

  
  const watchBookType = watch('bookType')
  const watchPhysicalType = watch('physicalType')
  const watchUploadId = watch('uploadId')

  const publishers = publishersQuery.data?.data ?? []
  const categories = categoriesQuery.data?.data ?? []
  const locations = React.useMemo(() => {
    const rows = locationsQuery.data?.data ?? []
    return rows.map((loc) => {
      const raw = loc as Location & { is_active?: boolean }
      const isActive = raw.isActive ?? raw.is_active ?? true
      return { ...loc, isActive }
    })
  }, [locationsQuery.data?.data])
  const authors = authorsQuery.data?.data ?? []
  const gradeLevels = gradeLevelsQuery.data?.data ?? []
  const linkedAuthorRows = linkedAuthorsQuery.data?.data ?? []
  const linkedGradeRows = linkedGradeLevelsQuery.data?.data ?? []

  const authorLabelById = React.useMemo(() => {
    const m = new Map<string, string>()
    book?.bookAuthors?.forEach((ba) => {
      const name = ba.author?.authorName
      if (name) m.set(ba.authorId, name)
    })
    linkedAuthorRows.forEach((row) => {
      const name = row.author?.authorName
      if (name) m.set(row.authorId, name)
    })
    authors.forEach((a) => m.set(a.id, a.authorName))
    return m
  }, [book?.bookAuthors, linkedAuthorRows, authors])

  const gradeLabelById = React.useMemo(() => {
    const m = new Map<string, string>()
    book?.bookGradeLevels?.forEach((bg) => {
      const name = bg.gradeLevel?.name
      if (name) m.set(bg.gradeLevelId, name)
    })
    linkedGradeRows.forEach((row) => {
      const name = row.gradeLevel?.name
      if (name) m.set(row.gradeLevelId, name)
    })
    gradeLevels.forEach((g) => m.set(g.id, g.name))
    return m
  }, [book?.bookGradeLevels, linkedGradeRows, gradeLevels])

  const publisherIdSet = React.useMemo(() => new Set(publishers.map((p) => p.id)), [publishers])
  const categoryIdSet = React.useMemo(() => new Set(categories.map((c) => c.id)), [categories])
  const locationSlugSet = React.useMemo(() => new Set(locations.map((l) => l.slug)), [locations])

  const catalogLoading =
    publishersQuery.isLoading ||
    categoriesQuery.isLoading ||
    locationsQuery.isLoading ||
    authorsQuery.isLoading ||
    gradeLevelsQuery.isLoading ||
    (open &&
      !!book?.id &&
      (linkedAuthorsQuery.isLoading || linkedGradeLevelsQuery.isLoading))

  useEffect(() => {
    if (!open) {
      reset(initialFormData)
    } else if (book) {
      reset({
        title: book.title,
        isbn: book.isbn,
        publishYear: book.publishYear,
        edition: book.edition || '',
        description: book.description || '',
        coverImageId: book.coverImageId || undefined,
        coverImage: book.coverImage || undefined,
        language: book.language,
        pageCount: book.pageCount,
        bookType: book.bookType,
        physicalType: book.physicalType || 'borrowable',
        publisherId: book.publisherId,
        mainCategoryId: book.mainCategoryId,
        physicalCopiesQuantity: book.physicalCopiesQuantity,
        uploadId: book.uploadId,
        defaultLocationCode: book.defaultLocationCode,
        authorIds: book.bookAuthors?.map(ba => ba.authorId) || [],
        gradeLevelIds: book.bookGradeLevels?.map(bgl => bgl.gradeLevelId) || [],
        physicalCopyPrice: book.physicalCopyPrice,
      })
    } else {
      reset(initialFormData)
    }
  }, [book, open, reset])

  const showPhysicalType = watchBookType === 'physical'
  const showPhysicalCopies = showPhysicalType && watchPhysicalType === 'borrowable'
  const showLocation = showPhysicalType
  const showUploadFile = watchBookType === 'ebook'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook']
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ hỗ trợ file PDF, EPUB, MOBI')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File không được vượt quá 50MB')
      return
    }

    try {
      const uploadData = await uploadMutation.mutateAsync(file)
      setValue('uploadId', uploadData.id)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleRemoveFile = () => {
    setValue('uploadId', undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = async (data: BookFormValues) => {
    
    const submitData: CreateBookRequest = {
      ...data,
      bookType: data.bookType as BookType,
      physicalType: data.physicalType as PhysicalType | undefined,
      physicalCopiesQuantity: data.physicalCopiesQuantity,
      physicalCopyPrice: data.physicalCopyPrice,
    }
    await onSubmit(submitData)
    onOpenChange(false)
  }

  const handleClose = () => {
    reset(initialFormData)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {book ? t('books.edit') : t('books.addNew')}
          </SheetTitle>
          <SheetDescription>
            {book ? t('books.editDescription') : t('books.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('books.name')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('books.namePlaceholder')}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('books.isbn')} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('books.isbnPlaceholder')}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="publishYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('books.publishYear')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          required
                          min={1000}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="pageCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('books.pageCount')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          required
                          min={1}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="edition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('books.edition')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('books.editionPlaceholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('books.language')} *</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="bookType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('books.bookType')} *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as BookType)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="physical">{t('books.physical')}</SelectItem>
                          <SelectItem value="ebook">{t('books.ebook')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showPhysicalType && (
                  <FormField
                    control={control}
                    name="physicalType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('books.physicalType')} *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(v) => field.onChange(v as PhysicalType)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="borrowable">{t('books.borrowable')}</SelectItem>
                            <SelectItem value="library_use">{t('books.library_use')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {showPhysicalCopies && (
                <FormField
                  control={control}
                  name="physicalCopiesQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng bản sao vật lý *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Nhập số lượng bản sao"
                          required
                          min={1}
                          max={100}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showPhysicalType && (
                <FormField
                  control={control}
                  name="physicalCopyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('books.physicalCopyPrice')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder={t('books.physicalCopyPricePlaceholder')}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const v = e.target.value
                            field.onChange(v === '' ? undefined : Number(v))
                          }}
                        />
                      </FormControl>
                      <p className="text-muted-foreground text-xs">{t('books.physicalCopyPriceHint')}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showLocation && (
                <FormField
                  control={control}
                  name="defaultLocationCode"
                  render={({ field }) => {
                    const raw = field.value
                    const locationOrUnknown =
                      raw && !locationSlugSet.has(raw) ? raw : undefined
                    const selectValue = !raw ? SEL_LOC_NONE : raw

                    return (
                      <FormItem>
                        <FormLabel>{t('books.defaultLocation')}</FormLabel>
                        <Select
                          disabled={catalogLoading}
                          value={selectValue}
                          onValueChange={(v) =>
                            field.onChange(v === SEL_LOC_NONE ? undefined : v)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('books.selectLocation')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={SEL_LOC_NONE}>
                              Không chọn vị trí mặc định
                            </SelectItem>
                            {locationOrUnknown ? (
                              <SelectItem value={locationOrUnknown}>
                                {locationOrUnknown} (không có trong danh sách hiện tại)
                              </SelectItem>
                            ) : null}
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.slug}>
                                {loc.name} · Tầng {loc.floor ?? '-'} · Khu {loc.section} · Kệ{' '}
                                {loc.shelf}
                                {!loc.isActive ? ' · (ngưng HĐ)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              )}

              {showUploadFile && (
                <FormField
                  control={control}
                  name="uploadId"
                  render={() => (
                    <FormItem>
                      <FormLabel>File sách (PDF, EPUB, MOBI) *</FormLabel>
                      <FormControl>
                        {watchUploadId ? (
                          <div className="flex items-center gap-2 p-3 border rounded-md bg-slate-50">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="flex-1 text-sm">Đã tải file thành công</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handleRemoveFile}
                              className="cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.epub,.mobi"
                              onChange={handleFileChange}
                              className="hidden"
                              id="ebook-file"
                            />
                            <label htmlFor="ebook-file">
                              <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="cursor-pointer"
                                disabled={uploadMutation.isPending}
                              >
                                <span>
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadMutation.isPending ? 'Đang tải...' : 'Tải file'}
                                </span>
                              </Button>
                            </label>
                            <span className="text-xs text-slate-500">Tối đa 50MB</span>
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={control}
                name="publisherId"
                render={({ field }) => {
                  const raw = field.value
                  const orphanPub = raw && !publisherIdSet.has(raw) ? raw : undefined
                  const selectValue = !raw ? SEL_REQ : raw

                  return (
                    <FormItem>
                      <FormLabel>{t('books.publisher')} *</FormLabel>
                      <Select
                        disabled={catalogLoading}
                        value={selectValue}
                        onValueChange={(v) => field.onChange(v === SEL_REQ ? '' : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('books.selectPublisher')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SEL_REQ}>{t('books.selectPublisher')}</SelectItem>
                          {orphanPub ? (
                            <SelectItem value={orphanPub}>
                              (Đã lưu) ID không còn trong danh sách
                            </SelectItem>
                          ) : null}
                          {publishers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.publisherName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={control}
                name="mainCategoryId"
                render={({ field }) => {
                  const raw = field.value
                  const orphanCat = raw && !categoryIdSet.has(raw) ? raw : undefined
                  const selectValue = !raw ? SEL_REQ : raw

                  return (
                    <FormItem>
                      <FormLabel>{t('books.category')} *</FormLabel>
                      <Select
                        disabled={catalogLoading}
                        value={selectValue}
                        onValueChange={(v) => field.onChange(v === SEL_REQ ? '' : v)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('books.selectCategory')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={SEL_REQ}>{t('books.selectCategory')}</SelectItem>
                          {orphanCat ? (
                            <SelectItem value={orphanCat}>
                              (Đã lưu) Danh mục không còn trong danh sách
                            </SelectItem>
                          ) : null}
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={control}
                name="authorIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tác giả</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value?.map((id) => (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {authorLabelById.get(id) ?? id}
                          <button
                            type="button"
                            onClick={() => field.onChange(field.value?.filter((i) => i !== id))}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormControl>
                      {authors.filter((a) => !field.value?.includes(a.id)).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Đã chọn hết tác giả hoặc chưa có dữ liệu.
                        </p>
                      ) : (
                        <Select
                          disabled={catalogLoading}
                          key={(field.value ?? []).join('|')}
                          onValueChange={(v) => {
                            if (!field.value?.includes(v)) {
                              field.onChange([...(field.value || []), v])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tác giả..." />
                          </SelectTrigger>
                          <SelectContent>
                            {authors
                              .filter((a) => !field.value?.includes(a.id))
                              .map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.authorName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="gradeLevelIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khối lớp</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value?.map((id) => (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {gradeLabelById.get(id) ?? id}
                          <button
                            type="button"
                            onClick={() => field.onChange(field.value?.filter((i) => i !== id))}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <FormControl>
                      {gradeLevels.filter((g) => !field.value?.includes(g.id)).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Đã chọn hết khối lớp hoặc chưa có dữ liệu.
                        </p>
                      ) : (
                        <Select
                          disabled={catalogLoading}
                          key={(field.value ?? []).join('|')}
                          onValueChange={(v) => {
                            if (!field.value?.includes(v)) {
                              field.onChange([...(field.value || []), v])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn khối lớp..." />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeLevels
                              .filter((g) => !field.value?.includes(g.id))
                              .map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                  {g.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh bìa sách</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com/book-cover.jpg"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('books.description')}</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder={t('books.descriptionPlaceholder')}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || (showUploadFile && !watchUploadId)} className="cursor-pointer">
                {isSubmitting ? t('common.loading') : t('common.save')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}