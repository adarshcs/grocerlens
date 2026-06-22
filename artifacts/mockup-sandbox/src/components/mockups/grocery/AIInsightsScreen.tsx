export function AIInsightsScreen() {
  const insights = [
    {
      icon: "🥬",
      title: "Grow your own greens",
      body: "You spent $34.20 on leafy greens this month. A small herb garden kit (~$25 one-time) could save you up to $20/month within 6 weeks.",
      tag: "Grow at home",
      tagColor: "#dcfce7",
      tagText: "#15803d",
      cta: "See how",
    },
    {
      icon: "🏷️",
      title: "Switch to store brand dairy",
      body: "Swapping to Whole Foods 365 dairy saves an average of 22% vs name brands. Your dairy spend was $45.20 — potential saving: $9.94/month.",
      tag: "Quick win",
      tagColor: "#fef9c3",
      tagText: "#854d0e",
      cta: "Compare prices",
    },
    {
      icon: "📦",
      title: "Bulk buy protein this week",
      body: "Costco has chicken breast at $3.49/lb vs your usual $7.49/lb. Buying 10 lbs and freezing could save $40 this trip.",
      tag: "Bulk deal",
      tagColor: "#ede9fe",
      tagText: "#6d28d9",
      cta: "Add reminder",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-[#15803d] px-5 pt-12 pb-6">
        <p className="text-green-200 text-xs tracking-widest uppercase font-medium">AI Insights</p>
        <h1 className="text-white text-2xl font-bold mt-1">Smart suggestions</h1>
        <p className="text-green-200 text-sm mt-1">Based on your last 30 days of grocery spending</p>

        {/* Summary chip */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-3 flex items-center gap-3">
          <div className="text-3xl">✨</div>
          <div>
            <p className="text-white font-semibold text-sm">You could save up to <span className="text-yellow-300">$69.94/mo</span></p>
            <p className="text-green-200 text-xs">with 3 simple changes below</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 mt-4 space-y-4">
        {insights.map((ins, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{ins.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: ins.tagColor, color: ins.tagText }}
                  >
                    {ins.tag}
                  </span>
                </div>
                <h3 className="text-gray-800 font-bold text-sm mb-1">{ins.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{ins.body}</p>
                <button className="mt-3 text-[#15803d] text-xs font-semibold border border-[#15803d] rounded-full px-3 py-1">
                  {ins.cta}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* WhatsApp share */}
        <div className="bg-[#25d366] rounded-2xl p-4 flex items-center gap-3">
          <div className="text-3xl">📲</div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Send to family</p>
            <p className="text-green-100 text-xs">Share this month's insights via WhatsApp</p>
          </div>
          <button className="bg-white text-[#25d366] text-xs font-bold px-3 py-1.5 rounded-full">
            Send
          </button>
        </div>

        {/* Trend chart placeholder */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-gray-700 font-semibold text-sm mb-3">Monthly trend</h3>
          <div className="flex items-end gap-2 h-20">
            {[65, 80, 72, 90, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${h}%`,
                    background: i === 5 ? "#15803d" : "#dcfce7",
                  }}
                />
                <span className="text-gray-400 text-xs">{["J","F","M","A","M","J"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around">
        {[
          { icon: "📊", label: "Dashboard", active: false },
          { icon: "🧾", label: "Bills", active: false },
          { icon: "👨‍👩‍👧", label: "Family", active: false },
          { icon: "✨", label: "Insights", active: true },
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
