import type { UserDoc } from "@/lib/cms/types";
import { DEMO_OFFICER } from "./demo-account";
import type { DelegationDoc, OfficialFunction, ParticipantDoc, ParticipantFileDoc, RegistrationStatus, Sex } from "./model";
import { emptyParticipant } from "./model";

/**
 * Sample registrations for the read-only demonstration (no database connected).
 * They are shown only when nothing real is stored and the deployment cannot save,
 * and every screen labels them as demo data. They never reach a database.
 */

/** Angola officer shown in the Control Room country table during the demo. */
export const demoUsers: UserDoc[] = [
  {
    id: "demo-user-ago",
    email: DEMO_OFFICER.email,
    name: DEMO_OFFICER.name,
    role: DEMO_OFFICER.role,
    sportIds: [],
    countryCode: DEMO_OFFICER.countryCode,
    active: true,
    _updatedAt: new Date(Date.UTC(2026, 10, 16, 9, 0)).toISOString(),
    _updatedBy: "demo",
  },
];

const day = (offset: number) => new Date(Date.UTC(2026, 10, 16, 9, 0) + offset * 3_600_000).toISOString();

export const demoDelegations: DelegationDoc[] = [
  ["AGO", "Ministério da Juventude e Desportos", "Palmira Lopes", "Directora Nacional do Desporto", "delegacao@minjud.gov.ao", "+244 923 000 101", "Nelson Kiala", "+244 923 000 102", ["athletics", "football", "basketball-3x3", "karate", "chess"], 46, 18],
  ["BRA", "Secretaria Nacional de Esporte", "Marcos Ribeiro", "Coordenador de Esporte Escolar", "cplp2027@esporte.gov.br", "+55 61 3000 2000", "Juliana Prado", "juliana.prado@esporte.gov.br", ["athletics", "taekwondo", "tennis", "beach-volleyball"], 30, 12],
  ["MOZ", "Secretaria de Estado do Desporto", "Alberto Mondlane", "Director de Desporto", "sed@desporto.gov.mz", "+258 84 000 3300", "Célia Macuácua", "+258 84 000 3301", ["athletics", "football", "basketball-3x3"], 34, 11],
  ["PRT", "Instituto Português do Desporto e Juventude", "Rui Carvalho", "Vogal do Conselho Diretivo", "cplp@ipdj.pt", "+351 21 000 4400", "Sofia Matos", "sofia.matos@ipdj.pt", ["athletics", "karate", "chess", "tennis"], 24, 10],
  ["CPV", "Direção-Geral do Desporto", "Helena Fortes", "Diretora-Geral", "dgd@desporto.gov.cv", "+238 260 5500", "Ivo Semedo", "+238 991 5501", ["athletics", "beach-volleyball"], 10, 5],
].map(([countryCode, institution, headName, headPosition, email, telephone, officerName, officerContact, sports, estimatedAthletes, estimatedOfficials]) => ({
  id: `demo-del-${String(countryCode).toLowerCase()}`,
  countryCode: countryCode as string,
  institution: institution as string,
  headName: headName as string,
  headPosition: headPosition as string,
  email: email as string,
  telephone: telephone as string,
  officerName: officerName as string,
  officerContact: officerContact as string,
  sports: sports as string[],
  estimatedAthletes: estimatedAthletes as number,
  estimatedOfficials: estimatedOfficials as number,
  _updatedAt: day(-90),
  _updatedBy: "demo",
}));

type Row = [country: string, name: string, kind: "athlete" | "official", sport: string, status: RegistrationStatus, dob: string, sex: Sex | "", extra?: Partial<ParticipantDoc>];

