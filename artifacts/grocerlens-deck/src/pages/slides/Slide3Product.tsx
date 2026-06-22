const base = import.meta.env.BASE_URL;

export default function Slide3Product() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      {/* Geometric accents */}
      <div
        style={{
          position: "absolute",
          top: "8vh",
          right: "6vw",
          width: "1.5vw",
          height: "1.5vw",
          borderRadius: "0.2vw",
          backgroundColor: "#f97316",
          opacity: 0.6,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15vh",
          left: "46vw",
          width: "3vw",
          height: "3vw",
          borderRadius: "50%",
          backgroundColor: "#15803d",
          opacity: 0.07,
        }}
      />

      {/* Left — feature list */}
      <div
        style={{
          width: "52vw",
          height: "100vh",
          padding: "7vh 8vw 7vh 8vw",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          zIndex: 10,
        }}
      >
        {/* Label */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5vw",
            padding: "0.5vh 1vw",
            backgroundColor: "rgba(21, 128, 61, 0.1)",
            borderRadius: "2vw",
            marginBottom: "2vh",
            width: "fit-content",
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
            The Product
          </span>
        </div>

        <h1
          style={{
            fontSize: "4vw",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 5vh 0",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Everything in one app
          <span style={{ color: "#f97316" }}>.</span>
        </h1>

        {/* Feature rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5vh", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw" }}>
            <div
              style={{
                minWidth: "0.4vw",
                width: "0.4vw",
                height: "3.5vh",
                backgroundColor: "#15803d",
                borderRadius: "1vw",
                marginTop: "0.3vh",
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 0.4vh 0",
                }}
              >
                Scan via camera, gallery, or email forwarding
              </p>
              <p style={{ fontSize: "1.2vw", color: "#4b5563", margin: 0 }}>
                Forward receipts to your household address — PDF or photo.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw" }}>
            <div
              style={{
                minWidth: "0.4vw",
                width: "0.4vw",
                height: "3.5vh",
                backgroundColor: "#f97316",
                borderRadius: "1vw",
                marginTop: "0.3vh",
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 0.4vh 0",
                }}
              >
                AI extracts store, date, total, and categories
              </p>
              <p style={{ fontSize: "1.2vw", color: "#4b5563", margin: 0 }}>
                GPT-4.1-mini parses itemised categories automatically in INR.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw" }}>
            <div
              style={{
                minWidth: "0.4vw",
                width: "0.4vw",
                height: "3.5vh",
                backgroundColor: "#15803d",
                borderRadius: "1vw",
                marginTop: "0.3vh",
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 0.4vh 0",
                }}
              >
                Shared household with invite codes
              </p>
              <p style={{ fontSize: "1.2vw", color: "#4b5563", margin: 0 }}>
                Every family member sees the same bills in real time.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw" }}>
            <div
              style={{
                minWidth: "0.4vw",
                width: "0.4vw",
                height: "3.5vh",
                backgroundColor: "#f97316",
                borderRadius: "1vw",
                marginTop: "0.3vh",
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "1.6vw",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 0.4vh 0",
                }}
              >
                Monthly insights with category drill-down and AI tips
              </p>
              <p style={{ fontSize: "1.2vw", color: "#4b5563", margin: 0 }}>
                Tap any category to see individual bills. AI surfaces patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — illustration */}
      <div
        style={{
          width: "48vw",
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "40vw",
            height: "40vw",
            backgroundColor: "rgba(21, 128, 61, 0.04)",
            borderRadius: "50%",
            right: "-8vw",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <img
          src={`${base}illust-family.png`}
          crossOrigin="anonymous"
          alt="Family sharing grocery data"
          style={{
            width: "80%",
            height: "80%",
            objectFit: "contain",
            position: "relative",
            zIndex: 2,
            marginRight: "2vw",
          }}
        />
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
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", gap: "2vw" }}>
          <span>GrocerLens</span>
          <span>/</span>
          <span>2026</span>
        </div>
        <span style={{ fontWeight: 700, color: "#111827" }}>03</span>
      </div>
    </div>
  );
}
