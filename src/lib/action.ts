"use server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import z from "zod";
import { verifyPassword } from "./utils";
import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { LoginFormState } from "./typs/loginFormState";
const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z.string(),
});

export const login = async (
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> => {
  const cookieStore = await cookies();
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const result = schema.safeParse(rawData);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      success: false,
    };
  }
  const { username, password } = result.data;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
    .then((rows) => rows[0]);
  if (!user) {
    return {
      errors: { general: ["username atau password salah"] },
      success: false,
    };
  }
  const isPasswordValid = verifyPassword(password, user.hashPassword);
  if (!isPasswordValid) {
    return {
      errors: { general: ["username atau password salah"] },
      success: false,
    };
  }
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      birthdate: user.birthdate,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  cookieStore.set({
    name: "sessionToken",
    value: token,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  redirect("/dash");
};

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("sessionToken");
  redirect("/");
}
