import { Request, Response, NextFunction } from 'express';

interface OAuthLoginResponse {
  data?: {
    oauthLogin?: {
      accessToken?: string;
    };
  };
}

const authCookieInterceptor = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = (body: OAuthLoginResponse) => {
    const accessToken =
      body?.data?.oauthLogin?.accessToken;

    if (accessToken) {
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      if (body.data?.oauthLogin) {
        delete body.data.oauthLogin.accessToken;
      }
    }

    return originalJson(body);
  };

  next();
};

export default authCookieInterceptor;