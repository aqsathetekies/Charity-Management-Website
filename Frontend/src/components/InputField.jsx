import { useState } from 'react';
import './InputField.css';

export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon,
  required = false,
  min,
  step,
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || (value && value.toString().length > 0);

  return (
    <div className={`input-field ${isActive ? 'input-field--active' : ''} ${error ? 'input-field--error' : ''}`}>
      <div className="input-field__wrapper">
        {icon && <span className="input-field__icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ' '}
          required={required}
          min={min}
          step={step}
          className="input-field__input"
          id={`field-${label?.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label className="input-field__label" htmlFor={`field-${label?.replace(/\s+/g, '-').toLowerCase()}`}>
          {label} {required && <span className="required">*</span>}
        </label>
      </div>
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}
