/* global window */

// Week indicator
const WEEK = [
  { day: "Mon", date: "Apr 20", theme: "Partners",      status: "done" },
  { day: "Tue", date: "Apr 21", theme: "New Leads",     status: "done" },
  { day: "Wed", date: "Apr 22", theme: "Follow-ups",    status: "today" },
  { day: "Thu", date: "Apr 23", theme: "Past Clients",  status: "upcoming" },
  { day: "Fri", date: "Apr 24", theme: "Close the week",status: "upcoming" },
];

const PROSPECT_SECTIONS = [
  {
    key: "must",
    title: "Must Call Today",
    defaultOpen: true,
    cards: [
      {
        id: "p1",
        name: "Marcus Delgado",
        tag: "lead", tagLabel: "Lead",
        phone: "(714) 555-0194",
        context: "Pre-approval expires Friday. 30-yr conv, 20% down, $820k purchase price. Hasn't responded to 2 emails.",
        action: "Re-qualify income — bonus structure changed last month. Push closing before May 2.",
        priority: "high",
        lastTouch: "6d ago",
      },
      {
        id: "p2",
        name: "Priya Raman",
        tag: "agent", tagLabel: "Agent",
        phone: "(949) 555-0312",
        context: "Listing on Alta Vista accepted offer Monday. Buyer needs pre-approval by EOD Thursday.",
        action: "Ask for buyer intro — offer Saturday open-house co-branded flyer.",
        priority: "high",
        lastTouch: "2d ago",
      },
      {
        id: "p3",
        name: "Jordan & Lee Nakamura",
        tag: "pastclient", tagLabel: "Past Client",
        phone: "(310) 555-0088",
        context: "Funded 2023 at 6.875%. Current market ~5.625%. Break-even in 14 months. Birthday next week.",
        action: "Birthday + refi pitch. Lead with rate savings: ~$312/mo.",
        priority: "high",
        lastTouch: "4mo ago",
      },
    ],
  },
  {
    key: "high",
    title: "High Value",
    defaultOpen: false,
    cards: [
      {
        id: "p4",
        name: "Samantha Orr",
        tag: "partner", tagLabel: "Partner",
        phone: "(310) 555-0441",
        context: "Top-producing agent at Keller — sent 3 deals last year. Quarterly touch-base overdue.",
        action: "Coffee next week. Ask about her jumbo pipeline.",
        priority: "med",
        lastTouch: "3mo ago",
      },
      {
        id: "p5",
        name: "The Okafor Family",
        tag: "lead", tagLabel: "Lead",
        phone: "(626) 555-0199",
        context: "Referred by Priya. First-time buyers, $540k budget, W-2 + rental income.",
        action: "Schedule intake call. Share first-time buyer guide.",
        priority: "med",
        lastTouch: "new",
      },
    ],
  },
  {
    key: "suggest",
    title: "Suggested",
    defaultOpen: false,
    cards: [
      {
        id: "p6",
        name: "Elena Brooks",
        tag: "pastclient", tagLabel: "Past Client",
        phone: "(805) 555-0227",
        context: "Closed 2021. Mentioned 'growing family' on last check-in. HELOC or move-up candidate.",
        action: "Soft check-in. No pitch.",
        priority: "low",
        lastTouch: "6mo ago",
      },
      {
        id: "p7",
        name: "Derek Paulson",
        tag: "agent", tagLabel: "Agent",
        phone: "(714) 555-0311",
        context: "Newer agent at Compass. 1 deal last year. Potential to grow.",
        action: "Intro call — offer free pre-qual tool demo.",
        priority: "low",
        lastTouch: "2mo ago",
      },
    ],
  },
];

// Pipeline
const STAGES = [
  { key: "lead",  label: "Lead",         num: "01" },
  { key: "app",   label: "App",          num: "02" },
  { key: "pre",   label: "Pre-Approval", num: "03" },
  { key: "proc",  label: "Processing",   num: "04" },
  { key: "uw",    label: "Underwriting", num: "05" },
  { key: "fund",  label: "Funded",       num: "06" },
];

