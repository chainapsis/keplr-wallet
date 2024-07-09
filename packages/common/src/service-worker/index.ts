export const isServiceWorker = (): boolean => {
  return (
    typeof self !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof ServiceWorkerGlobalScope !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    self instanceof ServiceWorkerGlobalScope
  );
};
