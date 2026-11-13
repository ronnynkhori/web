import type { StoredDoc } from "@/lib/store/types";

/** Draft → Submitted → Under Review → Correction Required → Approved or Rejected. */
export type RegistrationStatus = "draft" | "submitted" | "review" | "correction" | "approved" | "rejected";

export type ParticipantKind = "athlete" | "official";

export type OfficialFunction =
  | "head"
  | "coach"
  | "assistant-coach"
  | "manager"
  | "medical"
  | "physio"
  | "admin-technical"
  | "judge"
  | "other";

export type Sex = "female" | "male";

export type FileKind = "passport" | "photo" | "guardian" | "eligibility" | "medical" | "other";

export const fileKinds: FileKind[] = ["passport", "photo", "guardian", "eligibility", "medical", "other"];

export const officialFunctions: OfficialFunction[] = [
  "head",
  "coach",
  "assistant-coach",
  "manager",
  "medical",
  "physio",
  "admin-technical",
  "judge",
  "other",
];

export interface DelegationDoc extends StoredDoc {
  countryCode: string;
  institution: string;
  headName: string;
  headPosition: string;
  email: string;
  telephone: string;
  officerName: string;
  officerContact: string;
  sports: string[];
  estimatedAthletes: number;
  estimatedOfficials: number;
}

export interface ParticipantDoc extends StoredDoc {
  countryCode: string;
  kind: ParticipantKind;
  status: RegistrationStatus;
  fullName: string;
  dateOfBirth: string;
  sex: Sex | "";
  nationality: string;
  countryRepresented: string;
  documentNumber: string;
  documentExpiry: string;
  sportId: string;
  discipline: string;
  /** Free text until the Committee sends an event list. */
  sportNotes: string;
  ageCategory: string;
  competitionCategory: string;
  federation: string;
  club: string;
  jerseyNumber: string;
  emergencyName: string;
  emergencyPhone: string;
  accessibility: string;
  guardianName: string;
  guardianContact: string;
  function: OfficialFunction | "";
  functionOther: string;
  contactEmail: string;
  contactPhone: string;
  reviewNote: string;
  registrationNumber: string;
  submittedAt?: string;
  decidedAt?: string;
}

export interface ParticipantFileDoc extends StoredDoc {
  participantId: string;
  countryCode: string;
  kind: FileKind;
  filename: string;
  contentType: string;
  size: number;
}

export interface RegistrationNoticeDoc extends StoredDoc {
  countryCode: string;
  participantId: string;
  participantName: string;
  kind: "submitted" | "approved" | "correction" | "rejected";
  message: string;
  note?: string;
  emailTo: string;
  emailed: boolean;
}

export const emptyParticipant = (countryCode: string, kind: ParticipantKind): ParticipantDoc => ({
  id: "",
  countryCode,
  kind,
  status: "draft",
  fullName: "",
  dateOfBirth: "",
  sex: "",
  nationality: "",
  countryRepresented: countryCode,
  documentNumber: "",
  documentExpiry: "",
  sportId: "",
  discipline: "",
  sportNotes: "",
  ageCategory: "",
  competitionCategory: "",
  federation: "",
  club: "",
  jerseyNumber: "",
  emergencyName: "",
  emergencyPhone: "",
  accessibility: "",
  guardianName: "",
  guardianContact: "",
  function: "",
  functionOther: "",
  contactEmail: "",
  contactPhone: "",
  reviewNote: "",
  registrationNumber: "",
});
