import { useEffect } from "react";
import { useState } from "react";

const LoadingScreen = ({ onComplete }) => {
  const[text, setText] = useState("")
  const fullText = "< RealiTech />";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, index));
      index++;

      if (index > fullText.length) {
        clearInterval(interval);

        setTimeout(() => {
          onComplete();
        }, 700);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete] )

  return (
    <div className="fixed inset-0 z-50 bg-black text-gray-100 flex flex-col items-center justify-center">
      <div className="mb-4 text-4xl font-mono font-bold text-blue-400">
        {text} <span className="animate-pulse text-blue-500"> | </span>
      </div>

      <div className="w-[200px] h-[3px] bg-gray-900 rounded relative overflow-hidden border border-gray-700">
        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[loading-fill_3s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;