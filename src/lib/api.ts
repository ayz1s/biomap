export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request to ${url} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
