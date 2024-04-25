import { useEffect, useState } from "react";
import { Text } from "../Text";

export const AnimatedNumbers = (props) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const realValue = props?.value || 0;

  useEffect(() => {
    let start = 0;
    const end = realValue;
    const duration = props?.duration || 1000;
    const stepTime = Math.abs(Math.floor(duration / (end - start)));

    const timer = setInterval(() => {
      setAnimatedValue(prevValue => {
        const newValue = prevValue + 1;
        return newValue <= end ? newValue : end;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [realValue]);

  return (
    <Text bold indicator style={{ transition: '1s ease-in-out' }}>{animatedValue}</Text>
  );
};
