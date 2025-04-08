import { createContext, useState, useEffect, useContext, SetStateAction } from 'react';
import { useDateRange } from './date-range-context';
import { useSearchParams } from 'react-router-dom';

interface ReportState {
  data: any[];
  loading: boolean;
  error: string | null;
}

interface ReportContextType {
  ventas: ReportState;
  ventasArticulos: ReportState;
  ventasFormasPago: ReportState;
  ventasanterior: ReportState;
  ventasFormasPagoAnterior: ReportState;
  usuarios: any[];
}

const initialState: ReportState = { data: [], loading: false, error: null };

const ReportContext = createContext<ReportContextType>({
  ventas: initialState,
  ventasArticulos: initialState,
  ventasFormasPago: initialState,
  ventasanterior: initialState,
  ventasFormasPagoAnterior: initialState,
  usuarios: []
});

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const urlServicio = searchParams.get('urlServicio');
  const idUsuario = searchParams.get('idUsuario');
  const deviceID = searchParams.get('deviceID');

  const { dateRange } = useDateRange();

  const [ventas, setVentas] = useState<ReportState>(initialState);
  const [ventasArticulos, setVentasArticulos] = useState<ReportState>(initialState);
  const [ventasFormasPago, setVentasFormasPago] = useState<ReportState>(initialState);
  const [ventasanterior, setVentasanterior] = useState<ReportState>(initialState);
  const [ventasFormasPagoAnterior, setVentasFormasPagoAnterior] = useState<ReportState>(initialState);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to || !urlServicio) return;

    const fetchReports = async () => {
      const currentStart = new Date(dateRange.from!);
      const currentEnd = new Date(dateRange.to!);
      const rangeDuration = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - rangeDuration);

      const PeridoCombinado = {
        desde: `${previousStart.toISOString().split('T')[0]} 00:00`,
        hasta: `${currentEnd.toISOString().split('T')[0]} 23:59`,
      };

      const PeridoActual = {
        desde: `${currentStart.toISOString().split('T')[0]} 00:00`,
        hasta: `${currentEnd.toISOString().split('T')[0]} 23:59`,
      };

      const fetchCombinedData = async (
        endpoint: string,
        fechas: { desde: string; hasta: string },
        setCurrentState: React.Dispatch<SetStateAction<ReportState>>,
        setPreviousState?: React.Dispatch<SetStateAction<ReportState>> 
      ) => {
        try {
          setCurrentState(prev => ({ ...prev, loading: true, error: null }));
          if (setPreviousState) setPreviousState(prev => ({ ...prev, loading: true, error: null }));
      
          const formData = {
            datetime: 1,
            desde: fechas.desde,
            hasta: fechas.hasta,
            tablet: {
              deviceID,
              usuario: idUsuario,
              bodega: 1,
              fecha: new Date().toISOString(),
            },
          };
      
          const url = new URL(`LOCAL_NETWORK/REPORTES/${endpoint}`, urlServicio).toString();
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
      
          if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
          const data = await response.json();
      
          if (setPreviousState) {
            const dataActual = data.filter((item: { fechaCreacion: any; fechaEmision: any }) => {
              const fecha = new Date(item.fechaCreacion || item.fechaEmision);
              return fecha >= currentStart && fecha <= currentEnd;
            });
            const dataAnterior = data.filter((item: { fechaCreacion: any; fechaEmision: any }) => {
              const fecha = new Date(item.fechaCreacion || item.fechaEmision);
              return fecha >= previousStart && fecha < currentStart;
            });
  
            setCurrentState({ data: dataActual, loading: false, error: null });
            setPreviousState({ data: dataAnterior, loading: false, error: null });
          } else {
            setCurrentState({ data, loading: false, error: null });
          }
        } catch (error) {
          setCurrentState({ data: [], loading: false, error: error instanceof Error ? error.message : 'Error desconocido' });
          if (setPreviousState) {
            setPreviousState({ data: [], loading: false, error: error instanceof Error ? error.message : 'Error desconocido' });
          }
        }
      };      
      await Promise.allSettled([
        fetchCombinedData('VENTAS', PeridoCombinado, setVentas, setVentasanterior),
        fetchCombinedData('VENTAS_FORMASPAGO', PeridoCombinado, setVentasFormasPago, setVentasFormasPagoAnterior),
        fetchCombinedData('VENTAS_ARTICULOS', PeridoActual, setVentasArticulos)
      ]);
    };

    fetchReports();
  }, [dateRange, urlServicio, idUsuario, deviceID]);

  useEffect(() => {
    if (!urlServicio) return;
  
    const fetchUsuariosYRoles = async () => {
      try {
        const usuariosRes = await fetch(`${urlServicio.replace('REPORTES', 'LOCAL_NETWORK')}/USUARIO/GET`);
        const rolesRes = await fetch(`${urlServicio.replace('REPORTES', 'LOCAL_NETWORK')}/ROLES/GET`);
  
        const usuariosData = await usuariosRes.json();
        const rolesData = await rolesRes.json();
        const rolesMap = new Map(
          (Array.isArray(rolesData) ? rolesData : [])
            .filter(r => r.habilitado)
            .map(r => [r.id, r.nombre])
        );
  
        const usuariosConRol = (Array.isArray(usuariosData) ? usuariosData : []).map((usuario: any) => ({
          ...usuario,
          nombreRol: rolesMap.get(usuario.idRol) || 'SIN ROL'
        }));
        setUsuarios(usuariosConRol);
      } catch (err) {
        console.error('Error cargando usuarios o roles', err);
      }
    };
  
    fetchUsuariosYRoles();
  }, []);
  
  return (
    <ReportContext.Provider value={{ ventas, ventasArticulos, ventasFormasPago, ventasanterior, ventasFormasPagoAnterior, usuarios }}>
      {children}
    </ReportContext.Provider>
  );
}

export const useReports = () => useContext(ReportContext);
