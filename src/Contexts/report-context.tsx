import { createContext, useState, useEffect, useContext } from 'react';
import { useDateRange } from './date-range-context';
import { useSearchParams } from 'react-router-dom';

interface ReportData {
  [key: string]: any;
}

interface ReportContextType {
  ventas: ReportData[];
  utilidad: ReportData[];
  ventasFormasPago: ReportData[];
  ventasanterior: ReportData[];
  ventasFormasPagoAnterior: ReportData[];
  ventasLoading: boolean;
  utilidadLoading: boolean;
  ventasFormasPagoLoading: boolean;
  ventasanteriorLoading: boolean;
  ventasFormasPagoAnteriorLoading: boolean;
  ventasError: string | null;
  utilidadError: string | null;
  ventasFormasPagoError: string | null;
  ventasanteriorError: string | null;
  ventasFormasPagoAnteriorError: string | null;
}

const ReportContext = createContext<ReportContextType>({
  ventas: [],
  utilidad: [],
  ventasFormasPago: [],
  ventasanterior: [],
  ventasFormasPagoAnterior: [],
  ventasLoading: false,
  utilidadLoading: false,
  ventasFormasPagoLoading: false,
  ventasanteriorLoading: false,
  ventasFormasPagoAnteriorLoading: false,
  ventasError: null,
  utilidadError: null,
  ventasFormasPagoError: null,
  ventasanteriorError: null,
  ventasFormasPagoAnteriorError: null,
});

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const urlServicio = searchParams.get('urlServicio');
  const idUsuario = searchParams.get('idUsuario');
  const deviceID = searchParams.get('deviceID');

  const { dateRange } = useDateRange();
  const [ventas, setVentas] = useState<ReportData[]>([]);
  const [utilidad, setUtilidad] = useState<ReportData[]>([]);
  const [ventasFormasPago, setVentasFormasPago] = useState<ReportData[]>([]);
  const [ventasanterior, setVentasanterior] = useState<ReportData[]>([]);
  const [ventasFormasPagoAnterior, setVentasFormasPagoAnterior] = useState<ReportData[]>([]);

  const [ventasLoading, setVentasLoading] = useState(false);
  const [utilidadLoading, setUtilidadLoading] = useState(false);
  const [ventasFormasPagoLoading, setVentasFormasPagoLoading] = useState(false);
  const [ventasanteriorLoading, setVentasanteriorLoading] = useState(false);
  const [ventasFormasPagoAnteriorLoading, setVentasFormasPagoAnteriorLoading] = useState(false);

  const [ventasError, setVentasError] = useState<string | null>(null);
  const [utilidadError, setUtilidadError] = useState<string | null>(null);
  const [ventasFormasPagoError, setVentasFormasPagoError] = useState<string | null>(null);
  const [ventasanteriorError, setVentasanteriorError] = useState<string | null>(null);
  const [ventasFormasPagoAnteriorError, setVentasFormasPagoAnteriorError] = useState<string | null>(null);

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
        ventasFormasPago,
        ventasanterior,
        ventasFormasPagoAnterior,
        ventasLoading,
        utilidadLoading,
        ventasFormasPagoLoading,
        ventasanteriorLoading,
        ventasFormasPagoAnteriorLoading,
        ventasError,
        utilidadError,
        ventasFormasPagoError,
        ventasanteriorError,
        ventasFormasPagoAnteriorError
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export const useReports = () => useContext(ReportContext);