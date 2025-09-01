import { useDateRange } from "@/Contexts/date-range-context";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useReports } from "@/Contexts/report-context";
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ColorGenerator } from "@/components/generateDistincColors";

interface PaymentData {
  metodo: string;
  cantidad: number;
  montoTotal: number;
  fill: string;
  porcentaje: number;
}

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

const processData = (
  ventasFormasPago: any[],
  startDate?: Date,
  endDate?: Date,
  maxMethodsToShow: number = 5,
  colorGenerator?: ColorGenerator
) => {
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
  const totalMethods = sortedMethods.length;
  const colors = colorGenerator!.generateColors(totalMethods);
  const totalVentas = sortedMethods.reduce((sum, [, data]) => sum + data.total, 0);

  const dynamicConfig: ChartConfig = {
    cantidad: { label: "Transacciones" },
  };

  const data: PaymentData[] = [];
  let otherData: PaymentData | null = null;

  sortedMethods.forEach(([key, value], index) => {
    if (index < maxMethodsToShow) {
      dynamicConfig[key] = {
        label: value.originalName,
        color: colors[index],
      };

      data.push({
        metodo: key,
        cantidad: value.count,
        montoTotal: value.total,
        fill: colors[index],
        porcentaje: totalVentas > 0 ? (value.total / totalVentas) * 100 : 0,
      });
    } else {
      if (!otherData) {
        otherData = {
          metodo: "otros",
          cantidad: 0,
          montoTotal: 0,
          fill: "#d1d5db", 
          porcentaje: 0,
        };
        dynamicConfig.otros = {
          label: "Otros",
          color: "#d1d5db",
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

  return { data, chartConfig: dynamicConfig, totalMethods };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 w-[200px]">
        <div className="flex items-start gap-3">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0 mt-1"
            style={{ backgroundColor: data.fill }}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium text-gray-900 break-words whitespace-normal">
              {data.metodo}
            </p>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-gray-500">
                {formatCurrency(data.montoTotal)}
              </span>
              <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                {data.porcentaje.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const generateViewOptions = (totalMethods: number) => {
  const options = [];
  
  if (totalMethods <= 5) {
    return [{ value: totalMethods, label: `Mostrar todos (${totalMethods})` }];
  }
  
  const minTop = 5;
  const maxTop = Math.min(totalMethods - 1, 20);
  const interval = Math.max(1, Math.floor((maxTop - minTop) / 3));
  
  let currentTop = minTop;
  const generatedTops = new Set<number>();
  
  while (currentTop < maxTop && generatedTops.size < 4) {
    generatedTops.add(currentTop);
    currentTop += interval;
  }
  
  if (generatedTops.size < 4) {
    const topsToAdd = 4 - generatedTops.size;
    for (let i = 0; i < topsToAdd; i++) {
      const newTop = minTop + i + 1;
      if (newTop < maxTop) {
        generatedTops.add(newTop);
      }
    }
  }
  
  const sortedTops = Array.from(generatedTops).sort((a, b) => a - b);
  
  sortedTops.forEach(top => {
    options.push({ value: top, label: `Top ${top}` });
  });
  
  options.push({ value: totalMethods, label: `Mostrar todos (${totalMethods})` });
  
  return options;
};

export function PaymentMethodsChart() {
  const { dateRange } = useDateRange();
  const { ventasFormasPago } = useReports();
  const [colorGenerator] = useState(() => new ColorGenerator());
  const [maxMethodsToShow, setMaxMethodsToShow] = useState<number>(() => {
    const stored = localStorage.getItem("maxMethodsToShow");
    return stored ? parseInt(stored) : 5;
  });
  
  useEffect(() => {
    localStorage.setItem("maxMethodsToShow", maxMethodsToShow.toString());
  }, [maxMethodsToShow]);
  
  const { data, chartConfig, totalMethods } = processData(
    ventasFormasPago.data, 
    dateRange?.from, 
    dateRange?.to,
    maxMethodsToShow,
    colorGenerator
  );

  const viewOptions = generateViewOptions(totalMethods);

  return (
    <Card className="w-full h-full shadow-sm border border-gray-200 flex flex-col">
      <DataStatusHandler isLoading={ventasFormasPago.loading} error={ventasFormasPago.error}>
        <CardHeader className="items-center w-full -mb-5">
          <div className="flex justify-between items-center w-full">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Métodos de Pago</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Distribución por tipo de pago
              </CardDescription>
            </div>
            <Select 
              value={maxMethodsToShow.toString()}
              onValueChange={(value: string) => setMaxMethodsToShow(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vista" />
              </SelectTrigger>
              <SelectContent>
                {viewOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-2 -mb-10">
          <div className="w-full flex justify-start">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver detalles</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                className="w-full max-w-[300px] p-0 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden"
                align="start"
                side="left"
              >
                <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                  <div className="space-y-3">
                    {data.map((item) => (
                      <div key={item.metodo} className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0 mt-1"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium text-gray-900 break-words whitespace-normal">
                            {chartConfig[item.metodo]?.label || item.metodo}
                          </p>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs text-gray-500">
                              {formatCurrency(item.montoTotal)}
                            </span>
                            <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                              {item.porcentaje.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
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
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}