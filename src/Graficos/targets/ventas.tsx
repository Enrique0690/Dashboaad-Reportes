import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { ArrowUp, ArrowDown } from "lucide-react";

export function TotalVentasCard() {
  const { ventas, ventasanterior } = useReports();
  
  // Corrección de isLoading y error para una mejor gestión
  const isLoading = ventas.loading && ventasanterior.loading;
  const error = ventas.error && ventasanterior.error;

  // Validación de datos
  const ventasValidas = Array.isArray(ventas.data)
    ? ventas.data.filter(venta => ["FACTURA", "NOTA DE ENTREGA"].includes(venta.documento))
    : [];
    
  const ventasAnteriorValidas = Array.isArray(ventasanterior.data)
    ? ventasanterior.data.filter(venta => ["FACTURA", "NOTA DE ENTREGA"].includes(venta.documento))
    : [];

  const totalVentas = ventasValidas.length;
  const totalVentasAnterior = ventasAnteriorValidas.length;

  // Cálculo del valor total de ventas
  const valorTotalVentas = ventasValidas.reduce((sum, venta) => sum + (venta.monto ?? 0), 0);

  // Diferencia de ventas
  const diferenciaVentas = totalVentas - totalVentasAnterior;
  const ventasAumentaron = diferenciaVentas > 0;
  const ventasDisminuyeron = diferenciaVentas < 0;
  console.log("Ventas actuales:", ventas.data);
console.log("Ventas anteriores:", ventasanterior.data);
console.log("Ventas actuales filtradas:", ventasValidas);
console.log("Ventas anteriores filtradas:", ventasAnteriorValidas);
console.log("Diferencia de ventas:", diferenciaVentas);


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
            {ventasAumentaron && <ArrowUp className="h-4 w-4 text-green-500" />}
            {ventasDisminuyeron && <ArrowDown className="h-4 w-4 text-red-500" />}
            <p className={`text-sm ml-1 ${ventasAumentaron ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(diferenciaVentas)} ventas {ventasAumentaron ? 'más' : 'menos'}
            </p>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}
