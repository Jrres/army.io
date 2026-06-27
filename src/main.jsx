import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Canvas from "./Canvas.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<App />}>
        </Route>
        <Route path = "/game" element = {<Canvas width = "1980" height = "1080" />}>
        </Route>
      </Routes>
    </BrowserRouter>
    
  </StrictMode>,
)
