var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MergeAccountService_instances, _MergeAccountService_snapshotUser, _MergeAccountService_credentialPreview;
import mongoose from "mongoose";
class MergeAccountService {
    constructor({ userRepo, credentialRepo, refreshTokenRepo, loginRiskService, auditLogRepo, }) {
        _MergeAccountService_instances.add(this);
        this.userRepo = userRepo;
        this.credentialRepo = credentialRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.loginRiskService = loginRiskService;
        this.auditLogRepo = auditLogRepo;
    }
    /**
     * =================================
     * 🔍 Merge preview (NO TRANSACTION)
     * =================================
     */
    async previewMerge({ fromUserId, toUserId, operator }) {
        if (!fromUserId || !toUserId) {
            throw new Error("INVALID_MERGE_PARAMS");
        }
        if (fromUserId === toUserId) {
            throw new Error("CANNOT_MERGE_SELF");
        }
        const warnings = [];
        if (operator?.userId === fromUserId ||
            operator?.userId === toUserId) {
            warnings.push("CANNOT_MERGE_OPERATOR");
        }
        const [fromUser, toUser] = await Promise.all([
            this.userRepo.findById(fromUserId),
            this.userRepo.findById(toUserId),
        ]);
        if (!fromUser || !toUser) {
            throw new Error("INVALID_MERGE_PARAMS");
        }
        const [fromCreds, toCreds] = await Promise.all([
            this.credentialRepo.findByUserId(fromUserId),
            this.credentialRepo.findByUserId(toUserId),
        ]);
        if (fromCreds.length > 0) {
            warnings.push("CANNOT_MERGE_ACCOUNT_WITH_CREDENTIALS");
        }
        if (toCreds.length > 0) {
            warnings.push("CANNOT_MERGE_ACCOUNT_WITH_CREDENTIALS");
        }
        const providerConflict = fromCreds.some((cred) => toCreds.some((toCred) => toCred.provider === cred.provider));
        if (providerConflict) {
            warnings.push("CANNOT_MERGE_ACCOUNT_WITH_SAME_PROVIDER");
        }
        const refreshTokenCount = await this.refreshTokenRepo.countByUserId(toUserId);
        if (refreshTokenCount > 0) {
            warnings.push("CANNOT_MERGE_ACCOUNT_WITH_REFRESH_TOKENS");
        }
        await this.auditLogRepo.record({
            userId: operator?.userId,
            type: "PREVIEW_MERGE",
            fromUserId,
            toUserId,
            warnings: warnings.join(", "),
        });
        return {
            fromUser: __classPrivateFieldGet(this, _MergeAccountService_instances, "m", _MergeAccountService_snapshotUser).call(this, fromUser, fromCreds),
            toUser: __classPrivateFieldGet(this, _MergeAccountService_instances, "m", _MergeAccountService_snapshotUser).call(this, toUser, toCreds),
            credentialsToMove: fromCreds.map(__classPrivateFieldGet(this, _MergeAccountService_instances, "m", _MergeAccountService_credentialPreview)),
            refreshTokensToMove: refreshTokenCount,
            warnings,
            mergeAllowed: warnings.length === 0,
        };
    }
    /**
     * =================================
     * 🔀 Auto merge via verified email
     * =================================
     */
    async mergeByEmailCollision({ primaryUserId, secondaryUserId, provider, providerSub, verifiedEmail, }) {
        if (!verifiedEmail) {
            throw new Error("MERGE_REQUIRES_VERIFIED_EMAIL");
        }
        if (primaryUserId === secondaryUserId) {
            return primaryUserId;
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await this.credentialRepo.reassignUser(secondaryUserId, primaryUserId, { session });
            await this.refreshTokenRepo.reassignUser(secondaryUserId, primaryUserId, { session });
            await this.userRepo.deactivate(secondaryUserId, { session });
            await this.loginRiskService.recordEvent({
                userId: primaryUserId,
                type: "AUTO_MERGE_EMAIL",
                provider,
                providerSub,
                mergedFrom: secondaryUserId,
                email: verifiedEmail,
            }, { session });
            await session.commitTransaction();
            return primaryUserId;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
    /**
     * =================================
     * 🧑‍💻 Explicit merge (user/admin)
     * =================================
     */
    async mergeExplicit({ fromUserId, toUserId, reason, operator, }) {
        if (!fromUserId || !toUserId) {
            throw new Error("INVALID_MERGE_PARAMS");
        }
        if (fromUserId === toUserId) {
            throw new Error("CANNOT_MERGE_SELF");
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const creds = await this.credentialRepo.findByUserId(fromUserId, { session });
            if (!creds.length) {
                throw new Error("SOURCE_USER_HAS_NO_CREDENTIALS");
            }
            await this.credentialRepo.reassignUser(fromUserId, toUserId, { session });
            await this.refreshTokenRepo.reassignUser(fromUserId, toUserId, { session });
            await this.userRepo.deactivate(fromUserId, { session });
            await this.loginRiskService.recordEvent({
                userId: toUserId,
                type: "EXPLICIT_MERGE",
                mergedFrom: fromUserId,
                reason,
                operator,
            }, { session });
            await session.commitTransaction();
            return toUserId;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
}
_MergeAccountService_instances = new WeakSet(), _MergeAccountService_snapshotUser = function _MergeAccountService_snapshotUser(user, creds) {
    return {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        credentialCount: creds.length,
        providers: creds.map((c) => c.provider),
    };
}, _MergeAccountService_credentialPreview = function _MergeAccountService_credentialPreview(cred) {
    return {
        id: cred.id,
        provider: cred.provider,
        email: cred.email,
        lastLoginAt: cred.lastLoginAt || null,
    };
};
export default MergeAccountService;
