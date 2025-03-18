import { createContext, useState, useEffect, useContext } from 'react';
import { useDateRange } from './date-range-context';
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
  ventasLoading: boolean;
  utilidadLoading: boolean;
  clientesLoading: boolean;
  pedidosAnuladosLoading: boolean;
  ventasFormasPagoLoading: boolean;
  ventasArticulosLoading: boolean;
  ventasanteriorLoading: boolean;
  utilidadanteriorLoading: boolean;
  clientesanteriorLoading: boolean;
  pedidosAnuladosAnteriorLoading: boolean;
  ventasFormasPagoAnteriorLoading: boolean;
  ventasArticulosAnteriorLoading: boolean;
  ventasError: string | null;
  utilidadError: string | null;
  clientesError: string | null;
  pedidosAnuladosError: string | null;
  ventasFormasPagoError: string | null;
  ventasArticulosError: string | null;
  ventasanteriorError: string | null;
  utilidadanteriorError: string | null;
  clientesanteriorError: string | null;
  pedidosAnuladosAnteriorError: string | null;
  ventasFormasPagoAnteriorError: string | null;
  ventasArticulosAnteriorError: string | null;
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
  ventasLoading: false,
  utilidadLoading: false,
  clientesLoading: false,
  pedidosAnuladosLoading: false,
  ventasFormasPagoLoading: false,
  ventasArticulosLoading: false,
  ventasanteriorLoading: false,
  utilidadanteriorLoading: false,
  clientesanteriorLoading: false,
  pedidosAnuladosAnteriorLoading: false,
  ventasFormasPagoAnteriorLoading: false,
  ventasArticulosAnteriorLoading: false,
  ventasError: null,
  utilidadError: null,
  clientesError: null,
  pedidosAnuladosError: null,
  ventasFormasPagoError: null,
  ventasArticulosError: null,
  ventasanteriorError: null,
  utilidadanteriorError: null,
  clientesanteriorError: null,
  pedidosAnuladosAnteriorError: null,
  ventasFormasPagoAnteriorError: null,
  ventasArticulosAnteriorError: null,
});

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const urlServicio = searchParams.get('urlServicio');
  const idUsuario = searchParams.get('idUsuario');
  const deviceID = searchParams.get('deviceID');

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

  const [ventasLoading, setVentasLoading] = useState(false);
  const [utilidadLoading, setUtilidadLoading] = useState(false);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [pedidosAnuladosLoading, setPedidosAnuladosLoading] = useState(false);
  const [ventasFormasPagoLoading, setVentasFormasPagoLoading] = useState(false);
  const [ventasArticulosLoading, setVentasArticulosLoading] = useState(false);
  const [ventasanteriorLoading, setVentasanteriorLoading] = useState(false);
  const [utilidadanteriorLoading, setUtilidadanteriorLoading] = useState(false);
  const [clientesanteriorLoading, setClientesanteriorLoading] = useState(false);
  const [pedidosAnuladosAnteriorLoading, setPedidosAnuladosAnteriorLoading] = useState(false);
  const [ventasFormasPagoAnteriorLoading, setVentasFormasPagoAnteriorLoading] = useState(false);
  const [ventasArticulosAnteriorLoading, setVentasArticulosAnteriorLoading] = useState(false);

  const [ventasError, setVentasError] = useState<string | null>(null);
  const [utilidadError, setUtilidadError] = useState<string | null>(null);
  const [clientesError, setClientesError] = useState<string | null>(null);
  const [pedidosAnuladosError, setPedidosAnuladosError] = useState<string | null>(null);
  const [ventasFormasPagoError, setVentasFormasPagoError] = useState<string | null>(null);
  const [ventasArticulosError, setVentasArticulosError] = useState<string | null>(null);
  const [ventasanteriorError, setVentasanteriorError] = useState<string | null>(null);
  const [utilidadanteriorError, setUtilidadanteriorError] = useState<string | null>(null);
  const [clientesanteriorError, setClientesanteriorError] = useState<string | null>(null);
  const [pedidosAnuladosAnteriorError, setPedidosAnuladosAnteriorError] = useState<string | null>(null);
  const [ventasFormasPagoAnteriorError, setVentasFormasPagoAnteriorError] = useState<string | null>(null);
  const [ventasArticulosAnteriorError, setVentasArticulosAnteriorError] = useState<string | null>(null);

  const filterReports = (data: ReportData[]): ReportData[] => {
    return data.filter(item => 
      (item.documento === "NOTA DE ENTREGA" || item.documento === "FACTURA") &&
      item.estado === "ACTIVO"
    );
  };

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const fetchReports = async () => {
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

      const fetchData = async (
        endpoint: string,
        setter: (data: ReportData[]) => void,
        loadingSetter: (loading: boolean) => void,
        errorSetter: (error: string | null) => void,
        formData: any
      ) => {
        loadingSetter(true);
        errorSetter(null);
      
        if (!urlServicio) {
          errorSetter('URL de servicio no proporcionada');
          loadingSetter(false);
          return;
        }
      
        try {
          const url = new URL(`LOCAL_NETWORK/REPORTES/${endpoint}`, urlServicio).toString();
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await response.json();
          setter(Array.isArray(data) ? data : []);
        } catch (err) {
          errorSetter('Error al obtener reportes');
        } finally {
          loadingSetter(false);
        }
      };

      await Promise.allSettled([
        fetchData('VENTAS', (data) => setVentas(filterReports(data)), setVentasLoading, setVentasError, formData),
        fetchData('UTILIDAD', setUtilidad, setUtilidadLoading, setUtilidadError, formData),
        fetchData('VENTAS_FORMASPAGO', setVentasFormasPago, setVentasFormasPagoLoading, setVentasFormasPagoError, formData),
        fetchData('VENTAS', (data) => setVentasanterior(filterReports(data)), setVentasanteriorLoading, setVentasanteriorError, formDataAnterior),
        fetchData('VENTAS_FORMASPAGO', setVentasFormasPagoAnterior, setVentasFormasPagoAnteriorLoading, setVentasFormasPagoAnteriorError, formDataAnterior),
      ]).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`La consulta ${index} falló:`, result.reason);
          }
        });
      });
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
        ventasLoading,
        utilidadLoading,
        clientesLoading,
        pedidosAnuladosLoading,
        ventasFormasPagoLoading,
        ventasArticulosLoading,
        ventasanteriorLoading,
        utilidadanteriorLoading,
        clientesanteriorLoading,
        pedidosAnuladosAnteriorLoading,
        ventasFormasPagoAnteriorLoading,
        ventasArticulosAnteriorLoading,
        ventasError,
        utilidadError,
        clientesError,
        pedidosAnuladosError,
        ventasFormasPagoError,
        ventasArticulosError,
        ventasanteriorError,
        utilidadanteriorError,
        clientesanteriorError,
        pedidosAnuladosAnteriorError,
        ventasFormasPagoAnteriorError,
        ventasArticulosAnteriorError,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export const useReports = () => useContext(ReportContext);