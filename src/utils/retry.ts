export async function retry<T>(
  fn: () => Promise<T>,
  retries = 15,
  delay = 500
): Promise<T> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err: any) {
      if (err.response?.status === 500) {
        attempt++;
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw err; // don't retry non-500s
      }
    }
  }

  throw new Error(`Failed after ${retries} retries`);
}
