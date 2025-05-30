import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";
export type FormErrors = {
  [key: string]: string | FormErrors; // to handle nested errors recursively
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Return a single string: "salt:hash"
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

// Verify using the combined string
export function verifyPassword(password: string, stored: string) {
  const [salt, originalHash] = stored.split(":");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return hash === originalHash;
}

export function parseZodErrors(issues: z.ZodIssue[]) {
  const formErrors: FormErrors = {};
  issues.forEach(({ path, message }) => {
    let curr = formErrors;
    for (let i = 0; i < path.length; i++) {
      const key = path[i].toString();
      if (i === path.length - 1) {
        curr[key] = message;
      } else {
        if (!curr[key]) curr[key] = {};
        curr = curr[key] as FormErrors;
      }
    }
  });
  return formErrors;
}
