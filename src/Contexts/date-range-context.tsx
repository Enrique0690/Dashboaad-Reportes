import {createContext, useState, useContext} from "react"
import { DateRange } from "react-day-picker"

type DateRangeContextType = {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

const DateRangeContext = createContext<DateRangeContextType>({
  dateRange: undefined,
  setDateRange: () => {},
})

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  
  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  )
}

export const useDateRange = () => useContext(DateRangeContext)