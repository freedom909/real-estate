import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../shared/container/tokens";
import TokenService, { TokenPayload } from "../services/token/token.service";
import SessionRepo from "../repos/session.repo";
import TokenBindingService from "../middleware/tokenBindingService";
import { UnauthorizedError } from "../../../infrastructure/utils/errors";

/**
 * AuthGuard handles token verification and session validation.
 */
@injectable()
export class AuthGuard {
  constructor(
    @inject(TOKENS.auth.tokenService) private tokenService: TokenService,
    @inject(TOKENS.auth.sessionRepo) private sessionRepo: SessionRepo,
    @inject(TOKENS.auth.tokenBindingService)
    private tokenBindingService: TokenBindingService
  ) {}

  /**
   * Validate access token and session
   */
  public async validate(req: Request): Promise<{ userId: string; sessionId: string }> {
    // 1️⃣ Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No authorization header");
    }
    const token = authHeader.replace("Bearer ", "");

    // 2️⃣ Verify access token
    const payload: TokenPayload = await this.tokenService.verifyAccessToken(token);

    // 3️⃣ Fetch session
    const session = await this.sessionRepo.findById(payload.sessionId);
    if (!session || session.revokedAt) {
      throw new UnauthorizedError("Session invalid or revoked");
    }

    // 4️⃣ Validate token binding
    await this.tokenBindingService.validate({
      session,
      ip: req.ip,
      userAgent: req.headers["user-agent"] as string,
      deviceId: req.headers["x-device-id"] as string | undefined,
    });

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
    };
  }

  /**
   * Express middleware wrapper
   */
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId } = await this.validate(req);
        // Attach user info to request
        (req as any).userId = userId;
        next();
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          res.status(401).json({ error: err.message });
        } else {
          next(err);
        }
      }
    };
  }
}