import { describe, it, expect } from "vitest";
import { readAuthConfig } from "./auth";

const validEnv = {
  JOOMLA_SSO_SECRET: "0123456789abcdef0123456789abcdef",
  SESSION_SECRET: "fedcba9876543210fedcba9876543210",
  JOOMLA_LOGIN_URL: "https://ekocentrs.lv/kyc-sso.php",
};

describe("readAuthConfig", () => {
  it("returns the configured values", () => {
    expect(readAuthConfig(validEnv)).toEqual({
      joomlaSecret: validEnv.JOOMLA_SSO_SECRET,
      sessionSecret: validEnv.SESSION_SECRET,
      joomlaLoginUrl: validEnv.JOOMLA_LOGIN_URL,
    });
  });

  it("names the variable that is missing", () => {
    for (const key of Object.keys(validEnv)) {
      const incomplete = { ...validEnv, [key]: undefined };

      expect(() => readAuthConfig(incomplete)).toThrowError(new RegExp(key));
    }
  });

  it("refuses secrets that are too short to be worth signing with", () => {
    expect(() => readAuthConfig({ ...validEnv, SESSION_SECRET: "short" })).toThrowError(
      /SESSION_SECRET/
    );
  });

  it("refuses using one secret for both purposes", () => {
    const reused = { ...validEnv, SESSION_SECRET: validEnv.JOOMLA_SSO_SECRET };

    expect(() => readAuthConfig(reused)).toThrowError(/different/i);
  });

  it("refuses a login URL that is not an absolute http(s) address", () => {
    for (const url of ["/kyc-sso.php", "ekocentrs.lv/kyc-sso.php", "javascript:alert(1)"]) {
      expect(() => readAuthConfig({ ...validEnv, JOOMLA_LOGIN_URL: url })).toThrowError(
        /JOOMLA_LOGIN_URL/
      );
    }
  });
});
