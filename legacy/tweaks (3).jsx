/* global window, React */
const { useEffect, useState } = React;

function TweaksPanel({ density, onChange }) {
  return (
    <div className="tweaks-panel">
      <h5>Tweaks</h5>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--brown-500)", fontWeight: 600, marginBottom: 6, letterSpacing: "0.04em" }}>Density</div>
          <div className="seg">
            <button className={density === "comfortable" ? "on" : ""} onClick={() => onChange("comfortable")}>Comfortable</button>
            <button className={density === "compact" ? "on" : ""} onClick={() => onChange("compact")}>Compact</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useEditMode() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setOn(true);
      if (e.data.type === "__deactivate_edit_mode") setOn(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);
  return on;
}

Object.assign(window, { TweaksPanel, useEditMode });
