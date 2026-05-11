import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "./AppShell";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Load user profile (includes nmls number)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { id: true, name: true, email: true, nmls: true },
  });

  // Initial counts for sidebar badges (fast queries)
  const [prospectCount, pipelineCount, partnerCount, contactCount] = await Promise.all([
    prisma.prospectCard.count({ where: { bucket: { in: ["overdue", "today"] } } }),
    prisma.loan.count({ where: { stage: { notIn: ["fund"] } } }),
    prisma.partner.count(),
    prisma.contact.count(),
  ]);

  const activeLeadsCount = await prisma.loan.count({ where: { stage: { in: ["lead", "app"] } } });
  const preApprovedCount = await prisma.loan.count({ where: { stage: "pre" } });
  const pastClientsCount = await prisma.contact.count({ where: { type: "Client" } });

  return (
    <AppShell
      user={{ name: user?.name, email: user?.email, nmls: user?.nmls ?? undefined }}
      initialCounts={{
        prospecting: prospectCount,
        active: activeLeadsCount,
        preapproved: preApprovedCount,
        pipeline: pipelineCount,
        past: pastClientsCount,
        partners: partnerCount,
        contacts: contactCount,
      }}
    />
  );
}
