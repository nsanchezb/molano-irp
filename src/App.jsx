import { Routes, Route, Navigate } from 'react-router-dom'
import { SurveyProvider } from './context/SurveyContext.jsx'
import Bienvenida from './pages/Bienvenida.jsx'
import Perfil from './pages/Perfil.jsx'
import Nivel from './pages/Nivel.jsx'
import EntidadNacional from './pages/EntidadNacional.jsx'
import EntidadTerritorial from './pages/EntidadTerritorial.jsx'
import ConfirmarEntidad from './pages/ConfirmarEntidad.jsx'

export default function App() {
  return (
    <SurveyProvider>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/nivel" element={<Nivel />} />
        <Route path="/entidad/rama" element={<EntidadNacional />} />
        <Route path="/entidad/territorial" element={<EntidadTerritorial />} />
        <Route path="/entidad/confirmar" element={<ConfirmarEntidad />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SurveyProvider>
  )
}
