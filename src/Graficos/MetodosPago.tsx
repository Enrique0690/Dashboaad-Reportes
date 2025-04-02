import { useDateRange } from "@/Contexts/date-range-context";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useReports } from "@/Contexts/report-context";
import { DataStatusHandler } from "@/utils/DataStatusHandler";

interface PaymentData {
  metodo: string;
  cantidad: number;
  montoTotal: number;
  fill: string;
  porcentaje: number;
}

const COLORES = [
  "#2563eb", // Azul
  "#60a5fa", // Azul claro
  "#22c55e", // Verde
  "#facc15", // Amarillo
  "#f97316", // Naranja
  "#9333ea", // Morado
  "#d1d5db", // Gris (para "Otros")
];

const normalizeMethod = (method: string) => {
  return method
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .trim();
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("es-EC", {
    style: "currency",
    currency: "USD",
  });
};

const processData = (ventasFormasPago: any[], startDate?: Date, endDate?: Date) => {
  const metodos: Record<string, { count: number; total: number; originalName: string }> = {};

  ventasFormasPago.forEach((venta) => {
    const fechaVenta = new Date(venta.fechaEmision);
    if (startDate && endDate && (fechaVenta < startDate || fechaVenta > endDate)) {
      return;
    }

    const metodoRaw = venta.FormaPago || "Otro";
    const metodoKey = normalizeMethod(metodoRaw);
    const monto = typeof venta.monto === "number" ? venta.monto : 0; 
    if (!metodos[metodoKey]) {
      metodos[metodoKey] = {
        count: 0,
        total: 0,
        originalName: metodoRaw,
      };
    }

    metodos[metodoKey].count++;
    metodos[metodoKey].total += monto;
  });

  const sortedMethods = Object.entries(metodos).sort((a, b) => b[1].count - a[1].count);
  const totalVentas = sortedMethods.reduce((sum, [, data]) => sum + data.total, 0);

  const dynamicConfig: ChartConfig = {
    cantidad: { label: "Transacciones" },
  };

  const data: PaymentData[] = [];
  let otherData: PaymentData | null = null;
  const maxMainMethods = 4;

  sortedMethods.forEach(([key, value], index) => {
    if (index < maxMainMethods) {
      dynamicConfig[key] = {
        label: value.originalName,
        color: COLORES[index % COLORES.length],
      };

      data.push({
        metodo: key,
        cantidad: value.count,
        montoTotal: value.total,
        fill: COLORES[index % COLORES.length],
        porcentaje: totalVentas > 0 ? (value.total / totalVentas) * 100 : 0,
      });
    } else {
      if (!otherData) {
        otherData = {
          metodo: "otros",
          cantidad: 0,
          montoTotal: 0,
          fill: COLORES[COLORES.length - 1],
          porcentaje: 0,
        };
        dynamicConfig.otros = {
          label: "Otros",
          color: COLORES[COLORES.length - 1],
        };
      }
      otherData.cantidad += value.count;
      otherData.montoTotal += value.total;
      otherData.porcentaje += totalVentas > 0 ? (value.total / totalVentas) * 100 : 0; 
    }
  });

  if (otherData) {
    data.push(otherData);
  }

  return { data, chartConfig: dynamicConfig };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <p className="font-medium text-green-800">{data.metodo}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs">Monto:</span>
            <span className="text-xs font-semibold ml-2">
              {formatCurrency(data.montoTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Porcentaje:</span>
            <span className="text-xs font-semibold ml-2">
              {data.porcentaje.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function PaymentMethodsChart() {
  const { dateRange } = useDateRange();
  const { ventasFormasPago } = useReports();
  const { data, chartConfig } = processData(ventasFormasPago.data, dateRange?.from, dateRange?.to);

  return (
    <Card className="w-full h-full shadow-sm border border-gray-200 flex flex-col">
      <DataStatusHandler isLoading={ventasFormasPago.loading} error={ventasFormasPago.error}>
        <CardHeader className="items-center w-full text-center -mb-10">
          <CardTitle className="text-lg font-semibold">Métodos de Pago</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Distribución por tipo de pago
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-2 p-4">
          <div className="flex-1 w-full min-h-[200px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <PieChart width={400} height={400}>
                <ChartTooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  dataKey="montoTotal"
                  nameKey="metodo"
                  innerRadius="50%"
                  outerRadius="80%"
                  stroke="none"
                />
              </PieChart>
            </ChartContainer>
          </div>

          <div className="w-full flex flex-wrap justify-center gap-2">
            {data.map((item) => (
              <div key={item.metodo} className="flex items-center gap-1 px-2 py-1">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs whitespace-nowrap">
                  {chartConfig[item.metodo]?.label || item.metodo}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ({item.porcentaje.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}