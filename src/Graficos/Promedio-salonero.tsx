import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/ui/chart";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { useState, useEffect } from "react";
import { RoleFilter } from "@/components/rolFilter";

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
  const { ventas, ventasanterior, usuarios } = useReports();
  const isLoading = ventas.loading || ventasanterior.loading;
  const error = ventas.error || ventasanterior.error;
  const rolesUnicos = Array.from(new Set(usuarios.map((u) => u.nombreRol)));
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>(() => {
    const stored = localStorage.getItem("rolesSeleccionadosPromedioSalonero");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch { }
    }
    return rolesUnicos;
  });
  useEffect(() => {
    localStorage.setItem("rolesSeleccionadosPromedioSalonero", JSON.stringify(rolesSeleccionados));
  }, [rolesSeleccionados]);

  const processData = (ventas: any[], ventasanterior: any[]) => {
    const users: Record<string, { actual: number; anterior: number }> = {};

    ventas.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      const usuarioObj = usuarios.find((u) => u.nombre === usuario);
      if (!usuarioObj || !rolesSeleccionados.includes(usuarioObj.nombreRol)) return;

      if (!users[usuario]) users[usuario] = { actual: 0, anterior: 0 };
      users[usuario].actual += (venta.baseIva ?? 0) + (venta.base0 ?? 0);
    });

    ventasanterior.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      const usuarioObj = usuarios.find((u) => u.nombre === usuario);
      if (!usuarioObj || !rolesSeleccionados.includes(usuarioObj.nombreRol)) return;

      if (!users[usuario]) users[usuario] = { actual: 0, anterior: 0 };
      users[usuario].anterior += (venta.baseIva ?? 0) + (venta.base0 ?? 0);
    });

    return Object.entries(users)
      .map(([usuario, { actual, anterior }]) => ({
        usuario: formatFullName(usuario),
        totalVentasActual: actual,
        totalVentasAnterior: anterior,
      }))
      .sort((a, b) => b.totalVentasActual - a.totalVentasActual);
  };

  const usersData = processData(ventas.data, ventasanterior.data);
  const maxVisibleUsers = 6;
  const userHeight = 50;
  const minContainerHeight = Math.max(usersData.length * userHeight, maxVisibleUsers * userHeight);

  return (
    <Card className="h-[500px] flex flex-col">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader className="items-center w-full -mb-5">
          <div className="flex justify-between items-center w-full">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Ventas por Usuario</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Distribución de ventas por responsable
              </CardDescription>
            </div>
            <RoleFilter
              roles={rolesUnicos}
              selectedRoles={rolesSeleccionados}
              onChange={setRolesSeleccionados}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <div className="relative w-full h-full" style={{ minHeight: `${minContainerHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usersData}
                layout="vertical"
                margin={{ top: 10, right: 50, left: -50, bottom: 10 }}
                barCategoryGap="35%"
                barGap={5}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" domain={[0, "dataMax"]} tickFormatter={formatNumber} />
                <YAxis
                  dataKey="usuario"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={140}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 12)}...` : value)}
                />
                <ChartTooltip cursor={false} content={<CustomTooltip />} />
                <Bar dataKey="totalVentasActual" fill={COLORES.actual} radius={[0, 4, 4, 0]} barSize={30}>
                  <LabelList dataKey="totalVentasActual" position="right" formatter={formatNumber} fontSize={12} fill={COLORES.actual} />
                </Bar>
                <Bar dataKey="totalVentasAnterior" fill={COLORES.anterior} radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}
