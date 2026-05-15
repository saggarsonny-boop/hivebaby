import React, { useEffect, useState } from "react";

// ------------------------------------------------------------------
// A5: UNIVERSAL ONBOARDING WRAPPER (Frictionless Entry)
// ------------------------------------------------------------------

interface HiveOnboardingProps {
  children: React.ReactNode;
  engineName: string;
  engineValueProposition: string;
}

export function HiveOnboarding({ children, engineName, engineValueProposition }: HiveOnboardingProps) {
  const [isOnboarded, setIsOnboarded] = useState(true);

  useEffect(() => {
    const onboarded = localStorage.getItem(`hive_onboarded_${engineName}`);
    if (!onboarded) {
      setIsOnboarded(false);
    }
  }, [engineName]);

  const handleStart = () => {
    localStorage.setItem(`hive_onboarded_${engineName}`, "true");
    setIsOnboarded(true);
  };

  if (!isOnboarded) {
    return React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#000", color: "#fff", padding: "2rem", textAlign: "center" } },
      React.createElement("h1", { style: { fontSize: "2.5rem", marginBottom: "1rem", color: "#D4AF37" } }, `Welcome to ${engineName}`),
      React.createElement("p", { style: { fontSize: "1.25rem", marginBottom: "2rem", color: "#94a3b8", maxWidth: "500px" } }, engineValueProposition),
      React.createElement("button", {
        onClick: handleStart,
        style: { padding: "1rem 2rem", fontSize: "1.1rem", backgroundColor: "#D4AF37", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
      }, "Enter Engine")
    );
  }

  return React.createElement(React.Fragment, null, children);
}

// ------------------------------------------------------------------
// A18: GRAPPLER HOOK (Hallucination Containment via Metadata)
// ------------------------------------------------------------------

/**
 * A wrapper for Next.js API routes that forcibly injects the Grappler Hook
 * into the response headers, ensuring Queen Bee governance is enforced downstream.
 */
export function withGrapplerHook(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const response = await handler(req, ...args);
    
    // If it's a standard Response object, append the header
    if (response instanceof Response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Hive-Governance", "QueenBee.MasterGrappler");
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    return response;
  };
}
