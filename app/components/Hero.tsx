export default function Hero() {
  return (
    <div className="container mx-auto pb-[30px] xl:pb-[112px] pt-[150px] md:pt-[230px]">
      <div className="absolute left-[-30px] top-[-80%] right-0 bg-gradient-to-r from-[#F1DFFF] to-[#F7EDFE] aspect-square rounded-full" />

      <div className="relative max-w-5xl mx-auto">
        <div className="flex flex-col text-[#3C3E40] absolute left-0 xl:-left-10 -top-5 xl:top-12 md:top-20 -rotate-[5deg] text-[8.85px] xl:text-[18px]">
          <span className="px-2 xl:px-3 py-1 bg-[#E7C8FF] rounded-[8px] w-fit">
            Growth
          </span>
          <span className="px-2 xl:px-3 py-1 bg-[#E7C8FF] rounded-[8px] w-fit ml-6 -mt-1">
            & Accountability
          </span>
        </div>
        <div className="flex flex-col text-[#3C3E40] absolute bottom-[140px] xl:bottom-15 -rotate-[5deg] left-0 xl:left-40 text-[8.85px] xl:text-[18px]">
          <span className="pl-3 pr-2 py-1 bg-[#C8DBFF] rounded-[8px] w-fit">
            Scripture
          </span>
          <span className="pl-2 pr-4 py-1 bg-[#C8DBFF] rounded-[8px] w-fit ml-6 xl:ml-10 -mt-1">
            Insight
          </span>
        </div>
        <div className="flex flex-col text-[#3C3E40] absolute top-0 xl:-top-10 right-5 xl:right-20 xl:rotate-[5deg] text-[8.85px] xl:text-[18px]">
          <span className="px-2 xl:px-3 py-1 bg-[#F3C4DD] rounded-[8px] w-fit">
            Stay
          </span>
          <span className="px-2 xl:px-3 py-1 bg-[#F3C4DD] rounded-[8px] w-fit ml-3 xl:ml-6 -mt-1">
            Uplifted
          </span>
        </div>

        <div className="flex flex-col text-[#3C3E40] absolute bottom-[130px] xl:bottom-15 rotate-[10deg] right-0 xl:-right-10 text-[8.85px] xl:text-[18px]">
          <span className="pl-3 pr-2 py-1 bg-[#B4F6D5] rounded-[8px] w-fit">
            Community
          </span>
          <span className="pl-2 pr-4 py-1 bg-[#B4F6D5] rounded-[8px] w-fit ml-6 xl:ml-13 -mt-1">
            Growth
          </span>
        </div>

        <div className="text-center relative z-10 pt-8 md:pt-0">
          <div className="inline-block mb-6">
            <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF]">
              <span className="text-[#161717] text-xs md:text-base font-medium">
                A growing community of Believers
              </span>
            </div>
          </div>

          <h1 className="text-[42px] lg:text-[80px] font-[900] text-[#180426] leading-tight mb-6 font-aeonik relative">
            Grow in FAITH <br /> WALK in Purpose
            <img
              src="./heroImage2.svg"
              alt="bird translating"
              className="bird-animation absolute w-[52px] xl:w-[80px] h-[52px] xl:h-[80px] top-[-20px] left-[30px] xl:left-[190px]"
            />
            <img
              src="./heroImage.svg"
              alt="pathway"
              className="absolute bottom-[-70px] xl:bottom-[20px] right-[40px] xl:right-[120px] w-6 h-6 xl:w-[56px] xl:h-[56px]"
            />
          </h1>

          <p className="text-base lg:text-[24px] text-[#4E5255] mb-10 max-w-2xl mx-auto font-medium">
            A spiritual companion app built to help you stay consistent in your
            walk with God
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-[90%] md:w-auto justify-center group flex items-center gap-3 px-8 py-4 bg-white border-2 border-purple-700 text-purple-700 rounded-full  text-base hover:bg-purple-50 transition-all shadow-sm font-bold">
              Download app
              <div className="flex items-center gap-1">
                <img src="/apple.svg" className="w-5 h-5" />
                <img src="/google-play.svg" className="w-5 h-5 fill-current" />
              </div>
            </button>

            <button className="w-[90%] md:w-auto px-8 py-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full  text-base hover:bg-purple-800 transition-all shadow-lg font-bold">
              Join Us Today
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 md:mt-20 max-w-7xl mx-auto h-[224px] lg:h-auto">
        <div className="grid grid-cols-4 lg:grid-cols-4 gap-0 rounded-3xl overflow-hidden shadow-2xl h-full xl:h-auto">
          <div className="relative lg:aspect-[3/4] bg-gradient-to-b from-[#A967F1] to-[#5B26B1]">
            <div className="absolute inset-0 ">
              <img
                src="./hero1.png"
                alt="Woman praying"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>
          </div>

          <div className="relative lg:aspect-[3/4] bg-blue-600">
            <div className="absolute inset-0">
              <img
                src="./hero2.png"
                alt="Man reading bible"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>
          </div>

          <div className="relative lg:aspect-[3/4] bg-gradient-to-b from-pink-500/70 to-pink-600/70">
            <div className="absolute inset-0">
              <img
                src="./hero4.png"
                alt="Happy family"
                className="w-full h-full object-cover mix-blend-luminosity"
              />
            </div>
          </div>

          <div className="relative lg:aspect-[3/4] bg-[#1A8454]">
            <div className="absolute inset-0 ">
              <img
                src="./hero3.png"
                alt="Hands with plant"
                className="w-full h-full object-cover mix-blend-luminosity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
