//src/security/audit/securityAudit.js

export class SecurityAudit {
    flag(result){
        console.warn('security flagged:', result)
    }

    recordOutcome(entry){}
}

