"use client";

import { Printer } from "lucide-react";
import { useT } from "../i18n";
import { Button } from "../ui/button";

export function PrintNow() {
  const t = useT();
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer /> {t("Print or save as PDF")}
    </Button>
  );
}
