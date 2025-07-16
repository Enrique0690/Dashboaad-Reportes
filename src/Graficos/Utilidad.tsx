import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useReports } from "@/Contexts/report-context";
import { useState, useRef, useEffect } from "react";
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorGenerator } from "@/components/generateDistincColors";

const chartConfig = {
  cantidad: {
    label: "Cantidad Vendida",
  },
  neto: {
    label: "Total Neto",
  },
} satisfies ChartConfig;

const CustomTooltipContent = ({ active, payload, sortBy }: {
  active?: boolean;
  payload?: any[];
  label?: string;
  sortBy: "cantidad" | "neto";
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = payload[0].value;
  const labelText = sortBy === "cantidad" ? "Cantidad" : "Total Neto";

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <p className="font-bold text-sm mb-1">{data.producto}</p>
      <p className="text-sm">
        {labelText}: <span className="font-semibold">{value.toLocaleString()}</span>
      </p>
    </div>
  );
};

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const MAX_CHARS = 50;
  const text = payload.value;
  const isTruncated = text.length > MAX_CHARS;
  const displayText = isTruncated ? `${text.slice(0, MAX_CHARS)}...` : text;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-100} y={-10} width={100} height={40}>
        <div
          className="text-xs text-gray-600 leading-tight"
          style={{
            width: '100%',
            wordWrap: 'break-word',
            lineHeight: '1.2'
          }}
          title={isTruncated ? text : undefined}
        >
          {displayText}
        </div>
      </foreignObject>
    </g>
  );
};

export function TopProductsChart() {
  const { ventasArticulos } = useReports();
  const [sortBy, setSortBy] = useState<"cantidad" | "neto">("cantidad");
  const [colors, setColors] = useState<string[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const colorGenerator = useRef(new ColorGenerator());
  const uniqueProductsCount = new Set(ventasArticulos.data.map(v => v.descripcion)).size;
  const [maxProductsToShow, setMaxProductsToShow] = useState<number>(() => {
    const stored = localStorage.getItem("maxProductsToShow");
    return stored ? parseInt(stored) : 5;
  });

  useEffect(() => {
    localStorage.setItem("maxProductsToShow", maxProductsToShow.toString());
  }, [maxProductsToShow]);
  const productOptions = [5, 10, 15, 20].filter(value => value <= uniqueProductsCount);
  if (productOptions.length === 0) productOptions.push(uniqueProductsCount);

  const processData = (ventas: any[]) => {
    const products: Record<string, { cantidad: number; neto: number }> = {};

    ventas.forEach((venta) => {
      const producto = venta.descripcion || "Sin especificar";
      if (!products[producto]) {
        products[producto] = { cantidad: 0, neto: 0 };
      }
      products[producto].cantidad += venta.cantidad;
      products[producto].neto += venta.neto;
    });

    const sortedProducts = Object.entries(products)
      .sort(([, a], [, b]) => (sortBy === "cantidad" ? b.cantidad - a.cantidad : b.neto - a.neto))
      .slice(0, maxProductsToShow)
      .map(([producto, { cantidad, neto }], index) => ({
        producto,
        cantidad,
        neto,
        fill: colors[index] || "#2563eb",
      }));

    return sortedProducts;
  };
  useEffect(() => {
    const newColors = colorGenerator.current.generateColors(maxProductsToShow);
    setColors(newColors);
  }, [maxProductsToShow]);

  const chartData = processData(ventasArticulos.data);
  const chartHeight = Math.max(chartData.length * 50, 300);

  return (
    <Card className="w-full h-full flex flex-col">
      <DataStatusHandler isLoading={ventasArticulos.loading} error={ventasArticulos.error}>
        <CardHeader className="items-center w-full -mb-3">
          <div className="flex justify-between items-center w-full">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Productos Más Vendidos</CardTitle>
            </div>
            <Select
              value={maxProductsToShow.toString()}
              onValueChange={(value: string) => setMaxProductsToShow(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Número de Productos" />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} Productos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2 justify-center -mb-2">
            <button
              onClick={() => setSortBy("cantidad")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === "cantidad"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              Por Cantidad
            </button>
            <button
              onClick={() => setSortBy("neto")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === "neto"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              Por Total Neto
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-[300px]" ref={chartContainerRef}           >
            <div style={{ height: `${chartHeight}px` }}>
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 5, bottom: 5 }}
                  width={chartContainerRef.current?.clientWidth || 500}
                  height={chartHeight}
                >
                  <YAxis
                    dataKey="producto"
                    type="category"
                    tickLine={false}
                    tickMargin={0}
                    axisLine={false}
                    width={110}
                    tick={<CustomYAxisTick />}
                  />
                  <XAxis
                    dataKey={sortBy}
                    type="number"
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<CustomTooltipContent sortBy={sortBy} />}
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
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}