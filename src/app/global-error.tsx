"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100dvh",
          margin: 0,
          textAlign: "center",
        }}
      >
        <div role="alert">
          <h1>VisualDSA hit an unexpected error</h1>
          <p>Please try again.</p>
          <button type="button" onClick={reset} style={{ padding: "0.5rem 1rem" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
