/**
 * ALL-CAPS soft-serif display text where selected letters swap to italic.
 * Pass the word with the italic letters wrapped in underscores: "S_H_IP" -> S, *H*, I, P.
 */
export default function Display({ children, as: Tag = 'span', className = '', ...rest }) {
  const parts = String(children).split('_')
  return (
    <Tag className={`display ${className}`} {...rest}>
      {parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p))}
    </Tag>
  )
}
