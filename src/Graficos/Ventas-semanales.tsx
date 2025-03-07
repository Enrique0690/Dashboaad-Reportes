import { useDateRange } from '@/Contexts/date-range-context'; 
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useReports } from '@/Contexts/report-context';

interface ProcessedData {
  dia: string;
  nombreCompleto: string;
  periodoActual: number;
  periodoAnterior: number;
}

const DIAS_SEMANA = [
  { inicial: 'D', nombre: 'Domingo' },
  { inicial: 'L', nombre: 'Lunes' },
  { inicial: 'M', nombre: 'Martes' },
  { inicial: 'X', nombre: 'Miércoles' },
  { inicial: 'J', nombre: 'Jueves' },
  { inicial: 'V', nombre: 'Viernes' },
  { inicial: 'S', nombre: 'Sábado' },
];

const splitDateRange = (startDate: Date, endDate: Date) => {
  const midDate = new Date(startDate);
  const timeDiff = endDate.getTime() - startDate.getTime();
  midDate.setTime(startDate.getTime() + timeDiff / 2);

  return {
    periodoActualStart: midDate,
    periodoActualEnd: endDate,
    periodoAnteriorStart: startDate,
    periodoAnteriorEnd: midDate,
  };
};

const initDayStructure = () =>
  DIAS_SEMANA.map((dia) => ({
    dia: dia.inicial,
    nombreCompleto: dia.nombre,
    periodoActual: 0,
    periodoAnterior: 0,
  }));

const processData = (ventas: any[], startDate: Date, endDate: Date): ProcessedData[] => {
  const dias = initDayStructure();

  const { periodoActualStart, periodoActualEnd, periodoAnteriorStart, periodoAnteriorEnd } = splitDateRange(startDate, endDate);

  ventas.forEach((venta) => {
    const fechaVenta = new Date(venta.fechaCreacion);
    const diaSemana = fechaVenta.getDay();

    if (fechaVenta >= periodoActualStart && fechaVenta <= periodoActualEnd) {
      dias[diaSemana].periodoActual += venta.total;
    } else if (fechaVenta >= periodoAnteriorStart && fechaVenta < periodoAnteriorEnd) {
      dias[diaSemana].periodoAnterior += venta.total;
    }
  });

  return dias;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0].payload as ProcessedData;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-gray-800">{data.nombreCompleto}</p>
        <p className="text-blue-600">
          Período Actual:{' '}
          {data.periodoActual.toLocaleString('es-EC', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
        <p className="text-blue-400">
          Período Anterior:{' '}
          {data.periodoAnterior.toLocaleString('es-EC', {
            style: 'currency',
            currency: 'USD',
          })}
        </p>
      </div>
    );
  }
  return null;
};

export function WeeklySalesComparison() {
  const { dateRange } = useDateRange();
  const { ventas } = useReports();

  const startDate = dateRange?.from || new Date();
  const endDate = dateRange?.to || new Date();

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
  };

  const chartConfig = {
    periodoActual: {
      label: `Período Actual`,
      color: '#2563eb',
    },
    periodoAnterior: {
      label: `Período Anterior`,
      color: '#60a5fa',
    },
  } satisfies ChartConfig;

  const data = processData(ventas, startDate, endDate);
  const totalPeriodoActual = data.reduce((sum, day) => sum + day.periodoActual, 0);
  const totalPeriodoAnterior = data.reduce((sum, day) => sum + day.periodoAnterior, 0);
  const diferencia = totalPeriodoActual - totalPeriodoAnterior;
  const porcentaje = totalPeriodoAnterior > 0 ? ((diferencia / totalPeriodoAnterior) * 100).toFixed(1) : '100';

  return (
    <Card className="w-full h-full shadow-sm border border-gray-200">
      <CardHeader>
        <div>
          <CardTitle className="text-lg font-semibold">Comparación de Ventas</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {formatDateRange(startDate, endDate)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 w-full h-full p-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={data}
            width={0} 
            height={0} 
            className="w-full h-full"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Line
              dataKey="periodoActual"
              type="linear"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="periodoAnterior"
              type="linear"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-gray-500">
        {/* Leyenda con totales y colores representativos */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="block w-3 h-3 bg-[#2563eb] rounded-full"></span>
            <span className="font-medium text-gray-800">
              Período Actual: {totalPeriodoActual.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="block w-3 h-3 bg-[#60a5fa] rounded-full"></span>
            <span className="font-medium text-gray-800">
              Período Anterior: {totalPeriodoAnterior.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
        </div>
        <div className="text-xs">Comparacion de Periodos.</div>
      </CardFooter>
    </Card>
  );
}
