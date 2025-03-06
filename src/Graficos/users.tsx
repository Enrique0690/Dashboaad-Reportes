"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DatePickerWithRange } from "@/components/ui/DatePicker"
import ventasData from '../../data/ventas_por_pago.json'

interface ProcessedData {
  dia: string
  nombreCompleto: string
  periodoActual: number
  periodoAnterior: number
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

const chartConfig = {
  periodoActual: {
    label: "Semana Actual",
    color: "#2563eb",
  },
  periodoAnterior: {
    label: "Semana Anterior",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const getUniqueUsers = () => {
  const users = new Set(ventasData.map(venta => venta.Usuario))
  return Array.from(users).filter(Boolean) as string[]
}

const processData = (
  usuario: string,
  startDate: Date,
  endDate: Date
) => {
  const inicioPeriodoActual = startDate
  const finPeriodoActual = endDate
  const diffDays = Math.ceil((finPeriodoActual.getTime() - inicioPeriodoActual.getTime()) / (1000 * 60 * 60 * 24))
  const inicioPeriodoAnterior = new Date(inicioPeriodoActual)
  inicioPeriodoAnterior.setDate(inicioPeriodoActual.getDate() - diffDays - 1)
  const finPeriodoAnterior = new Date(inicioPeriodoAnterior)
  finPeriodoAnterior.setDate(inicioPeriodoAnterior.getDate() + diffDays)

  const initDayStructure = () => 
    DIAS_SEMANA.map(dia => ({
      dia: dia.inicial,
      nombreCompleto: dia.nombre,
      periodoActual: 0,
      periodoAnterior: 0,
      countActual: 0,
      countAnterior: 0
    }))

  const dias = initDayStructure()

  const filterByDateRange = (venta: any, start: Date, end: Date) => {
    const fecha = new Date(venta.fechaEmision)
    return fecha >= start && fecha <= end
  }

  ventasData
    .filter(venta => venta.Usuario === usuario)
    .forEach(venta => {
      const fechaVenta = new Date(venta.fechaEmision)
      const diaSemana = fechaVenta.getDay()
      
      if (filterByDateRange(venta, inicioPeriodoActual, finPeriodoActual)) {
        dias[diaSemana].periodoActual += venta.total
        dias[diaSemana].countActual++
      } 
      
      if (filterByDateRange(venta, inicioPeriodoAnterior, finPeriodoAnterior)) {
        dias[diaSemana].periodoAnterior += venta.total
        dias[diaSemana].countAnterior++
      }
    })

  return {
    data: dias.map(dia => ({
      dia: dia.dia,
      nombreCompleto: dia.nombreCompleto,
      periodoActual: dia.countActual > 0 ? dia.periodoActual / dia.countActual : 0,
      periodoAnterior: dia.countAnterior > 0 ? dia.periodoAnterior / dia.countAnterior : 0
    })),
    periodos: {
      actual: { inicio: inicioPeriodoActual, fin: finPeriodoActual },
      anterior: { inicio: inicioPeriodoAnterior, fin: finPeriodoAnterior }
    }
  }
}

const formatDateRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
}

export function UserSalesComparisonChart() {
  const [activeUser, setActiveUser] = useState<string>("CAJERO 1")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date()
  })

  const users = useMemo(getUniqueUsers, [])

  // Calcular totales para todos los usuarios
  const allTotals = useMemo(() => {
    const totals: Record<string, { actual: number; anterior: number }> = {}
    users.forEach(user => {
      const { data } = processData(user, dateRange.from, dateRange.to)
      totals[user] = {
        actual: data.reduce((sum, day) => sum + day.periodoActual, 0),
        anterior: data.reduce((sum, day) => sum + day.periodoAnterior, 0)
      }
    })
    return totals
  }, [users, dateRange])

  // Datos para el usuario activo
  const { data, periodos } = useMemo(
    () => processData(activeUser, dateRange.from, dateRange.to),
    [activeUser, dateRange]
  )

  // Calcular diferencia para el footer
  const { actual, anterior } = allTotals[activeUser] || { actual: 0, anterior: 0 }
  const diferencia = actual - anterior
  const porcentaje = anterior > 0 
    ? ((diferencia / anterior) * 100).toFixed(1)
    : '100'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Comparación de Ventas</CardTitle>
              <CardDescription>
                {formatDateRange(dateRange.from, dateRange.to)}
              </CardDescription>
            </div>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={(range) => {
                if (range?.from && range.to) {
                  setDateRange({ from: range.from, to: range.to })
                }
              }}
            />
          </div>
          
          <div className="flex overflow-x-auto">
            {users.map((user, index) => (
              <button
                key={user}
                data-active={activeUser === user}
                className={`relative flex flex-col justify-center gap-1 px-6 py-4 text-left ${
                  index !== 0 ? 'border-l' : ''
                } data-[active=true]:bg-muted/50 min-w-[200px]`}
                onClick={() => setActiveUser(user)}
              >
                <span className="text-xs text-muted-foreground truncate">
                  {user}
                </span>
                <span className="text-lg font-bold leading-none sm:text-xl truncate">
                  {(allTotals[user]?.actual || 0).toLocaleString('es-EC', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
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
              minTickGap={24}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) => data.find(d => d.dia === value)?.nombreCompleto || ''}
                  items={[
                    { key: 'periodoActual', label: chartConfig.periodoActual.label },
                    { key: 'periodoAnterior', label: chartConfig.periodoAnterior.label }
                  ]}
                  currencyOptions={{
                    style: 'currency',
                    currency: 'USD',
                    locale: 'es-EC'
                  }}
                />
              }
            />
            <Bar
              dataKey="periodoActual"
              fill="var(--color-periodoActual)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Bar
              dataKey="periodoAnterior"
              fill="var(--color-periodoAnterior)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className={`flex gap-2 font-medium leading-none ${
          diferencia >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {diferencia >= 0 ? 'Aumento' : 'Disminución'} de {Math.abs(Number(porcentaje))}%
          {diferencia >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Comparando con {formatDateRange(periodos.anterior.inicio, periodos.anterior.fin)}
        </div>
      </CardFooter>
    </Card>
  )
}