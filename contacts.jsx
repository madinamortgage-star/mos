/* global window, React */
const { useState, useMemo, useRef, useEffect } = React;

// ============================================================
// CONTACTS CRM
// Monday-style flexible contacts workspace.
// Pipelines: Sales, Recruiting, Investor, Onboarding, Partnership, Vendor
// ============================================================

const CONTACT_PIPELINES = [
  { key: "sales",      label: "Sales",        color: "#944547", icon: "flame",     count: 84 },
  { key: "recruit",    label: "Recruiting",   color: "#3E6E73", icon: "user",      count: 22 },
  { key: "investor",   label: "Investor",     color: "#6B7FB3", icon: "briefcase", count: 14 },
  { key: "onboard",    label: "Onboarding",   color: "#B58B3E", icon: "check",     count: 9  },
  { key: "partner",    label: "Partnership",  color: "#8A6E8C", icon: "handshake", count: 31 },
  { key: "vendor",     label: "Vendor",       color: "#5A4632", icon: "doc",       count: 7  },
];

const STATUS_COLORS = {
  "Active":      "#4E7A4E",
  "Qualified":   "#3E6E73",
  "Hot":         "#944547",
  "Warm":        "#B58B3E",
  "Cold":        "#6F5A44",
  "Nurture":     "#8A6E8C",
  "On Hold":     "#8A745A",
  "Closed":      "#2F4A2F",
  "Lost":        "#3B2E22",
};

const PRIORITY_COLORS = {
  "Critical": "#944547",
  "High":     "#C37374",
  "Medium":   "#B58B3E",
  "Low":      "#8A745A",
};

const LIFECYCLE_COLORS = {
  "Subscriber":  "#9AA9C2",
  "Lead":        "#6B7FB3",
  "MQL":         "#8A6E8C",
  "SQL":         "#B58B3E",
  "Opportunity": "#C37374",
  "Customer":    "#4E7A4E",
  "Evangelist":  "#2F4A2F",
};

const SOURCE_LIST = ["Referral", "Web Form", "Cold Outreach", "Event", "LinkedIn", "Partner", "Existing Client", "Inbound Call"];
const OWNER_LIST = [
  { i: "AR", name: "Alex Reyes",   c: "linear-gradient(135deg,#D7B97C,#8A6E3E)" },
  { i: "CV", name: "C. Vargas",    c: "linear-gradient(135deg,#B58BD7,#6A4090)" },
  { i: "ML", name: "M. Liu",       c: "linear-gradient(135deg,#86C5A0,#3E6E5F)" },
  { i: "JO", name: "J. Osei",      c: "linear-gradient(135deg,#E8A98C,#A8553C)" },
];

