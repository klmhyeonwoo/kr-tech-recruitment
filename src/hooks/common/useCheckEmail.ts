import { ChangeEvent, useCallback, useState } from "react";

export default function useCheckEmail() {
  const EMAIL_REGEX =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);

  const handleEmailChange = useCallback((e: ChangeEvent) => {
    const { value } = e.target as HTMLInputElement;
    setEmail(value);
    setIsValidEmail(value.match(EMAIL_REGEX) !== null);
  }, []);

  const handleCleanUpEmail = () => {
    setEmail("");
    setIsValidEmail(false);
  };

  return {
    email,
    isValidEmail,
    handleEmailChange,
    handleCleanUpEmail,
  };
}
