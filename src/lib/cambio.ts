const URL = 'https://open.er-api.com/v6/latest/USD';
export const CAMBIO_MOEDAS = ['USD', 'EUR', 'AED', 'AUD', 'JPY'];

export type Cambio = { updated: string | null; rates: Record<string, number> };

/** Câmbio em meticais (MZN): quantos meticais vale uma unidade de cada moeda. Em cache no servidor, renovado de hora a hora. */
export async function loadCambio(): Promise<Cambio | null> {
  try {
    const res = await fetch(URL, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const mzn = data?.rates?.MZN;
    if (data?.result !== 'success' || !mzn) return null;
    // As taxas vêm em dólares.
    const rates: Record<string, number> = {};
    for (const code of CAMBIO_MOEDAS) {
      const r = data.rates[code];
      if (r) rates[code] = mzn / r;
    }
    return { updated: data.time_last_update_utc ?? null, rates };
  } catch {
    return null;
  }
}
