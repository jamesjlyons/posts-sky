"use client";

import React from "react";
import Image from "next/image";

interface MainLayoutProps {
  mainContent: React.ReactNode;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function MainLayout({
  mainContent,
  isAuthenticated = false,
  onLogout,
}: MainLayoutProps) {
  return (
    <div className="grid grid-cols-[minmax(60px,_300px)_604px_300px] w-full max-w-[calc(300px+604px+300px)] mx-auto min-h-screen">
      <div className="pl-4 pr-3 py-4 flex flex-col items-end gap-4">
        <div className="bg-posts-yellow-wash rounded-4xl place-items-center p-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.22 9.204c-.531-.815-.886-1.69-.886-2.577 0-1.794 1.373-3.167 3.167-3.167.703 0 1.324.288 1.82.747l.68.627.678-.627c.497-.46 1.118-.747 1.822-.747 1.793 0 3.166 1.373 3.166 3.167 0 .887-.355 1.763-.885 2.575l-.001.002c-.529.812-1.235 1.564-1.939 2.204a19.99 19.99 0 01-2.81 2.123l-.015.01a.041.041 0 01-.033 0l-.016-.01a19.996 19.996 0 01-2.81-2.12c-.703-.644-1.409-1.396-1.938-2.207z"
              fill="color(display-p3 1 0.72 0.12 / 1)"
            ></path>
          </svg>
        </div>
      </div>
      <div className="feed border-x border-border-primary">{mainContent}</div>
      <div className="p-6">
        <p>PostsSky</p>
        <p className="text-text-tertiary text-xs">
          An ode to the community app by Read.cv
        </p>
        {isAuthenticated && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 mt-4 text-xs text-text-primary bg-button-secondary rounded-lg h-8 cursor-pointer"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
