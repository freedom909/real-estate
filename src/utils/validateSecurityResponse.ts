//utils/validateSecurityResponse.ts
import { SecurityAssessment } from "./types";

export const validateSecurityResponse = (response: any): SecurityAssessment => {
  const { riskLevel, suggestedAction, details } = response;

  if (!riskLevel || !suggestedAction || !details) {
    throw new Error("Invalid security response format");
  }

  return {
    riskLevel,
    suggestedAction,
    details,
  };
};