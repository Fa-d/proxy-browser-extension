// Using 'any' for navigate function initially, can be typed more strictly if needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let navigateFunction: any = null;

export const setNavigate = (navigate: unknown) => {
  navigateFunction = navigate;
};

export const navigateTo = (path: string, options?: { state?: unknown, replace?: boolean }) => {
  if (navigateFunction) {
    navigateFunction(path, options);
  } else {
    console.error("RouterService: Navigate function not set. Call setNavigate from your main router component.");
  }
};

// Add other navigation functions if needed, e.g.:
// export const goBack = () => { ... };
