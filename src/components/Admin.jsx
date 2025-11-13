import { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Admin() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [butcherForm, setButcherForm] = useState({ title: "", description: "", price_per_kg: 0 });
  const [groceryForm, setGroceryForm] = useState({ title: "", description: "", price: 0 });
  const [message, setMessage] = useState("");

  async function refreshOrders() {
    try {
      const res = await fetch(`${BACKEND}/api/admin/orders?auth_password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (res.ok) setOrders(data);
      else setMessage(data.detail || "Auth failed");
    } catch (e) {
      setMessage("Network error");
    }
  }

  async function addButcher() {
    try {
      const body = { ...butcherForm, available: true, image: null };
      const res = await fetch(`${BACKEND}/api/admin/butcher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Butcher item added");
      } else setMessage(data.detail || "Failed");
    } catch (e) { setMessage("Network error"); }
  }

  async function addGrocery() {
    try {
      const body = { ...groceryForm, available: true, image: null };
      const res = await fetch(`${BACKEND}/api/admin/grocery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Grocery item added");
      } else setMessage(data.detail || "Failed");
    } catch (e) { setMessage("Network error"); }
  }

  async function setStatus(id, status) {
    try {
      const res = await fetch(`${BACKEND}/api/admin/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Status updated");
        refreshOrders();
      } else setMessage(data.detail || "Failed");
    } catch (e) { setMessage("Network error"); }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white border rounded-lg p-4">
        <div className="font-semibold mb-2">Admin Password</div>
        <input type="password" className="border rounded px-2 py-1" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button onClick={refreshOrders} className="ml-2 px-3 py-1.5 bg-gray-900 text-white rounded">Load Orders</button>
        {message && <div className="text-sm text-gray-600 mt-2">{message}</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <div className="font-semibold">Add Butcher Item</div>
          <input className="w-full border rounded px-2 py-1" placeholder="Title" value={butcherForm.title} onChange={(e)=>setButcherForm({...butcherForm, title:e.target.value})} />
          <input className="w-full border rounded px-2 py-1" placeholder="Description" value={butcherForm.description} onChange={(e)=>setButcherForm({...butcherForm, description:e.target.value})} />
          <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" placeholder="Price per kg" value={butcherForm.price_per_kg} onChange={(e)=>setButcherForm({...butcherForm, price_per_kg:e.target.value})} />
          <button onClick={addButcher} className="w-full bg-rose-600 text-white rounded py-2">Add</button>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-2">
          <div className="font-semibold">Add Grocery Item</div>
          <input className="w-full border rounded px-2 py-1" placeholder="Title" value={groceryForm.title} onChange={(e)=>setGroceryForm({...groceryForm, title:e.target.value})} />
          <input className="w-full border rounded px-2 py-1" placeholder="Description" value={groceryForm.description} onChange={(e)=>setGroceryForm({...groceryForm, description:e.target.value})} />
          <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" placeholder="Price" value={groceryForm.price} onChange={(e)=>setGroceryForm({...groceryForm, price:e.target.value})} />
          <button onClick={addGrocery} className="w-full bg-emerald-600 text-white rounded py-2">Add</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="font-semibold mb-2">Orders</div>
        <div className="divide-y">
          {orders.map((o) => (
            <div key={o._id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.customer_name} • {o.payment_method}</div>
                  <div className="text-sm text-gray-600">{o.phone} • {o.address}</div>
                </div>
                <div className="font-semibold">{o.total?.toFixed ? o.total.toFixed(2) : o.total}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">Status: {o.status}</div>
              <div className="text-sm mt-2 grid sm:grid-cols-2 gap-2">
                {o.items?.map((it, idx) => (
                  <div key={idx} className="border rounded p-2 bg-gray-50">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-gray-600">{it.type === 'butcher' ? `${it.weight_kg} kg x ${it.unit_price}` : `${it.quantity} x ${it.unit_price}`}</div>
                    <div className="font-semibold">{it.subtotal?.toFixed ? it.subtotal.toFixed(2) : it.subtotal}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Pending","Confirmed","Ready for Pickup","Delivered"].map(s => (
                  <button key={s} onClick={()=>setStatus(o._id, s)} className={`px-2 py-1 rounded text-sm border ${o.status===s? 'bg-gray-900 text-white':'bg-white'}`}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
