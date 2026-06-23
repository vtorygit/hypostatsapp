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
        <Link to="/" className="app-logo" aria-label="Research Toolbox — главная">
          <span className="app-mark">RT</span>
          <span>Research Toolbox</span>
        </Link>

        <div className="header-meta">
          <TokenBadge compact />
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
