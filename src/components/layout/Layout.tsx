import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { TokenBadge } from "../tokens/TokenBadge";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo">
          Research Toolbox
        </Link>

        <TokenBadge />
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}