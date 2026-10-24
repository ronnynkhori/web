"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { Check, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import type { FormState } from "@/app/admin/actions/content";
import { isoToMaputoInput } from "@/lib/admin/parse";
import type { FieldDef } from "@/lib/admin/schemas";
import { locales, type Locale, type Localized } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import type { Translate } from "@/lib/admin/i18n/translate";
import { ActionBar } from "./action-bar";
import { useT } from "./i18n";
import { formatBytes, prepareImage, uploadFile } from "./upload";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/native-select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

type Values = Record<string, unknown>;
type Section = NonNullable<FieldDef["section"]>;

const langLabel: Record<Locale, string> = { pt: "PT", en: "EN" };
const langName: Record<Locale, string> = { pt: "Portuguese", en: "English" };

const sectionInfo: Record<Section, { title: string; description: string }> = {
  banner: { title: "Alert banner", description: "A strip across the top of every page for time-critical news. Switch it off once resolved." },
  site: { title: "Home page & downloads", description: "What the home page leads with, and where the photo download button points." },
  details: { title: "Details", description: "What visitors read. Portuguese and English: an empty language falls back to the other." },
  media: { title: "Photos & files", description: "Large photos are resized on this device before upload." },
  publishing: { title: "Publishing", description: "When and how this appears on the public site (Luanda time)." },
  more: { title: "More details (optional)", description: "Fill these in when they are confirmed. Everything else works without them." },
};

const publishingNames = new Set(["status", "publishAt", "expiresAt", "pinned"]);
/** On wide screens these sit in the right-hand column beside the save buttons. */
const sideSections = new Set<Section>(["media", "publishing", "more"]);

function sectionOf(field: FieldDef): Section {
  if (field.section) return field.section;
  if (field.type === "image" || field.type === "file") return "media";
  if (publishingNames.has(field.name)) return "publishing";
  return "details";
}

/** Field types made of several inputs: the label names the group, not one input. */
const grouped = new Set<FieldDef["type"]>(["image", "file", "link", "checkbox"]);

function FieldShell({ field, error, children }: { field: FieldDef; error?: string; children: ReactNode }) {
  const t = useT();
  const label = t(field.label);
  const help = field.help && t(field.help);
  const localized = field.type === "localized" || field.type === "localizedText" || field.type === "localizedLines";
  const labelFor = localized ? `${field.name}-en` : `f-${field.name}`;
  if (field.type === "checkbox") {
    return (
      <Field orientation="horizontal" data-invalid={error ? true : undefined} className="items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
        <div className="flex flex-col gap-1">
          <FieldLabel htmlFor={labelFor} className="text-sm font-semibold">
            {label}
          </FieldLabel>
          {help && <FieldDescription className="text-xs">{help}</FieldDescription>}
          {error && <FieldError>{t(error)}</FieldError>}
        </div>
        {children}
      </Field>
    );
  }
  return (
    <Field data-invalid={error ? true : undefined} className="gap-2">
      {grouped.has(field.type) ? (
        <span className="text-sm font-semibold">
          {label}
          {field.required && <span className="text-destructive"> *</span>}
        </span>
      ) : (
        <FieldLabel htmlFor={labelFor} className="text-sm font-semibold">
          {label}
          {field.required && <span className="text-destructive"> *</span>}
        </FieldLabel>
      )}
      {children}
      {help && <FieldDescription className="text-xs">{help}</FieldDescription>}
      {error && <FieldError>{t(error)}</FieldError>}
    </Field>
  );
}

