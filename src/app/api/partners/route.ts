import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  name: z.string(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  birthday: z.string().optional(),
  category: z.string().optional(),
  group: z.enum(["vip", "act", "new", "cold"]).default("new"),
  status: z.enum(["hot", "warm", "cold"]).default("warm"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");
  const search = searchParams.get("q");

  const partners = await prisma.partner.findMany({
    where: {
      ...(group ? { group } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { contact: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: [{ group: "asc" }, { deals12: "desc" }],
  });
  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const partner = await prisma.partner.create({
    data: { ...parsed.data, ownerId: session.user.id },
  });
  return NextResponse.json(partner, { status: 201 });
}
