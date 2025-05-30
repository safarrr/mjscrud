import { createUserSchema } from "@/components/sheetUserCreate";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { checkBearer } from "@/lib/auth";
import { hashPassword } from "@/lib/utils";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    await checkBearer(request);
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const data = await db.query.users.findMany({
      limit: Number(pageSize),
      offset: Number(page),
      with: {
        address: true,
      },
    });
    const total = await db.select({ count: count() }).from(users);
    return NextResponse.json({ count: total[0].count, data: data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    await checkBearer(request);

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const existingUser = await db.query.users.findFirst({
      where: (user) => eq(user.username, parsed.data?.username),
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "username sudah ada" },
        { status: 400 }
      );
    }
    const { username, firstname, lastname, password, birthdate, address } =
      parsed.data;

    const hash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        firstname,
        lastname,
        hashPassword: hash,
        birthdate: birthdate ? birthdate.toISOString() : null,
      })
      .returning();

    if (address) {
      await db.insert(addresses).values({
        userId: newUser.id,
        street: address.street,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
      });
    }

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