/** EN / PT / FR as tabs over one input: a third of the height on a phone. Every language stays in the form. */
function LocalizedInputs({
  name,
  label,
  value,
  multiline,
  lines,
  invalid,
}: {
  name: string;
  label: string;
  value?: Localized<string | string[]>;
  multiline?: boolean;
  lines?: boolean;
  invalid?: boolean;
}) {
  const t = useT();
  const text = (l: Locale) => {
    const raw = value?.[l];
    return Array.isArray(raw) ? raw.join("\n") : (raw ?? "");
  };
  const [filled, setFilled] = useState<Record<Locale, boolean>>(
    () => Object.fromEntries(locales.map((l) => [l, Boolean(text(l).trim())])) as Record<Locale, boolean>,
  );

  return (
    <Tabs defaultValue="en" className="gap-2">
      <TabsList className="h-9 self-start">
        {locales.map((l) => (
          <TabsTrigger key={l} value={l} className="relative min-w-12 px-3 text-xs font-bold" title={t(langName[l])}>
            {langLabel[l]}
            {l !== "en" && !filled[l] && <span aria-label={t("missing")} className="absolute top-1 right-1 size-1.5 rounded-full bg-highlight" />}
            {l !== "en" && filled[l] && <Check className="size-3 text-success-foreground" aria-hidden="true" />}
          </TabsTrigger>
        ))}
      </TabsList>
      {locales.map((l) => {
        const id = `${name}-${l}`;
        const common = {
          id,
          name: `${name}.${l}`,
          defaultValue: text(l),
          "aria-label": t("{label} ({language})", { label, language: t(langName[l]) }),
          "aria-invalid": l === "en" && invalid ? true : undefined,
          placeholder: l === "en" ? undefined : t("Optional: shows the English text when empty"),
          onInput: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const has = Boolean(e.currentTarget.value.trim());
            setFilled((f) => (f[l] === has ? f : { ...f, [l]: has }));
          },
        };
        return (
          <TabsContent key={l} value={l} forceMount className="data-[state=inactive]:hidden">
            {multiline || lines ? <Textarea {...common} rows={lines ? 5 : 4} className="min-h-24" /> : <Input {...common} />}
          </TabsContent>
        );
      })}
      {lines && <p className="text-xs text-muted-foreground">{t("One item per line.")}</p>}
    </Tabs>
  );
}

function DropZone({
  accept,
  busy,
  label,
  hint,
  icon,
  onFile,
}: {
  accept: string;
  busy: boolean;
  label: string;
  hint: string;
  icon: ReactNode;
  onFile: (file: File | undefined) => void;
}) {
  const [over, setOver] = useState(false);
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    onFile(e.dataTransfer.files?.[0]);
  };
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={cn(
        "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-input bg-muted/40 px-4 py-5 text-center transition-colors hover:border-primary hover:bg-accent",
        over && "border-primary bg-accent",
        busy && "pointer-events-none opacity-60",
      )}
    >
      {busy ? <Loader2 className="size-6 animate-spin text-primary" /> : icon}
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input type="file" accept={accept} className="sr-only" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} />
    </label>
  );
}

interface ImageValue {
  src: string;
  width: number;
  height: number;
  alt?: Localized;
}

