interface User {
  id: string;
  [key: string]: any;
}

interface MergePreview {
  fromUser: User;
  toUser: User;
  conflicts: string[];
  canMerge: boolean;
}

class AdminMergeService {
  async previewMerge(fromUserId: string, toUserId: string): Promise<MergePreview> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }

  async executeMerge(fromUserId: string, toUserId: string): Promise<boolean> {
    // 実装は環境に応じて追加
    throw new Error('Method not implemented');
  }
}

export default AdminMergeService;