"use client"

import Link from "next/link";
import { useParams } from "next/navigation";


const QuizCompletion = () => {
  const {id} = useParams()

      return (
        <div className="min-h-screen bg-[#330750] flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            {/* Angel Character */}
            <div className="mb-8 float-animation h-[300px] w-[300px]">
                <img src='/quizLoader.png' className="w-full h-full"/>
            </div>

            {/* Loading Text */}
            <div className="text-white space-y-4 text-center">
             <div className="relative inline-block bg-[#E6EAEE1C] text-white p-4 rounded-[12px] text-sm font-semibold shadow-[0px_4px_30px_0px_#3148BE0A]">
          Aced it! Keep up the good work
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#6C3C85]" />
        </div>
         <div className="bg-[#00000026] rounded-[10px] py-4 px-10">
          <span className="inline-block bg-white text-green-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Score
          </span>
          <h2 className="text-white text-[26px] font-semibold">100%</h2>
        </div>
            </div>

{/* <Link href={`/dashboard/learn/materials/${Number(id) + 1}`}> */}
           <button className="w-full bg-white rounded-full py-5 font-semibold text-base mt-8">
          Proceed to Chapter 2
        </button>
        {/* </Link> */}
          </div>
        </div>
      );
    };


    export default QuizCompletion;