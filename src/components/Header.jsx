import { ShoppingCart, Store, Shield } from "lucide-react";

export default function Header({ activeTab, setActiveTab, cartCount }) {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="text-rose-600" />
          <span className="font-semibold text-gray-800">Hybrid Market</span>
        </div>
        <nav className="flex items-center gap-3">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'shop' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('shop')}
          >
            Shop
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 ${activeTab === 'admin' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('admin')}
          >
            <Shield size={16}/> Admin
          </button>
          <div className="relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
