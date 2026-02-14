//repo/types.ts
import { SecurityEvent } from "../builder/securityEvent.builder";
import { SecurityAssessment } from "../../utils/types";

export class SecurityEventRepository {
  async save(event: SecurityEvent, assessment: SecurityAssessment): Promise<void> {
    // 実装を追加
    console.log("Saving security event:", event, assessment);
  }
}



