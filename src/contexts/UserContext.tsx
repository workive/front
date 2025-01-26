import {createContext, ReactNode, useCallback, useEffect, useState} from "react";
import {UserResponse} from "@/constants/types/userTypes";
import {OrganizationResponse} from "@/constants/types/organizationTypes";
import {getUser} from "@/services/userService";
import {getOrganization} from "@/services/organizationService";
import {getErrorMessage} from "~/utils/errorHandler.ts";
import useLocalStorage from "../hooks/useLocalStorage";
import {toast} from "@/components/ui/use-toast";

type UserContextType = {
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  organization: OrganizationResponse | null;
  accessToken: string | null;
  authenticate: (accessToken: string | null) => void;
  signout: () => void;
  isAuthenticated: () => boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  organization: null,
  accessToken: null,
  authenticate: () => { },
  signout: () => { },
  isAuthenticated: () => false
})

type UserContextProviderType = {
  children: ReactNode;
}

export const UserContextProvider = ({ children}: UserContextProviderType) => {
  const [accessToken, setAccessToken] = useLocalStorage<string | null>("ACCESS_TOKEN", null)
  const [user, setUser] = useState<UserResponse | null>(null);
  const [organization, setOrganization] = useState<OrganizationResponse | null>(null);

  const isAuthenticated = (): boolean => {
    return accessToken != null && accessToken !== "";
  };

  const authenticate = (_accessToken: string | null) => {
    setAccessToken(_accessToken);
  };

  const signout = () => {
    setAccessToken(null);
    setUser(null);
    setOrganization(null);
    console.log("userContext signout")
  }

  useEffect(() => {
    if (isAuthenticated()) {
      // Fetch user data
      getUser()
          .then((data: UserResponse) => setUser(data))
          .catch((error) => {
            const errorMessage = getErrorMessage(error);
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          });

      // Fetch organization data
      getOrganization()
          .then((data: OrganizationResponse) => setOrganization(data))
          .catch((error) => {
            const errorMessage = getErrorMessage(error);
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          });
    }
  }, [accessToken]);

  const contextValue = {
    user: user,
    setUser: setUser,
    organization: organization,
    accessToken: accessToken,
    isAuthenticated: useCallback(() => isAuthenticated(), [accessToken]),
    authenticate: useCallback((accessToken: string | null) => authenticate(accessToken), []),
    signout: useCallback(() => signout(), [])
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}