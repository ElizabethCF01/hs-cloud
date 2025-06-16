export async function retry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const delay = 2 ** attempt * 100;
      console.warn(`⚠️ Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries reached");
}
