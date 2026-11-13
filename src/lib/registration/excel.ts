import "server-only";
import type { ParticipantDoc } from "./model";
import { normaliseSex } from "./rules";

const columns = [
  "fullName",
  "dateOfBirth",
  "sex",
  "nationality",
  "documentNumber",
  "documentExpiry",
  "sportId",
  "discipline",
  "ageCategory",
  "competitionCategory",
  "federation",
  "club",
  "jerseyNumber",
  "emergencyName",
  "emergencyPhone",
  "accessibility",
  "guardianName",
  "guardianContact",
] as const;

export type AthleteRow = Record<(typeof columns)[number], string>;

export async function athleteTemplate(): Promise<Buffer> {
  const ExcelJS = await import("exceljs");
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Athletes");
  sheet.addRow([...columns]);
  sheet.addRow(["Ana Silva", "2009-06-01", "female", "Angolan", "AB123456", "2030-01-01", "athletics", "100 m", "Youth", "Women", "National federation", "", "", "Contact name", "+244900000000", "", "", ""]);
  sheet.getRow(1).font = { bold: true };
  const buffer = await book.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function readAthleteRows(bytes: Uint8Array): Promise<AthleteRow[]> {
  const ExcelJS = await import("exceljs");
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(bytes as unknown as ArrayBuffer);
  const sheet = book.worksheets[0];
  if (!sheet) return [];
  const header = (sheet.getRow(1).values as Array<string | undefined>).slice(1).map((cell) => String(cell ?? "").trim());
  const rows: AthleteRow[] = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const values = row.values as Array<unknown>;
    const record = Object.fromEntries(columns.map((column) => [column, ""])) as AthleteRow;
    header.forEach((key, i) => {
      if (key in record) record[key as keyof AthleteRow] = cellText(values[i + 1]);
    });
    if (record.fullName) rows.push(record);
  });
  return rows;
}

function cellText(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object" && value && "text" in value) return String((value as { text: string }).text);
  return String(value).trim();
}

export async function participantsWorkbook(people: ParticipantDoc[]): Promise<Buffer> {
  const ExcelJS = await import("exceljs");
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Registration");
  const head = ["registrationNumber", "status", "kind", "fullName", "dateOfBirth", "sex", "sportId", "discipline", "function", "documentNumber", "countryCode"];
  sheet.addRow(head);
  for (const person of people) {
    sheet.addRow([
      person.registrationNumber,
      person.status,
      person.kind,
      person.fullName,
      person.dateOfBirth,
      person.sex,
      person.sportId,
      person.discipline,
      person.function,
      person.documentNumber,
      person.countryCode,
    ]);
  }
  sheet.getRow(1).font = { bold: true };
  const buffer = await book.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function rowToAthlete(row: AthleteRow, countryCode: string): Partial<ParticipantDoc> {
  return {
    kind: "athlete",
    countryCode,
    countryRepresented: countryCode,
    fullName: row.fullName,
    dateOfBirth: row.dateOfBirth.slice(0, 10),
    sex: normaliseSex(row.sex),
    nationality: row.nationality,
    documentNumber: row.documentNumber,
    documentExpiry: row.documentExpiry.slice(0, 10),
    sportId: row.sportId,
    discipline: row.discipline,
    ageCategory: row.ageCategory,
    competitionCategory: row.competitionCategory,
    federation: row.federation,
    club: row.club,
    jerseyNumber: row.jerseyNumber,
    emergencyName: row.emergencyName,
    emergencyPhone: row.emergencyPhone,
    accessibility: row.accessibility,
    guardianName: row.guardianName,
    guardianContact: row.guardianContact,
  };
}
