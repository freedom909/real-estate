//utils/types.ts

export interface SecurityAssessment {
  suggestedAction: "ALLOW" | "FLAG" | "CHALLENGE" | "BLOCK";
  reason?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  riskScore?: number;
  details?: string;

}