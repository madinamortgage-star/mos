/* global window */

// Partner data — realtors, CPAs, financial advisors, etc.
// Grouped by engagement level. Each row is a partner with full column set.

function nextAction(p) {
  // Logic: based on deals + last contact + status
  const last = p._daysSinceContact;
  if (p.status === "hot" && p.deals12 >= 5) return { text: "Check-in — top partner", urgency: "high" };
  if (last >= 60 && p.deals12 > 0) return { text: `Reconnect — ${last} days silent`, urgency: "high" };
  if (last >= 30) return { text: `Call — no contact in ${last} days`, urgency: "med" };
  if (p.deals12 >= 2 && last <= 14) return { text: "Follow-up — sent 2+ deals recently", urgency: "med" };
  if (p.status === "cold") return { text: "Reactivate — was a producer", urgency: "low" };
  if (p.deals12 === 0) return { text: "Nurture — no deals yet", urgency: "low" };
  return { text: "Maintain rhythm", urgency: "low" };
}

function highValue(p) {
  const score = p.deals12 * 30 + p.totalTx * 4 + (p.annualValue / 1000);
  if (score >= 280) return { tag: "vip", label: "⭐ VIP" };
  if (score >= 160) return { tag: "hot", label: "🔥 High Value" };
  return null;
}

const PARTNERS_RAW = [
  // VIP
  { gid: "vip", name: "Westgate Realty", contact: "Jordan Park", phone: "(415) 555-0142", email: "jordan@westgate.re", birthday: "Mar 14",
    deals12: 11, totalTx: 38, annualValue: 87000, lastContact: "Apr 21", nextContact: "Apr 28",
    notes: "Asked about HELOC programs for past clients — sent overview.",
    status: "hot", callDone: true, _daysSinceContact: 1, dayBucket: "Mon" },
  { gid: "vip", name: "Pacific Heights Group", contact: "M. Reyes", phone: "(415) 555-0188", email: "m.reyes@phgroup.com", birthday: "Aug 02",
    deals12: 9, totalTx: 31, annualValue: 71000, lastContact: "Apr 18", nextContact: "May 02",
    notes: "Pipeline of 3 listings going under contract this week.",
    status: "hot", callDone: false, _daysSinceContact: 4, dayBucket: "Mon" },
  { gid: "vip", name: "Hartwell & Co. CPAs", contact: "L. Hartwell", phone: "(415) 555-0203", email: "leah@hartwellco.com", birthday: "Nov 21",
    deals12: 7, totalTx: 22, annualValue: 64000, lastContact: "Apr 12", nextContact: "Apr 26",
    notes: "Tax-season referrals — wants quarterly lunch cadence.",
    status: "hot", callDone: false, _daysSinceContact: 10, dayBucket: "Tue" },

  // Active
  { gid: "act", name: "Coast & Crown Realty", contact: "T. Nguyen", phone: "(415) 555-0177", email: "tnguyen@coastcrown.com", birthday: "Feb 09",
    deals12: 4, totalTx: 14, annualValue: 32000, lastContact: "Apr 15", nextContact: "Apr 29",
    notes: "Two new buyers in Q2 — needs pre-quals.",
    status: "warm", callDone: false, _daysSinceContact: 7, dayBucket: "Wed" },
  { gid: "act", name: "Bayline Brokerage", contact: "S. Ahmed", phone: "(415) 555-0214", email: "s.ahmed@bayline.re", birthday: "Jun 30",
    deals12: 3, totalTx: 9, annualValue: 24000, lastContact: "Mar 28", nextContact: "Apr 25",
    notes: "Sent 2 deals in March — wants jumbo product training.",
    status: "warm", callDone: true, _daysSinceContact: 25, dayBucket: "Wed" },
  { gid: "act", name: "Marina Realty Partners", contact: "K. Bauer", phone: "(415) 555-0269", email: "kara@marinarealty.com", birthday: "Sep 17",
    deals12: 3, totalTx: 11, annualValue: 27000, lastContact: "Apr 02", nextContact: "Apr 30",
    notes: "Co-hosted open house last weekend, 12 leads.",
    status: "warm", callDone: false, _daysSinceContact: 20, dayBucket: "Tue" },
  { gid: "act", name: "Eastgate Wealth Advisors", contact: "R. Pham", phone: "(415) 555-0331", email: "raj@eastgatewa.com", birthday: "Jan 28",
    deals12: 2, totalTx: 7, annualValue: 18500, lastContact: "Apr 09", nextContact: "May 06",
    notes: "Refi referrals from high-income clients.",
    status: "warm", callDone: false, _daysSinceContact: 13, dayBucket: "Thu" },

  // New / Growing
  { gid: "new", name: "Crestline Realty", contact: "A. Okafor", phone: "(415) 555-0402", email: "a.okafor@crestline.com", birthday: "May 11",
    deals12: 1, totalTx: 1, annualValue: 7500, lastContact: "Apr 19", nextContact: "May 03",
    notes: "First deal closed last month — wants drip campaign.",
    status: "warm", callDone: true, _daysSinceContact: 3, dayBucket: "Wed" },
  { gid: "new", name: "Seaview Realty", contact: "D. Lopez", phone: "(415) 555-0455", email: "diana@seaviewre.com", birthday: "Oct 04",
    deals12: 1, totalTx: 1, annualValue: 6800, lastContact: "Apr 11", nextContact: "Apr 25",
    notes: "Met at networking event — first co-marketing piece going out.",
    status: "warm", callDone: false, _daysSinceContact: 11, dayBucket: "Mon" },
  { gid: "new", name: "Halsted Tax Group", contact: "P. Halsted", phone: "(415) 555-0498", email: "phalsted@halstedtax.com", birthday: "Dec 03",
    deals12: 0, totalTx: 0, annualValue: 0, lastContact: "Apr 05", nextContact: "Apr 28",
    notes: "Intro meeting — interested in tax-strategy referrals.",
    status: "warm", callDone: false, _daysSinceContact: 17, dayBucket: "Thu" },

  // Cold
  { gid: "cold", name: "Ridgemont Realty", contact: "N. Carter", phone: "(415) 555-0512", email: "ncarter@ridgemont.com", birthday: "Jul 22",
    deals12: 0, totalTx: 6, annualValue: 4000, lastContact: "Jan 14", nextContact: "Apr 30",
    notes: "Used to send 3-4/yr — went quiet in Q4.",
    status: "cold", callDone: false, _daysSinceContact: 98, dayBucket: "Thu" },
  { gid: "cold", name: "Anchor Bay Realty", contact: "J. Vance", phone: "(415) 555-0588", email: "jvance@anchorbay.com", birthday: "Apr 19",
    deals12: 0, totalTx: 4, annualValue: 2500, lastContact: "Feb 08", nextContact: "May 05",
    notes: "Birthday this week — perfect re-engagement window.",
    status: "cold", callDone: false, _daysSinceContact: 73, dayBucket: "Tue" },
];

