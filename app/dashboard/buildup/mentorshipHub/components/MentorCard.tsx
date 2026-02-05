   type MentorCardProps = {
    mentor: {
      name: string;
      role: string;
      id: number;
      avatar: string;
      sessions: number;
      reviews: number;
    };
    onClick: (mentorId: number) => void;
  };
   
   const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => (
      <div 
        onClick={() => onClick(mentor.id)}
        className="bg-white rounded-[12px] overflow-hidden cursor-pointer"
      >
        <div className="px-4 py-5 text-center">
          <div className="relative inline-block mb-2">
            <img 
              src={mentor.avatar} 
              alt={mentor.name}
              className="w-[100px] h-[100px] rounded-full object-cover mx-auto"
            />
          </div>
          <h3 className="font-bold text-base mb-1 ">{mentor.name}</h3>
          <p className="text-[12px] mb-2">{mentor.role}</p>
          <p className="text-[12px] text-[#60666B]">
            {mentor.sessions}sessions . {mentor.reviews}reviews
          </p>
        </div>
      </div>
    );

    export default MentorCard;