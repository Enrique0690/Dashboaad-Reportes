import { Bar, BarChart, CartesianGrid, XAxis, TooltipProps, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from '@/utils/DataStatusHandler';
import { useState, useEffect } from 'react';
import { RoleFilter } from '@/components/rolFilter';
import { formatDate, formatCurrency } from '@/components/formats';

const COLORES = {
  actual: '#22c55e',
  anterior: '#c7db9c',
};

const CustomTooltip = ({ active, payload, fechaInicioActual, fechaFinActual, fechaInicioAnterior, fechaFinAnterior }: TooltipProps<number, string> & { fechaInicioActual: string, fechaFinActual: string, fechaInicioAnterior: string, fechaFinAnterior: string }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-green-800 text-sm">{data.usuario}</p>
        <div className="mt-1 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-[#22c55e]">
              <span className="text-xs">●</span>
              <span className="ml-1">Actual</span>
            </div>
            <span className="ml-1">{formatCurrency(data.ticketPromedioActual)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-[#c7db9c]">
              <span className="text-xs">●</span>
              <span className="ml-1">Anterior</span>
            </div>
            <span className="ml-1">{formatCurrency(data.ticketPromedioAnterior)}</span>
          </div>
          <div className="mt-1 text-gray-500">
            <span className="text-xs">Rango Actual: </span><span className="text-xs">{formatDate(fechaInicioActual)} - {formatDate(fechaFinActual)}</span>
          </div>
          <div className="text-gray-500">
            <span className="text-xs">Rango Anterior: </span><span className="text-xs">{formatDate(fechaInicioAnterior)} - {formatDate(fechaFinAnterior)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
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
  const { ventas, ventasanterior, usuarios, fechaInicioActual, fechaFinActual, fechaInicioAnterior, fechaFinAnterior } = useReports();
  const error = ventas.error || ventasanterior.error;
  const isLoading = ventas.loading || ventasanterior.loading;
  const rolesUnicos = Array.from(new Set(usuarios.map((u) => u.nombreRol)));
  const localStorageKey = "rolesSeleccionadosTicketPromedio";

  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>(() => {
    const stored = localStorage.getItem(localStorageKey);
    return stored ? JSON.parse(stored) : rolesUnicos;
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(rolesSeleccionados));
  }, [rolesSeleccionados]);

  const processData = (ventas: any[], ventasanterior: any[]) => {
    const usuariosData: Record<string, { totalVentasActual: number; totalPaxActual: number; totalVentasAnterior: number; totalPaxAnterior: number }> = {};

    ventas.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      const usuarioObj = usuarios.find((u) => u.nombre === usuario);
      if (!usuarioObj || !rolesSeleccionados.includes(usuarioObj.nombreRol)) return;

      const total = (typeof venta.baseIva === "number" ? venta.baseIva : 0) + (typeof venta.base0 === "number" ? venta.base0 : 0);
      const pax = venta.pax > 0 ? venta.pax : 1;

      if (!usuariosData[usuario]) {
        usuariosData[usuario] = { totalVentasActual: 0, totalPaxActual: 0, totalVentasAnterior: 0, totalPaxAnterior: 0 };
      }

      usuariosData[usuario].totalVentasActual += total;
      usuariosData[usuario].totalPaxActual += pax;
    });

    ventasanterior.forEach((venta) => {
      const usuario = venta.usuario || 'Sin especificar';
      const usuarioObj = usuarios.find((u) => u.nombre === usuario);
      if (!usuarioObj || !rolesSeleccionados.includes(usuarioObj.nombreRol)) return;

      const total = (typeof venta.baseIva === "number" ? venta.baseIva : 0) + (typeof venta.base0 === "number" ? venta.base0 : 0);
      const pax = venta.pax > 0 ? venta.pax : 1;

      if (!usuariosData[usuario]) {
        usuariosData[usuario] = { totalVentasActual: 0, totalPaxActual: 0, totalVentasAnterior: 0, totalPaxAnterior: 0 };
      }

      usuariosData[usuario].totalVentasAnterior += total;
      usuariosData[usuario].totalPaxAnterior += pax;
    });

    return Object.entries(usuariosData)
      .map(([usuario, { totalVentasActual, totalPaxActual, totalVentasAnterior, totalPaxAnterior }]) => ({
        usuario,
        ticketPromedioActual: totalPaxActual > 0 ? totalVentasActual / totalPaxActual : 0,
        ticketPromedioAnterior: totalPaxAnterior > 0 ? totalVentasAnterior / totalPaxAnterior : 0,
      }))
      .sort((a, b) => b.ticketPromedioActual - a.ticketPromedioActual);
  };

  const data = processData(ventas.data, ventasanterior.data);
  const maxVisibleUsers = 4;
  const userWidth = 65;
  const minContainerWidth = Math.max(data.length * userWidth, maxVisibleUsers * userWidth)
  return (
    <Card className="h-[500px] flex flex-col">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader className="items-center w-full -mb-5">
          <div className="flex justify-between items-center w-full">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Ticket Promedio por Usuario</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Comparación del período actual vs. anterior
              </CardDescription>
            </div>
            <RoleFilter
              roles={rolesUnicos}
              selectedRoles={rolesSeleccionados}
              onChange={setRolesSeleccionados}
            />
          </div>
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
                <ChartTooltip
                  cursor={false}
                  content={
                    <CustomTooltip
                      fechaInicioActual={fechaInicioActual?.toISOString() ?? ""}
                      fechaFinActual={fechaFinActual?.toISOString() ?? ""}
                      fechaInicioAnterior={fechaInicioAnterior?.toISOString() ?? ""}
                      fechaFinAnterior={fechaFinAnterior?.toISOString() ?? ""}
                    />
                  }
                />
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