const CONTACTS_DATA = [
  // Sales pipeline
  { id: "C-1001", first: "Priya",     last: "Raman",       email: "priya.raman@gmail.com",     phone: "(949) 555-0312", company: "Self · Buyer",          title: "Buyer",                  owner: "AR", source: "Referral",       type: "Lead",          status: "Hot",       lifecycle: "Opportunity", priority: "Critical", tags: ["Jumbo","Rush"],          city: "Newport Beach, CA", website: "—",                     linkedin: "in/priyaraman",  pipelines: ["sales"],         stage: "Pre-Approved",  lastContact: "Today",   nextFollow: "Tomorrow", deal: 815000, prob: 80, notes: "Offer accepted. 14-day close.", created: "Mar 28", updated: "8:21 AM" },
  { id: "C-1002", first: "Marcus",    last: "Delgado",     email: "mdelgado@gmail.com",        phone: "(714) 555-0194", company: "Self · Buyer",          title: "Buyer",                  owner: "AR", source: "Inbound Call",   type: "Lead",          status: "Warm",      lifecycle: "SQL",         priority: "High",     tags: ["FTHB"],                  city: "Anaheim, CA",       website: "—",                     linkedin: "—",              pipelines: ["sales"],         stage: "Contacted",     lastContact: "6d ago",  nextFollow: "Apr 24",   deal: 656000, prob: 45, notes: "PA expires Fri. Stalled.",     created: "Feb 11", updated: "6 days ago" },
  { id: "C-1003", first: "Aiden",     last: "Walsh",       email: "aiden.w@outlook.com",       phone: "(310) 555-0408", company: "Walsh Holdings",        title: "Principal",              owner: "AR", source: "Referral",       type: "Lead",          status: "Hot",       lifecycle: "Opportunity", priority: "High",     tags: ["Investor","Cash-out"],   city: "Santa Monica, CA",  website: "walshholdings.co",      linkedin: "in/aidenwalsh",  pipelines: ["sales","investor"], stage: "New",      lastContact: "Yesterday", nextFollow: "Apr 23", deal: 612000, prob: 55, notes: "Referred by Priya R.",         created: "Apr 18", updated: "1 day ago" },
  { id: "C-1004", first: "Maya",      last: "Okafor",      email: "maya.okafor@gmail.com",     phone: "(626) 555-0199", company: "Self · Buyer",          title: "Buyer",                  owner: "AR", source: "Web Form",       type: "Lead",          status: "Warm",      lifecycle: "Lead",        priority: "Medium",   tags: ["FTHB","W2+Rental"],      city: "Pasadena, CA",      website: "—",                     linkedin: "—",              pipelines: ["sales"],         stage: "Intake",        lastContact: "2d ago",  nextFollow: "Apr 24",   deal: 540000, prob: 30, notes: "First-time buyer intake Thu 2pm.", created: "Apr 19", updated: "2 days ago" },

  // Partners pipeline
  { id: "C-2001", first: "Samantha",  last: "Orr",         email: "samantha@kellerwilliams.com",phone: "(310) 555-0441", company: "Keller Williams",       title: "Realtor · Top Producer", owner: "AR", source: "Existing Client",type: "Partner",       status: "Active",    lifecycle: "Evangelist",  priority: "High",     tags: ["VIP","3+ deals"],        city: "Manhattan Beach, CA", website: "samanthaorr.kw.com",  linkedin: "in/samanthaorr", pipelines: ["partner"],       stage: "Active",        lastContact: "3mo ago", nextFollow: "Apr 25",   deal: null,   prob: null, notes: "Sent 3 deals last year. Q-touchbase.", created: "Jan 5", updated: "3 months ago" },
  { id: "C-2002", first: "Derek",     last: "Paulson",     email: "d.paulson@compass.com",     phone: "(714) 555-0311", company: "Compass",               title: "Realtor",                owner: "CV", source: "Event",          type: "Partner",       status: "Nurture",   lifecycle: "Customer",    priority: "Low",      tags: ["Newer"],                 city: "Irvine, CA",        website: "compass.com",           linkedin: "in/derekpaulson",pipelines: ["partner"],       stage: "Nurture",       lastContact: "2mo ago", nextFollow: "May 10",   deal: null,   prob: null, notes: "1 deal last year.",            created: "Jul 18", updated: "2 months ago" },
  { id: "C-2003", first: "Angela",    last: "Petrov",      email: "a.petrov@compass.com",      phone: "(310) 555-0402", company: "Compass",               title: "Senior Agent",           owner: "AR", source: "Existing Client",type: "Partner",       status: "Active",    lifecycle: "Evangelist",  priority: "Critical", tags: ["VIP","Top 1%"],          city: "Beverly Hills, CA", website: "—",                     linkedin: "in/angelapetrov",pipelines: ["partner"],       stage: "VIP",           lastContact: "1w ago",  nextFollow: "May 1",    deal: null,   prob: null, notes: "Sent 3 referrals in 18mo.",    created: "Sep 2",  updated: "1 week ago" },

  // Investor pipeline
  { id: "C-3001", first: "Tomás",     last: "Errazuriz",   email: "tomas@northpeakcap.com",    phone: "(415) 555-0921", company: "Northpeak Capital",     title: "Managing Partner",       owner: "AR", source: "LinkedIn",       type: "Investor",      status: "Qualified", lifecycle: "Opportunity", priority: "High",     tags: ["Series B","Fintech"],    city: "San Francisco, CA", website: "northpeakcap.com",      linkedin: "in/terrazuriz",  pipelines: ["investor"],      stage: "Diligence",     lastContact: "5d ago",  nextFollow: "Apr 26",   deal: 2500000,prob: 40, notes: "Reviewing data room. Decision May 1.", created: "Feb 28", updated: "5 days ago" },
  { id: "C-3002", first: "Ines",      last: "Kowalski",    email: "ines@brightseed.vc",        phone: "(212) 555-0148", company: "Brightseed VC",         title: "Principal",              owner: "AR", source: "Referral",       type: "Investor",      status: "Warm",      lifecycle: "MQL",         priority: "Medium",   tags: ["Seed","Proptech"],       city: "New York, NY",      website: "brightseed.vc",         linkedin: "in/ineskowalski",pipelines: ["investor"],      stage: "Intro",         lastContact: "2w ago",  nextFollow: "Apr 30",   deal: 750000, prob: 20, notes: "Wants to meet at AltFi 26.",   created: "Mar 14", updated: "2 weeks ago" },

  // Recruiting
  { id: "C-4001", first: "Helena",    last: "Voss",        email: "helena.voss@protonmail.com",phone: "(206) 555-0772", company: "Independent",           title: "Sr. Loan Officer",       owner: "AR", source: "LinkedIn",       type: "Candidate",     status: "Hot",       lifecycle: "Lead",        priority: "High",     tags: ["10+ yrs","Jumbo"],       city: "Seattle, WA",       website: "—",                     linkedin: "in/helenavoss",  pipelines: ["recruit"],       stage: "Offer Out",     lastContact: "Yesterday",nextFollow: "Apr 23",   deal: 180000, prob: 70, notes: "Comp negotiation in flight.",  created: "Mar 30", updated: "1 day ago" },
  { id: "C-4002", first: "Jamal",     last: "Forbes",      email: "jforbes@gmail.com",         phone: "(404) 555-0309", company: "Wells Fargo",           title: "Loan Officer",           owner: "AR", source: "Event",          type: "Candidate",     status: "Warm",      lifecycle: "MQL",         priority: "Medium",   tags: ["5 yrs","Conv"],          city: "Atlanta, GA",       website: "—",                     linkedin: "in/jamalforbes", pipelines: ["recruit"],       stage: "Screen",        lastContact: "1w ago",  nextFollow: "Apr 28",   deal: 140000, prob: 30, notes: "Open to relo.",                created: "Apr 8",  updated: "1 week ago" },

  // Onboarding
  { id: "C-5001", first: "Rosa",      last: "Kim",         email: "rosa.kim@gmail.com",        phone: "(213) 555-0721", company: "Self · Buyer",          title: "New Client",             owner: "CV", source: "Referral",       type: "Client",        status: "Active",    lifecycle: "Customer",    priority: "Medium",   tags: ["Onboarding"],            city: "Los Angeles, CA",   website: "—",                     linkedin: "—",              pipelines: ["onboard"],       stage: "Docs Pending",  lastContact: "2d ago",  nextFollow: "Apr 24",   deal: 378000, prob: 90, notes: "Awaiting paystubs.",           created: "Apr 17", updated: "2 days ago" },
  { id: "C-5002", first: "Ingrid",    last: "Solberg",     email: "ingrid.s@outlook.com",      phone: "(310) 555-0913", company: "Self · Buyer",          title: "New Client",             owner: "CV", source: "Web Form",       type: "Client",        status: "Active",    lifecycle: "Customer",    priority: "Medium",   tags: ["Touring"],               city: "Culver City, CA",   website: "—",                     linkedin: "—",              pipelines: ["onboard"],       stage: "Shopping",      lastContact: "4d ago",  nextFollow: "Apr 25",   deal: 670000, prob: 60, notes: "Touring this weekend.",        created: "Apr 12", updated: "4 days ago" },

  // Vendor
  { id: "C-6001", first: "Lawrence",  last: "Etheridge",   email: "lawrence@cornerstoneappr.com",phone: "(818) 555-0274", company: "Cornerstone Appraisals", title: "Lead Appraiser",         owner: "ML", source: "Existing Client",type: "Vendor",        status: "Active",    lifecycle: "Customer",    priority: "Low",      tags: ["Preferred"],             city: "Glendale, CA",      website: "cornerstoneappr.com",   linkedin: "—",              pipelines: ["vendor"],        stage: "Active",        lastContact: "1mo ago", nextFollow: "Jun 1",    deal: null,   prob: null, notes: "48hr turn on most.",           created: "Nov 4",  updated: "1 month ago" },
];

// Default visible fields per view
const DEFAULT_VISIBLE_FIELDS = [
  "owner", "company", "title", "email", "phone", "status", "lifecycle", "priority", "tags", "source", "city", "lastContact", "nextFollow", "deal",
];

const ALL_FIELDS = [
  { key: "owner",       label: "Owner",         type: "person",   width: 80,  required: true,  always: true },
  { key: "company",     label: "Company",       type: "company",  width: 180, required: false, always: true },
  { key: "title",       label: "Job Title",     type: "text",     width: 160 },
  { key: "email",       label: "Email",         type: "email",    width: 200, required: true,  always: true },
  { key: "phone",       label: "Phone",         type: "phone",    width: 140, always: true },
  { key: "status",      label: "Status",        type: "dropdown", width: 110, always: true },
  { key: "lifecycle",   label: "Lifecycle",     type: "dropdown", width: 120 },
  { key: "priority",    label: "Priority",      type: "dropdown", width: 100 },
  { key: "tags",        label: "Tags",          type: "multi",    width: 180 },
  { key: "source",      label: "Lead Source",   type: "dropdown", width: 130 },
  { key: "type",        label: "Contact Type",  type: "dropdown", width: 110 },
  { key: "city",        label: "Location",      type: "text",     width: 160 },
  { key: "website",     label: "Website",       type: "url",      width: 160 },
  { key: "linkedin",    label: "LinkedIn",      type: "url",      width: 140 },
  { key: "lastContact", label: "Last Contacted",type: "date",     width: 120 },
  { key: "nextFollow",  label: "Next Follow-up",type: "date",     width: 130 },
  { key: "deal",        label: "Deal Value",    type: "currency", width: 120 },
  { key: "prob",        label: "Probability",   type: "progress", width: 110 },
  { key: "notes",       label: "Notes",         type: "longtext", width: 240 },
  { key: "created",     label: "Created",       type: "date",     width: 110 },
  { key: "updated",     label: "Last Updated",  type: "date",     width: 120 },
];