const PIPELINE_GROUPS = [
  {
    key: "new", title: "New Leads", cls: "g-new", defaultOpen: true,
    stage: "lead",
    rows: [
      { id: "L001", first: "Aiden", last: "Walsh",       status: "hot",   statusLabel: "Hot", lo: "You",      processor: "—",          lender: "—",            loan: 612000, rev: 12240, com: 6120, stage: "lead", notes: "Referred by Priya R. Called 4/20.", date: "Apr 20" },
      { id: "L002", first: "Maya",  last: "Okafor",      status: "warm",  statusLabel: "Warm",lo: "You",      processor: "—",          lender: "—",            loan: 540000, rev: 10800, com: 5400, stage: "lead", notes: "First-time buyer. Intake Thu 2pm.", date: "Apr 21" },
      { id: "L003", first: "Ben",   last: "Garcia",      status: "cool",  statusLabel: "Cool",lo: "You",      processor: "—",          lender: "—",            loan: 425000, rev:  8500, com: 4250, stage: "lead", notes: "Needs to sell current home first.", date: "Apr 19" },
      { id: "L004", first: "Nia",   last: "Abernathy",   status: "hot",   statusLabel: "Hot", lo: "You",      processor: "—",          lender: "—",            loan: 890000, rev: 17800, com: 8900, stage: "lead", notes: "Cash-out refi. Moving fast.", date: "Apr 22" },
    ],
  },
  {
    key: "contact", title: "Contacted", cls: "g-contact", defaultOpen: true,
    stage: "lead",
    rows: [
      { id: "L010", first: "Marcus",last: "Delgado",     status: "stall", statusLabel: "Stalled",lo: "You",  processor: "—",          lender: "—",            loan: 656000, rev: 13120, com: 6560, stage: "lead", notes: "Pre-approval expires Fri. NR to 2 emails.", date: "Apr 16" },
      { id: "L011", first: "Rosa",  last: "Kim",         status: "warm",  statusLabel: "Warm",lo: "C. Vargas",processor: "—",          lender: "—",            loan: 378000, rev:  7560, com: 3780, stage: "lead", notes: "Awaiting paystubs.", date: "Apr 18" },
      { id: "L012", first: "Andre", last: "Thompson",    status: "hot",   statusLabel: "Hot", lo: "You",      processor: "M. Liu",     lender: "—",            loan: 725000, rev: 14500, com: 7250, stage: "lead", notes: "Ready for app. Wants VA loan.", date: "Apr 20" },
    ],
  },
  {
    key: "app", title: "Application Started", cls: "g-app", defaultOpen: false,
    stage: "app",
    rows: [
      { id: "L020", first: "Jules", last: "Everhart",    status: "warm",  statusLabel: "In Review",lo: "You",processor: "M. Liu",     lender: "Rocket Pro",   loan: 580000, rev: 11600, com: 5800, stage: "app", notes: "1003 complete, awaiting docs.", date: "Apr 17" },
      { id: "L021", first: "Sana",  last: "Malhotra",    status: "ok",    statusLabel: "On Track",lo: "You", processor: "M. Liu",     lender: "UWM",          loan: 940000, rev: 18800, com: 9400, stage: "app", notes: "Jumbo, strong file.", date: "Apr 15" },
    ],
  },
  {
    key: "pre", title: "Pre-Approved", cls: "g-pre", defaultOpen: true,
    stage: "pre",
    rows: [
      { id: "L030", first: "Priya", last: "Raman",       status: "hot",   statusLabel: "Offer Out",lo: "You",processor: "J. Osei",    lender: "PennyMac",     loan: 815000, rev: 16300, com: 8150, stage: "pre", notes: "Offer accepted 4/21 — rush file.", date: "Apr 21" },
      { id: "L031", first: "Tyrell",last: "Washington",  status: "ok",    statusLabel: "Shopping",lo: "You", processor: "J. Osei",    lender: "PennyMac",     loan: 495000, rev:  9900, com: 4950, stage: "pre", notes: "Pre-approval letter issued 4/14.", date: "Apr 14" },
      { id: "L032", first: "Ingrid",last: "Solberg",     status: "warm",  statusLabel: "Shopping",lo: "C. Vargas",processor:"J. Osei", lender: "Rocket Pro",   loan: 670000, rev: 13400, com: 6700, stage: "pre", notes: "Touring this weekend.", date: "Apr 19" },
      { id: "L033", first: "David", last: "Park",        status: "ok",    statusLabel: "Shopping",lo: "You", processor: "J. Osei",    lender: "UWM",          loan: 1125000,rev: 22500, com: 11250,stage: "pre", notes: "Jumbo. Very picky about neighborhoods.", date: "Apr 12" },
    ],
  },
  {
    key: "proc", title: "Processing", cls: "g-proc", defaultOpen: false,
    stage: "proc",
    rows: [
      { id: "L040", first: "Hank",  last: "Mendoza",     status: "ok",    statusLabel: "Docs In", lo: "You", processor: "M. Liu",     lender: "UWM",          loan: 445000, rev:  8900, com: 4450, stage: "proc", notes: "Appraisal ordered.", date: "Apr 10" },
      { id: "L041", first: "Celeste",last:"O'Hara",      status: "warm",  statusLabel: "Conditions",lo: "You",processor: "J. Osei",   lender: "Rocket Pro",   loan: 612000, rev: 12240, com: 6120, stage: "proc", notes: "5 conditions outstanding.", date: "Apr 08" },
    ],
  },
  {
    key: "fund", title: "Funded", cls: "g-fund", defaultOpen: false,
    stage: "fund",
    rows: [
      { id: "L050", first: "Jordan",last: "Nakamura",    status: "ok",    statusLabel: "Funded",  lo: "You", processor: "M. Liu",     lender: "PennyMac",     loan: 582500, rev: 11650, com: 5825, stage: "fund", notes: "Closed 4/18 — 6.875% 30yr.", date: "Apr 18" },
      { id: "L051", first: "Grace", last: "Linwood",     status: "ok",    statusLabel: "Funded",  lo: "You", processor: "J. Osei",    lender: "UWM",          loan: 398000, rev:  7960, com: 3980, stage: "fund", notes: "Refi. Happy client.", date: "Apr 15" },
    ],
  },
];

