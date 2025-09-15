import { IExtendedSession } from "@/types/session";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useUser = () => {
  const { data, status } = useSession() as unknown as IExtendedSession;
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Mark as initialized once we get a definitive status (not loading)
    if (status !== "loading") {
      setIsInitialized(true);
    }
  }, [status]);

  return {
    me: data?.user?.me || null,
    isLoading: status === "loading" || !isInitialized,
    isAuthenticated: status === "authenticated",
    isAdmin: data?.user?.me?.isAdmin || false,
  };
};

export default useUser;
