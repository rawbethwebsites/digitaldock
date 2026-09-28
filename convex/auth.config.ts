// This file registers the JWT issuer with Convex so that getAuthUserId(ctx)
// and ctx.auth.getUserIdentity() resolve correctly. Without it, sign-up/sign-in
// succeed server-side but every authenticated query returns null — the app
// appears permanently signed out with no error. See Convex Auth docs:
// https://docs.convex.dev/auth/convex-auth

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};