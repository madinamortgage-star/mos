import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { activityLogs: { orderBy: { occurredAt: "desc" }, take: 20 } },
  });
  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(partner);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const partner = await prisma.partner.update({ where: { id }, data: body });
  return NextResponse.json(partner);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.partner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
