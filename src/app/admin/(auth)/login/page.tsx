import { Suspense } from "react";
import { CircleCheck, Info } from "lucide-react";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { bootstrapHint } from "@/lib/admin/auth";
import { getT } from "@/lib/admin/i18n/server";

export const metadata = { title: "Sign in" };

async function ResetNotice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { reset } = await searchParams;
  if (!reset) return null;
  const t = await getT();
  return (
    <Alert className="bg-success text-success-foreground" role="status">
      <CircleCheck />
      <AlertDescription className="text-success-foreground">{t("Your password has been changed. Sign in with the new one.")}</AlertDescription>
    </Alert>
  );
}

async function BootstrapHint() {
  const hint = bootstrapHint(await getT());
  if (!hint) return null;
  return (
    <p className="flex gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
      <Info className="mt-px size-4 shrink-0" aria-hidden="true" />
      {hint}
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <AuthShell title="Games Control Room" description="Sign in to manage the CPLP 2027 website.">
      <Suspense>
        <ResetNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
      <Suspense>
        <BootstrapHint />
      </Suspense>
    </AuthShell>
  );
}
