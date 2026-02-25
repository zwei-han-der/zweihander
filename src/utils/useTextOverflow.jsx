import { useState, useEffect } from "react";

function useTextOverflow(refs, dependencies = []) {
  const [overflowStates, setOverflowStates] = useState(
    refs.reduce((acc, ref) => ({ ...acc, [ref.key]: false }), {})
  );

  useEffect(() => {
    const checkOverflow = () => {
      const newStates = {};

      refs.forEach(({ key, ref }) => {
        if (ref.current) {
          newStates[key] = ref.current.scrollWidth > ref.current.clientWidth;
        }
      });

      setOverflowStates(newStates);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, dependencies);

  return overflowStates;
}

export default useTextOverflow;