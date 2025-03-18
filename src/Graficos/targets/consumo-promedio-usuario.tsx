import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReports } from '@/Contexts/report-context';
import { DataStatusHandler } from "@/utils/DataStatusHandler";

export function ConsumoPromedioPorUsuarioCard() {
  const { ventas, ventasLoading, ventasError } = useReports();
  const ventasActivas = ventas.filter(venta => venta.estado === "ACTIVO");
  
  const ventasPorUsuario = ventasActivas.reduce((acc, venta) => {
    const usuario = venta.usuario;
    if (!acc[usuario]) {
      acc[usuario] = { total: 0, transacciones: 0 };
    }
    acc[usuario].total += venta.total;
    acc[usuario].transacciones += 1;
    return acc;
  }, {});

  const usuariosConPromedio = Object.entries(ventasPorUsuario)
    .map(([usuario, datos]) => ({
      usuario,
      promedio: datos.transacciones > 0 ? datos.total / datos.transacciones : 0
    }))
    .sort((a, b) => b.promedio - a.promedio);

  const ticketPromedioGeneral = usuariosConPromedio.length > 0 
    ? usuariosConPromedio.reduce((sum, user) => sum + user.promedio, 0) / usuariosConPromedio.length
    : 0;

  return (
    <Card className="w-full h-[00px] flex flex-col">
      <DataStatusHandler isLoading={ventasLoading} error={ventasError}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-400">
            Ticket Promedio por Usuario
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 p-4 pt-0 overflow-hidden">
          <div className="space-y-1">
            <div className="text-3xl font-bold">
              ${ticketPromedioGeneral.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-sm text-green-500">
              {usuariosConPromedio.length} Usuarios
            </p>
          </div>

          <div className="flex-1 overflow-y-auto border-t pt-4">
            {usuariosConPromedio.map((user, index) => (
              <div 
                key={user.usuario}
                className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md"
              >
                <span className="text-sm font-medium truncate">
                  {index + 1}. {user.usuario}
                </span>
                <span className="text-sm text-gray-600">
                  ${user.promedio.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </DataStatusHandler>
    </Card>
  );
}