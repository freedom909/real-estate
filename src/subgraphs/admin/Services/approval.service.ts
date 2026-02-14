// src/subgraphs/auth/services/approval.service.ts
interface ApprovalRequest {
  id: string;
  type: string;
  requesterUserId: string;
  targetUserId: string;
  payload: any;
  riskScore: number;
  status: string;
  // その他の必要なプロパティ
}

interface ApprovalRepo {
  create(data: any): Promise<ApprovalRequest>;
  findById(id: string): Promise<ApprovalRequest | null>;
  markApproved(requestId: string, adminUserId: string): Promise<void>;
  markRejected(requestId: string, adminUserId: string, reason: string): Promise<void>;
}

interface MergeAccountService {
  execute(payload: any): Promise<void>;
}

interface AuditLogService {
  record(log: any): Promise<void>;
}

interface RequestMergeParams {
  fromUserId: string;
  toUserId: string;
  requestedBy: string;
  preview: any;
  riskScore: number;
}

interface ApprovalServiceConstructorParams {
  approvalRepo: ApprovalRepo;
  mergeAccountService: MergeAccountService;
  auditLogService: AuditLogService;
}

export default class ApprovalService {
  private approvalRepo: ApprovalRepo;
  private mergeAccountService: MergeAccountService;
  private auditLogService: AuditLogService;

  constructor({
    approvalRepo,
    mergeAccountService,
    auditLogService,
  }: ApprovalServiceConstructorParams) {
    this.approvalRepo = approvalRepo;
    this.mergeAccountService = mergeAccountService;
    this.auditLogService = auditLogService;
  }

  async requestMerge({
    fromUserId,
    toUserId,
    requestedBy,
    preview,
    riskScore,
  }: RequestMergeParams) {
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

  async approve(requestId: string, adminUserId: string) {
    const req = await this.approvalRepo.findById(requestId);

    if (req?.status !== "PENDING") {
      throw new Error("INVALID_APPROVAL_STATE");
    }

    // 🔐 真正执行
    if (req?.type === "MERGE_ACCOUNT") {
      await this.mergeAccountService.execute(
        req.payload
      );
    }

    await this.approvalRepo.markApproved(
      requestId,
      adminUserId
    );

    await this.auditLogService.record({
      actor: adminUserId,
      action: req?.type,
      target: req?.targetUserId,
      meta: req?.payload,
    });

    return true;
  }

  async reject(requestId: string, adminUserId: string, reason: string) {
    await this.approvalRepo.markRejected(
      requestId,
      adminUserId,
      reason
    );
  }
}