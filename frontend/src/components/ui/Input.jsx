export function Input({ label, error, id, ...props }) {
  return (
    <div className="field">
      {label && <label className="field__label" htmlFor={id}>{label}</label>}
      <input id={id} className={`field__input ${error ? 'field__input--error' : ''}`} {...props} />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
