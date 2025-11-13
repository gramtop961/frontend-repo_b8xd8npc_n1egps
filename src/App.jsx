import { useState } from 'react'
import Header from './components/Header'
import Shop from './components/Shop'
import Admin from './components/Admin'

function App() {
  const [activeTab, setActiveTab] = useState('shop')
  const [cart, setCart] = useState([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} cartCount={cart.length} />
      <main className="py-6">
        {activeTab === 'shop' ? (
          <Shop cart={cart} setCart={setCart} />
        ) : (
          <Admin />
        )}
      </main>
      <footer className="text-center text-xs text-gray-500 py-6">Doar Plata numerar la livrare și Card la livrare.</footer>
    </div>
  )
}

export default App