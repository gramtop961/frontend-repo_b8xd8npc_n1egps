import { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Shop({ cart, setCart }) {
  const [butcher, setButcher] = useState([]);
  const [grocery, setGrocery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [b, g] = await Promise.all([
          fetch(`${BACKEND}/api/butcher/raw`).then((r) => r.json()),
          fetch(`${BACKEND}/api/grocery/raw`).then((r) => r.json()),
        ]);
        setButcher(b.filter((x) => x.available));
        setGrocery(g.filter((x) => x.available));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addButcher = (item, weightKg) => {
    const qtyWeight = Math.max(0.1, Number(weightKg || 0));
    const subtotal = +(qtyWeight * item.price_per_kg).toFixed(2);
    setCart((prev) => [
      ...prev,
      {
        type: "butcher",
        item_id: item._id,
        title: item.title,
        unit_price: item.price_per_kg,
        weight_kg: qtyWeight,
        subtotal,
      },
    ]);
  };

  const addGrocery = (item, qty) => {
    const quantity = Math.max(1, Number(qty || 1));
    const subtotal = +(quantity * item.price).toFixed(2);
    setCart((prev) => [
      ...prev,
      {
        type: "grocery",
        item_id: item._id,
        title: item.title,
        unit_price: item.price,
        quantity,
        subtotal,
      },
    ]);
  };

  const total = cart.reduce((s, x) => s + x.subtotal, 0).toFixed(2);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Butcher Shop</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {butcher.map((b) => (
              <div key={b._id} className="border rounded-lg p-3 bg-white">
                <div className="font-medium">{b.title}</div>
                {b.image && <img src={b.image} className="mt-2 rounded" alt={b.title}/>} 
                <div className="text-sm text-gray-600">{b.description}</div>
                <div className="mt-2 text-rose-600 font-semibold">{b.price_per_kg} / kg</div>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" min="0.1" step="0.1" placeholder="kg" className="border rounded px-2 py-1 w-24" id={`w-${b._id}`}/>
                  <button onClick={() => addButcher(b, document.getElementById(`w-${b._id}`).value)} className="px-3 py-1.5 bg-gray-900 text-white rounded">Add</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Turkish Grocery</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grocery.map((g) => (
              <div key={g._id} className="border rounded-lg p-3 bg-white">
                <div className="font-medium">{g.title}</div>
                {g.image && <img src={g.image} className="mt-2 rounded" alt={g.title}/>} 
                <div className="text-sm text-gray-600">{g.description}</div>
                <div className="mt-2 text-emerald-600 font-semibold">{g.price} / unit</div>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" min="1" step="1" defaultValue={1} className="border rounded px-2 py-1 w-20" id={`q-${g._id}`}/>
                  <button onClick={() => addGrocery(g, document.getElementById(`q-${g._id}`).value)} className="px-3 py-1.5 bg-gray-900 text-white rounded">Add</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="bg-white border rounded-lg p-4 h-fit sticky top-24">
        <h3 className="font-semibold mb-3">Your Cart</h3>
        <div className="space-y-2 max-h-80 overflow-auto pr-1">
          {cart.length === 0 && <div className="text-sm text-gray-500">No items yet</div>}
          {cart.map((c, i) => (
            <div key={i} className="text-sm flex justify-between gap-2 border-b pb-1">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-gray-500">
                  {c.type === 'butcher' ? `${c.weight_kg} kg x ${c.unit_price}` : `${c.quantity} x ${c.unit_price}`}
                </div>
              </div>
              <div className="font-semibold">{c.subtotal.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{total}</span>
        </div>
        <Checkout cart={cart} setCart={setCart} total={Number(total)} />
      </aside>
    </div>
  );
}

function Checkout({ cart, setCart, total }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState("Cash on Delivery");
  const [status, setStatus] = useState(null);

  async function placeOrder() {
    if (cart.length === 0) return;
    const body = {
      customer_name: name || "Guest",
      phone,
      address,
      payment_method: pay,
      items: cart,
      total,
    };
    try {
      const res = await fetch(`${BACKEND}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Order placed! ID " + data._id);
        setCart([]);
        setName(""); setPhone(""); setAddress("");
      } else {
        setStatus(data.detail || "Failed to place order");
      }
    } catch (e) {
      setStatus("Network error");
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm text-gray-600">Checkout</div>
      <input className="w-full border rounded px-2 py-1" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
      <input className="w-full border rounded px-2 py-1" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
      <textarea className="w-full border rounded px-2 py-1" placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} />
      <select className="w-full border rounded px-2 py-1" value={pay} onChange={(e)=>setPay(e.target.value)}>
        <option>Cash on Delivery</option>
        <option>Card on Delivery</option>
      </select>
      <button onClick={placeOrder} className="w-full bg-rose-600 text-white rounded py-2">Place Order</button>
      {status && <div className="text-xs text-gray-600">{status}</div>}
    </div>
  );
}
