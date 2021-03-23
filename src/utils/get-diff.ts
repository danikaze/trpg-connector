export function getDiff<T extends {}>(
  base: Partial<T>,
  changes: Partial<T>
): Partial<T> {
  const keys = Object.keys(changes) as (keyof T)[];
  return keys.reduce((diff, key) => {
    if (base[key] !== changes[key]) {
      diff[key] = changes[key];
    }
    return diff;
  }, {} as Partial<T>);
}
