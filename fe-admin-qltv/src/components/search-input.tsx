import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  debounce?: number
  className?: string
}

export function SearchInput({
  value: externalValue,
  onChange,
  onSubmit,
  placeholder = 'Tìm kiếm...',
  debounce = 300,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue || '')

  
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue)
    }
  }, [externalValue])

  
  useEffect(() => {
    if (!onSubmit || debounce === 0) return

    const timer = setTimeout(() => {
      if (internalValue !== externalValue) {
        onSubmit(internalValue)
      }
    }, debounce)

    return () => clearTimeout(timer)
  }, [internalValue, debounce, onSubmit, externalValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleSubmit = () => {
    onSubmit?.(internalValue)
  }

  if (onSubmit && debounce === 0) {
    
    return (
      <div className="flex items-center gap-2">
        <Input
          value={internalValue}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className={className}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSubmit}
          className="h-10 cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  
  return (
    <Input
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  )
}