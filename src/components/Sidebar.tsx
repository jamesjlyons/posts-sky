interface SidebarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function Sidebar({ isAuthenticated, onLogout }: SidebarProps) {
  return (
    <div className="p-6 max-[800px]:hidden">
      <p>PostsSky</p>
      <p className="text-xs text-text-tertiary">An ode to the community app by Read.cv</p>
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
  );
}
