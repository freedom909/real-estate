// types/express.d.ts などの適切な場所に追加
import { User } from './core/user/domain/user'; // User型のパスを指定

declare global {
  namespace Express {
    interface Request {
      user?: User; // または適切な型
    }
  }
}