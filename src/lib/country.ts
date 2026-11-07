export const countryName = (code: string | null) => {
  if (!code || code === '??') return 'Desconhecido';
  try { return new Intl.DisplayNames(['pt'], { type: 'region' }).of(code) || code; } catch { return code; }
};

export const countryFlag = (code: string | null) =>
  code && /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0))) : '🏳️';
