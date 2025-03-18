import { useState, useEffect } from 'react'
import { 
  startOfQuarter, endOfQuarter, subQuarters, 
  startOfYear, endOfYear, subYears, subDays, 
  setHours, setMinutes, setSeconds, setMilliseconds 
} from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDateRange } from '@/Contexts/date-range-context'

const setStartOfDay = (date: Date) => setHours(setMinutes(setSeconds(setMilliseconds(date, 0), 0), 0), 0)
const setEndOfDay = (date: Date) => setHours(setMinutes(setSeconds(setMilliseconds(date, 999), 59), 59), 23)

export function DatePickerWithRange({ className }: { className?: string }) {
  const { dateRange, setDateRange } = useDateRange()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(dateRange)

  useEffect(() => {
    const today = new Date()
    const defaultRange: DateRange = { from: setStartOfDay(subDays(today, 28)), to: setEndOfDay(today) }
    setSelectedRange(defaultRange)
    setDateRange(defaultRange)
  }, [setDateRange])

  const getPresetRange = (presetKey: string): DateRange => {
    const today = new Date()
    switch (presetKey) {
      case 'currentQuarterToDate':
        return { from: setStartOfDay(startOfQuarter(today)), to: setEndOfDay(today) }
      case 'lastQuarter':
        const lastQuarterStart = startOfQuarter(subQuarters(today, 1))
        return { from: setStartOfDay(lastQuarterStart), to: setEndOfDay(endOfQuarter(lastQuarterStart)) }
      case 'thisYear':
        return { from: setStartOfDay(startOfYear(today)), to: setEndOfDay(endOfYear(today)) }
      case 'thisYearToDate':
        return { from: setStartOfDay(startOfYear(today)), to: setEndOfDay(today) }
      case 'lastYear':
        const lastYearStart = startOfYear(subYears(today, 1))
        return { from: setStartOfDay(lastYearStart), to: setEndOfDay(endOfYear(lastYearStart)) }
      case 'auto':
        return { from: setStartOfDay(subDays(today, 6)), to: setEndOfDay(today) }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const handleApply = () => {
    if (selectedRange?.from && selectedRange?.to) {
      setDateRange({
        from: setStartOfDay(selectedRange.from),
        to: setEndOfDay(selectedRange.to),
      })
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setSelectedRange(dateRange)
    setIsOpen(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            size="lg"
            className={cn(
              'h-12 w-full flex items-center justify-between',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <span className="hidden sm:block text-lg font-semibold truncate">
              {selectedRange?.from && selectedRange?.to
                ? `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`
                : 'Seleccione una fecha'}
            </span>
            <CalendarIcon className="h-5 w-5 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full sm:w-auto p-0 overflow-hidden"
          align="start"
          forceMount
        >
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col p-2 gap-1 border-r">
              {['currentQuarterToDate', 'lastQuarter', 'thisYear', 'thisYearToDate', 'lastYear', 'auto'].map((preset) => (
                <Button
                  key={preset}
                  variant="ghost"
                  size="sm"
                  className="text-left justify-start"
                  onClick={() => setSelectedRange(getPresetRange(preset))}
                >
                  {preset === 'currentQuarterToDate' && 'Este trimestre hasta la fecha'}
                  {preset === 'lastQuarter' && 'Último trimestre'}
                  {preset === 'thisYear' && 'Este año'}
                  {preset === 'thisYearToDate' && 'Este año hasta la fecha'}
                  {preset === 'lastYear' && 'Año pasado'}
                  {preset === 'auto' && 'Periodo automático'}
                </Button>
              ))}
            </div>
            <div className="p-3 overflow-auto">
            <Calendar
  mode="range"
  selected={selectedRange}
  onSelect={setSelectedRange}
  numberOfMonths={2}
  disabled={{ after: new Date() }}
  defaultMonth={selectedRange?.from || new Date()}
  className="border rounded-lg"
  showOutsideDays={true} // Mantén esto en true para conservar la alineación
  modifiersStyles={{
    outside: { visibility: 'hidden' }, // Oculta visualmente los días fuera del mes
  }}
  classNames={{
    day_range_start: 'bg-green-500 text-white rounded-l-full', 
    day_range_end: 'bg-green-500 text-white rounded-r-full',
    day_selected: 'bg-green-200 hover:bg-green-300', 
  }}
/>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-2 border-t">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cerrar
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!selectedRange?.from || !selectedRange?.to}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}