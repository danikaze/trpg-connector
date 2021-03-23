export interface WaitUntilOptions {
  pollingTime: number;
  maxTries: number;
}

const defaultOptions: WaitUntilOptions = {
  pollingTime: 1000,
  maxTries: 30,
};

export function waitUntil<T>(
  condition: () => T | undefined,
  options?: Partial<WaitUntilOptions>
): Promise<T> {
  const opt = { ...defaultOptions, options };
  let tries = 1;

  const result = condition();
  if (result !== undefined) return Promise.resolve(result);

  return new Promise<T>((resolve, reject) => {
    const timeHandler = setInterval(() => {
      tries++;
      const result = condition();
      if (result !== undefined) {
        clearInterval(timeHandler);
        resolve(result);
      } else if (tries === opt.maxTries) {
        clearInterval(timeHandler);
        reject();
      }
    }, opt.pollingTime);
  });
}
