//utils/buildSecurityPrompt.ts

export function buildSecurityPrompt(event: SecurityEvent): string {
  // 実装を追加
  return `Security event: ${JSON.stringify(event)}\n\nPlease assess the risk level and suggest an action.`;
}

interface SecurityEvent {
  [key: string]: any;
}