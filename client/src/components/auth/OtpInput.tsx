import { useEffect, useRef, useState } from 'react';

type OtpInputProps = {
  value?: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
};

const OTP_LENGTH = 6;

export default function OtpInput({ value = '', onChange, hasError = false, autoFocus = false }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? ''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setDigits(Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? ''));
  }, [value]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const emit = (nextDigits: string[]) => {
    setDigits(nextDigits);
    onChange(nextDigits.join(''));
  };

  const updateDigit = (index: number, rawValue: string) => {
    const cleanValue = rawValue.replace(/\D/g, '');
    const nextDigits = [...digits];

    if (cleanValue.length > 1) {
      cleanValue.slice(0, OTP_LENGTH).split('').forEach((digit, pasteIndex) => {
        nextDigits[index + pasteIndex] = digit;
      });
      emit(nextDigits);
      refs.current[Math.min(index + cleanValue.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    nextDigits[index] = cleanValue;
    emit(nextDigits);
    if (cleanValue && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2 md:gap-3">
      {digits.map((digit, index) => (
        <input
          aria-label={`OTP digit ${index + 1}`}
          className={`otp-box ${hasError ? 'otp-box-error' : ''}`}
          inputMode="numeric"
          key={index}
          maxLength={1}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
