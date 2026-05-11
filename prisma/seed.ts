import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Default user (Alex Reyes)
  const user = await prisma.user.upsert({
    where: { email: "alex.reyes@mos.app" },
    update: {},
    create: {
      email: "alex.reyes@mos.app",
      name: "Alex Reyes",
      nmls: "1902847",
      role: "lo",
    },
  });
  console.log("Created user:", user.email);

  // ── Contacts ──────────────────────────────────────────────────────────────
  const contacts = [
    { externalId: "C-1001", firstName: "Priya",    lastName: "Raman",     email: "priya.raman@gmail.com",      phone: "(949) 555-0312", company: "Self · Buyer",       type: "Lead",    status: "Hot",    priority: "Critical", pipeline: "sales",   stage: "Pre-Approved", deal: 815000, prob: 80 },
    { externalId: "C-1002", firstName: "Marcus",   lastName: "Delgado",   email: "mdelgado@gmail.com",         phone: "(714) 555-0194", company: "Self · Buyer",       type: "Lead",    status: "Warm",   priority: "High",     pipeline: "sales",   stage: "Contacted",    deal: 656000, prob: 45 },
    { externalId: "C-1003", firstName: "Aiden",    lastName: "Walsh",     email: "aiden.w@outlook.com",        phone: "(310) 555-0408", company: "Walsh Holdings",     type: "Lead",    status: "Hot",    priority: "High",     pipeline: "sales",   stage: "New",          deal: 612000, prob: 55 },
    { externalId: "C-1004", firstName: "Maya",     lastName: "Okafor",    email: "maya.okafor@gmail.com",      phone: "(626) 555-0199", company: "Self · Buyer",       type: "Lead",    status: "Warm",   priority: "Medium",   pipeline: "sales",   stage: "Intake",       deal: 540000, prob: 30 },
    { externalId: "C-2001", firstName: "Samantha", lastName: "Orr",       email: "samantha@kellerwilliams.com",phone: "(310) 555-0441", company: "Keller Williams",    type: "Partner", status: "Active", priority: "High",     pipeline: "partner", stage: "Active",       deal: null,   prob: null },
    { externalId: "C-2002", firstName: "Derek",    lastName: "Paulson",   email: "d.paulson@compass.com",      phone: "(714) 555-0311", company: "Compass",            type: "Partner", status: "Nurture",priority: "Low",      pipeline: "partner", stage: "Nurture",      deal: null,   prob: null },
    { externalId: "C-3001", firstName: "Tomás",    lastName: "Errazuriz", email: "tomas@northpeakcap.com",     phone: "(415) 555-0921", company: "Northpeak Capital",  type: "Investor",status: "Qualified",priority:"High",     pipeline: "investor",stage: "Diligence",    deal: 2500000,prob: 40 },
    { externalId: "C-4001", firstName: "Helena",   lastName: "Voss",      email: "helena.voss@protonmail.com", phone: "(206) 555-0772", company: "Independent",        type: "Candidate",status:"Hot",    priority: "High",     pipeline: "recruit", stage: "Offer Out",    deal: 180000, prob: 70 },
    { externalId: "C-5001", firstName: "Rosa",     lastName: "Kim",       email: "rosa.kim@gmail.com",         phone: "(213) 555-0721", company: "Self · Buyer",       type: "Client",  status: "Active", priority: "Medium",   pipeline: "onboard", stage: "Docs Pending", deal: 378000, prob: 90 },
    { externalId: "C-5002", firstName: "Ingrid",   lastName: "Solberg",   email: "ingrid.s@outlook.com",       phone: "(310) 555-0913", company: "Self · Buyer",       type: "Client",  status: "Active", priority: "Medium",   pipeline: "onboard", stage: "Shopping",     deal: 670000, prob: 60 },
  ];

  for (const c of contacts) {
    const { pipeline, stage, deal, prob, ...contactData } = c;
    const contact = await prisma.contact.upsert({
      where: { externalId: c.externalId },
      update: {},
      create: { ...contactData, ownerId: user.id },
    });
    await prisma.contactPipeline.upsert({
      where: { contactId_pipeline: { contactId: contact.id, pipeline } },
      update: {},
      create: { contactId: contact.id, pipeline, stage, dealValue: deal ?? undefined, probability: prob ?? undefined },
    });
  }
  console.log("Created contacts");

  // ── Loans ─────────────────────────────────────────────────────────────────
  const priya = await prisma.contact.findUnique({ where: { externalId: "C-1001" } });
  const marcus = await prisma.contact.findUnique({ where: { externalId: "C-1002" } });
  const aiden = await prisma.contact.findUnique({ where: { externalId: "C-1003" } });
  const maya = await prisma.contact.findUnique({ where: { externalId: "C-1004" } });

  const loansToSeed = [
    { externalId: "L001", contactId: aiden!.id,  firstName: "Aiden", lastName: "Walsh",   amount: 612000, stage: "lead", status: "hot",  statusLabel: "Hot",       revenue: 12240, commission: 6120,  notes: "Referred by Priya R. Called 4/20.", date: "Apr 20", lender: "—",       processor: "—" },
    { externalId: "L002", contactId: maya!.id,   firstName: "Maya",  lastName: "Okafor",  amount: 540000, stage: "lead", status: "warm", statusLabel: "Warm",      revenue: 10800, commission: 5400,  notes: "First-time buyer. Intake Thu 2pm.", date: "Apr 21", lender: "—",       processor: "—" },
    { externalId: "L010", contactId: marcus!.id, firstName: "Marcus",lastName: "Delgado", amount: 656000, stage: "lead", status: "stall",statusLabel: "Stalled",   revenue: 13120, commission: 6560,  notes: "Pre-approval expires Fri. NR to 2 emails.", date: "Apr 16", lender: "—",  processor: "—" },
    { externalId: "L030", contactId: priya!.id,  firstName: "Priya", lastName: "Raman",   amount: 815000, stage: "pre",  status: "hot",  statusLabel: "Offer Out", revenue: 16300, commission: 8150,  notes: "Offer accepted 4/21 — rush file.", date: "Apr 21", lender: "PennyMac",processor: "J. Osei", rate: "6.125%", product: "30-yr Conventional", ltv: "80%", dti: "36.4%", closingDate: "May 15, 2026" },
  ];

  for (const loan of loansToSeed) {
    await prisma.loan.upsert({
      where: { externalId: loan.externalId },
      update: {},
      create: { ...loan, ownerId: user.id },
    });
  }
  console.log("Created loans");

  // ── Prospect Cards ────────────────────────────────────────────────────────
  const prospectCards = [
    { externalId: "p1", name: "Marcus Delgado",       company: "Delgado Holdings",   phone: "(714) 555-0194", tag: "lead",       tagLabel: "Lead",        context: "Pre-approval expires Friday. Hasn't responded to 2 emails.", action: "Re-qualify income — push closing before May 2.", priority: "high", bucket: "overdue", overdueBy: "6 days",   daysSince: 6,   section: "must"    },
    { externalId: "p2", name: "Priya Raman",          company: "RE/MAX Premier",     phone: "(949) 555-0312", tag: "agent",      tagLabel: "Agent",       context: "Listing on Alta Vista accepted offer Monday. Buyer needs pre-approval by EOD Thursday.", action: "Ask for buyer intro.", priority: "high", bucket: "today",   overdueBy: "Due today",  daysSince: 2,   section: "must"    },
    { externalId: "p3", name: "Jordan & Lee Nakamura",company: "Self · Past Client", phone: "(310) 555-0088", tag: "pastclient", tagLabel: "Past Client", context: "Funded 2023 at 6.875%. Market ~5.625%. Break-even 14 months.", action: "Birthday + refi pitch.", priority: "high", bucket: "overdue", overdueBy: "4 months", daysSince: 124, section: "must"    },
    { externalId: "p4", name: "Samantha Orr",         company: "Keller Williams",    phone: "(310) 555-0441", tag: "partner",    tagLabel: "Partner",     context: "Top-producing agent at Keller — sent 3 deals last year. Quarterly touch-base overdue.", action: "Coffee next week.", priority: "med", bucket: "overdue",   overdueBy: "3 months", daysSince: 91,  section: "high"    },
    { externalId: "p5", name: "The Okafor Family",    company: "Okafor Family",      phone: "(626) 555-0199", tag: "lead",       tagLabel: "Lead",        context: "Referred by Priya. First-time buyers, $540k budget.", action: "Schedule intake call.", priority: "med", bucket: "today",     overdueBy: "Due today",  daysSince: 0,   section: "high"    },
    { externalId: "p6", name: "Elena Brooks",         company: "Brooks Family",      phone: "(805) 555-0227", tag: "pastclient", tagLabel: "Past Client", context: "Closed 2021. Mentioned 'growing family' on last check-in.", action: "Soft check-in.", priority: "low", bucket: "overdue",   overdueBy: "6 months", daysSince: 184, section: "suggest" },
    { externalId: "p7", name: "Derek Paulson",        company: "Compass",            phone: "(714) 555-0311", tag: "agent",      tagLabel: "Agent",       context: "Newer agent at Compass. 1 deal last year.", action: "Intro call.", priority: "low", bucket: "hot",       overdueBy: "2 months", daysSince: 62,  section: "suggest" },
  ];

  for (const card of prospectCards) {
    await prisma.prospectCard.upsert({
      where: { externalId: card.externalId },
      update: {},
      create: card,
    });
  }
  console.log("Created prospect cards");

  // ── Partners ──────────────────────────────────────────────────────────────
  const partnersToSeed = [
    { externalId: "PR-001", name: "Westgate Realty",         contact: "Jordan Park",  phone: "(415) 555-0142", email: "jordan@westgate.re",    birthday: "Mar 14", group: "vip",  status: "hot",  deals12: 11, totalTx: 38, annualValue: 87000, lastContact: "Apr 21", nextContact: "Apr 28", notes: "Asked about HELOC programs.", daysSinceContact: 1  },
    { externalId: "PR-002", name: "Pacific Heights Group",   contact: "M. Reyes",     phone: "(415) 555-0188", email: "m.reyes@phgroup.com",   birthday: "Aug 02", group: "vip",  status: "hot",  deals12: 9,  totalTx: 31, annualValue: 71000, lastContact: "Apr 18", nextContact: "May 02", notes: "3 listings going under contract.", daysSinceContact: 4 },
    { externalId: "PR-003", name: "Hartwell & Co. CPAs",     contact: "L. Hartwell",  phone: "(415) 555-0203", email: "leah@hartwellco.com",   birthday: "Nov 21", group: "vip",  status: "hot",  deals12: 7,  totalTx: 22, annualValue: 64000, lastContact: "Apr 12", nextContact: "Apr 26", notes: "Tax-season referrals.", daysSinceContact: 10 },
    { externalId: "PR-004", name: "Coast & Crown Realty",    contact: "T. Nguyen",    phone: "(415) 555-0177", email: "tnguyen@coastcrown.com",birthday: "Feb 09", group: "act",  status: "warm", deals12: 4,  totalTx: 14, annualValue: 32000, lastContact: "Apr 15", nextContact: "Apr 29", notes: "Two new buyers in Q2.", daysSinceContact: 7  },
    { externalId: "PR-005", name: "Bayline Brokerage",       contact: "S. Ahmed",     phone: "(415) 555-0214", email: "s.ahmed@bayline.re",    birthday: "Jun 30", group: "act",  status: "warm", deals12: 3,  totalTx: 9,  annualValue: 24000, lastContact: "Mar 28", nextContact: "Apr 25", notes: "Wants jumbo product training.", daysSinceContact: 25 },
    { externalId: "PR-006", name: "Marina Realty Partners",  contact: "K. Bauer",     phone: "(415) 555-0269", email: "kara@marinarealty.com", birthday: "Sep 17", group: "act",  status: "warm", deals12: 3,  totalTx: 11, annualValue: 27000, lastContact: "Apr 02", nextContact: "Apr 30", notes: "Co-hosted open house, 12 leads.", daysSinceContact: 20 },
    { externalId: "PR-007", name: "Crestline Realty",        contact: "A. Okafor",    phone: "(415) 555-0402", email: "a.okafor@crestline.com",birthday: "May 11", group: "new",  status: "warm", deals12: 1,  totalTx: 1,  annualValue: 7500,  lastContact: "Apr 19", nextContact: "May 03", notes: "First deal closed last month.", daysSinceContact: 3  },
    { externalId: "PR-008", name: "Ridgemont Realty",        contact: "N. Carter",    phone: "(415) 555-0512", email: "ncarter@ridgemont.com", birthday: "Jul 22", group: "cold", status: "cold", deals12: 0,  totalTx: 6,  annualValue: 4000,  lastContact: "Jan 14", nextContact: "Apr 30", notes: "Used to send 3-4/yr — went quiet in Q4.", daysSinceContact: 98 },
  ];

  for (const p of partnersToSeed) {
    await prisma.partner.upsert({
      where: { externalId: p.externalId },
      update: {},
      create: { ...p, ownerId: user.id },
    });
  }
  console.log("Created partners");

  // ── Seed messages for Priya's loan ───────────────────────────────────────
  const priyaLoan = await prisma.loan.findUnique({ where: { externalId: "L030" } });
  if (priyaLoan) {
    const msgs = [
      { kind: "sms", direction: "inbound",  body: "Hey! Offer was accepted last night. They gave us 14 days to close. Can we do it?" },
      { kind: "sms", direction: "outbound", body: "Congrats!! 14 days is tight but doable given you're fully pre-approved. Let me get the file to processing this morning." },
      { kind: "sms", direction: "inbound",  body: "Amazing. What do you need from me?" },
      { kind: "sms", direction: "outbound", body: "Updated bank statements (last 2 months) and the signed purchase contract. Rest is on our end." },
      { kind: "note", direction: "outbound", body: "File is a rush — flagged with J. Osei. Lender is PennyMac. Expect appraisal order today." },
    ];
    for (const m of msgs) {
      await prisma.message.create({ data: { contactId: priya!.id, loanId: priyaLoan.id, ...m } });
    }
    console.log("Created messages for Priya");
  }

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
