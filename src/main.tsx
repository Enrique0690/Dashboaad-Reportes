import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DateRangeProvider } from './Contexts/date-range-context.tsx'
import { ReportProvider } from './Contexts/report-context.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DateRangeProvider>
        <ReportProvider>
          <App />
        </ReportProvider>
      </DateRangeProvider>
    </BrowserRouter>
  </StrictMode>,
)