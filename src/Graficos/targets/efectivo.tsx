import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { ArrowUp, ArrowDown } from "lucide-react"; 

export function TotalEfectivoCard() {
  const { ventasFormasPago, ventasFormasPagoAnterior, ventasFormasPagoLoading, ventasFormasPagoError } = useReports();
  const ventasValidas = Array.isArray(ventasFormasPago)
    ? ventasFormasPago.filter(venta => {
        const formaPago = typeof venta.FormaPago === 'string' ? venta.FormaPago.toLowerCase() : '';
        return formaPago === "efectivo" && venta.Estado === "ACTIVO";
      })
    : [];
  const ventasAnteriorValidas = Array.isArray(ventasFormasPagoAnterior)
    ? ventasFormasPagoAnterior.filter(venta => {
        const formaPago = typeof venta.FormaPago === 'string' ? venta.FormaPago.toLowerCase() : '';
        return formaPago === "efectivo" && venta.Estado === "ACTIVO";
      })
    : [];
  const totalEfectivo = ventasValidas.reduce((sum, venta) => {
    const monto = typeof venta.monto === 'number' ? venta.monto : 0;
    return sum + monto;
  }, 0);
  const totalEfectivoAnterior = ventasAnteriorValidas.reduce((sum, venta) => {
    const monto = typeof venta.monto === 'number' ? venta.monto : 0;
    return sum + monto;
  }, 0);
  const diferenciaEfectivo = totalEfectivo - totalEfectivoAnterior;
  const efectivoAumento = diferenciaEfectivo > 0;
  const efectivoDisminuyo = diferenciaEfectivo < 0;
  const diferenciaTransacciones = ventasValidas.length - ventasAnteriorValidas.length;

  return (
    <Card className="w-full h-full">
      <DataStatusHandler isLoading={ventasFormasPagoLoading} error={ventasFormasPagoError}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-5">
          <CardTitle className="text-sm font-medium text-gray-400">
            Total en Efectivo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-0">
          <div className="text-3xl font-bold">
            ${totalEfectivo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center mt-1">
            {efectivoAumento && (
              <ArrowUp className="h-4 w-4 text-green-500" />
            )}
            {efectivoDisminuyo && (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <p className={`text-sm ml-1 ${efectivoAumento ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(diferenciaTransacciones)} transacciones {efectivoAumento ? 'más' : 'menos'}
            </p>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}