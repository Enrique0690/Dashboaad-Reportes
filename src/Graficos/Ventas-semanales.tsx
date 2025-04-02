import { useDateRange } from '@/Contexts/date-range-context';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from '@/utils/DataStatusHandler';

interface ProcessedData {
  fecha: string;
  nombreCompleto: string;
  periodoActual: number;
}

const COLORES = {
  actual: '#22c55e',
};

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};

const formatDateShort = (dateString: string) => {
  const [day, month, year] = dateString.split('-');
  return `${day}/${month}/${year.slice(-2)}`; 
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString('es-EC');
};

const processData = (ventas: any[], startDate: Date, endDate: Date): ProcessedData[] => {
  const dateMap = new Map<string, number>();
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateKey = formatDate(currentDate);
    dateMap.set(dateKey, 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  ventas.forEach((venta) => {
    const saleDate = new Date(venta.fechaCreacion);
    const dateKey = formatDate(saleDate);
    if (dateMap.has(dateKey)) {
      dateMap.set(dateKey, dateMap.get(dateKey)! + venta.total);
    }
  });

  return Array.from(dateMap.entries()).map(([fecha, periodoActual]) => ({
    fecha,
    nombreCompleto: new Date(fecha.split('-').reverse().join('-')).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    periodoActual
  }));
};

const getDateInterval = (startDate: Date, endDate: Date): number => {
  const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  if (diffInDays <= 30) return 1; 
  if (diffInDays <= 90) return 5; 
  return 15; 
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0].payload as ProcessedData;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-green-800">{data.nombreCompleto}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="block w-4 h-0.5 bg-green-500"></span>
          <p className="text-sm text-gray-700">
            Ventas: <span className="font-medium">{formatNumber(data.periodoActual)}</span>
          </p>
        </div>
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
    return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const chartConfig = {
    periodoActual: {
      label: `Período Actual`,
      color: COLORES.actual,
    },
  } satisfies ChartConfig;
  const dateInterval = getDateInterval(startDate, endDate);
  const data = processData(ventas.data, startDate, endDate);

  return (
    <Card className="w-full h-[500px] shadow-sm border border-gray-200 overflow-hidden">
      <DataStatusHandler isLoading={ventas.loading} error={ventas.error}>
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Ventas por Fecha</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {formatDateRange(startDate, endDate)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="w-full h-[calc(450px-80px)] p-3 overflow-x-auto">
          <ChartContainer config={chartConfig} className="w-full h-full min-w-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 15, left: -20, bottom: 60 }} 
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={formatDateShort}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  tickMargin={35} // Aumentamos espacio para ticks
                  interval={dateInterval}
                  style={{
                    fontSize: '0.75rem', 
                    whiteSpace: 'nowrap'
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                  width={75}
                />
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Line
                  dataKey="periodoActual"
                  type="linear"
                  stroke={COLORES.actual}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}