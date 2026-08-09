// src/hooks/use-swipe.ts
// Hook para detectar gestos de swipe horizontal en pantallas táctiles.
// Solo dispara el callback si el desplazamiento horizontal supera el umbral
// y es mayor que el desplazamiento vertical (evita conflicto con scroll).

import { useRef, useCallback, type TouchEvent } from "react";

const SWIPE_THRESHOLD = 50;

export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX.current;
      const deltaY = e.changedTouches[0].clientY - startY.current;

      // Solo activar si el movimiento horizontal es dominante
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;

      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd };
}
