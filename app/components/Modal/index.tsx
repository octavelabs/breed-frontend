// type ModalProps = {
//     title: string;
//     name: string;
//     role: string;
//     onClose: () => void;
// }

// const Modal: React.FC<ModalProps> = ({
//     title,
//     name, role,
// }) => {
//     return(
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in-up">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
//             <div className="p-8">
//               {/* Header */}
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Mentorship</p>
//                   <h2 className="text-2xl font-bold clash-display">
//                     {mentor.name} <span className="text-gray-400">.</span> 
//                     <span className="text-gray-600 text-lg font-normal"> {mentor.role}</span>
//                   </h2>
//                 </div>
//                 <button 
//                   onClick={onClose}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               <div className="h-px bg-gray-200 mb-6"></div>

//               <div className="grid md:grid-cols-2 gap-8">
//                 {/* Left - Details */}
//                 <div className="space-y-6">
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Price</p>
//                     <p className="text-2xl font-bold clash-display">Free</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Session Duration</p>
//                     <p className="text-2xl font-bold clash-display">1 Hour</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">About</p>
//                     <p className="text-lg font-bold clash-display">General Mentorship</p>
//                   </div>
//                 </div>

//                 {/* Right - Calendar */}
//                 <div>
//                   <div className="flex justify-between items-center mb-6">
//                     <div>
//                       <p className="text-sm text-gray-500 mb-1">Step 1 of 3</p>
//                       <h3 className="text-xl font-bold clash-display">Select date</h3>
//                     </div>
//                   </div>

//                   {/* Month Navigation */}
//                   <div className="flex justify-between items-center mb-4">
//                     <h4 className="font-semibold text-lg">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
//                     <div className="flex gap-2">
//                       <button 
//                         onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                       >
//                         <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                         </svg>
//                       </button>
//                       <button 
//                         onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
//                         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                       >
//                         <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>

//                   {/* Calendar Grid */}
//                   <div className="grid grid-cols-7 gap-2 mb-6">
//                     {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
//                       <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
//                         {day}
//                       </div>
//                     ))}
//                     {emptyDays.map((_, i) => (
//                       <div key={`empty-${i}`}></div>
//                     ))}
//                     {days.map(day => (
//                       <button
//                         key={day}
//                         onClick={() => setSelectedDate(day)}
//                         className={`aspect-square rounded-xl flex items-center justify-center font-medium transition-all ${
//                           selectedDate === day
//                             ? 'bg-purple-600 text-white shadow-lg'
//                             : 'hover:bg-gray-100 text-gray-700'
//                         }`}
//                       >
//                         {day}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Proceed Button */}
//                   <button
//                     onClick={() => selectedDate && onSelectDate(selectedDate)}
//                     disabled={!selectedDate}
//                     className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
//                       selectedDate
//                         ? 'bg-gradient-to-r from-purple-600 to-purple-700 btn-hover-lift'
//                         : 'bg-gray-300 cursor-not-allowed'
//                     }`}
//                   >
//                     Proceed
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     };
//     )
// }