const VIEWS = [
  { key: "table",    label: "Main Table",  icon: "kanban" },
  { key: "kanban",   label: "Kanban",      icon: "kanban" },
  { key: "calendar", label: "Calendar",    icon: "clock" },
  { key: "timeline", label: "Timeline",    icon: "clock" },
  { key: "activity", label: "Activity",    icon: "flame" },
  { key: "accounts", label: "Companies",   icon: "briefcase" },
];

const SAVED_VIEWS = [
  { key: "all",     label: "All contacts",       count: 412 },
  { key: "mine",    label: "My contacts",        count: 142 },
  { key: "hot",     label: "Hot · this week",    count: 18 },
  { key: "follow",  label: "Needs follow-up",    count: 47 },
  { key: "vip",     label: "VIP partners",       count: 12 },
  { key: "stale",   label: "Stale 30+ days",     count: 64 },
];

// ============================================================
// CELL RENDERERS
// ============================================================
function ownerAvatar(ownerKey) {
  const o = OWNER_LIST.find(x => x.i === ownerKey) || OWNER_LIST[0];
  return <span className="crm-owner" style={{ background: o.c }} title={o.name}>{o.i}</span>;
}

function StatusPill({ value }) {
  const c = STATUS_COLORS[value] || "#8A745A";
  return <span className="crm-pill" style={{ background: c }}>{value}</span>;
}
function LifecyclePill({ value }) {
  if (!value) return <span className="crm-empty">—</span>;
  const c = LIFECYCLE_COLORS[value] || "#8A745A";
  return <span className="crm-pill ghost" style={{ color: c, boxShadow: `inset 0 0 0 1px ${c}55` }}>{value}</span>;
}
function PriorityPill({ value }) {
  if (!value) return <span className="crm-empty">—</span>;
  const c = PRIORITY_COLORS[value] || "#8A745A";
  return (
    <span className="crm-priority">
      <span className="crm-priority-dot" style={{ background: c }} />
      <span style={{ color: c }}>{value}</span>
    </span>
  );
}
function TagList({ tags }) {
  if (!tags?.length) return <span className="crm-empty">—</span>;
  return (
    <div className="crm-tags">
      {tags.map(t => <span key={t} className="crm-tag">{t}</span>)}
    </div>
  );
}
function fmtMoney(n) { return n == null ? "—" : "$" + n.toLocaleString(); }
function Progress({ v }) {
  if (v == null) return <span className="crm-empty">—</span>;
  return (
    <div className="crm-progress">
      <div className="crm-progress-bar"><div style={{ width: v + "%" }} /></div>
      <span className="crm-progress-v mono">{v}%</span>
    </div>
  );
}

function renderCell(field, c) {
  switch (field.key) {
    case "owner":       return ownerAvatar(c.owner);
    case "company":     return <span className="crm-company">{c.company}</span>;
    case "title":       return <span className="crm-text">{c.title}</span>;
    case "email":       return <a className="crm-link" href={"mailto:"+c.email} onClick={e=>e.stopPropagation()}>{c.email}</a>;
    case "phone":       return <span className="crm-mono">{c.phone}</span>;
    case "status":      return <StatusPill value={c.status} />;
    case "lifecycle":   return <LifecyclePill value={c.lifecycle} />;
    case "priority":    return <PriorityPill value={c.priority} />;
    case "tags":        return <TagList tags={c.tags} />;
    case "source":      return <span className="crm-pill ghost neutral">{c.source}</span>;
    case "type":        return <span className="crm-pill ghost neutral">{c.type}</span>;
    case "city":        return <span className="crm-text">{c.city}</span>;
    case "website":     return c.website && c.website !== "—" ? <a className="crm-link" href={"https://"+c.website} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{c.website}</a> : <span className="crm-empty">—</span>;
    case "linkedin":    return c.linkedin && c.linkedin !== "—" ? <a className="crm-link" href={"https://linkedin.com/"+c.linkedin} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{c.linkedin}</a> : <span className="crm-empty">—</span>;
    case "lastContact": return <span className="crm-mono dim">{c.lastContact}</span>;
    case "nextFollow":  return <span className="crm-followup">{c.nextFollow}</span>;
    case "deal":        return <span className="crm-mono money">{fmtMoney(c.deal)}</span>;
    case "prob":        return <Progress v={c.prob} />;
    case "notes":       return <span className="crm-notes">{c.notes}</span>;
    case "created":     return <span className="crm-mono dim">{c.created}</span>;
    case "updated":     return <span className="crm-mono dim">{c.updated}</span>;
    default: return null;
  }
}

// ============================================================
// FIELD CUSTOMIZER PANEL
// ============================================================
function FieldCustomizer({ visible, fields, onChange, onClose, onAddField }) {
  if (!visible) return null;
  const toggle = (k) => {
    onChange(fields.includes(k) ? fields.filter(x => x !== k) : [...fields, k]);
  };
  return (
    <div className="crm-customizer">
      <div className="crm-customizer-head">
        <div>
          <div className="crm-customizer-title">Customize fields</div>
          <div className="crm-customizer-sub">Drag to reorder · click to show/hide</div>
        </div>
        <button className="crm-x" onClick={onClose}><window.Icon name="x" size={14} /></button>
      </div>
      <div className="crm-customizer-body">
        {ALL_FIELDS.map(f => {
          const on = fields.includes(f.key);
          return (
            <div key={f.key} className={"crm-field-row" + (on ? " on" : "") + (f.always ? " locked" : "")} onClick={() => !f.always && toggle(f.key)}>
              <span className="crm-drag">⋮⋮</span>
              <span className="crm-field-type" data-t={f.type}>{f.type}</span>
              <span className="crm-field-label">{f.label}</span>
              {f.required && <span className="crm-required">required</span>}
              <span className="crm-field-toggle">{on ? "●" : "○"}</span>
            </div>
          );
        })}
      </div>
      <div className="crm-customizer-foot">
        <button className="crm-btn ghost" onClick={onAddField}><window.Icon name="plus" size={12}/> Add new field</button>
        <button className="crm-btn ghost">Save as template</button>
      </div>
    </div>
  );
}

