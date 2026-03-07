import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initFromSQLite } from './data/dataService.js'

const root = createRoot(document.getElementById('root'))

initFromSQLite().then(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
