import { Routes, Route, Navigate } from 'react-router-dom'
import Bienvenida from './pages/Bienvenida.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Bienvenida />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
