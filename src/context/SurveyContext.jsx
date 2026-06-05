import { createContext, useContext, useState } from 'react'

const SurveyContext = createContext(null)

export function SurveyProvider({ children }) {
  const [survey, setSurvey] = useState({
    surveyType: null,       // 'ciudadania' | 'funcionario'
    level: null,            // 'nacional' | 'territorial'
    branch: null,           // rama del poder público
    sector: null,           // sector (rama ejecutiva)
    entityId: null,
    entityName: null,
    department: null,       // departamento (nivel territorial)
    phone: null,
    token: null,            // JWT tras verificación OTP
    consentAt: null,        // Unix timestamp del momento en que aceptó la política
  })

  const set = (fields) => setSurvey((prev) => ({ ...prev, ...fields }))
  const reset = () => setSurvey({
    surveyType: null, level: null, branch: null, sector: null,
    entityId: null, entityName: null, department: null, phone: null, token: null, consentAt: null,
  })

  return (
    <SurveyContext.Provider value={{ survey, set, reset }}>
      {children}
    </SurveyContext.Provider>
  )
}

export function useSurvey() {
  const ctx = useContext(SurveyContext)
  if (!ctx) throw new Error('useSurvey debe usarse dentro de SurveyProvider')
  return ctx
}
