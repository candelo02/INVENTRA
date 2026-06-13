export function Spinner({ size = 24 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="spinner"
      aria-label="Cargando"
    />
  )
}
