import { useEffect, useState, useRef } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export default function useScale(width: number, height: number) {
  const windowDimensions = useWindowDimensions();
  const windowWidth = windowDimensions.width;
  const windowHeight = windowDimensions.height;
  const aspectRatio = width / height;

  const aspectWidth = windowHeight * aspectRatio;
  const aspectHeight = windowWidth / aspectRatio;

  return {
    xScale: Math.min(windowWidth, aspectWidth) / width,
    yScale: Math.min(windowHeight, aspectHeight) / height,
  };
}
