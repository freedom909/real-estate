export default class OAuthVerifier {

  async verify(provider: string, token: string): Promise<any> {

    switch (provider) {

      case "google":
        return this.verifyGoogle(token);

      case "github":
        return this.verifyGithub(token);

      case "apple":
        return this.verifyApple(token);

      default:
        throw new Error("Unsupported provider");

    }

  }

  async verifyGoogle(idToken: string) {

    // normally use google-auth-library

    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    return payload;

  }

  async verifyGithub(accessToken: string) {

    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.json();

  }

  async verifyApple(idToken: string) {

    const payload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64").toString()
    );

    return payload;

  }

}