import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";
import { ArrowUp, ArrowDown } from "lucide-react"; 

export function TotalTarjetaCard() {
  const { ventasFormasPago, ventasFormasPagoAnterior } = useReports();
  const isLoading = ventasFormasPago.loading || ventasFormasPagoAnterior.loading;
  const error = ventasFormasPago.error || ventasFormasPagoAnterior.error;
  const ventasValidas = Array.isArray(ventasFormasPago.data)
    ? ventasFormasPago.data.filter(venta => {
        const formaPago = typeof venta.FormaPago === 'string' ? venta.FormaPago.toLowerCase() : '';
        return formaPago.includes("tarjeta") && venta.Estado === "ACTIVO";
      })
    : [];
  const ventasAnteriorValidas = Array.isArray(ventasFormasPagoAnterior.data)
    ? ventasFormasPagoAnterior.data.filter(venta => {
        const formaPago = typeof venta.FormaPago === 'string' ? venta.FormaPago.toLowerCase() : '';
        return formaPago.includes("tarjeta") && venta.Estado === "ACTIVO";
      })
    : [];
  const totalTarjeta = ventasValidas.reduce((sum, venta) => {
    const monto = typeof venta.monto === 'number' ? venta.monto : 0;
    return sum + monto;
  }, 0);
  const totalTarjetaAnterior = ventasAnteriorValidas.reduce((sum, venta) => {
    const monto = typeof venta.monto === 'number' ? venta.monto : 0;
    return sum + monto;
  }, 0);
  const diferenciaTarjeta = totalTarjeta - totalTarjetaAnterior;
  const tarjetaAumento = diferenciaTarjeta > 0;
  const tarjetaDisminuyo = diferenciaTarjeta < 0;
  const diferenciaTransacciones = ventasValidas.length - ventasAnteriorValidas.length;

  return (
    <Card className="w-full h-full">
      <DataStatusHandler isLoading={isLoading} error={error}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 -mb-5">
          <CardTitle className="text-sm font-medium text-gray-400">
            Total en Tarjeta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-0">
          <div className="text-3xl font-bold">
            ${totalTarjeta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center mt-1">
            {tarjetaAumento && (
              <ArrowUp className="h-4 w-4 text-green-500" />
            )}
            {tarjetaDisminuyo && (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <p className={`text-sm ml-1 ${tarjetaAumento ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(diferenciaTransacciones)} transacciones {tarjetaAumento ? 'más' : 'menos'} 
            </p>
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}