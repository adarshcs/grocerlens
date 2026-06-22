export default function Slide2Problem() {
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
          top: "10vh",
          right: "8vw",
          width: "2.5vw",
          height: "2.5vw",
          borderRadius: "50%",
          backgroundColor: "#f97316",
          opacity: 0.15,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8vh",
          left: "4vw",
          width: "5vw",
          height: "5vw",
          borderRadius: "50%",
          backgroundColor: "#15803d",
          opacity: 0.06,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "45vh",
          right: "5vw",
          width: "1.2vw",
          height: "1.2vw",
          borderRadius: "0.2vw",
          backgroundColor: "#15803d",
          opacity: 0.5,
          transform: "rotate(45deg)",
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: "6vh" }}>
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
            The Problem
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
          Grocery spending is a blind spot
          <span style={{ color: "#f97316" }}>.</span>
        </h1>
      </div>

      {/* Four problem cards in a 2×2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "2.5vh 3vw",
          flex: 1,
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
              fontSize: "1.6vw",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Largest untracked household expense
          </p>
        </div>

        {/* Card 2 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
              fontSize: "1.6vw",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Paper receipts vanish; spreadsheets don't last
          </p>
        </div>

        {/* Card 3 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
              fontSize: "1.6vw",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Families have no shared view of food spending
          </p>
        </div>

        {/* Card 4 */}
        <div
          style={{
            backgroundColor: "rgba(21, 128, 61, 0.06)",
            borderRadius: "1vw",
            padding: "3vh 2.5vw",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
              fontSize: "1.6vw",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            No app handles INR + household sharing + receipt OCR
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
        <span style={{ fontWeight: 700, color: "#111827" }}>02</span>
      </div>
    </div>
  );
}
