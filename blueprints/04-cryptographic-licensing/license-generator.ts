/**
 * Asymmetric Ed25519 Offline License Generator
 * Run on the secure licensing server only.
 * Private key NEVER touches client devices.
 */

import { generateKeyPair, exportPKCS8, exportSPKI, SignJWT } from 'jose';

export interface LicensePayload {
  tenantId: string;
  licenseId: string;
  planTier: 'starter' | 'pro' | 'enterprise';
  features: string[];
  seatCount: number;
  validDays: number;
  graceDays: number;
}

export async function generateLicenseKeys() {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA');
  const privatePem = await exportPKCS8(privateKey);
  const publicPem = await exportSPKI(publicKey);
  return { privatePem, publicPem };
}

export async function issueLicenseToken(
  payload: LicensePayload,
  privateKeyPem: string
): Promise<string> {
  const { importPKCS8 } = await import('jose');
  const privateKey = await importPKCS8(privateKeyPem, 'EdDSA');

  const now = Math.floor(Date.now() / 1000);
  const exp = now + payload.validDays * 86400;
  const graceExp = exp + payload.graceDays * 86400;

  return await new SignJWT({
    sub: payload.tenantId,
    lic: payload.licenseId,
    plan: payload.planTier,
    feat: payload.features,
    seats: payload.seatCount,
    grace_exp: graceExp,
  })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setIssuer('saas-master-licensing')
    .sign(privateKey);
}
