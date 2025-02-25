"use client";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { checkSession, logout } from "~/lib/api";
import { LoginDialog } from "~/components/LoginDialog";
import { login } from "~/lib/api";
import { AuthContext } from "./context";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const init = async () => {
      const result = await checkSession();
      setIsAuthenticated(result.success);
      if (!result.success) {
        setShowLoginDialog(true);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setShowLoginDialog(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          isAuthenticated,
          setIsAuthenticated,
          showLoginDialog,
          setShowLoginDialog,
          handleLogout,
        }}
      >
        <LoginDialog
          isOpen={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLogin={async (credentials) => {
            const result = await login(credentials);
            if (result.success) {
              setIsAuthenticated(true);
              setShowLoginDialog(false);
            } else {
              throw new Error("Login failed");
            }
          }}
        />
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