// ============================================================
// ADD FIELD MODAL
// ============================================================
const FIELD_TYPES = [
  { k:"text",      label:"Text",          icon:"T",  hint:"Single line" },
  { k:"longtext",  label:"Long text",     icon:"¶",  hint:"Multi-line" },
  { k:"number",    label:"Number",        icon:"#",  hint:"Integer/decimal" },
  { k:"currency",  label:"Currency",      icon:"$",  hint:"Money" },
  { k:"email",     label:"Email",         icon:"@",  hint:"Validated" },
  { k:"phone",     label:"Phone",         icon:"☎",  hint:"Formatted" },
  { k:"url",       label:"URL",           icon:"↗",  hint:"Web link" },
  { k:"date",      label:"Date",          icon:"📅", hint:"Single date" },
  { k:"daterange", label:"Date range",    icon:"⇄",  hint:"Start–end" },
  { k:"dropdown",  label:"Dropdown",      icon:"▾",  hint:"Single select" },
  { k:"multi",     label:"Multi-select",  icon:"⌘",  hint:"Many options" },
  { k:"check",     label:"Checkbox",      icon:"☑",  hint:"True/False" },
  { k:"person",    label:"Person",        icon:"◉",  hint:"Owner / user" },
  { k:"company",   label:"Company",       icon:"⌂",  hint:"Linked account" },
  { k:"file",      label:"File",          icon:"📎", hint:"Attachment" },
  { k:"rating",    label:"Rating",        icon:"★",  hint:"1–5 stars" },
  { k:"progress",  label:"Progress",      icon:"▰",  hint:"0–100%" },
  { k:"formula",   label:"Formula",       icon:"ƒ",  hint:"Computed" },
  { k:"relation",  label:"Relation",      icon:"⤺",  hint:"Linked record" },
];

