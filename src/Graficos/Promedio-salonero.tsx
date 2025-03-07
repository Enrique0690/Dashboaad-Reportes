import { useDateRange } from "@/Contexts/date-range-context";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from "@/components/ui/chart";
import { useReports } from '@/Contexts/report-context';

interface UserSalesData {
  usuario: string;
  totalVentasActual: number;
  totalVentasAnterior: number;
}

const COLORES = {
  actual: "#2563eb",
  anterior: "#60a5fa",
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
  });
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as UserSalesData;
    return (
      <div className="bg-background p-4 rounded-lg shadow-lg border max-w-[180px]">
        <p className="font-semibold text-sm">{data.usuario}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#2563eb]">●</span>
            <span className="text-xs ml-2">Actual:</span>
            <span className="text-xs font-semibold ml-2">
              {formatCurrency(data.totalVentasActual)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#60a5fa]">●</span>
            <span className="text-xs ml-2">Anterior:</span>
            <span className="text-xs font-semibold ml-2">
              {formatCurrency(data.totalVentasAnterior)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const chartConfig = {
  actual: {
    label: "Período Actual",
    color: COLORES.actual,
  },
  anterior: {
    label: "Período Anterior",
    color: COLORES.anterior,
  },
} satisfies ChartConfig;

export function UserSalesChart() {
  const { ventas, ventasanterior } = useReports();

  const processData = (ventas: any[], ventasanterior: any[]) => {
    const users: Record<string, { actual: number; anterior: number }> = {};

    // Procesar ventas del período actual
    ventas.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      if (!users[usuario]) {
        users[usuario] = { actual: 0, anterior: 0 };
      }
      users[usuario].actual += venta.total;
    });

    // Procesar ventas del período anterior
    ventasanterior.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      if (!users[usuario]) {
        users[usuario] = { actual: 0, anterior: 0 };
      }
      users[usuario].anterior += venta.total;
    });

    // Ordenar usuarios por ventas actuales (de mayor a menor)
    const sortedUsers = Object.entries(users)
      .sort(([, a], [, b]) => b.actual - a.actual)
      .map(([usuario, { actual, anterior }]) => ({
        usuario,
        totalVentasActual: actual,
        totalVentasAnterior: anterior,
      }));

    return {
      usersData: sortedUsers,
      totalGeneralActual: sortedUsers.reduce((sum, user) => sum + user.totalVentasActual, 0),
      totalGeneralAnterior: sortedUsers.reduce((sum, user) => sum + user.totalVentasAnterior, 0),
    };
  };

  const { usersData, totalGeneralActual, totalGeneralAnterior } = processData(ventas, ventasanterior);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div>
          <CardTitle>Ventas por Usuario</CardTitle>
          <CardDescription>
            Distribución de ventas por responsable (período actual vs. anterior)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="w-full overflow-x-auto">
          <ChartContainer config={chartConfig} className="h-[400px] sm:h-[300px] w-full">
            <BarChart
              data={usersData}
              margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="usuario"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tick={{ fontSize: 10 }}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalVentasActual"
                fill={COLORES.actual}
                radius={[4, 4, 0, 0]}
                barSize={20}  
                name="Período Actual"
              />
              <Bar
                dataKey="totalVentasAnterior"
                fill={COLORES.anterior}
                radius={[4, 4, 0, 0]}
                barSize={20}  
                name="Período Anterior"
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Periodo actual: {formatCurrency(totalGeneralActual)}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 font-medium leading-none">
          Periodo anterior: {formatCurrency(totalGeneralAnterior)}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {usersData.length} usuarios registrados
        </div>
      </CardFooter>
    </Card>
  );
}