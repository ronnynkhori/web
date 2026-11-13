import { describe, expect, it } from "vitest";
import { emptyParticipant, type ParticipantDoc } from "./model";
import { ageOn, birthYears, canDecide, duplicateIssue, isMinor, nextRegistrationNumber, quotaIssue, submitIssues } from "./rules";

const athlete = (patch: Partial<ParticipantDoc> = {}): ParticipantDoc => ({
  ...emptyParticipant("AGO", "athlete"),
  id: "a",
  fullName: "Ana Silva",
  dateOfBirth: "2009-06-01",
  sex: "female",
  nationality: "Angolan",
  documentNumber: "AB123",
  documentExpiry: "2030-01-01",
  sportId: "athletics",
  discipline: "100 m",
  ageCategory: "Youth",
  competitionCategory: "Women",
  federation: "FAA",
  emergencyName: "Pai",
  emergencyPhone: "+244900",
  ...patch,
});

describe("registration rules", () => {
  it("treats someone who turns 18 after opening day as a minor", () => {
    expect(isMinor("2009-03-26")).toBe(true);
    expect(isMinor("2009-03-25")).toBe(false);
    expect(ageOn("2009-03-25")).toBe(18);
  });

  it("reads the provisional birth-year band", () => {
    expect(birthYears("Born between 1 January 2009 and 31 December 2010 (provisional).")).toEqual({ from: 2009, to: 2010 });
  });

  it("blocks a second active passport in the same country", () => {
    const other = athlete({ id: "b", documentNumber: "ab-123" });
    expect(duplicateIssue(athlete(), [athlete(), other])?.code).toBe("duplicate");
    expect(duplicateIssue(athlete(), [athlete(), { ...other, status: "rejected" }])).toBeNull();
  });

  it("stops an entry past the provisional women's quota", () => {
    const base = athlete({ sportId: "tennis" });
    const people = [base, { ...base, id: "2", documentNumber: "B" }];
    expect(quotaIssue({ ...base, id: "3", documentNumber: "C" }, people)?.code).toBe("quota");
  });

  it("requires a passport file before submit", () => {
    expect(submitIssues(athlete(), [athlete()], [], null).some((issue) => issue.kind === "passport")).toBe(true);
  });

  it("requires a document the Committee has marked mandatory", () => {
    expect(submitIssues(athlete(), [athlete()], [], null, { extraRequired: ["medical"] }).some((issue) => issue.kind === "medical")).toBe(true);
  });

  it("uses a Committee quota in place of the provisional number", () => {
    const base = athlete({ sportId: "tennis" });
    const people = [base, { ...base, id: "2", documentNumber: "B" }];
    expect(quotaIssue({ ...base, id: "3", documentNumber: "C" }, people, { tennis: { men: 2, women: 9, staff: 2, judges: 1 } })).toBeNull();
  });

  it("issues the next registration number for that country", () => {
    expect(nextRegistrationNumber([athlete({ registrationNumber: "CPLP27-AGO-0002" })], "AGO")).toBe("CPLP27-AGO-0003");
  });

  it("allows the committee to approve a submitted entry", () => {
    expect(canDecide("submitted", "approved")).toBe(true);
    expect(canDecide("draft", "approved")).toBe(false);
  });
});
