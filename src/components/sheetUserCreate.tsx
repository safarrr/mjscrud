/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { useContext, useState } from "react";
import z from "zod";
import { Button } from "./ui/button";
import { FormErrors, parseZodErrors } from "@/lib/utils";
import axios from "axios";
import { AuthContexts, AuthContextType } from "./authProvider";
export const createUserSchema = z.object({
  username: z.string().max(150),
  firstname: z.string().max(255),
  lastname: z.string().max(255),
  password: z.string().min(6),
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
type CreateUserInput = z.infer<typeof createUserSchema>;

function SheetCreateUser({ getData }: { getData?: () => void }) {
  const [formData, setFormData] = useState<CreateUserInput>({
    username: "",
    firstname: "",
    lastname: "",
    password: "",
    birthdate: undefined,
    address: {
      street: "",
      city: "",
      province: "",
      postalCode: "",
    },
  });
  const [openSheet, setOpenSheet] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const user = useContext<AuthContextType>(AuthContexts);
  function setFieldValue(path: string, value: any) {
    setFormData((prev) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let curr: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!curr[keys[i]]) curr[keys[i]] = {};
        curr = curr[keys[i]];
      }
      curr[keys[keys.length - 1]] = value;
      return updated;
    });
  }

  function getError(path: string): string | undefined {
    const keys = path.split(".");
    let curr: any = errors;
    for (const key of keys) {
      if (!curr) return undefined;
      curr = curr[key];
    }
    return typeof curr === "string" ? curr : undefined;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = parseZodErrors(result.error.issues);
      setErrors(newErrors);
    } else {
      setErrors({});
    }
    try {
      await axios.post("/api/user/", result.data, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (getData) {
        getData();
      }
      setFormData({
        username: "",
        firstname: "",
        lastname: "",
        password: "",
        birthdate: undefined,
        address: {
          street: "",
          city: "",
          province: "",
          postalCode: "",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == 400) {
          toast.error(
            error.response?.data.error || error.response?.data.message || ""
          );
        }
      } else {
      }
    }
  }
  return (
    <Sheet
      open={openSheet}
      onOpenChange={(e) => {
        setFormData({
          username: "",
          firstname: "",
          lastname: "",
          password: "",
          birthdate: undefined,
          address: {
            street: "",
            city: "",
            province: "",
            postalCode: "",
          },
        });
        setOpenSheet(e);
      }}
    >
      <SheetTrigger asChild>
        <Button className="w-max">buat</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Buat user</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-6 p-5 overflow-y-auto">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFieldValue("username", e.target.value)}
                />
                {getError("username") && (
                  <p className="text-red-500 text-sm">{getError("username")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  value={formData.firstname}
                  onChange={(e) => setFieldValue("firstname", e.target.value)}
                />
                {getError("firstname") && (
                  <p className="text-red-500 text-sm">
                    {getError("firstname")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => setFieldValue("lastname", e.target.value)}
                />
                {getError("lastname") && (
                  <p className="text-red-500 text-sm">{getError("lastname")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                />
                {getError("password") && (
                  <p className="text-red-500 text-sm">{getError("password")}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birthdate">Birthdate</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={
                    formData.birthdate
                      ? new Date(formData.birthdate)
                          .toISOString()
                          .substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "birthdate",
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                />
                {getError("birthdate") && (
                  <p className="text-red-500 text-sm">
                    {getError("birthdate")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Address (optional)</h3>

              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={formData.address?.street ?? ""}
                  onChange={(e) =>
                    setFieldValue("address.street", e.target.value)
                  }
                />
                {getError("address.street") && (
                  <p className="text-red-500 text-sm">
                    {getError("address.street")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address?.city ?? ""}
                  onChange={(e) =>
                    setFieldValue("address.city", e.target.value)
                  }
                />
                {getError("address.city") && (
                  <p className="text-red-500 text-sm">
                    {getError("address.city")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.address?.province ?? ""}
                  onChange={(e) =>
                    setFieldValue("address.province", e.target.value)
                  }
                />
                {getError("address.province") && (
                  <p className="text-red-500 text-sm">
                    {getError("address.province")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.address?.postalCode ?? ""}
                  onChange={(e) =>
                    setFieldValue("address.postalCode", e.target.value)
                  }
                />
                {getError("address.postalCode") && (
                  <p className="text-red-500 text-sm">
                    {getError("address.postalCode")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit">Create User</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default SheetCreateUser;
