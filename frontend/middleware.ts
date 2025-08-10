import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

// Protect all Case Studies pages under /projects/*
export const config = {
  matcher: ["/projects/:path*"],
};
