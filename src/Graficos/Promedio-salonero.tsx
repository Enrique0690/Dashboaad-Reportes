import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from "@/components/ui/chart"
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

const chartConfig = {
  semanaActual: {
    label: "Semana Actual",
    color: "#2563eb",
  },
  semanaPasada: {
    label: "Semana Pasada",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const processData = (startDate?: Date, endDate?: Date) => {
  const hoy = new Date()
  const inicioSemanaActual = startDate || getStartOfWeek(hoy)
  const finSemanaActual = endDate || getEndOfWeek(hoy)
  const inicioSemanaPasada = new Date(inicioSemanaActual)
  inicioSemanaPasada.setDate(inicioSemanaActual.getDate() - 7)

  const initDayStructure = () =>
    DIAS_SEMANA.map((dia) => ({
      dia: dia.inicial,
      nombreCompleto: dia.nombre,
      semanaActual: { total: 0, count: 0 },
      semanaPasada: { total: 0, count: 0 }
    }))

  const dias = initDayStructure()

  let totalSemanaActual = 0
  let countSemanaActual = 0
  let totalSemanaPasada = 0
  let countSemanaPasada = 0

  ventasData.forEach(venta => {
    const fechaVenta = new Date(venta.fechaEmision)
    const diaSemana = fechaVenta.getDay()

    if (fechaVenta >= inicioSemanaActual && fechaVenta <= finSemanaActual) {
      dias[diaSemana].semanaActual.total += venta.total
      dias[diaSemana].semanaActual.count++
      totalSemanaActual += venta.total
      countSemanaActual++
    }
    else if (fechaVenta >= inicioSemanaPasada && fechaVenta < inicioSemanaActual) {
      dias[diaSemana].semanaPasada.total += venta.total
      dias[diaSemana].semanaPasada.count++
      totalSemanaPasada += venta.total
      countSemanaPasada++
    }
  })

  const promedioSemanaActual = countSemanaActual > 0 ? totalSemanaActual / countSemanaActual : 0
  const promedioSemanaPasada = countSemanaPasada > 0 ? totalSemanaPasada / countSemanaPasada : 0

  return {
    dailyData: dias.map(dia => ({
      dia: dia.dia,
      nombreCompleto: dia.nombreCompleto,
      semanaActual: dia.semanaActual.count > 0
        ? dia.semanaActual.total / dia.semanaActual.count
        : 0,
      semanaPasada: dia.semanaPasada.count > 0
        ? dia.semanaPasada.total / dia.semanaPasada.count
        : 0,
    })),
    promedios: {
      semanaActual: promedioSemanaActual,
      semanaPasada: promedioSemanaPasada
    }
  }
}

const formatDateRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as ProcessedData
    return (
      <div className="bg-background p-4 rounded-lg shadow-lg border max-w-[180px]">
        <p className="font-semibold text-sm">{data.nombreCompleto}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#2563eb]">●</span>
            <span className="text-xs ml-2">Actual:</span>
            <span className="text-xs font-semibold ml-2">
              {data.semanaActual.toLocaleString('es-EC', {
                style: 'currency',
                currency: 'USD'
              })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#60a5fa]">●</span>
            <span className="text-xs ml-2">Anterior:</span>
            <span className="text-xs font-semibold ml-2">
              {data.semanaPasada.toLocaleString('es-EC', {
                style: 'currency',
                currency: 'USD'
              })}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function AverageTicketChart() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
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

  const { dailyData, promedios } = processData(dateRange.from, dateRange.to)
  const diferencia = promedios.semanaActual - promedios.semanaPasada
  const porcentaje = promedios.semanaPasada > 0
    ? ((diferencia / promedios.semanaPasada) * 100).toFixed(1)
    : '100'

  // Calcular semana anterior
  const previousWeekStart = new Date(dateRange.from)
  previousWeekStart.setDate(dateRange.from.getDate() - 7)
  const previousWeekEnd = new Date(dateRange.to)
  previousWeekEnd.setDate(dateRange.to.getDate() - 7)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Ticket Promedio Diario</CardTitle>
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

      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={dailyData}
            margin={{ left: 12, right: 12, top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dia"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="semanaActual"
              fill="var(--color-semanaActual)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="semanaPasada"
              fill="var(--color-semanaPasada)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
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