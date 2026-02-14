export default class ApprovalService {
    constructor({ approvalRepo, mergeAccountService, auditLogService, }) {
        this.approvalRepo = approvalRepo;
        this.mergeAccountService = mergeAccountService;
        this.auditLogService = auditLogService;
    }
    async requestMerge({ fromUserId, toUserId, requestedBy, preview, riskScore, }) {
        return this.approvalRepo.create({
            type: "MERGE_ACCOUNT",
            requesterUserId: requestedBy,
            targetUserId: toUserId,
            payload: {
                fromUserId,
                toUserId,
                preview,
            },
            riskScore,
        });
    }
    async approve(requestId, adminUserId) {
        const req = await this.approvalRepo.findById(requestId);
        if (req?.status !== "PENDING") {
            throw new Error("INVALID_APPROVAL_STATE");
        }
        // 🔐 真正执行
        if (req?.type === "MERGE_ACCOUNT") {
            await this.mergeAccountService.execute(req.payload);
        }
        await this.approvalRepo.markApproved(requestId, adminUserId);
        await this.auditLogService.record({
            actor: adminUserId,
            action: req?.type,
            target: req?.targetUserId,
            meta: req?.payload,
        });
        return true;
    }
    async reject(requestId, adminUserId, reason) {
        await this.approvalRepo.markRejected(requestId, adminUserId, reason);
    }
}
