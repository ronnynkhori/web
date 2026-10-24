import { AuthShell } from "@/components/admin/auth-shell";
import { ResetForm } from "@/components/admin/password-reset-forms";

export const metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="New password" description="Choose a new password for the Games Control Room.">
      <ResetForm />
    </AuthShell>
  );
}
