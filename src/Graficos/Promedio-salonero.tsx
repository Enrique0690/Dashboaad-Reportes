import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";

const COLORES = {
  actual: '#22c55e',
  anterior: '#c7db9c',
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString('es-EC');
};

const formatCurrency = (value: number) => {
  return `$${formatNumber(value)}`;
};

const formatFullName = (fullName: string) => {
  return fullName
    .split(' ') 
    .filter((part) => part.trim() !== '') 
    .join(' '); 
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
              {formatCurrency(data.totalVentasActual)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#c7db9c]">●</span>
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

export function UserSalesChart() {
  const { ventas, ventasanterior, ventasLoading, ventasanteriorLoading, ventasError, ventasanteriorError } = useReports();
  const isLoading = ventasLoading && ventasanteriorLoading;
  const error = ventasError && ventasanteriorError;

  const processData = (ventas: any[], ventasanterior: any[]) => {
    const users: Record<string, { actual: number; anterior: number }> = {};

    ventas.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      if (!users[usuario]) {
        users[usuario] = { actual: 0, anterior: 0 };
      }
      users[usuario].actual += venta.total;
    });

    ventasanterior.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      if (!users[usuario]) {
        users[usuario] = { actual: 0, anterior: 0 };
      }
      users[usuario].anterior += venta.total;
    });

    const sortedUsers = Object.entries(users)
      .sort(([, a], [, b]) => b.actual - a.actual)
      .map(([usuario, { actual, anterior }]) => ({
        usuario: formatFullName(usuario),
        totalVentasActual: actual,
        totalVentasAnterior: anterior,
      }));

    return {
      usersData: sortedUsers,
      totalGeneralActual: sortedUsers.reduce((sum, user) => sum + user.totalVentasActual, 0),
      totalGeneralAnterior: sortedUsers.reduce((sum, user) => sum + user.totalVentasAnterior, 0),
    };
  };

  const { usersData } = processData(ventas, ventasanterior);

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader className="pb-3">
          <CardTitle>Ventas por Usuario</CardTitle>
          <CardDescription>Distribución de ventas por responsable</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-1">
          <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usersData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: -50, bottom: 5 }} 
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => formatNumber(value)}
                />
                <YAxis
                  dataKey="usuario"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={140}
                  tick={{ fontSize: 12 }}
                  tickFormatter={value => 
                    value.length > 15 ? `${value.substring(0, 12)}...` : value
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="totalVentasActual"
                  fill={COLORES.actual}
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  <LabelList
                    dataKey="totalVentasActual"
                    position="right"
                    formatter={(value: number) => formatNumber(value)}
                    fontSize={12}
                    fill={COLORES.actual}
                  />
                </Bar>
                <Bar
                  dataKey="totalVentasAnterior"
                  fill={COLORES.anterior}
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}