import { build } from "@apollo/client";
import { validate } from "graphql";

export class GeminiSecurityService {
    async evaluate(event) {
       const prompt=buildSecurityPrompt(event);
       const raw=await callGemini(prompt)
       const parsed=validateSecurityResponse(raw);
       return parsed;
    }
            
}