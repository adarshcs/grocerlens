const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
      }}
    >
      {/* Geometric accents */}
      <div
        style={{
          position: "absolute",
          top: "15vh",
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
          bottom: "20vh",
          left: "40vw",
          width: "4vw",
          height: "4vw",
          borderRadius: "50%",
          backgroundColor: "#15803d",
          opacity: 0.08,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10vh",
          right: "45vw",
          width: "1.5vw",
          height: "1.5vw",
          borderRadius: "0.2vw",
          backgroundColor: "#15803d",
          opacity: 0.7,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "12vh",
          right: "8vw",
          width: "1vw",
          height: "1vw",
          borderRadius: "50%",
          border: "0.18vw solid #f97316",
          opacity: 0.35,
        }}
      />

      {/* Left content */}
      <div
        style={{
          width: "45vw",
          height: "100vh",
          padding: "6vh 8vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
          <div
            style={{
              width: "1.5vw",
              height: "1.5vw",
              backgroundColor: "#15803d",
              borderRadius: "0.3vw",
            }}
          />
          <span
            style={{
              fontSize: "1.2vw",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            GrocerLens
          </span>
        </div>

        {/* Hero copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh", marginTop: "-8vh" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5vw",
              padding: "0.5vh 1vw",
              backgroundColor: "rgba(21, 128, 61, 0.1)",
              borderRadius: "2vw",
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
              Product Overview
            </span>
          </div>

          <h1
            style={{
              fontSize: "5.5vw",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.03em",
              textWrap: "balance",
            }}
          >
            Grocer
            <span style={{ color: "#15803d" }}>Lens</span>
            <span style={{ color: "#f97316" }}>.</span>
          </h1>

          <p
            style={{
              fontSize: "1.5vw",
              color: "#4b5563",
              lineHeight: 1.5,
              margin: 0,
              maxWidth: "28vw",
              fontWeight: 400,
            }}
          >
            Household grocery expense tracking — scan receipts, get AI insights, share with family.
          </p>

          <p
            style={{
              fontSize: "1.2vw",
              color: "#6b7280",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Built for Indian households. Available on iOS &amp; Android.
          </p>

          <div
            style={{
              width: "4vw",
              height: "0.3vh",
              backgroundColor: "#15803d",
              marginTop: "0.5vh",
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: "2vw",
            fontSize: "0.85vw",
            color: "#9ca3af",
            fontWeight: 500,
          }}
        >
          <span>GrocerLens</span>
          <span>/</span>
          <span>2026</span>
        </div>
      </div>

      {/* Right illustration side */}
      <div
        style={{
          width: "55vw",
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
            width: "45vw",
            height: "45vw",
            backgroundColor: "rgba(21, 128, 61, 0.04)",
            borderRadius: "50%",
            right: "-10vw",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <img
          src={`${base}illust-scan.png`}
          crossOrigin="anonymous"
          alt="Receipt scanning illustration"
          style={{
            width: "75%",
            height: "75%",
            objectFit: "contain",
            position: "relative",
            zIndex: 2,
            marginRight: "4vw",
          }}
        />
      </div>
    </div>
  );
}
