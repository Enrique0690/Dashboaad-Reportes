import { createContext, useState, useEffect, useContext } from 'react';
import { useDateRange } from './date-range-context';
import { Spinner } from '@/components/ui/Spinner';

const API_BASE_URL = ' http://localhost:1000/LOCAL_NETWORK/REPORTES';

// Definir tipos de datos
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
  loading: false,
  error: null,
});

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const { dateRange } = useDateRange();
  const [ventas, setVentas] = useState<ReportData[]>([]);
  const [utilidad, setUtilidad] = useState<ReportData[]>([]);
  const [clientes, setClientes] = useState<ReportData[]>([]);
  const [pedidosAnulados, setPedidosAnulados] = useState<ReportData[]>([]);
  const [ventasFormasPago, setVentasFormasPago] = useState<ReportData[]>([]);
  const [ventasArticulos, setVentasArticulos] = useState<ReportData[]>([]);
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
          deviceID: 1739913025,
          usuario: 1,
          bodega: 1,
          fecha: new Date().toISOString(),
        },
      };

      try {
        const fetchData = async (endpoint: string, setter: (data: ReportData[]) => void) => {
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await response.json();
          setter(Array.isArray(data) ? data : []);
        };

        await Promise.all([
          fetchData('VENTAS', setVentas),
          fetchData('UTILIDAD', setUtilidad),
          fetchData('VENTAS_CLIENTES', setClientes),
          fetchData('PEDIDOS_ANULADOS', setPedidosAnulados),
          fetchData('VENTAS_FORMASPAGO', setVentasFormasPago),
          fetchData('VENTAS_ARTICULOS', setVentasArticulos),
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
    <ReportContext.Provider value={{ ventas, utilidad, clientes, pedidosAnulados, ventasFormasPago, ventasArticulos, loading, error }}>
      {children}
      {loading && <Spinner />}
    </ReportContext.Provider>
  );
}

export const useReports = () => useContext(ReportContext);