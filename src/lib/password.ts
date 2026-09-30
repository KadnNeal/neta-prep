export const PASSWORD_RULES = ["At least 8 characters", "One uppercase letter", "One special character"] as const;

/** Rules the password fails (empty = valid). Shared by signup and set-password. */
export function getPasswordErrors(pw: string): string[] {
  const errs: string[] = [];
  if (pw.length < 8) errs.push("At least 8 characters");
  if (!/[A-Z]/.test(pw)) errs.push("One uppercase letter");
  if (!/[!@#$%^&*()\-_=+[\]{};':"\|,.<>/?]/.test(pw)) errs.push("One special character");
  return errs;
}
