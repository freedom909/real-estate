import mongoose from "mongoose";

export default class MergeAccountService {
  constructor({
    userRepo,
    credentialRepo,
    refreshTokenRepo,
    loginRiskService,
    auditLogRepo,
  }) {
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

    if (
      operator?.userId === fromUserId ||
      operator?.userId === toUserId
    ) {
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
      warnings.push(
        "CANNOT_MERGE_ACCOUNT_WITH_CREDENTIALS"
      );
    }

    if (toCreds.length > 0) {
      warnings.push(
        "CANNOT_MERGE_ACCOUNT_WITH_CREDENTIALS"
      );
    }

    const providerConflict = fromCreds.some((cred) =>
      toCreds.some(
        (toCred) =>
          toCred.provider === cred.provider
      )
    );

    if (providerConflict) {
      warnings.push(
        "CANNOT_MERGE_ACCOUNT_WITH_SAME_PROVIDER"
      );
    }

    const refreshTokenCount =
      await this.refreshTokenRepo.countByUserId(
        toUserId
      );

    if (refreshTokenCount > 0) {
      warnings.push(
        "CANNOT_MERGE_ACCOUNT_WITH_refreshTokenS"
      );
    }

    await this.auditLogRepo.record({
      userId: operator?.userId,
      type: "PREVIEW_MERGE",
      fromUserId,
      toUserId,
      warnings: warnings.join(", "),
    });

    return {
      fromUser: this.#snapshotUser(
        fromUser,
        fromCreds
      ),
      toUser: this.#snapshotUser(
        toUser,
        toCreds
      ),
      credentialsToMove: fromCreds.map(
        this.#credentialPreview
      ),
      refreshTokensToMove: refreshTokenCount,
      warnings,
      mergeAllowed: warnings.length === 0,
    };
  }

  #snapshotUser(user, creds) {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      credentialCount: creds.length,
      providers: creds.map((c) => c.provider),
    };
  }

  #credentialPreview(cred) {
    return {
      id: cred.id,
      provider: cred.provider,
      email: cred.email,
      lastLoginAt: cred.lastLoginAt || null,
    };
  }

  /**
   * =================================
   * 🔀 Auto merge via verified email
   * =================================
   */
  async mergeByEmailCollision({
    primaryUserId,
    secondaryUserId,
    provider,
    providerSub,
    verifiedEmail,
  }) {
    if (!verifiedEmail) {
      throw new Error(
        "MERGE_REQUIRES_VERIFIED_EMAIL"
      );
    }

    if (primaryUserId === secondaryUserId) {
      return primaryUserId;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await this.credentialRepo.reassignUser(
        secondaryUserId,
        primaryUserId,
        { session }
      );

      await this.refreshTokenRepo.reassignUser(
        secondaryUserId,
        primaryUserId,
        { session }
      );

      await this.userRepo.deactivate(
        secondaryUserId,
        { session }
      );

      await this.loginRiskService.recordEvent(
        {
          userId: primaryUserId,
          type: "AUTO_MERGE_EMAIL",
          provider,
          providerSub,
          mergedFrom: secondaryUserId,
          email: verifiedEmail,
        },
        { session }
      );

      await session.commitTransaction();
      return primaryUserId;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * =================================
   * 🧑‍💻 Explicit merge (user/admin)
   * =================================
   */
  async mergeExplicit({
    fromUserId,
    toUserId,
    reason,
    operator,
  }) {
    if (!fromUserId || !toUserId) {
      throw new Error("INVALID_MERGE_PARAMS");
    }

    if (fromUserId === toUserId) {
      throw new Error("CANNOT_MERGE_SELF");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const creds =
        await this.credentialRepo.findByUserId(
          fromUserId,
          { session }
        );

      if (!creds.length) {
        throw new Error(
          "SOURCE_USER_HAS_NO_CREDENTIALS"
        );
      }

      await this.credentialRepo.reassignUser(
        fromUserId,
        toUserId,
        { session }
      );

      await this.refreshTokenRepo.reassignUser(
        fromUserId,
        toUserId,
        { session }
      );

      await this.userRepo.deactivate(
        fromUserId,
        { session }
      );

      await this.loginRiskService.recordEvent(
        {
          userId: toUserId,
          type: "EXPLICIT_MERGE",
          mergedFrom: fromUserId,
          reason,
          operator,
        },
        { session }
      );

      await session.commitTransaction();
      return toUserId;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
