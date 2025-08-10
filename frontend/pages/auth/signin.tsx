import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const callbackUrl =
    (router.query.callbackUrl as string) || "/projects"; // default back to case studies

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {status === "loading" ? (
          <p>Loading...</p>
        ) : session ? (
          <p>Redirecting...</p>
        ) : (
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 24,
              maxWidth: 480,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
              Sign in to continue
            </h1>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
              You need to sign in to view the case studies.
            </p>
            <button
              onClick={() => signIn("google", { callbackUrl })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                backgroundColor: "#1f2937",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303C33.602,32.328,29.197,36,24,36c-6.627,0-12-5.373-12-12  s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24  s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657  C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.134,0,9.794-1.966,13.305-5.18l-6.147-5.197C29.197,36,24,36,24,36c-5.179,0-9.599-3.688-11.225-8.688  l-6.542,5.038C9.56,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.697,4.328-6.102,8-11.303,8c0,0,0,0,0,0l0,0l0,0  c-5.179,0-9.599-3.688-11.225-8.688l-6.542,5.038C9.56,39.556,16.227,44,24,44c8.284,0,15-6.716,15-15  C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        )}
      </main>
    </>
  );
}
