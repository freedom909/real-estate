export const validateSecurityResponse = (response) => {
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
