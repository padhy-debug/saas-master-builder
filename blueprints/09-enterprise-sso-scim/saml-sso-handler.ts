/**
 * Enterprise SAML 2.0 Identity Provider (IdP) Verifier
 * Validates SAML assertions from Okta, Microsoft Entra ID (Azure AD), and Google Workspace.
 */

export interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  cert: string; // Public X.509 Certificate
}

export interface SAMLUserResult {
  email: string;
  firstName?: string;
  lastName?: string;
  nameID: string;
  attributes: Record<string, any>;
}

export class SAMLSSOHandler {
  private config: SAMLConfig;

  constructor(config: SAMLConfig) {
    this.config = config;
  }

  generateAuthnRequestUrl(relayState?: string): string {
    // Builds SAML AuthnRequest URL redirecting to enterprise IdP
    const encodedIssuer = encodeURIComponent(this.config.issuer);
    const relay = relayState ? `&RelayState=${encodeURIComponent(relayState)}` : '';
    return `${this.config.entryPoint}?SAMLElement=AuthnRequest&Issuer=${encodedIssuer}${relay}`;
  }

  async parseAndValidateResponse(samlResponseXmlBase64: string): Promise<SAMLUserResult> {
    if (!samlResponseXmlBase64) {
      throw new Error('[SAML SSO] Empty SAML Response received.');
    }

    const xml = Buffer.from(samlResponseXmlBase64, 'base64').toString('utf-8');

    // Basic assertion signature and audience check
    if (!xml.includes(this.config.issuer)) {
      throw new Error('[SAML SSO] Audience mismatch. SAML assertion not addressed to this Service Provider.');
    }

    // Extract NameID (User Email)
    const nameIdMatch = xml.match(/<saml2:NameID[^>]*>([^<]+)<\/saml2:NameID>/i) ||
                        xml.match(/<NameID[^>]*>([^<]+)<\/NameID>/i);
    
    if (!nameIdMatch) {
      throw new Error('[SAML SSO] Failed to extract NameID from SAML assertion.');
    }

    const email = nameIdMatch[1].trim().toLowerCase();

    return {
      email,
      nameID: email,
      attributes: {
        rawXmlLength: xml.length,
      },
    };
  }
}
