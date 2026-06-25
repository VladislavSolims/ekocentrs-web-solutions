"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { encodeLinkPayload, type LinkPayload } from "@/lib/linkPayload";
import { COMPANIES, type CompanyKey } from "@/config/companies";

const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

export default function IzveidotPage() {
  const [company, setCompany] = useState<CompanyKey>("EKOCENTRS");
  const [clientType, setClientType] = useState<LinkPayload["clientType"]>("individual");
  const [address, setAddress] = useState("");
  const [dealType, setDealType] = useState<LinkPayload["dealType"]>("sale");
  const [role, setRole] = useState<LinkPayload["role"]>("client");
  const [link, setLink] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!link) {
      setQrCodeDataUrl(null);
      return;
    }
    QRCode.toDataURL(link, { width: 240, margin: 1 }).then(setQrCodeDataUrl);
  }, [link]);

  function handleCreateLink() {
    const encoded = encodeLinkPayload({ v: 1, clientType, company, address, dealType, role });
    setLink(`${window.location.origin}/aizpildit?d=${encoded}`);
    setCopied(false);
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  async function handleShare() {
    if (!link) return;
    await navigator.share({ title: "Klienta identifikācijas anketa", url: link });
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Izveidot anketas saiti</h1>
      <p className="mb-6 text-sm text-slate-500">
        Aizpildi zināmos datus par darījumu — klients pārējo aizpildīs pats.
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <label htmlFor="company" className={labelClass}>
            Firma
          </label>
          <select
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value as CompanyKey)}
            className={inputClass}
          >
            {Object.entries(COMPANIES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.legalName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="clientType" className={labelClass}>
            Klienta tips
          </label>
          <select
            id="clientType"
            value={clientType}
            onChange={(e) => setClientType(e.target.value as LinkPayload["clientType"])}
            className={inputClass}
          >
            <option value="individual">Fiziska persona</option>
            <option value="legal">Juridiska persona</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="address" className={labelClass}>
            Adrese
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
            placeholder="Rīga, Brīvības iela 1"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="dealType" className={labelClass}>
            Darījuma veids
          </label>
          <select
            id="dealType"
            value={dealType}
            onChange={(e) => setDealType(e.target.value as LinkPayload["dealType"])}
            className={inputClass}
          >
            <option value="sale">NĪ pārdošana</option>
            <option value="purchase">NĪ iegāde</option>
            <option value="rent">NĪ īre</option>
            <option value="lease">NĪ noma</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="role" className={labelClass}>
            Loma
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as LinkPayload["role"])}
            className={inputClass}
          >
            <option value="client">Klients</option>
            <option value="partner">Darījuma partneris</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleCreateLink}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Izveidot saiti
        </button>

        {link && (
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p data-testid="generated-link" className="mb-3 break-all text-sm text-slate-700">
              {link}
            </p>

            {qrCodeDataUrl && (
              <div className="mb-4 flex justify-center">
                <img
                  src={qrCodeDataUrl}
                  alt="QR kods ar anketas saiti"
                  data-testid="qr-code"
                  className="rounded-md border border-slate-200 bg-white p-2"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {copied ? "Nokopēts!" : "Kopēt saiti"}
              </button>

              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download="anketas-saite-qr.png"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Lejupielādēt QR kodu
                </a>
              )}

              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Nosūtīt
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
