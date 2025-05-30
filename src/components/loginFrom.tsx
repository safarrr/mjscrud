"use client";
import { LoginFormState } from "@/lib/typs/loginFormState";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { login } from "@/lib/action";
import { useActionState } from "react";
const initialState: LoginFormState = {
  errors: {},
  success: true,
};

export default function LoginForm({}) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="flex flex-col items-center justify-center w-full h-svh">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>username:demo password:demo</CardDescription>
          {!state.success ? (
            <p className="text-red-600">username dan passwrod salah</p>
          ) : (
            ""
          )}
        </CardHeader>
        <CardContent>
          <form className=" space-y-2" action={formAction}>
            <div className="flex flex-col space-y-2">
              <Label>username</Label>
              <Input type="text" name="username" />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>password</Label>
              <Input type="text" name="password" />
            </div>
            <Button>login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
