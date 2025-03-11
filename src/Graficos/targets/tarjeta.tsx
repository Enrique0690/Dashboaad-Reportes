import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";

export function TotalTarjetaCard() {
  const { ventasFormasPago, ventasFormasPagoLoading, ventasFormasPagoError } = useReports();

  // Filtrar ventas que contengan la palabra "tarjeta" (insensible a mayúsculas/minúsculas)
  const ventasTarjeta = ventasFormasPago.filter(venta =>
    venta.FormaPago.toLowerCase().includes("tarjeta")
  );

  // Calcular el total de ventas con tarjeta
  const totalTarjeta = ventasTarjeta.reduce((sum, venta) => sum + venta.total, 0);

  return (
    <Card className="w-full h-full">
      <DataStatusHandler isLoading={ventasFormasPagoLoading} error={ventasFormasPagoError} >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-5">
        <CardTitle className="text-sm font-medium text-gray-400">
          Total en Tarjeta
        </CardTitle>
        <span className="text-xl font-medium">$</span>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-0">
        <div className="text-3xl font-bold">${totalTarjeta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <p className="text-sm text-green-500 mt-1">
          +{ventasTarjeta.length} Transacciones
        </p>
      </CardContent>
      </DataStatusHandler>
    </Card>
  );
}