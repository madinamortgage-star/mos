/* global window */

// ===== ACTIVE LEADS BOARD (Monday-style, 6 groups) =====
const ACTIVELEADS_GROUPS = [
  {
    key: "new", title: "New Leads", cls: "g-new", defaultOpen: true, color: "#6B7FB3",
    rows: [
      { id: "AL-001", first: "Aiden",   last: "Walsh",      phone: "(714) 555-0102", email: "aiden.walsh@gmail.com",    lo: "AR", stagePill: { label: "New", cls: "sp-hot" },             notes: "Referred by Priya R. Hot — wants to move fast.",         followup: "Apr 23", updated: "today",       purpose: "Purchase",  amount: 612000, rev: 12240, com: 6120 },
      { id: "AL-002", first: "Maya",    last: "Okafor",     phone: "(626) 555-0199", email: "maya.okafor@outlook.com",  lo: "AR", stagePill: { label: "New", cls: "sp-hot" },             notes: "First-time buyer. Intake Thu 2pm.",                       followup: "Apr 24", updated: "yesterday",   purpose: "Purchase",  amount: 540000, rev: 10800, com: 5400 },
      { id: "AL-003", first: "Ben",     last: "Garcia",     phone: "(310) 555-0337", email: "ben.g@gmail.com",          lo: "AR", stagePill: { label: "New", cls: "sp-hot" },             notes: "Needs to sell current home first.",                       followup: "Apr 25", updated: "2 days ago",  purpose: "Purchase",  amount: 425000, rev:  8500, com: 4250 },
    ],
  },
  {
    key: "contacted", title: "Contacted", cls: "g-contact", defaultOpen: true, color: "#8A6E8C",
    rows: [
      { id: "AL-010", first: "Marcus",  last: "Delgado",    phone: "(714) 555-0194", email: "m.delgado@gmail.com",      lo: "AR", stagePill: { label: "LO to contact Client", cls: "sp-lotocall" }, notes: "Pre-approval expires Friday. NR to 2 emails.", followup: "Apr 22", updated: "6 days ago",  purpose: "Purchase",  amount: 656000, rev: 13120, com: 6560 },
      { id: "AL-011", first: "Rosa",    last: "Kim",        phone: "(818) 555-0277", email: "rosa.kim@yahoo.com",       lo: "CV", stagePill: { label: "Waiting on Docs", cls: "sp-waiting" },     notes: "Awaiting paystubs.",                            followup: "Apr 24", updated: "4 days ago",  purpose: "Purchase",  amount: 378000, rev:  7560, com: 3780 },
    ],
  },
  {
    key: "app", title: "Application Started", cls: "g-app", defaultOpen: true, color: "#B58B3E",
    rows: [
      { id: "AL-020", first: "Jules",   last: "Everhart",   phone: "(213) 555-0411", email: "jules.e@gmail.com",        lo: "AR", stagePill: { label: "App Pending", cls: "sp-apppending" },      notes: "1003 complete, awaiting docs.",               followup: "Apr 25", updated: "5 days ago",  purpose: "Purchase",  amount: 580000, rev: 11600, com: 5800 },
      { id: "AL-021", first: "Sana",    last: "Malhotra",   phone: "(415) 555-0119", email: "sana.m@outlook.com",       lo: "AR", stagePill: { label: "App Pending", cls: "sp-apppending" },      notes: "Jumbo, strong file.",                          followup: "Apr 26", updated: "1 week ago",  purpose: "Purchase",  amount: 940000, rev: 18800, com: 9400 },
    ],
  },
  {
    key: "worked", title: "Being Worked", cls: "g-proc", defaultOpen: true, color: "#3E6E73",
    rows: [
      { id: "AL-030", first: "Andre",   last: "Thompson",   phone: "(310) 555-0512", email: "andre.t@gmail.com",        lo: "AR", stagePill: { label: "Needs Updated Num…", cls: "sp-needsnum" }, notes: "VA loan. Pulling COE.",                       followup: "Apr 23", updated: "2 days ago",  purpose: "Purchase",  amount: 725000, rev: 14500, com: 7250 },
      { id: "AL-031", first: "Hank",    last: "Mendoza",    phone: "(602) 555-0918", email: "hank.m@yahoo.com",         lo: "AR", stagePill: { label: "Waiting on Docs", cls: "sp-waiting" },     notes: "Appraisal ordered.",                           followup: "Apr 28", updated: "3 days ago",  purpose: "Purchase",  amount: 445000, rev:  8900, com: 4450 },
    ],
  },
  {
    key: "preapp", title: "Pre-Approved", cls: "g-pre", defaultOpen: true, color: "#D8A13A",
    rows: [
      { id: "AL-040", first: "Priya",   last: "Raman",      phone: "(949) 555-0312", email: "priya.r@gmail.com",        lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" },             notes: "Offer accepted 4/21 — rush file.",            followup: "Apr 22", updated: "today",       purpose: "Purchase",  amount: 815000, rev: 16300, com: 8150 },
      { id: "AL-041", first: "David",   last: "Park",       phone: "(415) 555-0721", email: "david.p@outlook.com",      lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" },             notes: "Jumbo. Picky neighborhoods.",                  followup: "Apr 28", updated: "1 week ago",  purpose: "Purchase",  amount: 1125000,rev: 22500, com: 11250 },
    ],
  },
  {
    key: "lost", title: "Inactive / Lost", cls: "g-fund", defaultOpen: false, color: "#8A745A",
    rows: [
      { id: "AL-050", first: "Trevor",  last: "Hwang",      phone: "(206) 555-0319", email: "trevor.h@gmail.com",       lo: "AR", stagePill: { label: "Cold", cls: "sp-needsnum" },               notes: "Went with credit union. Re-engage in Q3.",     followup: "Jul 1",  updated: "3 weeks ago", purpose: "Purchase",  amount: null,   rev: null,  com: null },
    ],
  },
];

// ===== DASHBOARD DATA =====
const DASHBOARD = {
  // Money opportunity hero
  available: 182450,
  captured: 42180,
  buckets: [
    { key: "pipeline", label: "Pipeline Commission", value: 87650, sub: "17 loans in process", icon: "🔥", tone: "navy" },
    { key: "preapp",   label: "Pre-Approved Opportunity", value: 56200, sub: "11 buyers shopping", icon: "💡", tone: "amber" },
    { key: "refi",     label: "Past Client Refi", value: 38600, sub: "23 candidates @ 5.625%", icon: "↻", tone: "red" },
  ],
  // Today
  todayCalls: 5, todayGoal: 12,
  topCalls: [
    { id: "p1", name: "Marcus Delgado",   reason: "Pre-approval expires Friday — re-qualify income",   value: 6560,  tag: "Lead" },
    { id: "p2", name: "Priya Raman",      reason: "Offer accepted — rush file to processing",           value: 8150,  tag: "Pre-Approved" },
    { id: "p3", name: "Jordan Nakamura",  reason: "Refi opportunity — $312/mo savings",                 value: 5825,  tag: "Past Client" },
  ],
  yesterdayMissed: 2,
  habits: [
    { key: "calls", label: "12 prospecting calls",       done: false, value: 5, of: 12 },
    { key: "follow", label: "Pipeline follow-ups",        done: true },
    { key: "update", label: "Update loan statuses",       done: false },
    { key: "admin",  label: "Process daily admin queue",  done: false },
  ],
  // Week
  week: [
    { day: "Mon", date: "Apr 20", theme: "Partners",       calls: 12, goal: 12, status: "done" },
    { day: "Tue", date: "Apr 21", theme: "New Leads",      calls: 11, goal: 12, status: "done" },
    { day: "Wed", date: "Apr 22", theme: "Follow-ups",     calls:  5, goal: 12, status: "today" },
    { day: "Thu", date: "Apr 23", theme: "Past Clients",   calls:  0, goal: 12, status: "upcoming" },
    { day: "Fri", date: "Apr 24", theme: "Close the week", calls:  0, goal: 10, status: "upcoming" },
  ],
  reminders: [
    { kind: "birthday", text: "Jordan Nakamura — birthday Thursday",  cta: "Schedule call" },
    { kind: "deadline", text: "Marcus Delgado — pre-approval expires Friday", cta: "Re-qualify" },
    { kind: "rolled",   text: "2 missed calls rolled forward from Tuesday",  cta: "Add to today" },
  ],
  // Month
  month: {
    fundings: 6,
    pipelineValue: 9_820_000,
    projectedIncome: 62150,
    goal: 100000,
    trend: [22, 28, 31, 18, 35, 42, 47, 51, 58, 62, 60, 62],
  },
  // Year
  year: {
    goal: 1_200_000,
    ytd: 412800,
    pace: 1_140_400,
    funnel: [
      { label: "Calls",         value: 1842 },
      { label: "Leads",         value:  287 },
      { label: "Pre-Approvals", value:   94 },
      { label: "Closings",      value:   28 },
    ],
  },
};

// ===== UPGRADED PROSPECTING (grouped by contact type) =====
const PROSPECT_TYPED = [
  {
    key: "highvalue",
    title: "🔥 High Value Opportunities",
    eyebrow: "Top of the pile",
    isHighValue: true,
    defaultOpen: true,
    cards: [
      {
        id: "hv1", name: "Priya Raman", tag: "agent", tagLabel: "Agent · Pre-Approved",
        phone: "(949) 555-0312",
        context: "Listing on Alta Vista accepted offer Monday. Buyer needs pre-approval by EOD Thursday. $815k file already in motion.",
        action: "Rush file to processing today. Ask for buyer intro on next listing.",
        value: 8150, valueLabel: "Est. commission",
        priority: "high", lastTouch: "2d ago",
      },
      {
        id: "hv2", name: "Samantha Orr", tag: "partner", tagLabel: "Top Referral Source",
        phone: "(310) 555-0441",
        context: "Top-producing agent at Keller — sent 3 deals last year ($23K commission). Quarterly touch-base 2 weeks overdue.",
        action: "Coffee next week. Ask about her jumbo pipeline. Reinforce the relationship.",
        value: 23000, valueLabel: "12mo value",
        priority: "high", lastTouch: "3mo ago",
      },
    ],
  },
  {
    key: "agents",
    title: "Agents / Partners",
    defaultOpen: false,
    cards: [
      {
        id: "ag1", name: "Derek Paulson", tag: "agent", tagLabel: "Agent",
        phone: "(714) 555-0311",
        context: "Newer agent at Compass. 1 deal last year. Open to partnership.",
        action: "Intro call — offer free pre-qual tool demo.",
        value: 5000, valueLabel: "Potential",
        priority: "med", lastTouch: "2mo ago",
      },
      {
        id: "ag2", name: "Maya Lansing", tag: "partner", tagLabel: "Title Partner",
        phone: "(818) 555-0207",
        context: "Quarterly partner — sends 1-2 referrals/yr. Holiday cadence due.",
        action: "Quick check-in text. Reference her last referral.",
        value: 4500, valueLabel: "12mo value",
        priority: "med", lastTouch: "5mo ago",
      },
    ],
  },
  {
    key: "leads",
    title: "Active Leads",
    defaultOpen: true,
    cards: [
      {
        id: "ld1", name: "Marcus Delgado", tag: "lead", tagLabel: "Lead",
        phone: "(714) 555-0194",
        context: "Pre-approval expires Friday. 30-yr conv, 20% down, $820k purchase. Hasn't responded to 2 emails.",
        action: "Re-qualify income — bonus structure changed. Push closing before May 2.",
        value: 6560, valueLabel: "Est. commission",
        priority: "high", lastTouch: "6d ago",
      },
      {
        id: "ld2", name: "The Okafor Family", tag: "lead", tagLabel: "Lead",
        phone: "(626) 555-0199",
        context: "Referred by Priya. First-time buyers, $540k budget, W-2 + rental income.",
        action: "Schedule intake call. Share first-time buyer guide.",
        value: 5400, valueLabel: "Est. commission",
        priority: "med", lastTouch: "new",
      },
    ],
  },
  {
    key: "past",
    title: "Past Clients",
    defaultOpen: false,
    cards: [
      {
        id: "pc1", name: "Elena Brooks", tag: "pastclient", tagLabel: "Past Client",
        phone: "(805) 555-0227",
        context: "Closed 2021. Mentioned 'growing family' on last check-in. HELOC or move-up candidate.",
        action: "Soft check-in. No pitch.",
        value: null, valueLabel: "Move-up potential",
        priority: "low", lastTouch: "6mo ago",
      },
    ],
  },
];

// ===== REFI OPPORTUNITIES =====
const REFI_OPPS = [
  { id: "r1", name: "Jordan Nakamura",   prevRate: "6.875%", currentRate: "5.625%", savings: 312, balance: 582500, commission: 5825, since: "Closed 2023" },
  { id: "r2", name: "Grace Linwood",     prevRate: "7.125%", currentRate: "5.625%", savings: 396, balance: 398000, commission: 3980, since: "Closed 2022" },
  { id: "r3", name: "Martin Castaneda",  prevRate: "6.625%", currentRate: "5.625%", savings: 248, balance: 712000, commission: 7120, since: "Closed 2023" },
  { id: "r4", name: "Tobias Armand",     prevRate: "7.250%", currentRate: "5.625%", savings: 442, balance: 445000, commission: 4450, since: "Closed 2025" },
];

Object.assign(window, { ACTIVELEADS_GROUPS, DASHBOARD, PROSPECT_TYPED, REFI_OPPS });
