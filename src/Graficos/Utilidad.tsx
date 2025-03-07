import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {  Card,  CardContent,  CardDescription,  CardFooter,  CardHeader,  CardTitle} from "@/components/ui/card";
import {  ChartConfig,  ChartContainer,  ChartTooltip,  ChartTooltipContent} from "@/components/ui/chart";
import { useReports } from "@/Contexts/report-context";
import { useState } from "react";

// Definir colores para cada barra del gráfico
const COLORS = [
  "#2563eb",
  "#60a5fa",
  "#22c55e",
  "#facc15",
  "#f97316",
  "#9333ea",
  "#d1d5db",
];

// Configuración del gráfico
const chartConfig = {
  cantidad: {
    label: "Cantidad Vendida",
  },
  neto: {
    label: "Total Neto",
  },
} satisfies ChartConfig;

export function TopProductsChart() {
  const { utilidad } = useReports();
  const [sortBy, setSortBy] = useState<"cantidad" | "neto">("cantidad");

  // Procesar los datos para obtener los productos más vendidos
  const processData = (ventas: any[]) => {
    const products: Record<string, { cantidad: number; neto: number }> = {};

    ventas.forEach((venta) => {
      const producto = venta.articulo || "Sin especificar";
      if (!products[producto]) {
        products[producto] = { cantidad: 0, neto: 0 };
      }
      products[producto].cantidad += venta.cantidad;
      products[producto].neto += venta.neto;
    });

    // Convertir a array y ordenar
    const sortedProducts = Object.entries(products)
      .sort(([, a], [, b]) => (sortBy === "cantidad" ? b.cantidad - a.cantidad : b.neto - a.neto))
      .slice(0, 6) // Tomar solo los 6 primeros
      .map(([producto, { cantidad, neto }], index) => ({
        producto,
        cantidad,
        neto,
        fill: COLORS[index % COLORS.length], 
      }));

    return sortedProducts;
  };

  const chartData = processData(utilidad);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Top 6 Productos Más Vendidos</CardTitle>
        <CardDescription>
          {sortBy === "cantidad"
            ? "Clasificados por cantidad vendida"
            : "Clasificados por total neto"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Contenedor para los botones */}
        <div className="flex gap-2 justify-center md:justify-start">
          <button
            onClick={() => setSortBy("cantidad")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "cantidad"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Por Cantidad
          </button>
          <button
            onClick={() => setSortBy("neto")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "neto"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Por Total Neto
          </button>
        </div>

        {/* Contenedor del gráfico */}
        <div className="flex-1 h-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 10 }}
              className="w-full h-full"
            >
              <YAxis
                dataKey="producto"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={100} 
              />
              <XAxis
                dataKey={sortBy}
                type="number"
                hide
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey={sortBy}
                layout="vertical"
                radius={5}
                fill={chartData[0]?.fill} 
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm p-4 border-t">
        <div className="flex gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
          {sortBy === "cantidad"
            ? "Productos más vendidos este mes"
            : "Productos con mayor utilidad este mes"}
        </div>
        <div className="leading-none text-muted-foreground p-3">
          Mostrando los 6 productos principales
        </div>
      </CardFooter>
    </Card>
  );
}