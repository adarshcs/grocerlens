export default function Slide4BusinessModel() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "7vh 8vw",
        boxSizing: "border-box",
      }}
    >
      {/* Geometric accents */}
      <div
        style={{
          position: "absolute",
          top: "12vh",
          right: "9vw",
          width: "2vw",
          height: "2vw",
          borderRadius: "50%",
          backgroundColor: "#f97316",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "18vh",
          left: "3vw",
          width: "1.2vw",
          height: "1.2vw",
          borderRadius: "0.2vw",
          backgroundColor: "#15803d",
          opacity: 0.5,
          transform: "rotate(45deg)",
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: "5vh" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5vw",
            padding: "0.5vh 1vw",
            backgroundColor: "rgba(21, 128, 61, 0.1)",
            borderRadius: "2vw",
            marginBottom: "2vh",
          }}
        >
          <div
            style={{
              width: "0.5vw",
              height: "0.5vw",
              backgroundColor: "#15803d",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: "0.9vw",
              fontWeight: 700,
              color: "#15803d",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Business Model
          </span>
        </div>
        <h1
          style={{
            fontSize: "4.5vw",
            fontWeight: 800,
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Freemium, built for families
          <span style={{ color: "#f97316" }}>.</span>
        </h1>
      </div>

      {/* Two tier cards side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3vw",
          flex: 1,
        }}
      >
        {/* Free tier */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.2vw",
            padding: "4vh 3vw",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.9vw",
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 1.5vh 0",
              }}
            >
              Free Tier
            </p>
            <div
              style={{
                fontSize: "4vw",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              ₹0
            </div>
            <div
              style={{
                width: "3vw",
                height: "0.3vh",
                backgroundColor: "#9ca3af",
                margin: "2vh 0",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#d1d5db",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "1.4vw", color: "#374151", fontWeight: 500 }}>
                4 receipt scans / month
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#d1d5db",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "1.4vw", color: "#374151", fontWeight: 500 }}>
                4 AI insight refreshes / month
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#d1d5db",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "1.4vw", color: "#374151", fontWeight: 500 }}>
                Household sharing included
              </span>
            </div>
          </div>
        </div>

        {/* Premium tier */}
        <div
          style={{
            backgroundColor: "#15803d",
            borderRadius: "1.2vw",
            padding: "4vh 3vw",
            boxShadow: "0 4px 24px rgba(21, 128, 61, 0.25)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-4vw",
              right: "-4vw",
              width: "14vw",
              height: "14vw",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />
          <div>
            <p
              style={{
                fontSize: "0.9vw",
                fontWeight: 700,
                color: "rgba(255,255,255,0.75)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 1.5vh 0",
              }}
            >
              Premium
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1.5vw" }}>
              <div
                style={{
                  fontSize: "4vw",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                ₹99
              </div>
              <div
                style={{
                  fontSize: "1.3vw",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                / month
              </div>
            </div>
            <div
              style={{
                fontSize: "1.2vw",
                color: "rgba(255,255,255,0.65)",
                marginTop: "0.5vh",
              }}
            >
              or ₹799 / year
            </div>
            <div
              style={{
                width: "3vw",
                height: "0.3vh",
                backgroundColor: "#f97316",
                margin: "2vh 0",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#f97316",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "1.4vw", color: "white", fontWeight: 500 }}>
                Unlimited receipt scans
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#f97316",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "1.4vw", color: "white", fontWeight: 500 }}>
                Unlimited AI insight refreshes
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
              <div
                style={{
                  width: "0.6vw",
                  height: "0.6vw",
                  borderRadius: "50%",
                  backgroundColor: "#f97316",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "1.4vw", color: "white", fontWeight: 500 }}>
                In-app purchase via RevenueCat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "3vh",
          fontSize: "0.85vw",
          color: "#9ca3af",
          fontWeight: 500,
          borderTop: "1px solid rgba(0,0,0,0.05)",
          paddingTop: "2vh",
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>GrocerLens</span>
          <span>/</span>
          <span>2026</span>
        </div>
        <span style={{ fontWeight: 700, color: "#111827" }}>04</span>
      </div>
    </div>
  );
}
