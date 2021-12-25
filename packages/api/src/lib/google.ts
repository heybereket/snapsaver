import { Strategy } from "passport-google-oauth20";
import { prisma } from "./connections/prisma";
import { IS_PRODUCTION } from "./constants";

export const googleStrategy = () => {
  return new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: IS_PRODUCTION
        ? "https://api.snapsaver.me/v1/google/callback"
        : "http://localhost:8080/v1/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      const currentUser = await prisma.user.findUnique({
        where: {
          email: profile.emails?.values()?.next()?.value.value,
        },
      });

      if (!currentUser) {
        await prisma.user.create({
          data: {
            email: profile.emails?.values()?.next()?.value.value,
          },
        });

        return done(null, profile);
      } else {
        return done(undefined, profile);
      }
    }
  );
};
