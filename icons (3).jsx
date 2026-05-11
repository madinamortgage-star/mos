/* global window, React */

const Icon = ({ name, size = 16, ...props }) => {
  const s = { width: size, height: size, ...props.style };
  const common = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", style: s, ...props };
  switch (name) {
    case "home":    return <svg {...common}><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>;
    case "phone":   return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.63 2.6a2 2 0 0 1-.45 2.11L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.45c.84.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92Z"/></svg>;
    case "target":  return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>;
    case "flame":   return <svg {...common}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-2-1.5-2.5-1.5-4.5A4 4 0 0 1 13 3c0 3 5 4.5 5 9a6 6 0 1 1-12 0c0-2 .5-3 1.5-4"/></svg>;
    case "check":   return <svg {...common}><path d="M20 6 9 17l-5-5"/></svg>;
    case "chev":    return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case "users":   return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "kanban":  return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v12"/><path d="M16 3v7"/></svg>;
    case "user":    return <svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "sparkle": return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>;
    case "mag":     return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "plus":    return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "x":       return <svg {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case "arrow-left": return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case "clock":   return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "mail":    return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case "doc":     return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>;
    case "filter":  return <svg {...common}><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></svg>;
    case "briefcase": return <svg {...common}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case "handshake": return <svg {...common}><path d="m11 17 2 2a1 1 0 0 0 1.41-1.41"/><path d="m14 14 2.5 2.5a1 1 0 1 0 1.41-1.41L15 12"/><path d="m17 7 1 1-4 4-3-3 1-1 2 2"/><path d="M3 12 8 7l3 3-5 5z"/></svg>;
    default: return null;
  }
};

Object.assign(window, { Icon });
