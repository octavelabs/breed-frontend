type MentorCardProps = {
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    avatarUrl?: string | null;
    discipleCount: number;
    mentorProfile?: {
      bio?: string | null;
      specializations?: string[];
    } | null;
  };
  onClick: () => void;
};

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onClick }) => {
  const initials = `${mentor.firstName[0]}${mentor.lastName[0]}`.toUpperCase();
  const specs = mentor.mentorProfile?.specializations ?? [];

  return (
    <div onClick={onClick} className="bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
      <div className="px-4 py-5 text-center">
        <div className="relative inline-block mb-3">
          {mentor.avatarUrl ? (
            <img
              src={mentor.avatarUrl}
              alt={`${mentor.firstName} ${mentor.lastName}`}
              className="w-25 h-25 rounded-full object-cover mx-auto"
            />
          ) : (
            <div className="w-25 h-25 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-2xl mx-auto">
              {initials}
            </div>
          )}
        </div>
        <h3 className="font-bold text-base mb-0.5 leading-tight">{mentor.firstName} {mentor.lastName}</h3>
        {mentor.username && <p className="text-[11px] text-[#60666B] mb-1.5">@{mentor.username}</p>}
        {specs.length > 0 && (
          <p className="text-[11px] text-[#870BD6] font-medium truncate">{specs[0]}</p>
        )}
        <p className="text-[11px] text-[#60666B] mt-1">
          {mentor.discipleCount} disciple{mentor.discipleCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

export default MentorCard;
