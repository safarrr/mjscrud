/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { checkBearer } from "@/lib/auth";
import { eq } from "drizzle-orm";
import z from "zod";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/utils";

const updateUserSchema = z.object({
  username: z.string().max(150),
  firstname: z.string().max(255),
  lastname: z.string().max(255),
  password: z.string().min(6).optional(),
  birthdate: z.coerce.date().optional(),
  address: z
    .object({
      street: z.string().max(255),
      city: z.string().max(255),
      province: z.string().max(255),
      postalCode: z.string().max(20),
    })
    .optional(),
});

type UpdateUserInput = z.infer<typeof updateUserSchema>;
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await checkBearer(req);

  const userId = params.id;

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
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
    const data = parsed.data;

    // Prepare values for update
    const updateValues: any = {
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      birthdate: data.birthdate ?? null,
    };

    if (data.password) {
      updateValues.hashPassword = hashPassword(data.password);
    }

    await db.update(users).set(updateValues).where(eq(users.id, userId));

    if (data.address) {
      const existingAddress = await db.query.addresses.findFirst({
        where: eq(addresses.userId, userId),
      });

      if (existingAddress) {
        await db
          .update(addresses)
          .set({
            street: data.address.street,
            city: data.address.city,
            province: data.address.province,
            postalCode: data.address.postalCode,
          })
          .where(eq(addresses.userId, userId));
      } else {
        await db.insert(addresses).values({
          userId,
          ...data.address,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkBearer(request);
    const { id } = await params;
    const isValid = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!isValid) {
      return NextResponse.json({
        message: "data not found",
      });
    }
    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({
      message: "ok",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error,
      },
      { status: 500 }
    );
  }
}
