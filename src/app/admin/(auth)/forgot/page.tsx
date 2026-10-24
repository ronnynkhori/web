import { AuthShell } from "@/components/admin/auth-shell";
import { ForgotForm } from "@/components/admin/password-reset-forms";
import { selfResetAvailable } from "@/lib/admin/recovery";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password" description="Enter your sign-in email and we will send you a link to choose a new password.">
      <ForgotForm available={selfResetAvailable()} />
    </AuthShell>
  );
}