// Decorate
PARTNERS_RAW.forEach(p => {
  p.id = "PRT-" + p.name.split(/\s+/).map(w => w[0]).join("").toUpperCase() + "-" + Math.floor(Math.random()*900+100);
  p.action = nextAction(p);
  p.hv = highValue(p);
});

const PARTNER_GROUPS = [
  { key: "vip",  title: "VIP Partners",            color: "#D8A13A", subtitle: "Top 3 by revenue + relationship",
    rows: PARTNERS_RAW.filter(p => p.gid === "vip"), defaultOpen: true },
  { key: "act",  title: "Active Partners",         color: "#3E6E73", subtitle: "Sent ≥1 deal in last 90 days",
    rows: PARTNERS_RAW.filter(p => p.gid === "act"), defaultOpen: true },
  { key: "new",  title: "New / Growing Partners",  color: "#6B7FB3", subtitle: "Onboarded < 6 months ago",
    rows: PARTNERS_RAW.filter(p => p.gid === "new"), defaultOpen: true },
  { key: "cold", title: "Inactive / Cold Partners", color: "#8A6E8C", subtitle: "No activity in 60+ days",
    rows: PARTNERS_RAW.filter(p => p.gid === "cold"), defaultOpen: false },
];

const PARTNER_DAY_GROUPS = ["Mon", "Tue", "Wed", "Thu"].map(d => ({
  key: "d-" + d.toLowerCase(),
  title: d === "Mon" ? "Monday — VIP & top realtors"
       : d === "Tue" ? "Tuesday — CPAs & advisors"
       : d === "Wed" ? "Wednesday — active brokers"
       : "Thursday — re-engagement",
  color: d === "Mon" ? "#D8A13A" : d === "Tue" ? "#3E6E73" : d === "Wed" ? "#6B7FB3" : "#8A6E8C",
  subtitle: d === "Mon" ? "Anchor day — deepen relationships"
          : d === "Tue" ? "Quarterly cadence with referrers"
          : d === "Wed" ? "Mid-week check-in with active producers"
          : "Win-back & cold reactivation",
  rows: PARTNERS_RAW.filter(p => p.dayBucket === d),
  defaultOpen: true,
}));

Object.assign(window, { PARTNERS_RAW, PARTNER_GROUPS, PARTNER_DAY_GROUPS });
