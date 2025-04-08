export const formatDate = (iso: string) => {
    const fecha = new Date(iso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear()).slice(-2);
    return `${dia}/${mes}/${anio}`;
  };

 export const formatNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toLocaleString('es-EC');
  };
  
 export const formatCurrency = (value: number) => {
    return `$${formatNumber(value)}`;
  };