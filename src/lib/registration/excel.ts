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
  "sportNotes",
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
  sheet.addRow(["Ana Silva", "2009-06-01", "female", "Angolan", "AB123456", "2030-01-01", "athletics", "100 m", "", "Youth", "Women", "National federation", "", "", "Contact name", "+244900000000", "", "", ""]);
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
  book.creator = "CPLP 2027 · Sala de Controlo";
  const sheet = book.addWorksheet("Inscrições", { views: [{ state: "frozen", ySplit: 1 }] });
  const columns: [string, number, (person: ParticipantDoc) => string][] = [
    ["Nº de inscrição / Registration no.", 22, (p) => p.registrationNumber],
    ["País / Country", 9, (p) => p.countryCode],
    ["Estado / Status", 14, (p) => p.status],
    ["Tipo / Role", 10, (p) => p.kind],
    ["Nome completo / Full name", 32, (p) => p.fullName],
    ["Nascimento / Date of birth", 14, (p) => p.dateOfBirth],
    ["Sexo / Sex", 9, (p) => p.sex],
    ["Nacionalidade / Nationality", 14, (p) => p.nationality],
    ["Documento / Document no.", 18, (p) => p.documentNumber],
    ["Validade / Expiry", 12, (p) => p.documentExpiry],
    ["Modalidade / Sport", 16, (p) => p.sportId],
    ["Prova / Event", 18, (p) => p.discipline],
    ["Escalão / Age category", 14, (p) => p.ageCategory],
    ["Categoria / Competition category", 16, (p) => p.competitionCategory],
    ["Federação / Federation", 24, (p) => p.federation],
    ["Clube / Club", 18, (p) => p.club],
    ["Camisola / Jersey", 9, (p) => p.jerseyNumber],
    ["Função / Function", 16, (p) => p.function],
    ["Submetido / Submitted", 18, (p) => (p.submittedAt ?? "").slice(0, 16).replace("T", " ")],
    ["Decidido / Decided", 18, (p) => (p.decidedAt ?? "").slice(0, 16).replace("T", " ")],
    ["Nota / Review note", 40, (p) => p.reviewNote],
  ];
  sheet.columns = columns.map(([header, width]) => ({ header, width }));
  for (const person of people) sheet.addRow(columns.map(([, , value]) => value(person)));
  const head = sheet.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A2A66" } };
  head.alignment = { vertical: "middle", wrapText: true };
  head.height = 30;
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
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
    sportNotes: row.sportNotes,
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
