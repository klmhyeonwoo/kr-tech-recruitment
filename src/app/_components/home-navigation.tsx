"use client";

import { useEffect, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

const wheelPlugins = [WheelGesturesPlugin()];
const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

type Props<Id extends string> = {
  items: readonly { id: Id; label: string }[];
  active: Id;
  vertical: boolean;
  onSelect: (id: Id) => void;
};

export default function HomeNavigation<Id extends string>({
  items, active, vertical, onSelect,
}: Props<Id>) {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
  const [viewportRef, embla] = useEmblaCarousel({
    active: !vertical,
    align: "start",
    containScroll: "keepSnaps",
    dragFree: !reducedMotion,
    duration: reducedMotion ? 0 : 22,
    watchFocus: false,
  }, wheelPlugins);
  const [edges, setEdges] = useState({ start: false, end: false });
  const activeIndex = items.findIndex((item) => item.id === active);

  useEffect(() => {
    if (!embla || vertical) return;

    function updateEdges() {
      if (!embla) return;
      const progress = embla.scrollProgress();
      const slides = embla.slideNodes();
      const first = slides[0]?.getBoundingClientRect();
      const last = slides[slides.length - 1]?.getBoundingClientRect();
      const overflow = !!first && !!last && last.right - first.left > embla.rootNode().clientWidth - 8;
      const start = overflow && progress > 0.005;
      const end = overflow && progress < 0.995;
      setEdges((current) => current.start === start && current.end === end
        ? current : { start, end });
    }

    function restoreSelection() {
      embla?.scrollTo(activeIndex, true);
      updateEdges();
    }

    embla.scrollTo(activeIndex, reducedMotion);
    updateEdges();
    embla.on("scroll", updateEdges);
    embla.on("reInit", restoreSelection);
    return () => {
      embla.off("scroll", updateEdges);
      embla.off("reInit", restoreSelection);
    };
  }, [embla, vertical, activeIndex, reducedMotion]);

  function reveal(index: number) {
    if (!embla || vertical) return;
    const viewport = embla.rootNode().getBoundingClientRect();
    const tab = embla.slideNodes()[index]?.getBoundingClientRect();
    if (tab && (tab.left < viewport.left + 3 || tab.right > viewport.right - 3)) {
      embla.scrollTo(index, reducedMotion);
    }
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === (vertical ? "ArrowDown" : "ArrowRight")) next = (index + 1) % items.length;
    else if (event.key === (vertical ? "ArrowUp" : "ArrowLeft")) next = (index + items.length - 1) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    document.getElementById(`home-tab-${items[next].id}`)?.focus({ preventScroll: true });
    reveal(next);
  }

  return (
    <div className="home-navigation"
      data-fade-start={!vertical && edges.start}
      data-fade-end={!vertical && edges.end}>
      <div className="home-navigation-viewport" ref={viewportRef} data-lenis-prevent>
        <div className="home-navigation-track" role="tablist" aria-label="홈 탐색"
          aria-orientation={vertical ? "vertical" : "horizontal"}>
          {items.map((item, index) => (
            <button key={item.id} id={`home-tab-${item.id}`}
              type="button" role="tab" aria-selected={active === item.id}
              aria-controls={`home-panel-${item.id}`} tabIndex={active === item.id ? 0 : -1}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) reveal(index);
              }}
              onKeyDown={(event) => moveFocus(event, index)}
              onClick={() => onSelect(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
