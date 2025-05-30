"use client";
import { UserType } from "@/lib/typs/user";
import { createContext, ReactNode } from "react";

export type AuthContextType = { user: UserType; token: string } | null;

export const AuthContexts = createContext<AuthContextType>(null);
export default function AuthProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: AuthContextType;
}) {
  return <AuthContexts.Provider value={data}>{children}</AuthContexts.Provider>;
}
