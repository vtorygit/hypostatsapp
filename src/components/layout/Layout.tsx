import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo" aria-label="Research Toolbox — главная">
          <span className="app-mark">RT</span>
          <span>Инструменты исследователя</span>
        </Link>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
