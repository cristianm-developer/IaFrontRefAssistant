import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { mountIaFrontRefAssistant } from '@cristianmpx/aiui-assistant'
import config from '../iafrontrefassistant.config'
import App from './App'

mountIaFrontRefAssistant(config)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
