import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from '@/utils/DataStatusHandler';

const COLORES = {
  actual: '#22c55e',
  anterior: '#c7db9c',
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
  });
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-green-800">{data.usuario}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#22c55e]">●</span>
            <span className="text-xs ml-2">Actual:</span>
            <span className="text-xs font-semibold ml-2">
              {formatCurrency(data.ticketPromedioActual)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#c7db9c]">●</span>
            <span className="text-xs ml-2">Anterior:</span>
            <span className="text-xs font-semibold ml-2">
              {formatCurrency(data.ticketPromedioAnterior)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
const processData = (ventas: any[], ventasanterior: any[]) => {
  const usuarios: Record<string, { totalVentasActual: number; totalPaxActual: number; totalVentasAnterior: number; totalPaxAnterior: number }> = {};

  ventas.forEach((venta) => {
    const usuario = venta.usuario || 'Sin especificar';
    const total = typeof venta.total === 'number' ? venta.total : 0;
    const pax = venta.pax > 0 ? venta.pax : 1; 

    if (!usuarios[usuario]) {
      usuarios[usuario] = { totalVentasActual: 0, totalPaxActual: 0, totalVentasAnterior: 0, totalPaxAnterior: 0 };
    }

    usuarios[usuario].totalVentasActual += total;
    usuarios[usuario].totalPaxActual += pax;
  });

  ventasanterior.forEach((venta) => {
    const usuario = venta.usuario || 'Sin especificar';
    const total = typeof venta.total === 'number' ? venta.total : 0;
    const pax = venta.pax > 0 ? venta.pax : 1; 

    if (!usuarios[usuario]) {
      usuarios[usuario] = { totalVentasActual: 0, totalPaxActual: 0, totalVentasAnterior: 0, totalPaxAnterior: 0 };
    }

    usuarios[usuario].totalVentasAnterior += total;
    usuarios[usuario].totalPaxAnterior += pax;
  });

  return Object.entries(usuarios)
    .map(([usuario, { totalVentasActual, totalPaxActual, totalVentasAnterior, totalPaxAnterior }]) => ({
      usuario,
      ticketPromedioActual: totalPaxActual > 0 ? totalVentasActual / totalPaxActual : 0,
      ticketPromedioAnterior: totalPaxAnterior > 0 ? totalVentasAnterior / totalPaxAnterior : 0,
    }))
    .sort((a, b) => b.ticketPromedioActual - a.ticketPromedioActual);
};

const chartConfig = {
  actual: {
    label: 'Período Actual',
    color: COLORES.actual,
  },
  anterior: {
    label: 'Período Anterior',
    color: COLORES.anterior,
  },
} satisfies ChartConfig;

export function TicketPromedioChart() {
  const { ventas, ventasanterior } = useReports();
  const data = processData(ventas.data, ventasanterior.data);
  const error = ventas.error || ventasanterior.error;
  const isLoading = ventas.loading || ventasanterior.loading;
  const maxVisibleUsers = 4; 
  const userWidth = 65; 
  const minContainerWidth = Math.max(data.length * userWidth, maxVisibleUsers * userWidth)
  return (
    <Card className="h-[500px] flex flex-col">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader>
          <CardTitle>Ticket Promedio por Usuario</CardTitle>
          <CardDescription>Comparación del período actual vs. anterior</CardDescription>
        </CardHeader>
        <CardContent className="h-full flex flex-col justify-between overflow-x-auto -mb-3"> 
          <ChartContainer 
            config={chartConfig} 
            className="h-full flex-1"
            style={{
              minWidth: `${minContainerWidth}px`,
              overflowX: data.length > maxVisibleUsers ? 'auto' : 'visible',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: data.length > 4 ? 20 : 10 }} 
                barCategoryGap="20%"  
                barGap={1}            
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="usuario"
                  tickLine={false}
                  tickMargin={5}  
                  axisLine={false}
                  interval={0}
                  angle={-40}  
                  textAnchor="end"
                  fontSize={10} 
                  height={80} 
                />
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Bar
                  dataKey="ticketPromedioActual"
                  fill={COLORES.actual}
                  radius={4}
                  barSize={25}  
                />
                <Bar
                  dataKey="ticketPromedioAnterior"
                  fill={COLORES.anterior}
                  radius={4}
                  barSize={25}  
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}