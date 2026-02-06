export const EventCard = () => (
  <div className="bg-white rounded-xl overflow-hidden mb-5 shadow-sm">
    {/* Event Image */}
    <div className="w-full h-[280px] bg-gradient-to-br from-red-600 to-orange-600 relative flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-xs font-semibold mb-4 opacity-90">
          GLOBAL VIRTUAL<br/>HANGOUT
        </div>
        <div className="text-4xl font-bold leading-tight mb-6 uppercase">
          PEACE IN THE<br/>PRESSURE
        </div>
        <div className="text-[11px] font-medium mb-2">
          Sun, 6th July | 6pm WAT
        </div>
        <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-[11px] font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10l-4 4 6 6 4-16-18 7 4 2 2 6 3-4z"/>
          </svg>
          Virtual Hangout
        </div>
      </div>
    </div>

    {/* Event Details */}
    <div className="p-4">
      <div className="text-[13px] font-semibold text-black mb-2">
        🎉 GLOBAL VIRTUAL HANGOUT
      </div>
      <div className="text-sm font-semibold text-black mb-1">
        Topic: Peace in the Pressure
      </div>
      <div className="text-[13px] font-normal text-gray-600 mb-0.5">
        📅 Sunday, 6th July
      </div>
      <div className="text-[13px] font-normal text-gray-600 mb-0.5">
        🕐 6PM WAT
      </div>
      <div className="text-[13px] font-normal text-gray-600 mb-3">
        ✈️ Virtual Hangout
      </div>
      
      <p className="text-[13px] font-normal text-gray-800 leading-relaxed mb-3">
        Hey fam! In a world full of noise, stress, and constant demands, how do you stay grounded?
      </p>
      
      <p className="text-[13px] font-normal text-gray-800 leading-relaxed mb-3">
        Join us this Sunday for a powerful conversation on finding peace in the pressure. You don't want to miss this!
      </p>
      
      <p className="text-[13px] font-normal text-gray-800 leading-relaxed">
        Hosted by Uche of BTH, it's going to be real, refreshing, and full of faith
      </p>
    </div>
  </div>
);