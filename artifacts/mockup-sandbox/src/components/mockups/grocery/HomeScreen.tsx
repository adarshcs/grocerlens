export function HomeScreen() {
  const categories = [
    { name: "Produce", amount: 62.40, pct: 28, color: "#16a34a" },
    { name: "Dairy", amount: 45.20, pct: 20, color: "#22c55e" },
    { name: "Meat", amount: 89.50, pct: 40, color: "#15803d" },
    { name: "Snacks", amount: 27.80, pct: 12, color: "#86efac" },
  ];

  const recent = [
    { store: "Whole Foods", date: "Today", amount: 84.30, icon: "🛒" },
    { store: "Trader Joe's", date: "Yesterday", amount: 47.60, icon: "🛍️" },
    { store: "Costco", date: "Jun 20", amount: 132.45, icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Status bar */}
      <div className="bg-[#15803d] px-5 pt-12 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-green-200 text-xs font-medium tracking-widest uppercase">June 2026</p>
            <h1 className="text-white text-2xl font-bold mt-1">GrocerLens</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">SM</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-700 -ml-3 flex items-center justify-center">
              <span className="text-white text-xs font-bold">JT</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white -ml-3 flex items-center justify-center">
              <span className="text-green-700 text-xs font-bold">+2</span>
            </div>
          </div>
        </div>

        {/* Total spend card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <p className="text-green-200 text-xs font-medium">Total this month</p>
          <p className="text-white text-4xl font-bold mt-1">$224.<span className="text-2xl">90</span></p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-green-300 text-xs">↑ 8.2% vs last month</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1.5 bg-white/20 rounded-full">
              <div className="h-1.5 bg-white rounded-full" style={{ width: "75%" }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-green-200 text-xs">$224.90 spent</span>
              <span className="text-green-200 text-xs">$300 budget</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24">
        {/* Period selector */}
        <div className="flex gap-2 mt-4 mb-5">
          {["Day", "Week", "Month", "Year"].map((p, i) => (
            <button
              key={p}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                i === 2
                  ? "bg-[#15803d] text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Breakdown */}
        <h2 className="text-gray-800 font-semibold text-sm mb-3">Spending by category</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
          {/* Donut placeholder */}
          <div className="flex gap-4 items-center">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#dcfce7" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#15803d" strokeWidth="4"
                  strokeDasharray="40 60" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="4"
                  strokeDasharray="20 80" strokeDashoffset="-40" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#86efac" strokeWidth="4"
                  strokeDasharray="28 72" strokeDashoffset="-60" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4ade80" strokeWidth="4"
                  strokeDasharray="12 88" strokeDashoffset="-88" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">100%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {categories.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-xs text-gray-600">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-800">${c.amount.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1">({c.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent bills */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-gray-800 font-semibold text-sm">Recent bills</h2>
          <button className="text-[#15803d] text-xs font-semibold">See all</button>
        </div>
        <div className="space-y-2">
          {recent.map((r) => (
            <div key={r.store} className="bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-xl">
                {r.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{r.store}</p>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">${r.amount.toFixed(2)}</p>
                <span className="text-xs text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full">Auto-scanned</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        {[
          { icon: "📊", label: "Dashboard", active: true },
          { icon: "🧾", label: "Bills", active: false },
          { icon: "👨‍👩‍👧", label: "Family", active: false },
          { icon: "✨", label: "Insights", active: false },
        ].map((n) => (
          <button key={n.label} className="flex flex-col items-center gap-0.5">
            <span className="text-lg">{n.icon}</span>
            <span className={`text-xs ${n.active ? "text-[#15803d] font-semibold" : "text-gray-400"}`}>
              {n.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
