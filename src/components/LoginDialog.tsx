"use client";

import * as React from "react";
import { Dialog } from "@base-ui-components/react/dialog";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: {
    identifier: string;
    password: string;
  }) => Promise<void>;
}

export function LoginDialog({ isOpen, onClose, onLogin }: LoginDialogProps) {
  const [loginForm, setLoginForm] = React.useState({
    identifier: "",
    password: "",
  });
  const [loginError, setLoginError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await onLogin(loginForm);
    } catch {
      setLoginError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose} dismissible={false}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-backdrop z-20" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg w-[400px] z-30">
          <Dialog.Title className="text-lg font-medium mb-4">
            Login to PostsSky
          </Dialog.Title>
          <Dialog.Description>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-2">
                  Bluesky Handle
                  <input
                    type="text"
                    value={loginForm.identifier}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        identifier: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-input rounded mt-2"
                    placeholder="handle.bsky.social"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs mb-2">
                  App Password
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full p-2 bg-input rounded mt-2"
                  />
                </label>
              </div>
              {loginError && (
                <p className="text-red-500 text-sm">{loginError}</p>
              )}
              <div className="flex justify-end gap-2">
                {/* <Dialog.Close className="px-3 py-1.5 text-xs text-text-primary rounded-lg h-8 cursor-pointer">
                  Cancel
                </Dialog.Close> */}
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-text-primary bg-button-secondary rounded-lg h-8 cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>
          </Dialog.Description>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
