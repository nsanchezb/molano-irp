import { Routes, Route, Navigate } from 'react-router-dom'
import { SurveyProvider } from './context/SurveyContext.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import Bienvenida from './pages/Bienvenida.jsx'
import Perfil from './pages/Perfil.jsx'
import Nivel from './pages/Nivel.jsx'
import EntidadNacional from './pages/EntidadNacional.jsx'
import EntidadTerritorial from './pages/EntidadTerritorial.jsx'
import ConfirmarEntidad from './pages/ConfirmarEntidad.jsx'
import IngresoCelular from './pages/IngresoCelular.jsx'
import IngresoOTP from './pages/IngresoOTP.jsx'
import Cuestionario from './pages/Cuestionario.jsx'
import Gracias from './pages/Gracias.jsx'
import PoliticaDatos from './pages/PoliticaDatos.jsx'
import DashboardLogin from './pages/dashboard/Login.jsx'
import DashboardRanking from './pages/dashboard/Ranking.jsx'
import DashboardDetalle from './pages/dashboard/Detalle.jsx'

export default function App() {
  return (
    <SurveyProvider>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/nivel" element={<Nivel />} />
        <Route path="/entidad/rama" element={<EntidadNacional />} />
        <Route path="/entidad/territorial" element={<EntidadTerritorial />} />
        <Route path="/entidad/confirmar" element={<ConfirmarEntidad />} />
        <Route path="/verificar" element={<IngresoCelular />} />
        <Route path="/verificar/codigo" element={<IngresoOTP />} />
        <Route path="/cuestionario" element={<Cuestionario />} />
        <Route path="/gracias" element={<Gracias />} />
        <Route path="/politica-datos" element={<PoliticaDatos />} />
        <Route path="/dashboard/login" element={<DashboardLogin />} />
        <Route path="/dashboard" element={<DashboardRanking />} />
        <Route path="/dashboard/entidad/:entityId" element={<DashboardDetalle />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SurveyProvider>
  )
}
