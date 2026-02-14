// src/core/user/domain/normalizeRole.ts
export function normalizeRole(role) {
    // Normalize role to standard format
    if (!role)
        return "USER";
    // Convert to uppercase and remove spaces
    return role.toUpperCase().trim().replace(/\s+/g, "_");
}
