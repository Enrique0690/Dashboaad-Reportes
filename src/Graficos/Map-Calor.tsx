import { useReports } from "@/Contexts/report-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo } from "react";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const COLORES = [
  "#d1e7d2", 
  "#a3d9a5", 
  "#6cbf6a", 
  "#2f9e55",
  "#1c7a3a"  
];


export function BusinessActivityHeatmap() {
  const { ventas } = useReports();

  // Procesar los datos para el mapa de calor
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
      data[hour][day] += 1; // Contar el número de ventas
      hoursWithSales.add(hour);
    });

    // Convertir a un array de horas con ventas
    const sortedHours = Array.from(hoursWithSales).sort((a, b) => a - b);

    return {
      heatmapData: data,
      hoursWithSales: sortedHours,
    };
  }, [ventas]);

  // Encontrar el valor máximo para normalizar los colores
  const maxValue = Math.max(...Object.values(heatmapData).flat());

  // Función para obtener el color basado en el valor
  const getColor = (value: number) => {
    if (value === 0) return "#fff";
    const index = Math.floor((value / maxValue) * (COLORES.length - 1));
    return COLORES[index];
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex justify-between items-center">
        <div className="flex flex-col">
          <CardTitle>Mapa de Calor de Actividad</CardTitle>
          <CardDescription>
            Actividad de ventas por día y hora
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="h-auto w-full flex flex-col">
        <div className="flex pl-12 flex-wrap">
          {DIAS_SEMANA.map((day) => (
            <div
              key={day}
              className="flex-1 text-center text-sm font-medium pb-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Contenedor con scroll para el mapa de calor */}
        <div className="flex overflow-x-auto overflow-y-auto scrollbar-minimal">
          <div className="w-12 shrink-0">
            {hoursWithSales.map((hour) => (
              <div
                key={hour}
                className="h-9 text-sm flex items-center justify-end pr-2 text-muted-foreground"
              >
                {`${hour}:00`}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {hoursWithSales.map((hour) =>
              DIAS_SEMANA.map((_, day) => (
                <Tooltip key={`${hour}-${day}`}>
                  <TooltipTrigger asChild>
                    <div
                      className="h-8 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
      </CardContent>
    </Card>
  );
}