"use client";

import { useEffect, useState } from "react";

export default function Ads() {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  return (
    <section>
      {isRendered && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-1550225145364569"
          data-ad-slot="6016093098"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      )}
    </section>
  );
}
