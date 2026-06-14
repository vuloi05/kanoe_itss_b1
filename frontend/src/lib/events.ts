export const TOKEN_BALANCE_EVENT = "token-balance-updated";

export function dispatchTokenBalanceUpdate(newBalance: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(TOKEN_BALANCE_EVENT, { detail: newBalance })
    );
  }
}

export function subscribeToTokenBalance(callback: (balance: number) => void) {
  if (typeof window === "undefined") return () => {};
  
  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent<number>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(TOKEN_BALANCE_EVENT, handleEvent);
  return () => {
    window.removeEventListener(TOKEN_BALANCE_EVENT, handleEvent);
  };
}
