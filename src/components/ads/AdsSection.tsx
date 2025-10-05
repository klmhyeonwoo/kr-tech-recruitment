"use client";
import React, { useEffect } from "react";

export default function AdsSection() {
  useEffect(() => {
    const handleEzoicLoad = () => {
      try {
        const ezoic = window.ezstandalone;
        if (ezoic) {
          ezoic.define(109);
          if (!ezoic.enabled) {
            ezoic.enable();
            ezoic.display();
            ezoic.refresh();
          }
        } else {
          // Ezoic script is not loaded yet, try again later
          setTimeout(handleEzoicLoad, 500);
        }
      } catch (ex) {
        console.error("Error with Ezoic:", ex);
      }
    };

    handleEzoicLoad();
  }, []);

  return (
    <section>
      <div id="ezoic-pub-ad-placeholder-109"> </div>
    </section>
  );
}
