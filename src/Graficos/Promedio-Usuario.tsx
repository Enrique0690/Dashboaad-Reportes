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
  const usuarios: Record<string, { totalVentasActual: number; transaccionesActual: number; totalVentasAnterior: number; transaccionesAnterior: number }> = {};

  ventas.forEach((venta) => {
    const usuario = venta.usuario || 'Sin especificar';
    const total = typeof venta.total === 'number' ? venta.total : 0;
    if (!usuarios[usuario]) {
      usuarios[usuario] = { totalVentasActual: 0, transaccionesActual: 0, totalVentasAnterior: 0, transaccionesAnterior: 0 };
    }
    usuarios[usuario].totalVentasActual += total;
    usuarios[usuario].transaccionesActual += 1;
  });

  ventasanterior.forEach((venta) => {
    const usuario = venta.usuario || 'Sin especificar';
    const total = typeof venta.total === 'number' ? venta.total : 0;
    if (!usuarios[usuario]) {
      usuarios[usuario] = { totalVentasActual: 0, transaccionesActual: 0, totalVentasAnterior: 0, transaccionesAnterior: 0 };
    }
    usuarios[usuario].totalVentasAnterior += total;
    usuarios[usuario].transaccionesAnterior += 1;
  });

  return Object.entries(usuarios)
    .map(([usuario, { totalVentasActual, transaccionesActual, totalVentasAnterior, transaccionesAnterior }]) => ({
      usuario,
      ticketPromedioActual: transaccionesActual > 0 ? totalVentasActual / transaccionesActual : 0,
      ticketPromedioAnterior: transaccionesAnterior > 0 ? totalVentasAnterior / transaccionesAnterior : 0,
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
  const { ventas, ventasanterior, ventasLoading, ventasanteriorLoading, ventasError, ventasanteriorError } = useReports();
  const data = processData(ventas, ventasanterior);
  const error = ventasError || ventasanteriorError;
  const isLoading = ventasLoading || ventasanteriorLoading;
  const maxVisibleUsers = 3;
  const minContainerWidth = Math.max(data.length <= maxVisibleUsers ? data.length * 120 : maxVisibleUsers * 120, 400);

  return (
    <Card className="h-[500px] flex flex-col">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader>
          <CardTitle>Ticket Promedio por Usuario</CardTitle>
          <CardDescription>Comparación del período actual vs. anterior</CardDescription>
        </CardHeader>
        <CardContent className="h-full flex flex-col justify-between p-2 overflow-x-auto"> {/* Reducir el padding aquí */}
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
                barCategoryGap="8%" 
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="usuario"
                  tickLine={false}
                  tickMargin={5}  
                  axisLine={false}
                  interval={0}
                  angle={-20}  
                  textAnchor="end"
                  fontSize={10} 
                  height={data.length > 4 ? 60 : 50} 
                />
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Bar
                  dataKey="ticketPromedioActual"
                  fill={COLORES.actual}
                  radius={4}
                  barSize={30}  
                />
                <Bar
                  dataKey="ticketPromedioAnterior"
                  fill={COLORES.anterior}
                  radius={4}
                  barSize={30}  
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}