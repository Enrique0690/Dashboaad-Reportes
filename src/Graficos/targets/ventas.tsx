import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { ArrowUp, ArrowDown } from "lucide-react";

export function TotalVentasCard() {
  const { ventas, ventasanterior, ventasLoading, ventasanteriorLoading, ventasanteriorError, ventasError } = useReports();
  const isLoading = ventasLoading && ventasanteriorLoading;
  const error = ventasError && ventasanteriorError;
  const ventasValidas = Array.isArray(ventas)
    ? ventas.filter(venta => venta.documento === "FACTURA" || venta.documento === "NOTA DE ENTREGA")
    : [];
  const ventasAnteriorValidas = Array.isArray(ventasanterior)
    ? ventasanterior.filter(venta => venta.documento === "FACTURA" || venta.documento === "NOTA DE ENTREGA")
    : [];
  const totalVentas = ventasValidas.length;
  const valorTotalVentas = ventasValidas.reduce((sum, venta) => {
    const monto = typeof venta.monto === 'number' ? venta.monto : 0;
    return sum + monto;
  }, 0);
  const totalVentasAnterior = ventasAnteriorValidas.length;
  const diferenciaVentas = totalVentas - totalVentasAnterior;
  const ventasAumentaron = diferenciaVentas > 0;
  const ventasDisminuyeron = diferenciaVentas < 0;

  return (
    <Card className="w-full h-full">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-5">
          <CardTitle className="text-sm font-medium text-gray-400">
            Total de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-0">
          <div className="text-3xl font-bold">
            ${valorTotalVentas.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center mt-1">
            {ventasAumentaron && (
              <ArrowUp className="h-4 w-4 text-green-500" />
            )}
            {ventasDisminuyeron && (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <p className={`text-sm ml-1 ${ventasAumentaron ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(diferenciaVentas)} ventas {ventasAumentaron ? 'más' : 'menos'}
            </p>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}