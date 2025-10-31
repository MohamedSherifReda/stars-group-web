export const getDeviceType = () => {
  const width = window.innerWidth;

  return width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
};
