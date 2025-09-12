import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DaySwitcher = ({ currentDay, handlePrevDay, handleNextDay }) => {
  return (
    <div className="flex items-center w-32 justify-between bg-gray-800 px-1 py-1 rounded-lg mt-2 md:mt-0">
      <button onClick={handlePrevDay} className="rounded-full hover:bg-gray-700">
        <ChevronLeft className="w-5 h-5 text-gray-200" />
      </button>
      <span className="text-gray-100 font-medium mx-1 text-center">
        {currentDay}
      </span>
      <button onClick={handleNextDay} className="rounded-full hover:bg-gray-700">
        <ChevronRight className="w-5 h-5 text-gray-200" />
      </button>
    </div>
  );
};

export default DaySwitcher;
