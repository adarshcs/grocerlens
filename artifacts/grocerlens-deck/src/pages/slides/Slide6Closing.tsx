export default function Slide6Closing() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Background circle */}
      <div
        style={{
          position: "absolute",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          backgroundColor: "rgba(21, 128, 61, 0.05)",
          right: "-15vw",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      {/* Geometric accents */}
      <div
        style={{
          position: "absolute",
          top: "12vh",
          left: "8vw",
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
          bottom: "15vh",
          right: "8vw",
          width: "1.5vw",
          height: "1.5vw",
          borderRadius: "0.2vw",
          backgroundColor: "#15803d",
          opacity: 0.5,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20vh",
          right: "30vw",
          width: "1vw",
          height: "1vw",
          borderRadius: "50%",
          border: "0.18vw solid #f97316",
          opacity: 0.4,
        }}
      />

      {/* Centered content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          zIndex: 10,
          maxWidth: "65vw",
          marginLeft: "8vw",
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "4vh" }}>
          <div
            style={{
              width: "2vw",
              height: "2vw",
              backgroundColor: "#15803d",
              borderRadius: "0.4vw",
            }}
          />
          <span
            style={{
              fontSize: "1.5vw",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            GrocerLens
          </span>
        </div>

        <h1
          style={{
            fontSize: "6vw",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 1.5vh 0",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            textWrap: "balance",
          }}
        >
          Track every rupee
          <span style={{ color: "#15803d" }}>.</span>
        </h1>
        <h2
          style={{
            fontSize: "4.5vw",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 5vh 0",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Share every receipt
          <span style={{ color: "#f97316" }}>.</span>
        </h2>

        <div
          style={{
            width: "5vw",
            height: "0.3vh",
            backgroundColor: "#15803d",
            marginBottom: "4vh",
          }}
        />

        <div style={{ display: "flex", gap: "5vw" }}>
          <div>
            <p
              style={{
                fontSize: "0.85vw",
                fontWeight: 700,
                color: "#9ca3af",
                margin: "0 0 0.5vh 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Available on
            </p>
            <p
              style={{
                fontSize: "1.4vw",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              App Store + Google Play
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "0.85vw",
                fontWeight: 700,
                color: "#9ca3af",
                margin: "0 0 0.5vh 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Contact
            </p>
            <p
              style={{
                fontSize: "1.4vw",
                fontWeight: 700,
                color: "#15803d",
                margin: 0,
              }}
            >
              contact@grocerlens.app
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "3.5vh",
          left: "8vw",
          right: "8vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <span style={{ fontWeight: 700, color: "#111827" }}>06</span>
      </div>
    </div>
  );
}