function ImageField({ field, value }: { field: FieldDef; value?: ImageValue }) {
  const t = useT();
  const [image, setImage] = useState<ImageValue | undefined>(value);
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setStatus({ text: t("Preparing image…") });
    try {
      const prepared = await prepareImage(file, t);
      setStatus({ text: t("Uploading {size}…", { size: formatBytes(prepared.file.size) }) });
      const result = await uploadFile(prepared.file, field.folder ?? "images", t);
      if ("error" in result) setStatus({ text: result.error, error: true });
      else {
        setImage({ src: result.url, width: prepared.width, height: prepared.height, alt: image?.alt });
        setStatus({ text: t("Uploaded ({width}×{height}). Save to publish it.", { width: prepared.width, height: prepared.height }) });
      }
    } catch (error) {
      setStatus({ text: error instanceof Error ? error.message : t("Upload failed."), error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={`${field.name}.src`} value={image?.src ?? ""} />
      <input type="hidden" name={`${field.name}.width`} value={image?.width ?? ""} />
      <input type="hidden" name={`${field.name}.height`} value={image?.height ?? ""} />
      {image?.src ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border bg-muted sm:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary uploaded URL */}
            <img src={image.src} alt="" className="size-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
            <Button asChild variant="outline" disabled={busy}>
              <label className="cursor-pointer">
                {busy ? <Loader2 className="animate-spin" /> : <Upload />} {t("Replace")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
            </Button>
            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setImage(undefined)}>
              <Trash2 /> {t("Remove")}
            </Button>
          </div>
        </div>
      ) : (
        <DropZone
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          busy={busy}
          label={t("Tap to choose a photo")}
          hint={t("or drag it here · JPG, PNG, WebP or SVG")}
          icon={<ImagePlus className="size-6 text-primary" />}
          onFile={onFile}
        />
      )}
      {status && (
        <p role="status" className={cn("text-xs", status.error ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {status.text}
        </p>
      )}
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
        <span className="text-xs font-semibold">{t("Image description for screen readers")}</span>
        <LocalizedInputs name={`${field.name}.alt`} label={t("Image description")} value={image?.alt} />
      </div>
    </div>
  );
}

function FileField({ field, values }: { field: FieldDef; values: Values }) {
  const t = useT();
  const [file, setFile] = useState({
    href: (values.href as string | null) ?? "",
    size: (values.size as string) ?? "",
    fileType: (values.fileType as string) ?? "PDF",
  });
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(selected: File | undefined) {
    if (!selected) return;
    setBusy(true);
    setStatus({ text: t("Uploading {size}…", { size: formatBytes(selected.size) }) });
    const result = await uploadFile(selected, field.folder ?? "documents", t);
    setBusy(false);
    if ("error" in result) return setStatus({ text: result.error, error: true });
    const ext = selected.name.split(".").pop()?.toUpperCase() ?? "PDF";
    setFile({ href: result.url, size: formatBytes(selected.size), fileType: ext });
    setStatus({ text: t("Uploaded. Save to publish the new file.") });
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={`${field.name}.href`} value={file.href} />
      <input type="hidden" name={`${field.name}.size`} value={file.size} />
      <input type="hidden" name={`${field.name}.fileType`} value={file.fileType} />
      {file.href && (
        <a href={file.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm hover:bg-accent">
          <FileText className="size-5 text-primary" aria-hidden="true" />
          <span className="flex-1 font-medium">{t("Current file")}</span>
          <span className="text-xs text-muted-foreground">
            {file.fileType}
            {file.size && ` · ${file.size}`}
          </span>
        </a>
      )}
      <DropZone
        accept="application/pdf"
        busy={busy}
        label={file.href ? t("Replace the PDF") : t("Tap to choose a PDF")}
        hint={file.href ? t("The link on the site stays the same") : t("No file yet: the site shows “Coming soon”")}
        icon={<Upload className="size-6 text-primary" />}
        onFile={onFile}
      />
      {status && (
        <p role="status" className={cn("text-xs", status.error ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {status.text}
        </p>
      )}
    </div>
  );
}

function renderField(field: FieldDef, values: Values, invalid: boolean, t: Translate) {
  const value = values[field.name];
  const id = `f-${field.name}`;
  const aria = invalid ? { "aria-invalid": true as const } : {};
  const label = t(field.label);
  switch (field.type) {
    case "localized":
      return <LocalizedInputs name={field.name} label={label} value={value as Localized} invalid={invalid} />;
    case "localizedText":
      return <LocalizedInputs name={field.name} label={label} value={value as Localized} multiline invalid={invalid} />;
    case "localizedLines":
      return <LocalizedInputs name={field.name} label={label} value={value as Localized<string[]>} lines invalid={invalid} />;
    case "textarea":
      return <Textarea id={id} name={field.name} defaultValue={(value as string) ?? ""} rows={4} {...aria} />;
    case "tags":
      return (
        <Textarea id={id} name={field.name} defaultValue={((value as string[]) ?? []).join(", ")} rows={3} placeholder={t("Separate with commas")} {...aria} />
      );
    case "checkbox":
      return <Switch id={id} name={field.name} defaultChecked={Boolean(value)} aria-label={label} />;
    case "select":
      return (
        <NativeSelect id={id} name={field.name} defaultValue={(value as string) ?? ""} {...aria}>
          {!field.required && <option value="">—</option>}
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </NativeSelect>
      );
    case "datetime":
      return <Input type="datetime-local" id={id} name={field.name} defaultValue={isoToMaputoInput(value)} {...aria} />;
    case "date":
      return <Input type="date" id={id} name={field.name} defaultValue={(value as string) ?? ""} {...aria} />;
    case "time":
      return <Input type="time" id={id} name={field.name} defaultValue={(value as string) ?? ""} {...aria} />;
    case "number":
      return <Input type="number" inputMode="numeric" id={id} name={field.name} defaultValue={(value as number) ?? ""} {...aria} />;
    case "image":
      return <ImageField field={field} value={value as ImageValue | undefined} />;
    case "file":
      return <FileField field={field} values={values} />;
    case "link": {
      const link = value as { href: string; label: Localized } | undefined;
      return (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3">
          <Input
            name={`${field.name}.href`}
            aria-label={t("{label}: link address", { label })}
            defaultValue={link?.href ?? ""}
            placeholder={t("https://… or #guide")}
            inputMode="url"
          />
          <span className="text-xs font-semibold">{t("Button label")}</span>
          <LocalizedInputs name={`${field.name}.label`} label={t("{label}: button label", { label })} value={link?.label} />
        </div>
      );
    }
    default:
      return (
        <Input
          type={field.type === "url" || field.type === "email" || field.type === "password" ? field.type : "text"}
          inputMode={field.type === "url" ? "url" : field.type === "email" ? "email" : undefined}
          id={id}
          name={field.name}
          autoComplete={field.type === "password" ? "new-password" : field.type === "email" ? "email" : undefined}
          defaultValue={field.type === "password" ? "" : ((value as string) ?? "")}
          {...aria}
        />
      );
  }
}

/**
 * Generic editor used by every content collection. "page" forms are split
 * into cards (Details, Photos & files, Publishing) with a pinned save bar;
 * "inline" forms sit inside another card (fixture details, adjustments).
 */
export function DocForm({
  fields,
  values,
  action,
  submitLabel,
  cancelHref,
  layout = "page",
}: {
  fields: FieldDef[];
  values: Values;
  action: (state: FormState, form: FormData) => Promise<FormState>;
  submitLabel: string;
  cancelHref?: string;
  layout?: "page" | "inline";
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(action, {});
  const order: Section[] = ["banner", "details", "site", "more", "media", "publishing"];
  const sections = order
    .map((s) => ({ id: s, fields: fields.filter((f) => sectionOf(f) === s) }))
    .filter((s) => s.fields.length);
  const fieldList = (list: FieldDef[]) =>
    list.map((field) => (
      <FieldShell key={field.name} field={field} error={state.errors?.[field.name]}>
        {renderField(field, values, Boolean(state.errors?.[field.name]), t)}
      </FieldShell>
    ));

  const sectionCard = (id: Section, list: FieldDef[], titled: boolean) => (
    <Card key={id}>
      {titled && (
        <CardHeader className="border-b">
          <CardTitle className="text-base">{t(sectionInfo[id].title)}</CardTitle>
          <CardDescription className="text-xs">{t(sectionInfo[id].description)}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-5">{fieldList(list)}</CardContent>
    </Card>
  );

  const buttons = (
    <>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Check />}
        {pending ? t("Saving…") : t(submitLabel)}
      </Button>
      {cancelHref && (
        <Button asChild variant="outline">
          <Link href={cancelHref}>{t("Cancel")}</Link>
        </Button>
      )}
    </>
  );

  return (
    <form
      noValidate
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-5"
    >
      {state.message && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{t(state.message)}</AlertDescription>
        </Alert>
      )}
      {layout === "inline" ? (
        <>
          <div className="flex flex-col gap-5">{fieldList(fields)}</div>
          <div className="flex flex-wrap gap-2 *:max-sm:flex-1">{buttons}</div>
        </>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-5">
            {sections
              .filter((s) => !sideSections.has(s.id))
              .map((s) => sectionCard(s.id, s.fields, sections.length > 1))}
          </div>
          <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-20">
            {sections
              .filter((s) => sideSections.has(s.id))
              .map((s) => sectionCard(s.id, s.fields, sections.length > 1))}
            <ActionBar className="xl:static xl:mt-0 xl:flex-wrap xl:shadow-xs">{buttons}</ActionBar>
          </aside>
        </div>
      )}
    </form>
  );
}
