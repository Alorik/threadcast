import { useEffect } from "react";

export default function PresenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    fetch("/api/presence", {
      method: "POST",
    });

    const handleOffline = () => {
      navigator.sendBeacon("/api/presence/offline");
    };

    window.addEventListener("beforeunload", handleOffline);
    return () => {
      handleOffline();
      window.removeEventListener("beforeunload", handleOffline);
    };
  }, []);
  return <>{children}</>;
}
