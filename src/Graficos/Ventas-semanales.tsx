import { useDateRange } from '@/Contexts/date-range-context';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from '@/utils/DataStatusHandler';

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

const COLORES = {
  actual: '#22c55e',
  anterior: '#16a34a',
};

const initDayStructure = () =>
  DIAS_SEMANA.map((dia) => ({
    dia: dia.inicial,
    nombreCompleto: dia.nombre,
    periodoActual: 0,
    periodoAnterior: 0,
  }));

const processData = (ventas: any[], ventasanterior: any[]): ProcessedData[] => {
  const dias = initDayStructure();

  // Procesar ventas del período actual
  ventas.forEach((venta) => {
    const fechaVenta = new Date(venta.fechaCreacion);
    const diaSemana = fechaVenta.getDay();
    dias[diaSemana].periodoActual += venta.total;
  });

  // Procesar ventas del período anterior
  ventasanterior.forEach((venta) => {
    const fechaVenta = new Date(venta.fechaCreacion);
    const diaSemana = fechaVenta.getDay();
    dias[diaSemana].periodoAnterior += venta.total;
  });

  return dias;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0].payload as ProcessedData;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-green-800">{data.nombreCompleto}</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className="block w-4 h-0.5"
              style={{ backgroundColor: COLORES.actual }}
            ></span>
            <p className="text-sm text-gray-700">
              Período Actual:{' '}
              <span className="font-medium">
                {data.periodoActual.toLocaleString('es-EC', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="block w-4 h-0.5"
              style={{
                borderBottom: `2px dashed ${COLORES.anterior}`,
              }}
            ></span>
            <p className="text-sm text-gray-700">
              Período Anterior:{' '}
              <span className="font-medium">
                {data.periodoAnterior.toLocaleString('es-EC', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function WeeklySalesComparison() {
  const { dateRange } = useDateRange();
  const { ventas, ventasanterior, ventasLoading, ventasanteriorLoading, ventasError, ventasanteriorError } = useReports();
  const startDate = dateRange?.from || new Date();
  const endDate = dateRange?.to || new Date();
  const isLoading = ventasLoading || ventasanteriorLoading;
  const error = ventasError || ventasanteriorError;

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
  };

  const chartConfig = {
    periodoActual: {
      label: `Período Actual`,
      color: COLORES.actual,
    },
    periodoAnterior: {
      label: `Período Anterior`,
      color: COLORES.anterior,
    },
  } satisfies ChartConfig;

  // Procesar datos usando ventas y ventasanterior
  const data = processData(ventas, ventasanterior);
  const totalPeriodoActual = data.reduce((sum, day) => sum + day.periodoActual, 0);
  const totalPeriodoAnterior = data.reduce((sum, day) => sum + day.periodoAnterior, 0);

  return (
    <Card className="w-full h-[450px] shadow-sm border border-gray-200">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader>
          <div>
            <CardTitle className="text-lg font-semibold">Comparación de Ventas</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {formatDateRange(startDate, endDate)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="w-full h-[calc(450px-150px)] p-4">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <LineChart
              accessibilityLayer
              data={data}
              width={0}
              height={0}
              className="w-full h-full"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })} />
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Line
                dataKey="periodoActual"
                type="linear"
                stroke={COLORES.actual}
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="periodoAnterior"
                type="linear"
                stroke={COLORES.anterior}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="block w-3 h-3" style={{ backgroundColor: COLORES.actual }}></span>
              <span className="font-medium text-gray-800">
                Período Actual: {totalPeriodoActual.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="block w-3 h-3" style={{ backgroundColor: COLORES.anterior }}></span>
              <span className="font-medium text-gray-800">
                Período Anterior: {totalPeriodoAnterior.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
          </div>
          <div className="text-xs">Comparación de Periodos.</div>
        </CardFooter>
      </DataStatusHandler>
    </Card>
  );
}