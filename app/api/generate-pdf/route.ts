import { chromium, type Browser } from "playwright-core";
import { renderDocumentHtml } from "@/lib/renderDocumentHtml";
import { buildPdfFileName } from "@/lib/pdfFileName";
import { individualSchema } from "@/schemas/individualSchema";
import { legalSchema } from "@/schemas/legalSchema";
import { COMPANIES, type CompanyKey } from "@/config/companies";

export const runtime = "nodejs";

type GeneratePdfRequest = {
  clientType: "individual" | "legal";
  company: CompanyKey;
  answers: Record<string, unknown>;
};

function isValidRequest(body: unknown): body is GeneratePdfRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    (b.clientType === "individual" || b.clientType === "legal") &&
    typeof b.company === "string" &&
    b.company in COMPANIES &&
    typeof b.answers === "object" &&
    b.answers !== null
  );
}

async function launchBrowser(): Promise<Browser> {
  const isServerless = Boolean(process.env.VERCEL);
  if (!isServerless) {
    return chromium.launch();
  }
  const chromiumBinary = (await import("@sparticuz/chromium")).default;
  return chromium.launch({
    executablePath: await chromiumBinary.executablePath(),
    args: chromiumBinary.args,
  });
}

async function parseBody(request: Request): Promise<unknown> {
  const formData = await request.formData().catch(() => null);
  if (!formData) return null;

  const answersRaw = formData.get("answers");
  let answers: unknown = null;
  try {
    answers = JSON.parse(typeof answersRaw === "string" ? answersRaw : "");
  } catch {
    answers = null;
  }

  return {
    clientType: formData.get("clientType"),
    company: formData.get("company"),
    answers,
  };
}

export async function POST(request: Request) {
  const body = await parseBody(request);

  if (!isValidRequest(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const schema = body.clientType === "individual" ? individualSchema : legalSchema;
  const documentHtml = renderDocumentHtml(schema, body.answers, body.company);

  const fullHtml = `<!DOCTYPE html>
<html lang="lv">
  <head>
    <meta charSet="utf-8" />
    <style>
      body {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 10.5pt;
        color: #1e293b;
        line-height: 1.5;
      }
      h1 {
        font-size: 16pt;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 0.2em;
      }
      article > p {
        font-size: 9pt;
        color: #64748b;
        margin-top: 0;
      }
      h2 {
        font-size: 9pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin: 0 0 0.5em 0;
      }
      section {
        border-top: 1px solid #e2e8f0;
        padding-top: 0.8em;
        margin-top: 1.2em;
        break-inside: avoid;
      }
      dl {
        margin: 0;
      }
      .qa {
        break-inside: avoid;
        margin: 0 0 0.6em 0;
      }
      .qa dt {
        font-size: 7.5pt;
        color: #64748b;
        margin: 0;
      }
      .qa dd {
        font-size: 10pt;
        font-weight: 500;
        color: #0f172a;
        margin: 0.1em 0 0 0;
      }
      .signature-area {
        display: flex;
        gap: 2em;
        margin-top: 2.5em;
      }
      .signature-line {
        flex: 1;
      }
      .signature-blank {
        height: 2.5em;
        border-bottom: 1px solid #94a3b8;
      }
      .signature-line p {
        margin: 0.4em 0 0 0;
        font-size: 7.5pt;
        color: #64748b;
      }
      footer {
        border-top: 1px solid #e2e8f0;
        margin-top: 2em;
        padding-top: 1em;
        font-size: 7.5pt;
        line-height: 1.4;
        color: #94a3b8;
      }
    </style>
  </head>
  <body>${documentHtml}</body>
</html>`;

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    const fileName = buildPdfFileName(body.answers);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } finally {
    await browser.close();
  }
}
