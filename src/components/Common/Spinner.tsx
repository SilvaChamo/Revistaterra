/**
 * Indicador de "a processar" único do site: um anel que gira (o arco sólido e, no resto, a mesma cor transparente),
 * com um ponto central que pulsa. Usa a cor do texto (`currentColor`), por isso serve em fundos claros e em botões.
 * Tamanho em px (`size`); o resto vai em `className` (margens, cor...).
 */
/** O raio é 30% menor que o `size` pedido (anel mais discreto em todas as páginas). */
const SCALE = 0.7;

export default function Spinner({ size = 32, className = '', label = 'A processar…' }: { size?: number; className?: string; label?: string }) {
  const px = Math.round(size * SCALE);
  return (
    <span role="status" aria-label={label} className={`ec-spinner ${className.includes('mx-auto') ? 'block' : 'inline-block'} align-middle ${className}`} style={{ width: px, height: px }}>
      <span className="ec-spinner-outer" />
      <span className="ec-spinner-dot" />
    </span>
  );
}
