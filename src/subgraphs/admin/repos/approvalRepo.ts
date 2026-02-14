interface ApprovalRequest {
  id: string;
  userId: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  // その他の必要なプロパティ
}

class AdminApprovalRepo {
  async createRequest(requestData: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }

  async findById(id: string): Promise<ApprovalRequest | null> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }

  async listPending(): Promise<ApprovalRequest[]> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<ApprovalRequest> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }
}

export default AdminApprovalRepo;