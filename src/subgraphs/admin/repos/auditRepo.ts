interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
  // その他の必要なプロパティ
}

class AdminAuditRepo {
  async insert(logData: Partial<AuditLog>): Promise<AuditLog> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }

  async query(filters: Record<string, any>): Promise<AuditLog[]> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }
}

export default AdminAuditRepo;