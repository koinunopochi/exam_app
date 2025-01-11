import { useState } from "react";

export const useExamTimer = (
  initialTimeLimit: number | undefined,
  onTimeUp: () => void
) => {
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit);

  const handleTimeUp = () => {
    setTimeLimit(undefined);
    onTimeUp();
  };

  return {
    timeLimit,
    handleTimeUp,
  };
};
