import { useState, useEffect } from "react";
import motivationalQuotes from "../motivationalQuotes";

const MotivationalQuote = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Function to pick random quote
    const pickRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    };

    pickRandomQuote(); // initial pick

    const interval = setInterval(() => {
      pickRandomQuote();
    }, 10000); // change every 10,000 ms = 10 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <div className="quote-box p-4 text-center italic text-gray-700 dark:text-gray-300">
      “{quote}”
    </div>
  );
};

export default MotivationalQuote;
