import { ChangeEvent, useCallback, useState } from "react";

const EMAIL_REGEX =
  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

export default function useCheckEmail() {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  const handleEmailChange = useCallback((e: ChangeEvent) => {
    const { value } = e.target as HTMLInputElement;
    setEmail(value);
    setIsValidEmail(EMAIL_REGEX.test(value));
  }, []);

  const handleCleanUpEmail = useCallback(() => {
    setEmail("");
    setIsValidEmail(false);
  }, []);

  return {
    email,
    isValidEmail,
    handleEmailChange,
    handleCleanUpEmail,
  };
}
