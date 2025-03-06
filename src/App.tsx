import { AverageTicketChart } from "./Graficos/Promedio-salonero";
import { WeeklySalesComparison } from "./Graficos/Ventas-semanales";
import { PaymentMethodsChart } from "./Graficos/MetodosPago";
import { UserSalesComparisonChart } from "./Graficos/users";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-4 shadow-md rounded-md"> <WeeklySalesComparison /></div>
        <div className="bg-white p-4 shadow-md rounded-md"> <AverageTicketChart /> </div>
        <div className="bg-white p-4 shadow-md rounded-md"> <PaymentMethodsChart /></div>
        <div className="bg-white p-4 shadow-md rounded-md">Gráfico 4</div>
        <div className="bg-white p-4 shadow-md rounded-md"> <UserSalesComparisonChart /> </div>
        <div className="bg-white p-4 shadow-md rounded-md">Gráfico 6</div>
        <div className="bg-white p-4 shadow-md rounded-md">Gráfico 7</div>
        <div className="bg-white p-4 shadow-md rounded-md">Gráfico 8</div>
      </div>
    </div>
  );
}

export default App;
