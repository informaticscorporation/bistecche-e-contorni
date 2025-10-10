import { BrowserRouter, Route, Routes } from "react-router-dom"
import Dashboard from "./Page/Dashboard"
import Home from "./Page/Home"
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
