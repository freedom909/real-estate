import { buildSecurityPrompt } from "../../utils/buildSecurityPrompt";
import { validateSecurityResponse } from "../../utils/validateSecurityResponse";
// interface SecurityAssessment {
//   riskLevel: string;
//   suggestedAction: string;
//   details: string;
// }
export class GeminiSecurityService {
    async assess(event) {
        const prompt = buildSecurityPrompt(event);
        const rawResponse = await callGemini(prompt);
        const parsedResponse = validateSecurityResponse(rawResponse);
        return parsedResponse;
    }
}
// This function should be implemented elsewhere in your codebase
async function callGemini(prompt) {
    // Implementation for calling Gemini API
    throw new Error("callGemini function not implemented");
}
