import type { Role } from "@/lib/cms/types";

/**
 * Fixed Angola officer for the proposal walkthrough. Works without a Users
 * row so the delegation portal can be demonstrated on read-only / empty
 * deployments. Disable with DEMO_DATA=0.
 */
export const DEMO_OFFICER = {
  email: "ago@cplp2027.demo",
  password: "CPLP-Demo-AGO",
  name: "Nelson Kiala",
  countryCode: "AGO",
  role: "delegation" as const satisfies Role,
} as const;

export function demoOfficerEnabled(): boolean {
  return process.env.DEMO_DATA !== "0";
}

export function isDemoOfficerEmail(email: string): boolean {
  return demoOfficerEnabled() && email.trim().toLowerCase() === DEMO_OFFICER.email;
}

export function demoOfficerMatches(email: string, password: string): boolean {
  return isDemoOfficerEmail(email) && password === DEMO_OFFICER.password;
}

export function demoOfficerSession() {
  return {
    email: DEMO_OFFICER.email,
    name: DEMO_OFFICER.name,
    role: DEMO_OFFICER.role,
    sportIds: [] as string[],
    countryCode: DEMO_OFFICER.countryCode,
  };
}

export function demoOfficerHint(locale: "pt" | "en" = "en"): string | null {
  if (!demoOfficerEnabled()) return null;
  return locale === "pt"
    ? `Demonstração Angola: ${DEMO_OFFICER.email} / ${DEMO_OFFICER.password}`
    : `Angola demo: ${DEMO_OFFICER.email} / ${DEMO_OFFICER.password}`;
}
