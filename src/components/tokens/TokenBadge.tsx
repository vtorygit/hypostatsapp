import { useEffect, useState } from "react";
import { DAILY_TOKEN_LIMIT, getTokenBalance } from "../../lib/storage";

export function TokenBadge() {
  const [balance, setBalance] = useState(getTokenBalance());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBalance(getTokenBalance());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="token-badge">
      <span>Токены</span>
      <strong>
        {balance}/{DAILY_TOKEN_LIMIT}
      </strong>
    </div>
  );
}