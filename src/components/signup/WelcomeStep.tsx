'use client';

import { WelcomeStepProps } from "@/types";
import Image from "next/image";

const WelcomeStep = ({ data }: WelcomeStepProps) => {
  console.log(data);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-white text-center relative">
      <div className="relative w-64 h-64 rounded-full bg-yellow-200 flex items-center justify-center mx-auto mb-6">
        {/* Party Avatar Image */}
        <Image
          src="/icons/PartyIcon.svg"
          alt="Party Avatar"
          width={90}
          height={90}
          className="object-contain"
        />

        {/* Decorative stars and dots */}
        {/* Stars */}
        <Image src="/icons/star.svg" alt="star" width={50} height={50} className="absolute top-0 left-1" />
        <Image src="/icons/star.svg" alt="star" width={40} height={40} className="absolute top-2 right-10" />
        <Image src="/icons/star.svg" alt="star" width={30} height={30} className="absolute bottom-3 right-1" />
        <Image src="/icons/star.svg" alt="star" width={25} height={25} className="absolute bottom-2 left-2" />

        {/* Dots */}
        <span className="absolute top-1/2 left-0 w-4 h-4 bg-yellow-400 rounded-full -translate-y-1/2" />
        <span className="absolute top-4 left-1/2 w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2" />
        <span className="absolute top-[70%] right-[20] w-2 h-2 bg-yellow-400 rounded-full -translate-y-1/2" />
        <span className="absolute bottom-0 left-1/2 w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2" />
      </div>

      {/* Welcome Text */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Welcome</h1>

      {/* Continue Button */}
      <button
        onClick={() => window.location.href = '/'}
        className="w-full max-w-xs py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
      >
        Continue
      </button>
    </div>
  );
};

export default WelcomeStep;
