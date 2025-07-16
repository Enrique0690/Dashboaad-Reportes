import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { ArrowUp, ArrowDown } from "lucide-react"; 

export function ConsumoPromedioCard() {
  const { ventas, ventasanterior } = useReports();
  const ventasActivas = Array.isArray(ventas.data)
    ? ventas.data.filter(venta => 
        venta.estado === "ACTIVO" && 
        (venta.documento === "FACTURA" || venta.documento === "NOTA DE ENTREGA")
      )
    : [];
  const ventasAnteriorActivas = Array.isArray(ventasanterior.data)
    ? ventasanterior.data.filter(venta => 
        venta.estado === "ACTIVO" && 
        (venta.documento === "FACTURA" || venta.documento === "NOTA DE ENTREGA")
      )
    : [];
  const consumoPromedioActual = calcularConsumoPromedio(ventasActivas);
  const consumoPromedioAnterior = calcularConsumoPromedio(ventasAnteriorActivas);
  const diferenciaConsumo = consumoPromedioActual - consumoPromedioAnterior;
  const consumoAumento = diferenciaConsumo > 0;
  const consumoDisminuyo = diferenciaConsumo < 0;

  return (
    <Card className="w-full h-full">
      <DataStatusHandler isLoading={ventas.loading} error={ventas.error}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-5">
          <CardTitle className="text-sm font-medium text-gray-400">
            Consumo Promedio por Persona
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-0">
          <div className="text-3xl font-bold">
            ${consumoPromedioActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center mt-1">
            {consumoAumento && (
              <ArrowUp className="h-4 w-4 text-green-500" />
            )}
            {consumoDisminuyo && (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <p className={`text-sm ml-1 ${consumoAumento ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(diferenciaConsumo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {consumoAumento ? 'más' : 'menos'}
            </p>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}

function calcularConsumoPromedio(ventas: any) {
  const totalPax = ventas.reduce((sum: number, venta: any) => sum + (venta.pax > 0 ? venta.pax : 1), 0);
  if (totalPax === 0) return 0;

  const totalConsumo = ventas.reduce((sum: number, venta: any) => sum + (venta.baseIva + venta.base0), 0);

  return totalConsumo / totalPax;
}
