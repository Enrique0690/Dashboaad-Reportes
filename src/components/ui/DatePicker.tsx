import { useState } from "react"
import { startOfQuarter, endOfQuarter, subQuarters, startOfYear, endOfYear, subYears, subDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDateRange } from "@/Contexts/date-range-context"

export function DatePickerWithRange({ className }: { className?: string }) {
  const { dateRange, setDateRange } = useDateRange()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(dateRange)

  const getPresetRange = (presetKey: string): DateRange => {
    const today = new Date()
    switch (presetKey) {
      case 'currentQuarterToDate':
        return { from: startOfQuarter(today), to: today }
      case 'lastQuarter':
        const lastQuarterStart = startOfQuarter(subQuarters(today, 1))
        return { from: lastQuarterStart, to: endOfQuarter(lastQuarterStart) }
      case 'thisYear':
        return { from: startOfYear(today), to: endOfYear(today) }
      case 'thisYearToDate':
        return { from: startOfYear(today), to: today }
      case 'lastYear':
        const lastYearStart = startOfYear(subYears(today, 1))
        return { from: lastYearStart, to: endOfYear(lastYearStart) }
      case 'auto':
        return { from: subDays(today, 6), to: today }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const handleApply = () => {
    if (selectedRange?.from && selectedRange?.to) {
      setDateRange(selectedRange)
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setSelectedRange(dateRange)
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            size="icon"
            className={cn(
              "h-10 w-10",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" forceMount>
          <div className="flex">
            <div className="flex flex-col p-2 gap-1 border-r">
              {['currentQuarterToDate', 'lastQuarter', 'thisYear', 'thisYearToDate', 'lastYear', 'auto'].map((preset) => (
                <Button
                  key={preset}
                  variant="ghost"
                  size="sm"
                  className="text-left justify-start"
                  onClick={() => setSelectedRange(getPresetRange(preset))}
                >
                  {{
                    'currentQuarterToDate': 'Este trimestre hasta la fecha',
                    'lastQuarter': 'Último trimestre',
                    'thisYear': 'Este año',
                    'thisYearToDate': 'Este año hasta la fecha',
                    'lastYear': 'Año pasado',
                    'auto': 'Periodo automático'
                  }[preset]}
                </Button>
              ))}
            </div>

            <div className="p-3">
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
                defaultMonth={selectedRange?.from || new Date()}
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