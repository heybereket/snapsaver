import { Strategy } from "passport-google-oauth20";
import { prisma } from "./connections/prisma";
import { API_URL } from "./constants";

export const googleStrategy = () => {
  return new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${API_URL}/google/callback`,
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
