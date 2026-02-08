import { useEffect } from "react";

export default function useClickOutside({
  ref: RefObject,
  callback,
}: {
  ref: React.RefObject<HTMLElement>;
  callback: () => void;
}) {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      RefObject.current &&
      !RefObject.current.contains(event.target as Node)
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
}
