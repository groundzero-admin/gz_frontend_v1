import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. Import the router
import { HelmetProvider } from "react-helmet-async";





import './index.css'
import './color.css'
// import Landing_Page from './Landing_page.jsx'
import App from './App'
import ScrollToTop from './ScrollToTop'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
  
)