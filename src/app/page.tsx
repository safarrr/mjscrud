"use client";
import { AuthContexts, AuthContextType } from "@/components/authProvider";
import LoginForm from "@/components/loginFrom";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
export default function Home() {
  const router = useRouter();
  const user = useContext<AuthContextType>(AuthContexts);
  useEffect(() => {
    if (user) {
      router.push("/dash");
    }
  }, [user, router]);
  return <>{!user && <LoginForm />}</>;
}
