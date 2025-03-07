import { createContext, useState, useEffect, useContext } from 'react';
import { useDateRange } from './date-range-context';
import { Spinner } from '@/components/ui/Spinner';
import { useSearchParams } from 'react-router-dom';

interface ReportData {
  [key: string]: any;
}

interface ReportContextType {
  ventas: ReportData[];
  utilidad: ReportData[];
  clientes: ReportData[];
  pedidosAnulados: ReportData[];
  ventasFormasPago: ReportData[];
  ventasArticulos: ReportData[];
  ventasanterior: ReportData[];
  utilidadanterior: ReportData[];
  clientesanterior: ReportData[];
  pedidosAnuladosAnterior: ReportData[];
  ventasFormasPagoAnterior: ReportData[];
  ventasArticulosAnterior: ReportData[];
  loading: boolean;
  error: string | null;
}

const ReportContext = createContext<ReportContextType>({
  ventas: [],
  utilidad: [],
  clientes: [],
  pedidosAnulados: [],
  ventasFormasPago: [],
  ventasArticulos: [],
  ventasanterior: [],
  utilidadanterior: [],
  clientesanterior: [],
  pedidosAnuladosAnterior: [],
  ventasFormasPagoAnterior: [],
  ventasArticulosAnterior: [],
  loading: false,
  error: null,
});

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const nombreLocal = searchParams.get('nombreLocal') || '';
  const urlServicio = searchParams.get('urlServicio') ;
  const idUsuario = searchParams.get('idUsuario') ;
  const deviceID = searchParams.get('deviceID') ;

  const { dateRange } = useDateRange();
  const [ventas, setVentas] = useState<ReportData[]>([]);
  const [utilidad, setUtilidad] = useState<ReportData[]>([]);
  const [clientes, setClientes] = useState<ReportData[]>([]);
  const [pedidosAnulados, setPedidosAnulados] = useState<ReportData[]>([]);
  const [ventasFormasPago, setVentasFormasPago] = useState<ReportData[]>([]);
  const [ventasArticulos, setVentasArticulos] = useState<ReportData[]>([]);
  const [ventasanterior, setVentasanterior] = useState<ReportData[]>([]);
  const [utilidadanterior, setUtilidadanterior] = useState<ReportData[]>([]);
  const [clientesanterior, setClientesanterior] = useState<ReportData[]>([]);
  const [pedidosAnuladosAnterior, setPedidosAnuladosAnterior] = useState<ReportData[]>([]);
  const [ventasFormasPagoAnterior, setVentasFormasPagoAnterior] = useState<ReportData[]>([]);
  const [ventasArticulosAnterior, setVentasArticulosAnterior] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const formData = {
        datetime: 1,
        desde: `${dateRange.from!.toISOString().split('T')[0]} 00:00`,
        hasta: `${dateRange.to!.toISOString().split('T')[0]} 23:59`,
        tablet: {
          deviceID,
          usuario: idUsuario,
          bodega: 1,
          fecha: new Date().toISOString(),
        },
      };

      // Calcular las fechas de los peridos anteriores
      const rangeDuration = dateRange.to!.getTime() - dateRange.from!.getTime();
      const previousRangeFrom = new Date(dateRange.from!.getTime() - rangeDuration);
      const previousRangeTo = new Date(dateRange.to!.getTime() - rangeDuration);

      const formDataAnterior = {
        datetime: 1,
        desde: `${previousRangeFrom.toISOString().split('T')[0]} 00:00`,
        hasta: `${previousRangeTo.toISOString().split('T')[0]} 23:59`,
        tablet: {
          deviceID,
          usuario: idUsuario,
          bodega: 1,
          fecha: new Date().toISOString(),
        },
      };

      try {
        const fetchData = async (endpoint: string, setter: (data: ReportData[]) => void, formData: any) => {
          const response = await fetch(`${urlServicio}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await response.json();
          setter(Array.isArray(data) ? data : []);
        };

        await Promise.all([
          fetchData('VENTAS', setVentas, formData),
          fetchData('UTILIDAD', setUtilidad, formData),
          fetchData('VENTAS_CLIENTES', setClientes, formData),
          fetchData('PEDIDOS_ANULADOS', setPedidosAnulados, formData),
          fetchData('VENTAS_FORMASPAGO', setVentasFormasPago, formData),
          fetchData('VENTAS_ARTICULOS', setVentasArticulos, formData),
          fetchData('VENTAS', setVentasanterior, formDataAnterior),
          fetchData('UTILIDAD', setUtilidadanterior, formDataAnterior),
          fetchData('VENTAS_CLIENTES', setClientesanterior, formDataAnterior),
          fetchData('PEDIDOS_ANULADOS', setPedidosAnuladosAnterior, formDataAnterior),
          fetchData('VENTAS_FORMASPAGO', setVentasFormasPagoAnterior, formDataAnterior),
          fetchData('VENTAS_ARTICULOS', setVentasArticulosAnterior, formDataAnterior),
        ]);
      } catch (err) {
        setError('Error al obtener reportes');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  return (
    <ReportContext.Provider
      value={{
        ventas,
        utilidad,
        clientes,
        pedidosAnulados,
        ventasFormasPago,
        ventasArticulos,
        ventasanterior,
        utilidadanterior,
        clientesanterior,
        pedidosAnuladosAnterior,
        ventasFormasPagoAnterior,
        ventasArticulosAnterior,
        loading,
        error,
      }}
    >
      {children}
      {loading && <Spinner />}
    </ReportContext.Provider>
  );
}

export const useReports = () => useContext(ReportContext);