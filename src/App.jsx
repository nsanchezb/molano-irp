import { Routes, Route, Navigate } from 'react-router-dom'
import { SurveyProvider } from './context/SurveyContext.jsx'
import Bienvenida from './pages/Bienvenida.jsx'
import Perfil from './pages/Perfil.jsx'

export default function App() {
  return (
    <SurveyProvider>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SurveyProvider>
  )
}