// Default contact (opened from pipeline)
const CONTACT_DEFAULT = {
  id: "L030",
  name: "Priya Raman",
  tag: "Lead · Pre-Approved",
  phone: "(949) 555-0312",
  email: "priya.raman@gmail.com",
  dob: "Aug 14, 1988",
  source: "Referral — Samantha Orr (Keller Williams)",
  loan: {
    amount: 815000,
    rate: "6.125%",
    product: "30-yr Conventional",
    down: "20% ($203,750)",
    ltv: "80%",
    dti: "36.4%",
    closing: "May 15, 2026",
  },
  stage: "pre",
  messages: [
    { kind: "sms", who: "them", text: "Hey! Offer was accepted last night. They gave us 14 days to close. Can we do it?", when: "Today · 8:12 AM" },
    { kind: "sms", who: "me",   text: "Congrats!! 14 days is tight but doable given you're fully pre-approved. Let me get the file to processing this morning.", when: "Today · 8:18 AM" },
    { kind: "sms", who: "them", text: "Amazing. What do you need from me?", when: "Today · 8:19 AM" },
    { kind: "sms", who: "me",   text: "Updated bank statements (last 2 months) and the signed purchase contract. Rest is on our end.", when: "Today · 8:21 AM" },
    { kind: "note", who: "me",  text: "File is a rush — flagged with J. Osei. Lender is PennyMac, already has the pre-approval package. Expect appraisal order today.", when: "Today · 8:30 AM" },
  ],
  timeline: [
    { kind: "red",   t: "Offer accepted",        s: "1401 Alta Vista Dr — $815k, 14-day close", w: "Today · 8:12 AM" },
    { kind: "navy",  t: "Pre-approval issued",   s: "Up to $850k, 30-yr conv @ 6.125%",          w: "Apr 14" },
    { kind: "green", t: "Application completed", s: "1003 signed, docs uploaded",                w: "Apr 08" },
    { kind: "navy",  t: "Intake call",           s: "45 min. Confirmed W2 income + bonus.",      w: "Apr 02" },
    { kind: "navy",  t: "Referral received",     s: "From Samantha Orr (Keller Williams)",      w: "Mar 28" },
  ],
};

