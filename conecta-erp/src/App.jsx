import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import DashboardHome from './modules/DashboardHome';
import ClientsModule from './modules/ClientsModule';
import ServicesModule from './modules/ServicesModule';
import InventoryModule from './modules/InventoryModule';
import ConfigModule from './modules/ConfigModule';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="servicios" element={<ServicesModule />} />
          <Route path="clientes" element={<ClientsModule />} />
          <Route path="inventario" element={<InventoryModule />} />
          <Route path="configuracion" element={<ConfigModule />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
