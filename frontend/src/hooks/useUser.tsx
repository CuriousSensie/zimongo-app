import { IExtendedSession } from "@/types/session";
import { useSession } from "next-auth/react";

const useUser = () => {
  const session = useSession() as unknown as IExtendedSession;
  return session.data?.user;
};

export default useUser;
