import { useReports } from "@/Contexts/report-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo } from "react";
import { DataStatusHandler } from "@/utils/DataStatusHandler";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const COLORES = [
  "#d1e7d2", 
  "#a3d9a5", 
  "#6cbf6a", 
  "#2f9e55",
  "#1c7a3a"  
];

export function BusinessActivityHeatmap() {
  const { ventas, ventasLoading, ventasError } = useReports();

  const { heatmapData, hoursWithSales } = useMemo(() => {
    const data: Record<string, number[]> = {};
    const hoursWithSales = new Set<number>();

    ventas.forEach((venta) => {
      const fecha = new Date(venta.fechaCreacion);
      const day = fecha.getDay(); 
      const hour = fecha.getHours();

      if (!data[hour]) {
        data[hour] = Array(7).fill(0);
      }
      data[hour][day] += 1;
      hoursWithSales.add(hour);
    });

    const sortedHours = Array.from(hoursWithSales).sort((a, b) => a - b);

    return {
      heatmapData: data,
      hoursWithSales: sortedHours,
    };
  }, [ventas]);

  const maxValue = Math.max(...Object.values(heatmapData).flat());

  const getColor = (value: number) => {
    if (value === 0) return "#fff";
    const index = Math.floor((value / maxValue) * (COLORES.length - 1));
    return COLORES[index];
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <DataStatusHandler isLoading={ventasLoading} error={ventasError}>
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>Actividad del negocio</CardTitle>
            <CardDescription>
              Ventas por día y hora
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex">
              <div className="w-12 shrink-0 flex flex-col justify-center">
                {DIAS_SEMANA.map((day, index) => (
                  <div
                    key={day}
                    className="h-9 text-sm flex items-center justify-end pr-2 text-muted-foreground"
                    style={{ marginTop: index === 0 ? "2.5rem" : "0" }} 
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex-1 overflow-x-auto scrollbar-minimal">
                <div
                  className="flex pl-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${hoursWithSales.length}, minmax(2rem, 1fr))`,
                  }}
                >
                  {hoursWithSales.map((hour) => (
                    <div
                      key={hour}
                      className="flex items-center justify-center text-sm font-medium text-muted-foreground"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      {`${hour}:00`}
                    </div>
                  ))}
                </div>
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${hoursWithSales.length}, minmax(2rem, 1fr))`,
                    gridTemplateRows: `repeat(${DIAS_SEMANA.length}, 2rem)`,
                  }}
                >
                  {DIAS_SEMANA.map((_, day) =>
                    hoursWithSales.map((hour) => (
                      <Tooltip key={`${hour}-${day}`}>
                        <TooltipTrigger asChild>
                          <div
                            className="rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            style={{
                              backgroundColor: getColor(heatmapData[hour]?.[day] || 0),
                            }}
                          ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">
                            {DIAS_SEMANA[day]}, {hour}:00
                          </p>
                          <p>Ventas: {heatmapData[hour]?.[day] || 0}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
};