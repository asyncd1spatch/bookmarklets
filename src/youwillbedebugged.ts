(() => {
  Object.defineProperty(window, "outerWidth", {
    get: (): number => window.screen.width,
    set: (_value: unknown): void => {},
  });

  Object.defineProperty(window, "innerWidth", {
    get: (): number => window.screen.width,
    set: (_value: unknown): void => {},
  });

  const methodsToMute: string[] = [
    "log",
    "warn",
    "error",
    "debug",
    "info",
    "trace",
    "dir",
    "dirxml",
    "table",
    "count",
    "assert",
    "group",
    "groupCollapsed",
    "groupEnd",
    "time",
    "timeEnd",
    "profile",
    "profileEnd",
    "timeStamp",
    "context",
  ];

  methodsToMute.forEach((method) => {
    (console as unknown as Record<string, unknown>)[method] = (): void => {};
  });

  const highestIntervalId = setInterval(() => {}, 9999) as unknown as number;
  for (let i = 1; i < highestIntervalId; i++) {
    clearInterval(i);
  }

  const highestTimeoutId = setTimeout(() => {}, 9999) as unknown as number;
  for (let i = 1; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
})();