// ===== PRE-APPROVED LOANS BOARD =====
// Monday-style: groups by sub-state, columns include Borrower Phone / Email / LO /
// Stage (colored pill) / Notes / Follow-up / Last Updated / Purpose / Pre-Approved $ / Revenue / Commission
const PREAPPROVED_GROUPS = [
  {
    key: "ratewatch", title: "Rate Watch", cls: "g-ratewatch", defaultOpen: true, color: "#4E7A4E",
    rows: [
      { id: "REFI-001", first: "Darius", last: "Bowen",   phone: "(714) 555-0142", email: "dbowen@gmail.com",      lo: "AR", stagePill: { label: "Rate Watching", cls: "sp-ratewatch" }, notes: "JN — quoted 5.99%, savings of $402/mo",                                 followup: "Mar 19", updated: "1 month ago", purpose: "Refi · R/T",   amount: 525000,  rev: 4995, com: 4245.75 },
      { id: "REFI-002", first: "Phil",   last: "Smith",   phone: "(949) 555-0234", email: "psmith@outlook.com",    lo: "CV", stagePill: { label: "Rate Watching", cls: "sp-ratewatch" }, notes: "GG 11:14 — follow-up email sent to Phil. Sent to Adriana to review prior to.", followup: "Feb 3",  updated: "1 month ago", purpose: "Refi · R/T",   amount: 504000,  rev: 4599, com: 4245.75 },
      { id: "REFI-003", first: "Miley",  last: "Tran",    phone: "(310) 555-0198", email: "mtran@gmail.com",       lo: "AR", stagePill: { label: "Rate Watching", cls: "sp-ratewatch" }, notes: "GG 11:19 — Follow-up email sent to borrower, waiting on borrower's response.", followup: "Feb 3",  updated: "1 month ago", purpose: "Refi · R/T",   amount: 408000,  rev: 3595, com: 3395.75 },
      { id: "REFI-004", first: "Hunter", last: "Swain",   phone: "(626) 555-0311", email: "hswain@yahoo.com",      lo: "AR", stagePill: { label: "Rate Watching", cls: "sp-ratewatch" }, notes: "AG · Per Jason, Keep Swain in the rate shopping group on Monday, pushed.", followup: "Feb 3",  updated: "1 month ago", purpose: "Refi · R/T",   amount: 2000000, rev: 3595, com: 8495.75, bonus: 1499.25, proc: 800 },
    ],
  },
  {
    key: "apppending", title: "Leads (app pending)", cls: "g-app", defaultOpen: true, color: "#B58B3E",
    rows: [
      { id: "PA-010", first: "Pamela",   last: "Solomon",  phone: "(213) 555-0410", email: "pamela@somefirm.co",  lo: "AR", stagePill: { label: "LO to contact Client", cls: "sp-lotocall" }, notes: "GG 4:13: Follow-up group text sent, notes in arms, JN-OB/OR purchase…",  followup: "Apr 9", updated: "1 week ago", purpose: "Refi · R/T",    amount: null, rev: null, com: null },
      { id: "PA-011", first: "Pattie",   last: "Stennett", phone: "(323) 555-0229", email: "pstennett@gmail.com", lo: "CV", stagePill: { label: "LO to contact Client", cls: "sp-lotocall" }, notes: "GG 4:13: Follow-up group text sent, notes in arms. JN - Nakeisha has been…", followup: "Apr 9", updated: "1 week ago", purpose: "Refi · R/T",    amount: null, rev: null, com: null },
      { id: "PA-012", first: "Victoria", last: "Tijerina", phone: "(626) 555-0541", email: "vt@outlook.com",      lo: "AR", stagePill: { label: "LO to contact Client", cls: "sp-lotocall" }, notes: "GG 4:13: Emailed team to please add me to Annie's soonest view this app…", followup: "Apr 9", updated: "1 week ago", purpose: "Refi · R/T",    amount: null, rev: null, com: null },
      { id: "PA-013", first: "Chris",    last: "Shim",     phone: "—",              email: "—",                   lo: "AR", stagePill: { label: "Hot Leads", cls: "sp-hot" },                  notes: "7:14 rec'll even contact lead",                                            followup: "—",      updated: "1 week ago", purpose: "Refi · C/O",    amount: null, rev: null, com: null },
      { id: "PA-014", first: "Corbin",   last: "Pierce",   phone: "(714) 555-0878", email: "corbin@gmail.com",    lo: "AR", stagePill: { label: "Hot Leads", cls: "sp-hot" },                  notes: "about to make an offer using bank statements as income",                  followup: "—",      updated: "3 hours ago", purpose: "Hard Loan",    amount: null, rev: null, com: null },
    ],
  },
  {
    key: "beingworked", title: "Leads In (being worked)", cls: "g-contact", defaultOpen: true, color: "#6B7FB3",
    rows: [
      { id: "PA-020", first: "Beth",       last: "Smith",        phone: "(512) 555-0109", email: "—",                      lo: "AR", stagePill: { label: "Waiting on Docs", cls: "sp-waiting" }, notes: "COMMERCIAL LOAN: JB — waiting on PFS and DEBT schedule",                              followup: "Apr 30", updated: "6 days ago",  purpose: "Refi · R/T",   amount: null, rev: null, com: null },
      { id: "PA-021", first: "Todd",       last: "Laubach",      phone: "(408) 555-0442", email: "todd@marathon.co",       lo: "AR", stagePill: { label: "Waiting on Docs", cls: "sp-waiting" }, notes: "GG 4:16 SKINNY FOLLOW-UP TEXT ON DOCS. Need to check-in.",                              followup: "Apr 14", updated: "6 days ago",  purpose: "Refi · C/O",   amount: null, rev: null, com: null },
      { id: "PA-022", first: "Farrell",    last: "Fellowes",     phone: "(818) 555-0188", email: "info@kingdom.biz",       lo: "AR", stagePill: { label: "App Pending", cls: "sp-apppending" },  notes: "GG 4:13: Follow-up text sent to JB to ask him what subject property h…",             followup: "Apr 5",  updated: "6 days ago",  purpose: "Refi · R/T",   amount: null, rev: null, com: null },
      { id: "PA-023", first: "Covenant",   last: "Olalanda",     phone: "(646) 555-0091", email: "covenant@gmail.com",     lo: "AR", stagePill: { label: "App Pending", cls: "sp-apppending" },  notes: "JM 4:8 Need app and docs to begin will",                                              followup: "—",      updated: "3 hours ago", purpose: "Refi · R/T",   amount: null, rev: null, com: null },
      { id: "PA-024", first: "Beyamead",   last: "Ngiesmen",     phone: "(718) 555-0337", email: "—",                      lo: "CV", stagePill: { label: "Needs Updated Num…", cls: "sp-needsnum" }, notes: "GG 4:20: Email sent to LO for further clarification. 4:23 texted to…",            followup: "—",      updated: "6 days ago",  purpose: "Purchase",     amount: null, rev: null, com: null },
    ],
  },
  {
    key: "preapproved", title: "PreApproved / Shopping", cls: "g-pre", defaultOpen: true, color: "#B58B3E",
    rows: [
      { id: "PA-030", first: "Christopher", last: "Chester",    phone: "(310) 555-1122", email: "cchester@gmail.com",    lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:28: Email sent to check-in. 4.7.26 texted to check-in.",                 followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: 118000, rev: null, com: null },
      { id: "PA-031", first: "Josiah",      last: "Arendina",   phone: "(415) 555-0229", email: "jarendina@gmail.com",   lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:3:26: Email sent to check-in. 4.7.26 texted to check-in IL…",            followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: 325000, rev: null, com: null },
      { id: "PA-032", first: "Nabeela",     last: "Green",      phone: "(713) 555-0337", email: "ngreen@yahoo.com",      lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:3:26: Email sent to check-in. 4.7.26 texted to check-in.",                followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: 550000, rev: null, com: null },
      { id: "PA-033", first: "Jonathan",    last: "Jimenez",    phone: "(602) 555-0449", email: "jonathanj@gmail.com",   lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:3:26: Email sent to check-in.",                                           followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: null,   rev: null, com: null },
      { id: "PA-034", first: "Rafael",      last: "Greco",      phone: "(786) 555-0617", email: "rafael.g@outlook.com",  lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:3:26: App showing delivered in Arva: Seriт email to check in 4…",        followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: null,   rev: null, com: null },
      { id: "PA-035", first: "Marcus",      last: "Pao",        phone: "(415) 555-0721", email: "mpao@gmail.com",        lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:3:26: emailed LO to add me to the loan in Arrow, gave PA letter t…",     followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: null,   rev: null, com: null },
      { id: "PA-036", first: "Hector",      last: "Balan",      phone: "(305) 555-0833", email: "hbalan@gmail.com",      lo: "AR", stagePill: { label: "Pre-Approved", cls: "sp-pre" }, notes: "GG 4:4:26: need to refresh stubs and w2s 4.7.26 texted to check-in.",        followup: "Feb 18", updated: "2 weeks ago", purpose: "Purchase", amount: null,   rev: null, com: null },
    ],
  },
];

// ===== PAST CLIENTS BOARD =====
const PASTCLIENTS_GROUPS = [
  {
    key: "refi-eligible", title: "Refi Eligible (Rate Savings)", cls: "g-fund", defaultOpen: true, color: "#4E7A4E",
    rows: [
      { id: "PC-001", first: "Jordan",   last: "Nakamura",   phone: "(310) 555-0088", email: "j.nakamura@gmail.com",    lo: "AR", stagePill: { label: "Refi Opportunity", cls: "sp-hot" },      notes: "Closed 2023 @ 6.875%. Market ~5.625%. Break-even 14mo. Birthday next week.",    followup: "Apr 28", updated: "4 days ago",  purpose: "Refi · R/T",  amount: 582500, rev: 11650, com: 5825 },
      { id: "PC-002", first: "Grace",    last: "Linwood",    phone: "(310) 555-0092", email: "grace.l@outlook.com",     lo: "AR", stagePill: { label: "Refi Opportunity", cls: "sp-hot" },      notes: "Closed 2022 @ 7.125%. Strong refi candidate. Happy client.",                     followup: "Apr 30", updated: "1 week ago",  purpose: "Refi · R/T",  amount: 398000, rev:  7960, com: 3980 },
      { id: "PC-003", first: "Martin",   last: "Castaneda",  phone: "(714) 555-0176", email: "martin.c@gmail.com",      lo: "AR", stagePill: { label: "Rate Watching", cls: "sp-ratewatch" },   notes: "Waiting for 5.5% to pull trigger. Check-in monthly.",                            followup: "May 5",  updated: "2 weeks ago", purpose: "Refi · R/T",  amount: 712000, rev: null,  com: null },
    ],
  },
  {
    key: "life-event", title: "Life Event Watch", cls: "g-contact", defaultOpen: true, color: "#8A6E8C",
    rows: [
      { id: "PC-010", first: "Elena",    last: "Brooks",     phone: "(805) 555-0227", email: "elena.brooks@gmail.com",  lo: "AR", stagePill: { label: "Move-Up Candidate", cls: "sp-apppending" }, notes: "Mentioned 'growing family' on last check-in. HELOC or move-up candidate.",    followup: "Apr 29", updated: "6 months ago", purpose: "HELOC",      amount: 620000, rev: null, com: null },
      { id: "PC-011", first: "Marcus",   last: "Webber",     phone: "(619) 555-0310", email: "m.webber@outlook.com",    lo: "AR", stagePill: { label: "HELOC Eligible", cls: "sp-apppending" },   notes: "New child on the way. Equity ~$180k.",                                         followup: "May 2",  updated: "3 months ago", purpose: "HELOC",      amount: 180000, rev: null, com: null },
      { id: "PC-012", first: "Sonia",    last: "Vega",       phone: "(408) 555-0271", email: "sonia.vega@gmail.com",    lo: "AR", stagePill: { label: "Relocation Risk", cls: "sp-needsnum" },   notes: "Husband took job in Austin. May list Q3.",                                      followup: "Jun 1",  updated: "2 weeks ago",  purpose: "Sale/New",   amount: null,   rev: null, com: null },
    ],
  },
  {
    key: "referral-source", title: "Top Referral Sources", cls: "g-new", defaultOpen: false, color: "#6B7FB3",
    rows: [
      { id: "PC-020", first: "Angela",   last: "Petrov",     phone: "(310) 555-0402", email: "a.petrov@gmail.com",      lo: "AR", stagePill: { label: "VIP", cls: "sp-pre" },                   notes: "Sent 3 referrals in last 18mo. Send holiday gift + quarterly touch.",          followup: "May 1",  updated: "1 week ago",   purpose: "Partner",    amount: null, rev: null, com: null },
      { id: "PC-021", first: "Marcus",   last: "Liang",      phone: "(415) 555-0617", email: "m.liang@outlook.com",     lo: "AR", stagePill: { label: "VIP", cls: "sp-pre" },                   notes: "Active referral source. Refi'd twice.",                                        followup: "May 3",  updated: "2 weeks ago",  purpose: "Partner",    amount: null, rev: null, com: null },
    ],
  },
  {
    key: "nurture", title: "Nurture / Anniversary", cls: "g-app", defaultOpen: false, color: "#B58B3E",
    rows: [
      { id: "PC-030", first: "Tobias",   last: "Armand",     phone: "(702) 555-0991", email: "t.armand@gmail.com",      lo: "AR", stagePill: { label: "1yr Anniversary", cls: "sp-waiting" },    notes: "Funded 4/22/25. Send closing-day photo + anniversary note.",                   followup: "Apr 22", updated: "today",        purpose: "Nurture",    amount: 445000, rev: null, com: null },
      { id: "PC-031", first: "Rhea",     last: "Chen",       phone: "(206) 555-0718", email: "rhea.c@gmail.com",        lo: "AR", stagePill: { label: "2yr Anniversary", cls: "sp-waiting" },    notes: "Funded 3/11/24. Quick check-in text.",                                          followup: "Mar 11", updated: "1 month ago",  purpose: "Nurture",    amount: 522000, rev: null, com: null },
      { id: "PC-032", first: "Derek",    last: "Oyelaran",   phone: "(404) 555-0814", email: "derek.o@outlook.com",     lo: "AR", stagePill: { label: "Holiday Card", cls: "sp-waiting" },       notes: "Funded 2022. Card list.",                                                       followup: "Dec 10", updated: "4 months ago", purpose: "Nurture",    amount: 389000, rev: null, com: null },
    ],
  },
  {
    key: "dormant", title: "Dormant (12mo+ no contact)", cls: "g-proc", defaultOpen: false, color: "#3E6E73",
    rows: [
      { id: "PC-040", first: "Hana",     last: "Murai",      phone: "(650) 555-0229", email: "h.murai@gmail.com",       lo: "AR", stagePill: { label: "Reactivate", cls: "sp-needsnum" },       notes: "Funded 2021. No touch in 14 months.",                                           followup: "ASAP",   updated: "14 months ago", purpose: "Nurture",   amount: 467000, rev: null, com: null },
      { id: "PC-041", first: "Brent",    last: "Okonkwo",    phone: "(832) 555-0511", email: "brent.o@yahoo.com",       lo: "AR", stagePill: { label: "Reactivate", cls: "sp-needsnum" },       notes: "Funded 2020. Moved to Houston.",                                                followup: "ASAP",   updated: "16 months ago", purpose: "Nurture",   amount: 355000, rev: null, com: null },
    ],
  },
];

Object.assign(window, { WEEK, PROSPECT_SECTIONS, STAGES, PIPELINE_GROUPS, CONTACT_DEFAULT, PREAPPROVED_GROUPS, PASTCLIENTS_GROUPS });
