import { describe, it, expect } from "vitest";
import { readAuthConfig } from "./auth";

const joomlaEnv = {
  AGENT_LOGIN: "joomla",
  JOOMLA_SSO_SECRET: "0123456789abcdef0123456789abcdef",
  SESSION_SECRET: "fedcba9876543210fedcba9876543210",
  JOOMLA_LOGIN_URL: "https://ekocentrs.lv/kyc-sso.php",
};

describe("readAuthConfig", () => {
  it("refuses to guess when AGENT_LOGIN is not set", () => {
    // Falling back to "no login" would silently open the agent page the day
    // someone forgets a variable, so an unset switch is a hard error.
    expect(() => readAuthConfig({})).toThrowError(/AGENT_LOGIN/);
    expect(() => readAuthConfig({ AGENT_LOGIN: "maybe" })).toThrowError(/AGENT_LOGIN/);
  });

  describe("external mode — something in front of the app guards it", () => {
    it("needs nothing else configured", () => {
      expect(readAuthConfig({ AGENT_LOGIN: "external" })).toEqual({ mode: "external" });
    });

    it("ignores Joomla settings that happen to be left over", () => {
      expect(readAuthConfig({ ...joomlaEnv, AGENT_LOGIN: "external" })).toEqual({
        mode: "external",
      });
    });
  });

  describe("joomla mode — the app checks the hand-off itself", () => {
    it("returns the configured values", () => {
      expect(readAuthConfig(joomlaEnv)).toEqual({
        mode: "joomla",
        joomlaSecret: joomlaEnv.JOOMLA_SSO_SECRET,
        sessionSecret: joomlaEnv.SESSION_SECRET,
        joomlaLoginUrl: joomlaEnv.JOOMLA_LOGIN_URL,
      });
    });

    it("names the variable that is missing", () => {
      for (const key of ["JOOMLA_SSO_SECRET", "SESSION_SECRET", "JOOMLA_LOGIN_URL"]) {
        expect(() => readAuthConfig({ ...joomlaEnv, [key]: undefined })).toThrowError(
          new RegExp(key)
        );
      }
    });

    it("refuses secrets that are too short to be worth signing with", () => {
      expect(() => readAuthConfig({ ...joomlaEnv, SESSION_SECRET: "short" })).toThrowError(
        /SESSION_SECRET/
      );
    });

    it("refuses using one secret for both purposes", () => {
      const reused = { ...joomlaEnv, SESSION_SECRET: joomlaEnv.JOOMLA_SSO_SECRET };

      expect(() => readAuthConfig(reused)).toThrowError(/different/i);
    });

    it("refuses a login URL that is not an absolute http(s) address", () => {
      for (const url of ["/kyc-sso.php", "ekocentrs.lv/kyc-sso.php", "javascript:alert(1)"]) {
        expect(() => readAuthConfig({ ...joomlaEnv, JOOMLA_LOGIN_URL: url })).toThrowError(
          /JOOMLA_LOGIN_URL/
        );
      }
    });
  });
});
