'use client';

import React from 'react';

const useToggle = (defaultValue: boolean = false) => {
  const [currentState, setValue] = React.useState(defaultValue);

  const toggle = () => {
    setValue((prev) => !prev);
  };

  return {
    currentState,
    toggle,
  };
};

export default useToggle;
