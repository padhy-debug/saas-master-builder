/**
 * Offline Cryptographic License Verifier with Anti-Tamper Clock Guard
 * Embeds ONLY the Public Key into desktop/on-prem/mobile client builds.
 */

import { jwtVerify, importSPKI } from 'jose';

export interface LicenseVerificationResult {
  status: 'active' | 'grace_period' | 'locked' | 'tampered';
  payload?: any;
  message: string;
}

export class OfflineLicenseVerifier {
  private publicKeyPem: string;
  private lastKnownServerTimestamp: number;

  constructor(publicKeyPem: string, lastKnownTimestamp: number = 0) {
    this.publicKeyPem = publicKeyPem;
    this.lastKnownServerTimestamp = lastKnownTimestamp;
  }

  async verify(token: string): Promise<LicenseVerificationResult> {
    try {
      const publicKey = await importSPKI(this.publicKeyPem, 'EdDSA');
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: 'saas-master-licensing',
      });

      const nowSeconds = Math.floor(Date.now() / 1000);

      // Anti-Tamper: Detect backward clock manipulation
      if (this.lastKnownServerTimestamp > 0 && nowSeconds < this.lastKnownServerTimestamp - 300) {
        return {
          status: 'tampered',
          message: 'System clock has been set backward. License verification failed.',
        };
      }

      const exp = payload.exp as number;
      const graceExp = (payload.grace_exp as number) || exp;

      if (nowSeconds <= exp) {
        return {
          status: 'active',
          payload,
          message: 'License is valid and active.',
        };
      } else if (nowSeconds <= graceExp) {
        const daysLeft = Math.ceil((graceExp - nowSeconds) / 86400);
        return {
          status: 'grace_period',
          payload,
          message: `License expired. Running in grace period. Please connect to internet within ${daysLeft} days.`,
        };
      } else {
        return {
          status: 'locked',
          payload,
          message: 'License and grace period have expired. Access locked.',
        };
      }
    } catch (err: any) {
      return {
        status: 'locked',
        message: `Cryptographic verification failed: ${err.message}`,
      };
    }
  }
}
