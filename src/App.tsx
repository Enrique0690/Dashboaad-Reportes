import { UserSalesChart } from "./Graficos/Promedio-salonero"
import { WeeklySalesComparison } from "./Graficos/Ventas-semanales"
import { PaymentMethodsChart } from "./Graficos/MetodosPago"
import { BusinessActivityHeatmap } from "./Graficos/Map-Calor"
import { DatePickerWithRange } from "./components/ui/DatePicker"
import { TopProductsChart } from "./Graficos/Utilidad"
import { TicketPromedioChart } from "./Graficos/Promedio-Usuario"

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Contenedor para el título y el botón */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <DatePickerWithRange />
      </div>

      {/* Grid para los gráficos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className=" max-h-[600px] overflow-hidden">
          <WeeklySalesComparison />
        </div>
        <div className=" max-h-[600px] overflow-hidden">
          <UserSalesChart />
        </div>
        <div className=" max-h-[600px] overflow-hidden">
          <PaymentMethodsChart />
        </div>
        <div className=" max-h-[600px] overflow-hidden">
          <TopProductsChart />
        </div>
        <div className="lg:col-span-2 max-h-[600px] overflow-hidden">
          <BusinessActivityHeatmap />
        </div>
        <div className=" max-h-[600px] overflow-hidden">
          <TicketPromedioChart />
        </div>
        <div className=" max-h-[400px] overflow-hidden"></div>
      </div>
    </div>
  )
}

export default App
