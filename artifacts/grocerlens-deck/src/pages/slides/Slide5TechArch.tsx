export default function Slide5TechArch() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#111827",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "7vh 8vw",
        boxSizing: "border-box",
        color: "white",
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          top: "-12vw",
          right: "-4vw",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          backgroundColor: "#15803d",
          opacity: 0.18,
          filter: "blur(5vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10vh",
          left: "6vw",
          width: "1.5vw",
          height: "1.5vw",
          borderRadius: "0.2vw",
          backgroundColor: "#f97316",
          opacity: 0.7,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50vh",
          right: "4vw",
          width: "2vw",
          height: "2vw",
          borderRadius: "50%",
          backgroundColor: "#15803d",
          opacity: 0.3,
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: "5vh", zIndex: 10 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5vw",
            padding: "0.5vh 1vw",
            backgroundColor: "rgba(21, 128, 61, 0.2)",
            borderRadius: "2vw",
            marginBottom: "2vh",
          }}
        >
          <div
            style={{
              width: "0.5vw",
              height: "0.5vw",
              backgroundColor: "#4ade80",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: "0.9vw",
              fontWeight: 700,
              color: "#4ade80",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Technical Architecture
          </span>
        </div>
        <h1
          style={{
            fontSize: "4vw",
            fontWeight: 800,
            color: "white",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Contract-first, full-stack
          <span style={{ color: "#f97316" }}>.</span>
        </h1>
      </div>

      {/* Three-column tech breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "2vw",
          flex: 1,
          zIndex: 10,
        }}
      >
        {/* Column 1: Mobile */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.8vh",
          }}
        >
          <div>
            <div
              style={{
                width: "2.5vw",
                height: "0.3vh",
                backgroundColor: "#15803d",
                marginBottom: "1.5vh",
              }}
            />
            <p
              style={{
                fontSize: "1.3vw",
                fontWeight: 700,
                color: "#4ade80",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Mobile
            </p>
          </div>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            Expo SDK 54
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            expo-router
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            React Native
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            iOS + Android
          </p>
        </div>

        {/* Column 2: Backend */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.8vh",
          }}
        >
          <div>
            <div
              style={{
                width: "2.5vw",
                height: "0.3vh",
                backgroundColor: "#f97316",
                marginBottom: "1.5vh",
              }}
            />
            <p
              style={{
                fontSize: "1.3vw",
                fontWeight: 700,
                color: "#fb923c",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              API + Data
            </p>
          </div>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            Express 5 · Node.js 24
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            PostgreSQL + Drizzle ORM
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            OpenAPI spec + Orval codegen
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            Clerk (Google + Apple sign-in)
          </p>
        </div>

        {/* Column 3: Services */}
        <div
          style={{
            backgroundColor: "rgba(21, 128, 61, 0.15)",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            display: "flex",
            flexDirection: "column",
            gap: "1.8vh",
          }}
        >
          <div>
            <div
              style={{
                width: "2.5vw",
                height: "0.3vh",
                backgroundColor: "#4ade80",
                marginBottom: "1.5vh",
              }}
            />
            <p
              style={{
                fontSize: "1.3vw",
                fontWeight: 700,
                color: "#4ade80",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Services
            </p>
          </div>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            GPT-4.1-mini — OCR + insights
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            SendGrid Inbound Parse
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            bills.codegreen.co.in
          </p>
          <p style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.85)", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            RevenueCat — in-app payments
          </p>
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
          color: "#6b7280",
          fontWeight: 500,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "2vh",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>GrocerLens</span>
          <span>/</span>
          <span>2026</span>
        </div>
        <span style={{ fontWeight: 700, color: "white" }}>05</span>
      </div>
    </div>
  );
}
