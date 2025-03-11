import { UserSalesChart } from "@/Graficos/Promedio-salonero";
import { WeeklySalesComparison } from "@/Graficos/Ventas-semanales";
import { PaymentMethodsChart } from "@/Graficos/MetodosPago";
import { BusinessActivityHeatmap } from "@/Graficos/Map-Calor";
import { DatePickerWithRange } from "@/components/ui/DatePicker";
import { TopProductsChart } from "@/Graficos/Utilidad";
import { TicketPromedioChart } from "@/Graficos/Promedio-Usuario";
import { TotalVentasCard } from "@/Graficos/targets/ventas";
import { TotalEfectivoCard } from "@/Graficos/targets/efectivo";
import { TotalTarjetaCard } from "@/Graficos/targets/tarjeta";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <DatePickerWithRange />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="max-h-[125px]">
          <TotalVentasCard />
        </div>
        <div className="max-h-[125px]">
          <TotalEfectivoCard />
        </div>
        <div className="max-h-[125px]">
          <TotalTarjetaCard />
        </div>
        <div className="max-h-[450px]">
          <WeeklySalesComparison />
        </div>
        <div className="max-h-[450px]">
          <UserSalesChart />
        </div>
        <div className="max-h-[450px]">
          <PaymentMethodsChart />
        </div>
        <div className="max-h-[450px]">
          <TopProductsChart />
        </div>
        <div className="lg:col-span-2 max-h-[450px]">
          <BusinessActivityHeatmap />
        </div>
        <div className="max-h-[450px]">
          <TicketPromedioChart />
        </div>
        <div className="max-h-[450px]"></div>
      </div>
    </div>
  );
};