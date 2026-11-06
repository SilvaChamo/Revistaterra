/** Programação da rádio: tipos e funções partilhadas entre o site e o painel (sem acesso à base de dados). */

export type RadioSlot = {
  id: string;
  /** Dias da semana em que passa: 0 = domingo … 6 = sábado. Lista vazia = todos os dias. */
  days: number[];
  /** Início e fim no formato HH:MM (hora de Maputo). */
  start: string;
  end: string;
  show: string;
  description?: string;
  active: boolean;
};

export const DIAS_LONGOS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
/** Ordem de apresentação: a semana começa à segunda-feira. */
export const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Hora actual em Maputo (UTC+2): dia da semana e minutos desde a meia-noite. */
export function maputoNow(date = new Date()) {
  const shifted = new Date(date.getTime() + 2 * 3600 * 1000);
  return { day: shifted.getUTCDay(), minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() };
}

export const playsOn = (s: RadioSlot, day: number) => s.active && (s.days.length === 0 || s.days.includes(day));

/** Programas de um dia, por ordem de hora. */
export function slotsOfDay(slots: RadioSlot[], day: number): RadioSlot[] {
  return slots.filter((s) => playsOn(s, day)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || toMinutes(a.end) - toMinutes(b.end));
}

/** Programa que está no ar neste momento (o que começou mais tarde, se houver sobreposição). */
export function onAirNow(slots: RadioSlot[], date = new Date()): RadioSlot | null {
  const { day, minutes } = maputoNow(date);
  const atual = slotsOfDay(slots, day).filter((s) => minutes >= toMinutes(s.start) && minutes < toMinutes(s.end));
  return atual.length ? atual[atual.length - 1] : null;
}

/** "Todos os dias", "Seg a Sex", "Seg, Qua e Sex"… */
export function diasEmTexto(days: number[]): string {
  if (days.length === 0 || days.length === 7) return 'Todos os dias';
  const ordenados = ORDEM_DIAS.filter((d) => days.includes(d));
  const seguidos = ordenados.every((d, i) => i === 0 || ORDEM_DIAS.indexOf(d) === ORDEM_DIAS.indexOf(ordenados[i - 1]) + 1);
  if (ordenados.length >= 3 && seguidos) return `${DIAS_CURTOS[ordenados[0]]} a ${DIAS_CURTOS[ordenados[ordenados.length - 1]]}`;
  const nomes = ordenados.map((d) => DIAS_CURTOS[d]);
  return nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Valida e limpa a lista recebida do painel. Devolve a lista limpa ou uma mensagem de erro. */
export function validarGrelha(input: unknown): { ok: true; slots: RadioSlot[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: 'Programação inválida.' };
  if (input.length > 200) return { ok: false, error: 'Demasiados programas (máximo 200).' };
  const slots: RadioSlot[] = [];
  for (const raw of input as Record<string, unknown>[]) {
    const show = String(raw?.show ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 80);
    const start = String(raw?.start ?? '');
    const end = String(raw?.end ?? '');
    if (!show) return { ok: false, error: 'Todos os programas precisam de um nome.' };
    if (!HORA.test(start) || !HORA.test(end)) return { ok: false, error: `Horas inválidas em "${show}".` };
    if (toMinutes(end) <= toMinutes(start)) return { ok: false, error: `Em "${show}", a hora de fim tem de ser depois da hora de início.` };
    const days = Array.isArray(raw.days) ? Array.from(new Set((raw.days as unknown[]).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))) : [];
    slots.push({
      id: String(raw.id || '').slice(0, 40) || Math.random().toString(36).slice(2, 10),
      days: days.length === 7 ? [] : days.sort(),
      start,
      end,
      show,
      description: String(raw.description ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 200) || undefined,
      active: raw.active !== false,
    });
  }
  return { ok: true, slots };
}
