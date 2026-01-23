We adopt Strategy 1 (Runtime Role Adaptation)
Reason: zero schema change, zero API break, instant rollback.

allowed_write = true does NOT imply unrestricted write.
Final authorization is determined by API × Role policy.

Note: Policy matching is exact and does not allow wildcard inference unless explicitly defined.
