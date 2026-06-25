import { decodeLinkPayload } from "@/lib/linkPayload";
import { AizpilditClient } from "./AizpilditClient";

export default async function AizpilditPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { d } = await searchParams;

  if (typeof d !== "string") {
    return (
      <main>
        <p>Nederīga saite. Lūdzu, sazinieties ar savu aģentu.</p>
      </main>
    );
  }

  try {
    const payload = decodeLinkPayload(d);
    return <AizpilditClient payload={payload} />;
  } catch {
    return (
      <main>
        <p>Nederīga saite. Lūdzu, sazinieties ar savu aģentu.</p>
      </main>
    );
  }
}
