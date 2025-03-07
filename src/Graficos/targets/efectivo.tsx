import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';

export function TotalEfectivoCard() {
  const { ventasFormasPago } = useReports();

  // Filtrar ventas en efectivo y calcular el total
  const ventasEfectivo = ventasFormasPago.filter(venta => venta.FormaPago === "EFECTIVO");
  const totalEfectivo = ventasEfectivo.reduce((sum, venta) => sum + venta.total, 0);

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-5">
        <CardTitle className="text-sm font-medium text-gray-400">
          Total en Efectivo
        </CardTitle>
        <span className="text-xl font-medium">$</span>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-0">
        <div className="text-3xl font-bold">${totalEfectivo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <p className="text-sm text-green-500 mt-1">
          +{ventasEfectivo.length} Transacciones
        </p>
      </CardContent>
    </Card>
  );
}