const rows: Row[] = [
  ["AGO", "Edvaldo Manuel Neto", "athlete", "athletics", "submitted", "2009-04-12", "male", { discipline: "100 m", federation: "Federação Angolana de Atletismo" }],
  ["AGO", "Esperança Domingos Cassule", "athlete", "athletics", "review", "2010-01-30", "female", { discipline: "400 m" }],
  ["AGO", "Mauro Kiala Bento", "athlete", "football", "approved", "2009-08-03", "male", { jerseyNumber: "10", club: "Petro de Luanda (sub-17)" }],
  ["AGO", "Domingas Nzinga Pedro", "athlete", "chess", "correction", "2011-06-21", "female", { reviewNote: "A fotografia está desfocada. Carregue uma fotografia tipo passe nítida." }],
  ["AGO", "Joaquim Tavares", "official", "football", "approved", "1981-02-14", "male", { function: "coach" }],
  ["AGO", "Ana Paula Mbemba", "official", "", "draft", "1976-11-05", "female", { function: "head" }],
  ["BRA", "Lucas Ferreira Santos", "athlete", "taekwondo", "submitted", "2010-03-02", "male", { discipline: "-55 kg" }],
  ["BRA", "Beatriz Almeida Costa", "athlete", "tennis", "submitted", "2009-12-18", "female", { discipline: "Simples" }],
  ["BRA", "Gabriela Rocha Lima", "athlete", "beach-volleyball", "approved", "2009-05-09", "female" ],
  ["BRA", "Thiago Moura", "athlete", "athletics", "rejected", "2006-07-27", "male", { discipline: "Salto em comprimento", reviewNote: "Data de nascimento fora do escalão aprovado." }],
  ["BRA", "Carla Nunes Barbosa", "official", "tennis", "review", "1985-09-30", "female", { function: "coach" }],
  ["MOZ", "Ercílio Chissano Mabote", "athlete", "athletics", "submitted", "2009-10-10", "male", { discipline: "1500 m" }],
  ["MOZ", "Lurdes Cossa", "athlete", "basketball-3x3", "submitted", "2010-02-14", "female" ],
  ["MOZ", "Hélder Nhantumbo", "athlete", "football", "draft", "2009-06-01", "male" ],
  ["MOZ", "Dr. Amélia Sitoe", "official", "", "approved", "1979-04-22", "female", { function: "medical" }],
  ["PRT", "Tomás Ribeiro Antunes", "athlete", "karate", "approved", "2010-09-15", "male", { discipline: "Kumite -61 kg" }],
  ["PRT", "Inês Cardoso Pires", "athlete", "chess", "submitted", "2012-01-08", "female" ],
  ["PRT", "Mariana Lopes Silva", "athlete", "athletics", "correction", "2009-11-11", "female", { discipline: "Salto em altura", reviewNote: "O passaporte expira antes dos Jogos. Envie um documento válido." }],
  ["PRT", "Paulo Gomes", "official", "karate", "submitted", "1983-03-19", "male", { function: "coach" }],
  ["CPV", "Kelly Fortes Monteiro", "athlete", "beach-volleyball", "review", "2009-07-07", "female" ],
  ["CPV", "Admilson Tavares", "athlete", "athletics", "submitted", "2010-05-25", "male", { discipline: "800 m" }],
];

export const demoParticipants: ParticipantDoc[] = rows.map(([countryCode, fullName, kind, sportId, status, dateOfBirth, sex, extra], index) => {
  const id = `demo-person-${index + 1}`;
  const base = emptyParticipant(countryCode, kind);
  const minor = dateOfBirth > "2009-03-25";
  const submitted = status !== "draft" ? day(-80 + index * 3) : undefined;
  const decided = ["approved", "rejected", "correction"].includes(status) ? day(-20 + index) : undefined;
  return {
    ...base,
    id,
    status,
    fullName,
    dateOfBirth,
    sex,
    nationality: countryCode,
    documentNumber: `${countryCode}${(4_810_000 + index * 7_919).toString()}`,
    documentExpiry: "2031-06-30",
    sportId,
    discipline: kind === "athlete" ? "—" : "",
    ageCategory: kind === "athlete" ? "Sub-18" : "",
    competitionCategory: kind === "athlete" ? (sex === "female" ? "Feminino" : "Masculino") : "",
    federation: kind === "athlete" ? "Federação nacional" : "",
    emergencyName: kind === "athlete" ? "Encarregado de educação" : "",
    emergencyPhone: kind === "athlete" ? "+000 000 000" : "",
    guardianName: minor ? "Encarregado de educação" : "",
    guardianContact: minor ? "+000 000 001" : "",
    contactPhone: kind === "official" ? "+000 000 002" : "",
    function: (kind === "official" ? "coach" : "") as OfficialFunction | "",
    submittedAt: submitted,
    decidedAt: decided,
    ...extra,
    registrationNumber: status === "approved" ? `CPLP27-${countryCode}-${String(index + 1).padStart(4, "0")}` : "",
    _updatedAt: decided ?? submitted ?? day(-100),
    _updatedBy: "demo",
  };
});

/** Demo records carry passport and photo entries so the checks read as a real file would. */
export const demoFiles: ParticipantFileDoc[] = demoParticipants
  .filter((person) => person.status !== "draft")
  .flatMap((person) =>
    (["passport", "photo", ...(person.guardianName && person.status !== "correction" ? (["guardian"] as const) : [])] as const).map((kind) => ({
      id: `demo-file-${person.id}-${kind}`,
      participantId: person.id,
      countryCode: person.countryCode,
      kind,
      filename: kind === "photo" ? "fotografia.jpg" : kind === "passport" ? "passaporte.pdf" : "autorizacao.pdf",
      contentType: kind === "photo" ? "image/jpeg" : "application/pdf",
      size: 240_000,
    })),
  );

export const isDemoId = (id: string) => id.startsWith("demo-");
