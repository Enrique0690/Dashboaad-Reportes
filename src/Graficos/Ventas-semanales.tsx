import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, } from "@/components/ui/chart"
import { DatePickerWithRange } from "@/components/ui/DatePicker"
import ventasData from '../../data/ventas_por_pago.json'

interface ProcessedData {
  dia: string
  nombreCompleto: string
  semanaActual: number
  semanaPasada: number
}

const DIAS_SEMANA = [
  { inicial: "D", nombre: "Domingo" },
  { inicial: "L", nombre: "Lunes" },
  { inicial: "M", nombre: "Martes" },
  { inicial: "X", nombre: "Miércoles" },
  { inicial: "J", nombre: "Jueves" },
  { inicial: "V", nombre: "Viernes" },
  { inicial: "S", nombre: "Sábado" },
]

const getStartOfWeek = (date: Date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const getEndOfWeek = (date: Date) => {
  const d = new Date(date)
  d.setDate(d.getDate() + (6 - d.getDay()))
  d.setHours(23, 59, 59, 999)
  return d
}

const initDayStructure = () =>
  DIAS_SEMANA.map(dia => ({
    dia: dia.inicial,
    nombreCompleto: dia.nombre,
    semanaActual: 0,
    semanaPasada: 0
  }))

const processData = (startDate?: Date, endDate?: Date): ProcessedData[] => {
  const dias = initDayStructure()

  if (!startDate || !endDate) return dias

  const inicioSemanaActual = startDate
  const finSemanaActual = endDate
  const inicioSemanaPasada = new Date(inicioSemanaActual)
  inicioSemanaPasada.setDate(inicioSemanaActual.getDate() - 7)

  ventasData.forEach(venta => {
    const fechaVenta = new Date(venta.fechaEmision)
    const diaSemana = fechaVenta.getDay()

    if (fechaVenta >= inicioSemanaActual && fechaVenta <= finSemanaActual) {
      dias[diaSemana].semanaActual += venta.total
    }
    else if (fechaVenta >= inicioSemanaPasada && fechaVenta < inicioSemanaActual) {
      dias[diaSemana].semanaPasada += venta.total
    }
  })

  return dias
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0].payload as ProcessedData
    return (
      <div className="bg-background p-4 rounded-lg shadow-lg border">
        <p className="font-semibold">{data.nombreCompleto}</p>
        <p className="text-[#2563eb]">
          Semana Actual: {' '}
          {data.semanaActual.toLocaleString('es-EC', {
            style: 'currency',
            currency: 'USD'
          })}
        </p>
        <p className="text-[#60a5fa]">
          Semana Anterior: {' '}
          {data.semanaPasada.toLocaleString('es-EC', {
            style: 'currency',
            currency: 'USD'
          })}
        </p>
      </div>
    )
  }
  return null
}

export function WeeklySalesComparison() {
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: getStartOfWeek(new Date()),
    to: getEndOfWeek(new Date())
  })

  const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range.to) {
      setDateRange({
        from: getStartOfWeek(range.from),
        to: getEndOfWeek(range.from)
      })
    }
  }

  // Calcular semana anterior
  const previousWeekStart = new Date(dateRange.from)
  previousWeekStart.setDate(dateRange.from.getDate() - 7)
  const previousWeekEnd = new Date(dateRange.to)
  previousWeekEnd.setDate(dateRange.to.getDate() - 7)

  // Formateador de fechas
  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
  }

  const chartConfig = {
    semanaActual: {
      label: `Semana Actual`,
      color: "#2563eb",
    },
    semanaPasada: {
      label: `Semana Anterior`,
      color: "#60a5fa",
    },
  } satisfies ChartConfig

  const data = processData(dateRange.from, dateRange.to)
  const totalSemanaActual = data.reduce((sum, day) => sum + day.semanaActual, 0)
  const totalSemanaPasada = data.reduce((sum, day) => sum + day.semanaPasada, 0)
  const diferencia = totalSemanaActual - totalSemanaPasada
  const porcentaje = totalSemanaPasada > 0
    ? ((diferencia / totalSemanaPasada) * 100).toFixed(1)
    : '100'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Comparación de Ventas Semanales</CardTitle>
            <CardDescription>
              {formatDateRange(dateRange.from, dateRange.to)}
            </CardDescription>
          </div>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={handleDateChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dia"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip />}
            />
            <Line
              dataKey="semanaActual"
              type="linear"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="semanaPasada"
              type="linear"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className={`flex gap-2 font-medium leading-none ${diferencia >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
          {diferencia >= 0 ? 'Aumento' : 'Disminución'} de {Math.abs(Number(porcentaje))}%
          {diferencia >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Comparando con {formatDateRange(previousWeekStart, previousWeekEnd)}
        </div>
      </CardFooter>
    </Card>
  )
}