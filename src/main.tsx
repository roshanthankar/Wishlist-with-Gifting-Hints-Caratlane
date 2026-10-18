import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './shell/App'
import { loadFigmaFonts } from './proto/fonts'
import { startLiquidGlass } from './ui/liquidGlass'

// Wait briefly for Proxima Nova (with Figma metrics) so text doesn’t reflow on first paint.
loadFigmaFonts().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  startLiquidGlass()
})
