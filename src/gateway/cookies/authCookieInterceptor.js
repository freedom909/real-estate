const authCookieInterceptor = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const accessToken =
      body?.data?.oauthLogin?.accessToken;

    if (accessToken) {
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      delete body.data.oauthLogin.accessToken;
    }

    return originalJson(body);
  };

  next();
};

export default authCookieInterceptor