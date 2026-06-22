export function DetailScreen() {
  const items = [
    { name: "Organic Chicken Breast", qty: "2 lbs", price: 14.98, category: "Meat" },
    { name: "Almond Milk", qty: "1 gal", price: 4.99, category: "Dairy" },
    { name: "Baby Spinach", qty: "5 oz", price: 3.49, category: "Produce" },
    { name: "Greek Yogurt 4pk", qty: "1 pack", price: 6.99, category: "Dairy" },
    { name: "Brown Rice", qty: "2 lbs", price: 3.79, category: "Grains" },
    { name: "Blueberries", qty: "1 pint", price: 4.99, category: "Produce" },
    { name: "Protein Bar 6pk", qty: "1 box", price: 12.99, category: "Snacks" },
  ];

  const members = [
    { name: "You", initials: "SM", share: 42.12, color: "#15803d" },
    { name: "Jamie", initials: "JT", share: 28.08, color: "#22c55e" },
    { name: "Alex", initials: "AK", share: 14.10, color: "#4ade80" },
  ];

  const categoryColors: Record<string, string> = {
    Meat: "#fde68a",
    Dairy: "#bfdbfe",
    Produce: "#bbf7d0",
    Grains: "#fed7aa",
    Snacks: "#fecaca",
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-[#15803d] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">←</span>
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Whole Foods</h1>
            <p className="text-green-200 text-xs">Jun 22, 2026 · 14 items</p>
          </div>
          <div className="ml-auto">
            <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
              Auto-scanned ✓
            </span>
          </div>
        </div>
        <div className="flex justify-between bg-white/10 rounded-2xl p-3">
          <div className="text-center">
            <p className="text-green-200 text-xs">Subtotal</p>
            <p className="text-white font-bold">$76.32</p>
          </div>
          <div className="text-center">
            <p className="text-green-200 text-xs">Tax</p>
            <p className="text-white font-bold">$4.58</p>
          </div>
          <div className="text-center">
            <p className="text-green-200 text-xs">Total</p>
            <p className="text-white font-bold text-lg">$80.90</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6">
        {/* Family split */}
        <div className="mt-4 mb-4 bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-gray-700 font-semibold text-sm mb-3">Split between</h2>
          <div className="flex gap-3">
            {members.map((m) => (
              <div key={m.name} className="flex-1 text-center">
                <div
                  className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold mb-1"
                  style={{ background: m.color }}
                >
                  {m.initials}
                </div>
                <p className="text-xs text-gray-600 font-medium">{m.name}</p>
                <p className="text-sm font-bold text-gray-800">${m.share.toFixed(2)}</p>
              </div>
            ))}
            <div className="flex-1 text-center">
              <button className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-[#f0fdf4] border-2 border-dashed border-green-300 text-green-500 text-lg font-bold mb-1">
                +
              </button>
              <p className="text-xs text-gray-400">Invite</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-gray-800 font-semibold text-sm">Itemized bill</h2>
          <button className="text-[#15803d] text-xs font-semibold">View original</button>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.name} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: categoryColors[item.category] || "#e5e7eb",
                  color: "#374151",
                }}
              >
                {item.category}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">{item.qty}</p>
              </div>
              <p className="text-sm font-bold text-gray-800">${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
