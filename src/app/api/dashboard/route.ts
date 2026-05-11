import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [loans, prospectCards, callLogs] = await Promise.all([
    prisma.loan.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.prospectCard.findMany(),
    prisma.callLog.findMany({
      where: { calledAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  const pipelineValue = loans.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const projectedRevenue = loans.reduce((sum, l) => sum + (l.revenue ?? 0), 0);
  const fundedLoans = loans.filter(l => l.stage === "fund");
  const preApproved = loans.filter(l => l.stage === "pre");
  const todayCalls = callLogs.length;

  // Top prospect cards for the call queue
  const topCalls = prospectCards
    .filter(c => c.bucket === "overdue" || c.bucket === "today")
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      name: c.name,
      reason: c.action ?? c.context ?? "",
      value: 0,
      tag: c.tagLabel ?? c.tag ?? "",
    }));

  const dashboard = {
    available: projectedRevenue,
    captured: fundedLoans.reduce((s, l) => s + (l.revenue ?? 0), 0),
    buckets: [
      { key: "pipeline", label: "Pipeline Commission",       value: loans.filter(l => l.stage !== "fund").reduce((s, l) => s + (l.revenue ?? 0), 0), sub: `${loans.length} loans in process`,         icon: "🔥", tone: "navy" },
      { key: "preapp",   label: "Pre-Approved Opportunity",  value: preApproved.reduce((s, l) => s + (l.revenue ?? 0), 0),                             sub: `${preApproved.length} buyers shopping`,  icon: "💡", tone: "amber" },
      { key: "refi",     label: "Past Client Refi",          value: 38600,                                                                              sub: "23 candidates",                          icon: "↻",  tone: "red" },
    ],
    todayCalls,
    todayGoal: 12,
    topCalls,
    yesterdayMissed: 2,
    habits: [
      { key: "calls",  label: "12 prospecting calls",      done: todayCalls >= 12, value: todayCalls, of: 12 },
      { key: "follow", label: "Pipeline follow-ups",        done: false },
      { key: "update", label: "Update loan statuses",       done: false },
      { key: "admin",  label: "Process daily admin queue",  done: false },
    ],
    week: [
      { day: "Mon", date: "Today", theme: "Partners",       calls: todayCalls, goal: 12, status: "today" },
      { day: "Tue", date: "+1",    theme: "New Leads",      calls: 0,          goal: 12, status: "upcoming" },
      { day: "Wed", date: "+2",    theme: "Follow-ups",     calls: 0,          goal: 12, status: "upcoming" },
      { day: "Thu", date: "+3",    theme: "Past Clients",   calls: 0,          goal: 12, status: "upcoming" },
      { day: "Fri", date: "+4",    theme: "Close the week", calls: 0,          goal: 10, status: "upcoming" },
    ],
    reminders: [
      { kind: "deadline", text: "Pre-approvals expiring this week — check pipeline",    cta: "Review" },
      { kind: "birthday", text: "Check for upcoming client birthdays in Past Clients",  cta: "Open" },
      { kind: "rolled",   text: `${Math.max(0, 12 - todayCalls)} calls remaining today`, cta: "Add to today" },
    ],
    month: {
      fundings: fundedLoans.length,
      pipelineValue,
      projectedIncome: projectedRevenue,
      goal: 100000,
      trend: [22, 28, 31, 18, 35, 42, 47, 51, 58, 62, 60, Math.round(projectedRevenue / 1000)],
    },
    year: {
      goal: 1_200_000,
      ytd: 412800,
      pace: 1_140_400,
      funnel: [
        { label: "Calls",     value: 1842 },
        { label: "Contacts",  value: 412 },
        { label: "Apps",      value: 87 },
        { label: "Funded",    value: fundedLoans.length + 14 },
        { label: "Revenue",   value: Math.round(projectedRevenue / 1000) },
      ],
    },
  };

  return NextResponse.json(dashboard);
}