function AddFieldModal({ open, onClose, onAdd }) {
  if (!open) return null;
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [scope, setScope] = useState("global");
  return (
    <div className="crm-mini-backdrop" onClick={onClose}>
      <div className="crm-mini" onClick={e => e.stopPropagation()}>
        <div className="crm-mini-head">
          <div>
            <div className="crm-mini-eyebrow">Add field</div>
            <div className="crm-mini-title">New field</div>
          </div>
          <button className="crm-x" onClick={onClose}><window.Icon name="x" size={14} /></button>
        </div>
        <div className="crm-mini-body">
          <label className="crm-input-wrap">
            <span>Field name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Renewal Date" autoFocus/>
          </label>
          <div className="crm-input-wrap">
            <span>Field type</span>
            <div className="crm-type-grid">
              {FIELD_TYPES.map(t => (
                <button key={t.k}
                  className={"crm-type-card" + (type === t.k ? " on" : "")}
                  onClick={() => setType(t.k)}>
                  <span className="crm-type-icon">{t.icon}</span>
                  <span className="crm-type-label">{t.label}</span>
                  <span className="crm-type-hint">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="crm-input-wrap">
            <span>Scope</span>
            <div className="crm-seg">
              <button className={scope==="global"?"on":""} onClick={() => setScope("global")}>Global contact field</button>
              <button className={scope==="pipeline"?"on":""} onClick={() => setScope("pipeline")}>This pipeline only</button>
            </div>
          </div>
        </div>
        <div className="crm-mini-foot">
          <button className="crm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn primary" onClick={() => { onAdd({ name, type, scope }); onClose(); }}>Create field</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BULK ACTION BAR
// ============================================================
function BulkBar({ count, onClear, onAction }) {
  if (count === 0) return null;
  return (
    <div className="crm-bulkbar">
      <div className="crm-bulk-count">
        <span className="crm-bulk-n">{count}</span>
        <span>selected</span>
      </div>
      <div className="crm-bulk-actions">
        <button onClick={() => onAction("status")}>Change status</button>
        <button onClick={() => onAction("owner")}>Assign owner</button>
        <button onClick={() => onAction("tag")}>Add tag</button>
        <button onClick={() => onAction("pipeline")}>Move to pipeline</button>
        <button onClick={() => onAction("follow")}>Schedule follow-up</button>
        <button onClick={() => onAction("export")}>Export</button>
        <button onClick={() => onAction("delete")} className="danger">Delete</button>
      </div>
      <button className="crm-bulk-clear" onClick={onClear}>Clear</button>
    </div>
  );
}

// ============================================================
// CONTACTS TABLE VIEW
// ============================================================
function ContactsTable({ rows, fields, selected, onSelect, onSelectAll, onOpen, density, sort, onSort }) {
  const visibleFields = ALL_FIELDS.filter(f => fields.includes(f.key));
  const allSel = rows.length > 0 && rows.every(r => selected.includes(r.id));

  return (
    <div className="crm-table-wrap" data-density={density}>
      <table className="crm-table">
        <thead>
          <tr>
            <th className="crm-th-check">
              <input type="checkbox" checked={allSel} onChange={() => onSelectAll(!allSel)} />
            </th>
            <th className="crm-th-name sticky">
              <button className="crm-sort" onClick={() => onSort("name")}>
                Contact {sort==="name" && <span className="crm-sort-arrow">▾</span>}
              </button>
            </th>
            {visibleFields.map(f => (
              <th key={f.key} style={{ minWidth: f.width }}>
                <button className="crm-sort" onClick={() => onSort(f.key)}>
                  {f.label}
                  {sort===f.key && <span className="crm-sort-arrow">▾</span>}
                </button>
              </th>
            ))}
            <th className="crm-th-add">
              <button className="crm-add-col" title="Add column"><window.Icon name="plus" size={12} /></button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const sel = selected.includes(r.id);
            const initials = (r.first[0] + r.last[0]).toUpperCase();
            return (
              <tr key={r.id} className={sel ? "sel" : ""}>
                <td className="crm-td-check">
                  <input type="checkbox" checked={sel} onChange={() => onSelect(r.id)} />
                </td>
                <td className="crm-td-name sticky" onClick={() => onOpen(r)}>
                  <div className="crm-namecell">
                    <div className="crm-av">{initials}</div>
                    <div>
                      <div className="crm-fullname">{r.first} {r.last}</div>
                      <div className="crm-id mono">{r.id}</div>
                    </div>
                  </div>
                </td>
                {visibleFields.map(f => (
                  <td key={f.key} className={"crm-td crm-td-" + f.type}>{renderCell(f, r)}</td>
                ))}
                <td className="crm-td-add"></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="crm-add-row">
        <button><window.Icon name="plus" size={12}/> Add contact</button>
      </div>
    </div>
  );
}

// ============================================================
// KANBAN VIEW
// ============================================================
function KanbanView({ rows, groupBy, onOpen }) {
  const columns = useMemo(() => {
    if (groupBy === "status") {
      return Object.keys(STATUS_COLORS).map(k => ({ key: k, label: k, color: STATUS_COLORS[k], rows: rows.filter(r => r.status === k) }));
    }
    if (groupBy === "owner") {
      return OWNER_LIST.map(o => ({ key: o.i, label: o.name, color: "#8A6E3E", rows: rows.filter(r => r.owner === o.i) }));
    }
    if (groupBy === "priority") {
      return Object.keys(PRIORITY_COLORS).map(k => ({ key: k, label: k, color: PRIORITY_COLORS[k], rows: rows.filter(r => r.priority === k) }));
    }
    return Object.keys(LIFECYCLE_COLORS).map(k => ({ key: k, label: k, color: LIFECYCLE_COLORS[k], rows: rows.filter(r => r.lifecycle === k) }));
  }, [rows, groupBy]);

  return (
    <div className="crm-kanban">
      {columns.map(col => (
        <div key={col.key} className="crm-kcol">
          <div className="crm-kcol-head" style={{ borderTopColor: col.color }}>
            <span className="crm-kcol-dot" style={{ background: col.color }} />
            <span className="crm-kcol-title">{col.label}</span>
            <span className="crm-kcol-count">{col.rows.length}</span>
            <button className="crm-kcol-add" title="Add"><window.Icon name="plus" size={11}/></button>
          </div>
          <div className="crm-kcol-body">
            {col.rows.map(r => {
              const initials = (r.first[0] + r.last[0]).toUpperCase();
              return (
                <div key={r.id} className="crm-kcard" onClick={() => onOpen(r)}>
                  <div className="crm-kcard-top">
                    <div className="crm-av sm">{initials}</div>
                    <div className="crm-kcard-name">{r.first} {r.last}</div>
                    {ownerAvatar(r.owner)}
                  </div>
                  <div className="crm-kcard-co">{r.company}</div>
                  {r.deal != null && <div className="crm-kcard-deal mono">{fmtMoney(r.deal)}</div>}
                  <div className="crm-kcard-tags">
                    <PriorityPill value={r.priority}/>
                    {r.tags?.slice(0,2).map(t => <span key={t} className="crm-tag">{t}</span>)}
                  </div>
                  <div className="crm-kcard-foot">
                    <span className="crm-kcard-meta">Next: <b>{r.nextFollow}</b></span>
                  </div>
                </div>
              );
            })}
            {col.rows.length === 0 && <div className="crm-kcol-empty">No contacts</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// CALENDAR VIEW (follow-ups)
// ============================================================
function CalendarView({ rows, onOpen }) {
  // Simple monthly grid, May 2026
  const monthDays = [];
  const startOffset = 4; // Fri start (just mock)
  for (let i = 0; i < 35; i++) {
    const dayNum = i - startOffset + 1;
    monthDays.push(dayNum > 0 && dayNum <= 30 ? dayNum : null);
  }

  // Bucket contacts onto days based on stable hash of id
  const byDay = {};
  rows.forEach(r => {
    if (!r.nextFollow) return;
    const h = Math.abs(r.id.charCodeAt(2) * 7 + r.id.charCodeAt(4) * 3) % 30 + 1;
    byDay[h] = byDay[h] || [];
    byDay[h].push(r);
  });

  return (
    <div className="crm-calendar">
      <div className="crm-cal-head">
        <button className="crm-btn ghost">‹</button>
        <div className="crm-cal-title">April 2026</div>
        <button className="crm-btn ghost">›</button>
        <div style={{ flex: 1 }}/>
        <button className="crm-btn ghost">Today</button>
        <div className="crm-seg sm">
          <button>Month</button>
          <button className="on">Week</button>
          <button>Day</button>
        </div>
      </div>
      <div className="crm-cal-grid">
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
          <div key={d} className="crm-cal-dow">{d}</div>
        ))}
        {monthDays.map((d, i) => (
          <div key={i} className={"crm-cal-cell" + (d === 22 ? " today" : "") + (!d ? " muted" : "")}>
            <div className="crm-cal-num">{d || ""}</div>
            <div className="crm-cal-items">
              {(byDay[d] || []).slice(0,3).map(r => (
                <div key={r.id} className="crm-cal-item" onClick={() => onOpen(r)}>
                  <span className="crm-cal-dot" style={{ background: STATUS_COLORS[r.status] }} />
                  <span className="crm-cal-item-name">{r.first} {r.last[0]}.</span>
                </div>
              ))}
              {(byDay[d] || []).length > 3 && <div className="crm-cal-more">+{byDay[d].length - 3} more</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TIMELINE VIEW
// ============================================================
function TimelineView({ rows, onOpen }) {
  return (
    <div className="crm-timeline-view">
      <div className="crm-tl-axis">
        {["Apr 14","Apr 21","Apr 28","May 5","May 12","May 19"].map(d => <span key={d}>{d}</span>)}
      </div>
      {rows.map((r, i) => {
        const left = (i * 11 + 8) % 60;
        const w = 14 + ((i * 7) % 20);
        const c = STATUS_COLORS[r.status] || "#8A745A";
        return (
          <div key={r.id} className="crm-tl-row" onClick={() => onOpen(r)}>
            <div className="crm-tl-label">
              <div className="crm-av xs">{(r.first[0]+r.last[0]).toUpperCase()}</div>
              <span>{r.first} {r.last}</span>
            </div>
            <div className="crm-tl-track">
              <div className="crm-tl-bar" style={{ left: left + "%", width: w + "%", background: c }}>
                <span>{r.stage}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ACTIVITY VIEW
// ============================================================
const ACTIVITY_FEED = [
  { id:1, who:"AR", kind:"call",     contact:"Priya Raman",      detail:"Logged 14m call · pre-approval rush",    when:"2m ago",  pipe:"sales" },
  { id:2, who:"AR", kind:"email",    contact:"Helena Voss",      detail:"Sent follow-up · offer comp v3",         when:"18m ago", pipe:"recruit" },
  { id:3, who:"CV", kind:"stage",    contact:"Rosa Kim",         detail:"Moved · Intake → Docs Pending",          when:"42m ago", pipe:"onboard" },
  { id:4, who:"AR", kind:"note",     contact:"Tomás Errazuriz",  detail:"Note · data room views jumped to 47",    when:"1h ago",  pipe:"investor" },
  { id:5, who:"AR", kind:"meeting",  contact:"Angela Petrov",    detail:"Scheduled · coffee Apr 30 9am",          when:"2h ago",  pipe:"partner" },
  { id:6, who:"ML", kind:"field",    contact:"Lawrence Etheridge",detail:"Updated · Status to Active",            when:"3h ago",  pipe:"vendor" },
  { id:7, who:"AR", kind:"task",     contact:"Maya Okafor",      detail:"Completed · Send FTHB guide",            when:"5h ago",  pipe:"sales" },
  { id:8, who:"AR", kind:"email",    contact:"Samantha Orr",     detail:"Replied · quarterly touch-base",         when:"Yesterday", pipe:"partner" },
];
const ACT_ICONS = { call:"phone", email:"mail", stage:"kanban", note:"doc", meeting:"clock", field:"sparkle", task:"check" };

function ActivityView({ pipelineKey }) {
  const items = pipelineKey === "all" ? ACTIVITY_FEED : ACTIVITY_FEED.filter(a => a.pipe === pipelineKey);
  const Icon = window.Icon;
  return (
    <div className="crm-activity">
      <div className="crm-act-filters">
        <button className="crm-chip on">All activity</button>
        <button className="crm-chip">Calls</button>
        <button className="crm-chip">Emails</button>
        <button className="crm-chip">Meetings</button>
        <button className="crm-chip">Notes</button>
        <button className="crm-chip">Field changes</button>
      </div>
      <div className="crm-act-list">
        {items.map(a => (
          <div key={a.id} className={"crm-act-item k-" + a.kind}>
            <span className="crm-act-icon"><Icon name={ACT_ICONS[a.kind] || "doc"} size={14}/></span>
            <div className="crm-act-body">
              <div className="crm-act-top">
                <span className="crm-act-contact">{a.contact}</span>
                <span className="crm-act-kind">{a.kind}</span>
                <span className="crm-act-when">{a.when}</span>
              </div>
              <div className="crm-act-detail">{a.detail}</div>
            </div>
            <span className="crm-act-who">{ownerAvatar(a.who)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// COMPANIES VIEW
// ============================================================
function CompaniesView({ rows, onOpen }) {
  const map = {};
  rows.forEach(r => {
    map[r.company] = map[r.company] || { company: r.company, contacts: [], totalDeal: 0 };
    map[r.company].contacts.push(r);
    if (r.deal) map[r.company].totalDeal += r.deal;
  });
  const accounts = Object.values(map).sort((a, b) => b.totalDeal - a.totalDeal);
  return (
    <div className="crm-accounts">
      {accounts.map(a => (
        <div key={a.company} className="crm-account">
          <div className="crm-account-head">
            <div className="crm-account-logo">{a.company[0]}</div>
            <div>
              <div className="crm-account-name">{a.company}</div>
              <div className="crm-account-sub">{a.contacts.length} contact{a.contacts.length>1?"s":""} · {fmtMoney(a.totalDeal || null)} pipeline</div>
            </div>
            <button className="crm-btn ghost">View →</button>
          </div>
          <div className="crm-account-people">
            {a.contacts.map(r => (
              <div key={r.id} className="crm-account-person" onClick={() => onOpen(r)}>
                <div className="crm-av sm">{(r.first[0]+r.last[0]).toUpperCase()}</div>
                <div>
                  <div className="crm-account-pname">{r.first} {r.last}</div>
                  <div className="crm-account-ptitle">{r.title}</div>
                </div>
                <StatusPill value={r.status}/>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// CONTACT DETAIL DRAWER (slide-in)
// ============================================================
function ContactDrawer({ contact, onClose }) {
  if (!contact) return null;
  const [tab, setTab] = useState("overview");
  const c = contact;
  const initials = (c.first[0] + c.last[0]).toUpperCase();

  return (
    <div className="crm-drawer-backdrop" onClick={onClose}>
      <div className="crm-drawer" onClick={e => e.stopPropagation()}>
        <div className="crm-drawer-head">
          <button className="crm-back" onClick={onClose}><window.Icon name="arrow-left" size={14}/> Back to contacts</button>
          <div style={{flex:1}}/>
          <button className="crm-btn ghost"><window.Icon name="phone" size={12}/> Call</button>
          <button className="crm-btn ghost"><window.Icon name="mail" size={12}/> Email</button>
          <button className="crm-btn primary"><window.Icon name="plus" size={12}/> Log activity</button>
          <button className="crm-x" onClick={onClose}><window.Icon name="x" size={14}/></button>
        </div>

        <div className="crm-drawer-hero">
          <div className="crm-drawer-av">{initials}</div>
          <div className="crm-drawer-info">
            <div className="crm-drawer-name">{c.first} {c.last}</div>
            <div className="crm-drawer-sub">
              <span>{c.title}</span>
              <span className="crm-sep">·</span>
              <span className="crm-drawer-co">{c.company}</span>
              <span className="crm-sep">·</span>
              <span className="crm-mono">{c.id}</span>
            </div>
            <div className="crm-drawer-pills">
              <StatusPill value={c.status}/>
              <LifecyclePill value={c.lifecycle}/>
              <PriorityPill value={c.priority}/>
              {c.tags?.map(t => <span key={t} className="crm-tag">{t}</span>)}
            </div>
          </div>
          <div className="crm-drawer-quick">
            <div className="crm-quick-stat">
              <span className="crm-quick-l">Deal value</span>
              <span className="crm-quick-v mono">{fmtMoney(c.deal)}</span>
            </div>
            <div className="crm-quick-stat">
              <span className="crm-quick-l">Probability</span>
              <span className="crm-quick-v mono">{c.prob == null ? "—" : c.prob + "%"}</span>
            </div>
            <div className="crm-quick-stat">
              <span className="crm-quick-l">Last contact</span>
              <span className="crm-quick-v">{c.lastContact}</span>
            </div>
            <div className="crm-quick-stat">
              <span className="crm-quick-l">Next follow-up</span>
              <span className="crm-quick-v crm-followup">{c.nextFollow}</span>
            </div>
          </div>
        </div>

        <div className="crm-drawer-tabs">
          {["overview","activity","emails","tasks","files","relations","pipelines"].map(t => (
            <button key={t} className={tab===t?"on":""} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="crm-drawer-body">
          {tab === "overview" && (
            <div className="crm-drawer-grid">
              <div className="crm-drawer-card">
                <div className="crm-drawer-card-head">Contact information</div>
                <div className="crm-drawer-fields">
                  {[
                    ["Email", c.email],
                    ["Phone", c.phone],
                    ["Company", c.company],
                    ["Job Title", c.title],
                    ["Location", c.city],
                    ["Website", c.website],
                    ["LinkedIn", c.linkedin],
                    ["Source", c.source],
                    ["Type", c.type],
                    ["Owner", OWNER_LIST.find(o => o.i === c.owner)?.name],
                  ].map(([l,v]) => (
                    <div key={l} className="crm-drawer-field">
                      <span className="crm-drawer-flabel">{l}</span>
                      <span className="crm-drawer-fvalue">{v || "—"}</span>
                    </div>
                  ))}
                </div>
                <button className="crm-edit-fields">+ Edit fields</button>
              </div>

              <div className="crm-drawer-card">
                <div className="crm-drawer-card-head">Pipelines &amp; deals</div>
                <div className="crm-drawer-pipelines">
                  {c.pipelines?.map(pk => {
                    const p = CONTACT_PIPELINES.find(x => x.key === pk);
                    if (!p) return null;
                    return (
                      <div key={pk} className="crm-drawer-pipe" style={{ borderLeftColor: p.color }}>
                        <div className="crm-drawer-pipe-name">{p.label} Pipeline</div>
                        <div className="crm-drawer-pipe-stage">Stage: <b>{c.stage}</b></div>
                        {c.deal != null && <div className="crm-drawer-pipe-deal mono">{fmtMoney(c.deal)} · {c.prob}%</div>}
                      </div>
                    );
                  })}
                </div>
                <button className="crm-edit-fields">+ Add to pipeline</button>
              </div>

              <div className="crm-drawer-card span-2">
                <div className="crm-drawer-card-head">Notes</div>
                <div className="crm-drawer-note">{c.notes}</div>
                <div className="crm-drawer-composer">
                  <textarea placeholder="Add a note..." />
                  <button className="crm-btn primary">Save note</button>
                </div>
              </div>

              <div className="crm-drawer-card span-2">
                <div className="crm-drawer-card-head">Recent activity</div>
                <div className="crm-drawer-timeline">
                  {[
                    { d:"Today · 8:21 AM", k:"call",    t:"Logged call · 14 min",          s:"Discussed rush close. Documents arriving today." },
                    { d:"Today · 8:12 AM", k:"stage",   t:"Stage changed",                  s:"Pre-Approved → Offer Accepted" },
                    { d:"Yesterday",       k:"email",   t:"Replied to email",               s:"Re: Offer counter — sent comp sheet." },
                    { d:"Apr 14",          k:"field",   t:"Pre-approval issued",            s:"Up to $850k · 30-yr conv @ 6.125%" },
                    { d:"Apr 02",          k:"meeting", t:"Intake call · 45 min",           s:"Confirmed W2 income + bonus structure." },
                  ].map((it, i) => (
                    <div key={i} className={"crm-drawer-tl k-"+it.k}>
                      <span className="crm-drawer-tl-dot"/>
                      <div className="crm-drawer-tl-body">
                        <div className="crm-drawer-tl-top">
                          <span className="crm-drawer-tl-t">{it.t}</span>
                          <span className="crm-drawer-tl-d">{it.d}</span>
                        </div>
                        <div className="crm-drawer-tl-s">{it.s}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "activity" && (
            <div className="crm-drawer-fullact">
              <ActivityView pipelineKey="all"/>
            </div>
          )}
          {tab !== "overview" && tab !== "activity" && (
            <div className="crm-drawer-empty">
              <div className="crm-drawer-empty-icon">{tab === "emails" ? "✉" : tab === "tasks" ? "✓" : tab === "files" ? "📎" : tab === "relations" ? "↔" : "⤴"}</div>
              <div className="crm-drawer-empty-title">{tab.charAt(0).toUpperCase() + tab.slice(1)} for {c.first}</div>
              <div className="crm-drawer-empty-sub">Connect your inbox or add manually to see {tab} here.</div>
              <button className="crm-btn primary"><window.Icon name="plus" size={12}/> Add {tab.slice(0,-1)}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN CONTACTS PAGE
// ============================================================
function Contacts() {
  const [pipeline, setPipeline] = useState("all");
  const [view, setView] = useState("table");
  const [savedView, setSavedView] = useState("all");
  const [search, setSearch] = useState("");
  const [fields, setFields] = useState(DEFAULT_VISIBLE_FIELDS);
  const [customizing, setCustomizing] = useState(false);
  const [addingField, setAddingField] = useState(false);
  const [selected, setSelected] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [density, setDensity] = useState("comfortable");
  const [kanbanGroup, setKanbanGroup] = useState("status");
  const [sort, setSort] = useState("name");
  const [showSettings, setShowSettings] = useState(false);

  const rows = useMemo(() => {
    let r = CONTACTS_DATA;
    if (pipeline !== "all") r = r.filter(c => c.pipelines.includes(pipeline));
    if (savedView === "mine") r = r.filter(c => c.owner === "AR");
    if (savedView === "hot")  r = r.filter(c => c.status === "Hot");
    if (savedView === "follow") r = r.filter(c => c.nextFollow);
    if (savedView === "vip") r = r.filter(c => c.tags?.includes("VIP"));
    if (savedView === "stale") r = r.filter(c => /month|months/.test(c.lastContact || c.updated));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c => (c.first + " " + c.last + " " + c.company + " " + c.email + " " + (c.tags||[]).join(" ")).toLowerCase().includes(q));
    }
    // sort
    r = [...r].sort((a, b) => {
      if (sort === "name") return (a.first + a.last).localeCompare(b.first + b.last);
      if (sort === "deal") return (b.deal || 0) - (a.deal || 0);
      return ("" + (a[sort] || "")).localeCompare("" + (b[sort] || ""));
    });
    return r;
  }, [pipeline, savedView, search, sort]);

  const onSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const onSelectAll = (on) => setSelected(on ? rows.map(r => r.id) : []);

  return (
    <div className="crm-page">
      {/* Pipeline tabs */}
      <div className="crm-pipe-tabs">
        <button className={"crm-pipe-tab" + (pipeline === "all" ? " on" : "")} onClick={() => setPipeline("all")}>
          <span className="crm-pipe-icon" style={{ background: "#0E1830" }}><window.Icon name="users" size={11} style={{color:"#F5ECD7"}}/></span>
          <span className="crm-pipe-label">All Contacts</span>
          <span className="crm-pipe-count">412</span>
        </button>
        {CONTACT_PIPELINES.map(p => (
          <button key={p.key} className={"crm-pipe-tab" + (pipeline === p.key ? " on" : "")} onClick={() => setPipeline(p.key)} style={pipeline===p.key?{borderColor:p.color}:{}}>
            <span className="crm-pipe-icon" style={{ background: p.color }}><window.Icon name={p.icon} size={11} style={{color:"#fff"}}/></span>
            <span className="crm-pipe-label">{p.label}</span>
            <span className="crm-pipe-count">{p.count}</span>
          </button>
        ))}
        <button className="crm-pipe-add" onClick={() => setShowSettings(true)}>
          <window.Icon name="plus" size={11}/> New pipeline
        </button>
        <div style={{flex:1}}/>
        <button className="crm-pipe-settings" onClick={() => setShowSettings(true)}>
          ⚙ Pipeline settings
        </button>
      </div>

      {/* View / saved views */}
      <div className="crm-toolbar">
        <div className="crm-views">
          {VIEWS.map(v => (
            <button key={v.key} className={"crm-view-btn" + (view === v.key ? " on" : "")} onClick={() => setView(v.key)}>
              <window.Icon name={v.icon} size={12}/>
              <span>{v.label}</span>
            </button>
          ))}
          <button className="crm-view-add" title="New view"><window.Icon name="plus" size={11}/></button>
        </div>

        <div style={{flex:1}}/>

        <div className="crm-search">
          <window.Icon name="mag" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${rows.length} contacts…`}/>
        </div>
      </div>

      <div className="crm-subtoolbar">
        <div className="crm-saved-views">
          <span className="crm-toolbar-l">Saved:</span>
          {SAVED_VIEWS.map(sv => (
            <button key={sv.key} className={"crm-chip" + (savedView === sv.key ? " on" : "")} onClick={() => setSavedView(sv.key)}>
              {sv.label}
              <span className="crm-chip-c">{sv.count}</span>
            </button>
          ))}
        </div>

        <div style={{flex:1}}/>

        {view === "kanban" && (
          <div className="crm-kanban-group">
            <span className="crm-toolbar-l">Group by:</span>
            <select value={kanbanGroup} onChange={e => setKanbanGroup(e.target.value)}>
              <option value="status">Status</option>
              <option value="lifecycle">Lifecycle</option>
              <option value="priority">Priority</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        )}

        <button className="crm-btn ghost"><window.Icon name="filter" size={12}/> Filter</button>
        <button className="crm-btn ghost">Sort: <b>{sort}</b></button>
        <button className="crm-btn ghost" onClick={() => setDensity(d => d === "compact" ? "comfortable" : "compact")}>
          {density === "compact" ? "▤ Comfortable" : "≡ Compact"}
        </button>
        <button className="crm-btn primary" onClick={() => setCustomizing(true)}>
          <window.Icon name="sparkle" size={12}/> Customize fields
        </button>
        <button className="crm-btn primary-solid"><window.Icon name="plus" size={12}/> New contact</button>
      </div>

      <BulkBar count={selected.length} onClear={() => setSelected([])} onAction={() => {}}/>

      {/* Views */}
      <div className="crm-view-body">
        {view === "table"    && <ContactsTable rows={rows} fields={fields} selected={selected} onSelect={onSelect} onSelectAll={onSelectAll} onOpen={setDrawer} density={density} sort={sort} onSort={setSort}/>}
        {view === "kanban"   && <KanbanView rows={rows} groupBy={kanbanGroup} onOpen={setDrawer}/>}
        {view === "calendar" && <CalendarView rows={rows} onOpen={setDrawer}/>}
        {view === "timeline" && <TimelineView rows={rows} onOpen={setDrawer}/>}
        {view === "activity" && <ActivityView pipelineKey={pipeline}/>}
        {view === "accounts" && <CompaniesView rows={rows} onOpen={setDrawer}/>}
      </div>

      <FieldCustomizer
        visible={customizing}
        fields={fields}
        onChange={setFields}
        onClose={() => setCustomizing(false)}
        onAddField={() => setAddingField(true)}
      />

      <AddFieldModal open={addingField} onClose={() => setAddingField(false)} onAdd={() => {}}/>

      {showSettings && <PipelineSettings pipeline={pipeline} onClose={() => setShowSettings(false)}/>}

      {drawer && <ContactDrawer contact={drawer} onClose={() => setDrawer(null)}/>}
    </div>
  );
}

// ============================================================
// PIPELINE SETTINGS MODAL
// ============================================================
function PipelineSettings({ pipeline, onClose }) {
  const p = CONTACT_PIPELINES.find(x => x.key === pipeline) || CONTACT_PIPELINES[0];
  const [stages, setStages] = useState(["New","Contacted","Qualified","Proposal","Negotiation","Won","Lost"]);
  const [tab, setTab] = useState("stages");

  return (
    <div className="crm-mini-backdrop" onClick={onClose}>
      <div className="crm-mini wide" onClick={e => e.stopPropagation()}>
        <div className="crm-mini-head">
          <div>
            <div className="crm-mini-eyebrow">Pipeline settings</div>
            <div className="crm-mini-title">
              <span className="crm-pipe-icon" style={{ background: p.color, display:"inline-flex", marginRight: 8 }}>
                <window.Icon name={p.icon} size={11} style={{color:"#fff"}}/>
              </span>
              {p.label} Pipeline
            </div>
          </div>
          <button className="crm-x" onClick={onClose}><window.Icon name="x" size={14}/></button>
        </div>
        <div className="crm-set-tabs">
          {["stages","statuses","fields","automations","permissions","templates"].map(t => (
            <button key={t} className={tab===t?"on":""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="crm-mini-body">
          {tab === "stages" && (
            <div className="crm-stages-editor">
              <div className="crm-stages-hint">Drag stages to reorder · click to edit name / color</div>
              {stages.map((s, i) => (
                <div key={i} className="crm-stage-edit">
                  <span className="crm-drag">⋮⋮</span>
                  <span className="crm-stage-num mono">{String(i+1).padStart(2,"0")}</span>
                  <input defaultValue={s}/>
                  <div className="crm-stage-colors">
                    {["#6B7FB3","#8A6E8C","#B58B3E","#C37374","#944547","#4E7A4E","#3B2E22"].map((c, ci) => (
                      <button key={ci} className="crm-color-sw" style={{ background: c }}/>
                    ))}
                  </div>
                  <button className="crm-del">✕</button>
                </div>
              ))}
              <button className="crm-btn ghost"><window.Icon name="plus" size={11}/> Add stage</button>
            </div>
          )}
          {tab === "statuses" && (
            <div className="crm-statuses-editor">
              {Object.entries(STATUS_COLORS).map(([k, c]) => (
                <div key={k} className="crm-stage-edit">
                  <span className="crm-drag">⋮⋮</span>
                  <span className="crm-pill" style={{ background: c }}>{k}</span>
                  <input defaultValue={k}/>
                  <div className="crm-stage-colors">
                    {["#6B7FB3","#8A6E8C","#B58B3E","#C37374","#944547","#4E7A4E","#3B2E22","#5A4632"].map((cc, ci) => (
                      <button key={ci} className={"crm-color-sw"+(cc===c?" on":"")} style={{ background: cc }}/>
                    ))}
                  </div>
                  <button className="crm-del">✕</button>
                </div>
              ))}
              <button className="crm-btn ghost"><window.Icon name="plus" size={11}/> Add status</button>
            </div>
          )}
          {tab === "fields" && (
            <div className="crm-stages-editor">
              <div className="crm-stages-hint">Fields used in <b>{p.label}</b> pipeline. Global fields shown with ⌂.</div>
              {ALL_FIELDS.slice(0,10).map(f => (
                <div key={f.key} className="crm-stage-edit">
                  <span className="crm-drag">⋮⋮</span>
                  <span className="crm-field-type" data-t={f.type}>{f.type}</span>
                  <span className="crm-stage-name">{f.label}</span>
                  {f.always && <span className="crm-globe">⌂ Global</span>}
                  <div style={{flex:1}}/>
                  <label className="crm-tiny-toggle"><input type="checkbox" defaultChecked={f.required}/> Required</label>
                  <label className="crm-tiny-toggle"><input type="checkbox" defaultChecked/> Visible</label>
                  <button className="crm-del">✕</button>
                </div>
              ))}
              <button className="crm-btn ghost"><window.Icon name="plus" size={11}/> Add field</button>
              <button className="crm-btn ghost">📋 Duplicate from another pipeline</button>
            </div>
          )}
          {tab === "automations" && (
            <div className="crm-autos">
              {[
                { when:"When status changes to Hot", then:"Notify owner via Slack" },
                { when:"When stage = Proposal",      then:"Create task: Send contract within 24h" },
                { when:"When 30+ days no activity",  then:"Move to Nurture · alert owner" },
                { when:"When deal won",              then:"Move to Onboarding pipeline · Stage = Kickoff" },
              ].map((a, i) => (
                <div key={i} className="crm-auto-row">
                  <span className="crm-auto-when">{a.when}</span>
                  <span className="crm-auto-arrow">→</span>
                  <span className="crm-auto-then">{a.then}</span>
                  <button className="crm-del">✕</button>
                </div>
              ))}
              <button className="crm-btn ghost"><window.Icon name="plus" size={11}/> New automation</button>
            </div>
          )}
          {tab === "permissions" && (
            <div className="crm-perms">
              {["Owner can edit","Team can view","Admin only delete","Required: status, owner"].map((p, i) => (
                <label key={i} className="crm-perm-row"><input type="checkbox" defaultChecked={i!==2}/> {p}</label>
              ))}
            </div>
          )}
          {tab === "templates" && (
            <div className="crm-templates">
              {["SaaS Sales (B2B)","Recruiting","Investor Outreach","Client Onboarding","Partner Relationship","Vendor Management","Real Estate","Custom blank"].map(t => (
                <div key={t} className="crm-template-card">
                  <div className="crm-template-name">{t}</div>
                  <button className="crm-btn ghost">Use template</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="crm-mini-foot">
          <button className="crm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn ghost">Duplicate pipeline</button>
          <button className="crm-btn primary" onClick={onClose}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Contacts });
