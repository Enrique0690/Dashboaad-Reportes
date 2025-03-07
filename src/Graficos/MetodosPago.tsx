import { useDateRange } from "@/Contexts/date-range-context";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useReports } from "@/Contexts/report-context";

interface PaymentData {
  metodo: string;
  cantidad: number;
  montoTotal: number;
  fill: string;
  porcentaje: number;
}

const COLORES = [
  "#2563eb",
  "#60a5fa",
  "#22c55e",
  "#facc15",
  "#f97316",
  "#9333ea",
  "#d1d5db",
];

const normalizeMethod = (method: string) => {
  return method
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .trim();
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

    if (!metodos[metodoKey]) {
      metodos[metodoKey] = {
        count: 0,
        total: 0,
        originalName: metodoRaw,
      };
    }

    metodos[metodoKey].count++;
    metodos[metodoKey].total += venta.monto;
  });

  const sortedMethods = Object.entries(metodos).sort((a, b) => b[1].count - a[1].count);
  const totalVentas = sortedMethods.reduce((sum, [, data]) => sum + data.total, 0);

  const dynamicConfig: ChartConfig = {
    cantidad: { label: "Transacciones" },
  };

  const data: PaymentData[] = [];
  let otherData: PaymentData | null = null;
  const maxMainMethods = 6;

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
        porcentaje: (value.total / totalVentas) * 100,
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
      otherData.porcentaje += (value.total / totalVentas) * 100;
    }
  });

  if (otherData) {
    data.push(otherData);
  }

  return { data, chartConfig: dynamicConfig };
};

export function PaymentMethodsChart() {
  const { dateRange } = useDateRange();
  const { ventasFormasPago } = useReports();
  const { data, chartConfig } = processData(ventasFormasPago, dateRange?.from, dateRange?.to);
  const totalTransacciones = data.reduce((sum, item) => sum + item.cantidad, 0);
  const totalMonto = data.reduce((sum, item) => sum + item.montoTotal, 0);

  return (
    <Card className="flex flex-col w-full h-full">
      <CardHeader className="items-center w-full text-center">
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>Distribución por tipo de pago</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center gap-8 pr-4 pl-4 w-full">
        <div className="w-full flex justify-center">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <PieChart width={600} height={400}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="metodo"
                    valueFormatter={(value) =>
                      Number(value).toLocaleString("es-EC", {
                        style: "currency",
                        currency: "USD",
                      })
                    }
                    labelFormatter={(label) => chartConfig[label]?.label || label}
                  />
                }
              />
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

        {/* Leyenda de métodos de pago */}
        <div className="w-full flex flex-wrap justify-center gap-4">
          {data.map((item) => (
            <div key={item.metodo} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm">
                {chartConfig[item.metodo]?.label || item.metodo}
              </span>
              <span className="text-sm text-muted-foreground">
                ({item.porcentaje.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 text-sm w-full">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total:{" "}
          {totalMonto.toLocaleString("es-EC", {
            style: "currency",
            currency: "USD",
          })}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {totalTransacciones} transacciones registradas
        </div>
      </CardFooter>
    </Card>
  );
}