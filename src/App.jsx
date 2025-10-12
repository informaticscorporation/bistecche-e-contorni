import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useState, useEffect, use } from "react"
import Dashboard from "./Page/Dashboard"
import Home from "./Page/Home"
import Carrello from "./Page/Carrello"
import './App.css'
import Prodotto from "./Page/Prodotto"

function App() {
  const [count , setCount] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState([])

  useEffect (() => {
    setCount(0)
    setSelectedProduct([])
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home count={count} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prodotto/:id" element={<Prodotto selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} count={count} setCount={setCount} />} />
        <Route path="/carrello" element={<Carrello selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} count={count} setCount={setCount} />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
