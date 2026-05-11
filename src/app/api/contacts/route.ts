import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  city: z.string().optional(),
  source: z.string().optional(),
  type: z.string().optional(),
  status: z.string().default("Active"),
  priority: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  pipeline: z.string().optional(),
  stage: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pipeline = searchParams.get("pipeline");
  const search = searchParams.get("q");

  const contacts = await prisma.contact.findMany({
    where: {
      ...(pipeline ? { pipelines: { some: { pipeline } } } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: { pipelines: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { pipeline, stage, ...contactData } = parsed.data;

  const contact = await prisma.contact.create({
    data: {
      ...contactData,
      ownerId: session.user.id,
      ...(pipeline ? {
        pipelines: { create: { pipeline, stage } },
      } : {}),
    },
    include: { pipelines: true },
  });
  return NextResponse.json(contact, { status: 201 });
}
