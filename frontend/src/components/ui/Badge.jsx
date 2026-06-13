export function Badge({ type }) {
  const map = { entrada: 'badge--green', salida: 'badge--red' }
  return <span className={`badge ${map[type] || ''}`}>{type}</span>
}
