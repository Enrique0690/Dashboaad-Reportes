import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from "@/components/ui/chart";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";

interface UserSalesData {
  usuario: string;
  totalVentasActual: number;
  totalVentasAnterior: number;
}

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

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    const data = payload[0].payload as UserSalesData;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-green-800">{data.usuario}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#22c55e]">●</span> {/* Color actual */}
            <span className="text-xs ml-2">Actual:</span>
            <span className="text-xs font-semibold ml-2">
              {formatCurrency(data.totalVentasActual)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#16a34a]">●</span> {/* Color anterior */}
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
  const { ventas, ventasanterior, ventasLoading, ventasanteriorLoading, ventasError, ventasanteriorError } = useReports();
  const isLoading = ventasLoading || ventasanteriorLoading;
  const error = ventasError || ventasanteriorError;

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
    <Card className="w-full h-[450px] shadow-sm border border-gray-200">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold">Ventas por Usuario</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Distribución de ventas por responsable (período actual vs. anterior)
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="w-full h-[calc(450px-150px)] p-4">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              data={usersData}
              margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="block w-3 h-3" style={{ backgroundColor: COLORES.actual }}></span>
              <span className="font-medium text-gray-800">
                Período Actual: {formatCurrency(totalGeneralActual)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="block w-3 h-3" style={{ backgroundColor: COLORES.anterior }}></span>
              <span className="font-medium text-gray-800">
                Período Anterior: {formatCurrency(totalGeneralAnterior)}
              </span>
            </div>
          </div>
          <div className="text-xs">{usersData.length} usuarios registrados</div>
        </CardFooter>
      </DataStatusHandler>
    </Card>
  );
}