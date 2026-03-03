// global.d.ts
import { User } from './core/user/domain/user'; // User型のパスを指定

declare global {
  namespace Express {
    interface Request {
      user?: User; // または適切な型
    }
  }
}