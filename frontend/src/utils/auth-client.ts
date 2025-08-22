import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:8008",
});

export const signIn = async () => {
    const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/sendhome"
  });
}

export const { useSession } = authClient;