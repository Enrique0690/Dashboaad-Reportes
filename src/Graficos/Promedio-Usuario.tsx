import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from '@/utils/DataStatusHandler';

const COLORES = {
  actual: '#22c55e',
  anterior: '#16a34a',
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
  });
};

const processData = (ventas: any[], ventasanterior: any[]) => {
  const usuarios: Record<string, { totalVentasActual: number; transaccionesActual: number; totalVentasAnterior: number; transaccionesAnterior: number }> = {};

  ventas.forEach((venta) => {
    const usuario = venta.usuario || 'Sin especificar';
    if (!usuarios[usuario]) {
      usuarios[usuario] = { totalVentasActual: 0, transaccionesActual: 0, totalVentasAnterior: 0, transaccionesAnterior: 0 };
    }
    usuarios[usuario].totalVentasActual += venta.total;
    usuarios[usuario].transaccionesActual += 1;
  });

  ventasanterior.forEach((venta) => {
    const usuario = venta.usuario || 'Sin especificar';
    if (!usuarios[usuario]) {
      usuarios[usuario] = { totalVentasActual: 0, transaccionesActual: 0, totalVentasAnterior: 0, transaccionesAnterior: 0 };
    }
    usuarios[usuario].totalVentasAnterior += venta.total;
    usuarios[usuario].transaccionesAnterior += 1;
  });

  return Object.entries(usuarios)
    .map(([usuario, { totalVentasActual, transaccionesActual, totalVentasAnterior, transaccionesAnterior }]) => ({
      usuario,
      ticketPromedioActual: totalVentasActual / transaccionesActual,
      ticketPromedioAnterior: totalVentasAnterior / transaccionesAnterior,
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
  const totalTicketPromedioActual = data.reduce((sum, user) => sum + user.ticketPromedioActual, 0);
  const totalTicketPromedioAnterior = data.reduce((sum, user) => sum + user.ticketPromedioAnterior, 0);

  return (
    <Card className="h-[450px] flex flex-col">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader>
          <CardTitle>Ticket Promedio por Usuario</CardTitle>
          <CardDescription>Comparación del período actual vs. anterior</CardDescription>
        </CardHeader>
        <CardContent className="h-full flex flex-col justify-between">
          <ChartContainer config={chartConfig} className="h-full flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                accessibilityLayer
                data={data}
                margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="usuario" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="ticketPromedioActual" fill={COLORES.actual} radius={4} name="Período Actual" />
                <Bar dataKey="ticketPromedioAnterior" fill={COLORES.anterior} radius={4} name="Período Anterior" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Período actual: {formatCurrency(totalTicketPromedioActual)}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 font-medium leading-none">
            Período anterior: {formatCurrency(totalTicketPromedioAnterior)}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Comparación del ticket promedio por usuario entre períodos
          </div>
        </CardFooter>
      </DataStatusHandler>
    </Card>
  );
}