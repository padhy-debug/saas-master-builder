/**
 * SaaS Prompt Shield & Jailbreak Circuit Breaker
 * Detects adversarial inputs, prompt injection, and unauthorized instructions.
 */

export interface PromptScanResult {
  safe: boolean;
  threatLevel: 'none' | 'low' | 'high' | 'critical';
  matchedPattern?: string;
  reason?: string;
}

const INJECTION_PATTERNS = [
  { regex: /ignore\s+(all\s+)?(previous|above|prior)\s+instructions/i, name: 'SYSTEM_OVERRIDE_ATTEMPT' },
  { regex: /you\s+are\s+now\s+(unrestricted|in\s+developer\s+mode|dan)/i, name: 'JAILBREAK_PERSONA' },
  { regex: /reveal\s+(your\s+)?(system\s+prompt|secret\s+instructions)/i, name: 'SYSTEM_PROMPT_EXTRACTION' },
  { regex: /format\s+c:\s*\/|rm\s+-rf\s+\/|drop\s+database/i, name: 'MALICIOUS_SYSTEM_COMMAND' },
  { regex: /---\s*BEGIN\s+SYSTEM\s+PROMPT/i, name: 'PROMPT_DELIMITER_INJECTION' },
];

export function scanPrompt(userInput: string): PromptScanResult {
  if (!userInput || typeof userInput !== 'string') {
    return { safe: true, threatLevel: 'none' };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(userInput)) {
      return {
        safe: false,
        threatLevel: 'critical',
        matchedPattern: pattern.name,
        reason: `Potential adversarial prompt injection detected: ${pattern.name}`,
      };
    }
  }

  return { safe: true, threatLevel: 'none' };
}
