"use server";

import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import jwt from "jsonwebtoken";

import { UserType } from "./typs/user";

export async function getUserSever() {
  const cookieStore = await cookies();
  let dataUser: { user: UserType; token: string } | null = null;
  const token = cookieStore.get("sessionToken")?.value;
  if (!token) {
    return null;
  }
  try {
    const decodedPayload = verify(
      token,
      process.env.JWT_SECRET!
    ) as Partial<UserType>;
    if (decodedPayload && typeof decodedPayload === "object") {
      dataUser = {
        token: token,
        user: {
          id: decodedPayload.id!,
          username: decodedPayload.username!,
          firstname: decodedPayload.firstname!,
          lastname: decodedPayload.lastname!,
          hashPassword: decodedPayload.hashPassword!,
        },
      };
    }
    return dataUser;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return null;
  }
}

export async function checkBearer(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error("Forbidden");
  }
}
