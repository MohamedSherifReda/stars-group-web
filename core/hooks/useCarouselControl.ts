import { useState, useEffect } from 'react';
import type { CarouselApi } from 'ui/common/carousel';

interface CarouselControl {
  currentIndex: number;
  scrollToEvent: (index: number) => void;
  setMainApi: (api: CarouselApi) => void;
  setSecondaryApi?: (api: CarouselApi) => void;
  mainApi: CarouselApi | undefined;
}

export const useCarouselControl = (options?: {
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
}): CarouselControl => {
  const [currentIndex, setCurrentIndex] = useState<number>(
    options?.initialIndex || 0
  );
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [secondaryApi, setSecondaryApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!mainApi && !secondaryApi) {
      return;
    }

    const handleSelect = () => {
      const newIndex =
        mainApi?.selectedScrollSnap() ||
        secondaryApi?.selectedScrollSnap() ||
        0;
      setCurrentIndex(newIndex);
      options?.onIndexChange?.(newIndex);
    };

    // Subscribe to both APIs
    mainApi?.on('select', handleSelect);
    secondaryApi?.on('select', handleSelect);

    // Cleanup
    return () => {
      mainApi?.off('select', handleSelect);
      secondaryApi?.off('select', handleSelect);
    };
  }, [mainApi, secondaryApi, options]);

  const scrollToEvent = (index: number) => {
    mainApi?.scrollTo(index);
    secondaryApi?.scrollTo(index);
    setCurrentIndex(index);
    options?.onIndexChange?.(index);
  };

  return {
    currentIndex,
    mainApi,
    scrollToEvent,
    setMainApi,
    setSecondaryApi,
  };
};
