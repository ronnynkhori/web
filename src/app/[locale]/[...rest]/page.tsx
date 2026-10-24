import { notFound } from "next/navigation";

/** Unknown paths under a language render the localized 404 inside the site layout. */
export default function UnknownPage() {
  notFound();
}
