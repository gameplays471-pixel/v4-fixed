import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { UpdateProfileSchema, parseBody } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user });
  } catch (e) {
    console.error("Get profile error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = parseBody(UpdateProfileSchema, body);
    if (!parsed.success) return parsed.response;
    const { name, bio, weight, height, sex, birthDate, goal, avatarUrl } = parsed.data;

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        bio: bio ?? null,
        weight: weight ?? null,
        height: height ?? null,
        sex: sex ?? null,
        birthDate: birthDate ? new Date(birthDate) : null,
        goal: goal ?? null,
        avatarUrl: avatarUrl ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        weight: true,
        height: true,
        sex: true,
        birthDate: true,
        goal: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("Update profile error:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
