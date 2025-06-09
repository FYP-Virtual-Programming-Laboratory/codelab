import { Calendar, Clock, Code, Users, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SessionStatus, SESSION_STATUS, Session } from "@/lib/types";

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
};

const CompletedSessionDetails = ({ session, getScoreColor }: { session: Session; getScoreColor: (score: number) => string }) => (
  <div className="flex justify-between items-center text-sm mb-2">
    <span className="text-gray-500">Duration: {session.duration}</span>
    <div className="flex items-center">
      <span className="text-gray-500 mr-2">Score:</span>
      <span className={`font-bold ${getScoreColor(session.score!)}`}>{session.score}/100</span>
    </div>
  </div>
);

const OngoingSessionDetails = ({ session }: { session: Session }) => (
  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
    <span>Duration: {session.duration}</span>
    <span>
      {session.participants}/{session.maxParticipants} participants
    </span>
  </div>
);

const SessionStatusIndicator = ({ session }: { session: Session }) => {
  if (session.status === SESSION_STATUS.COMPLETED) {
    return (
      <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        <CheckCircle className="h-3 w-3 mr-1" />
        <span>Session completed - Results available</span>
      </div>
    );
  } else if (session.isCollaborative) {
    return (
      <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
        <Users className="h-3 w-3 mr-1" />
        <span>Team collaboration enabled</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
        <Users className="h-3 w-3 mr-1" />
        <span>Individual session</span>
      </div>
    );
  }
};


interface SessionCardContentProps {
  session: Session;
}

export const SessionCardContent = ({ session }: SessionCardContentProps) => {
  return (
    <>
      <p className="text-gray-600 text-sm mb-4">{session.description}</p>

      <div className="flex items-center mb-4">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className={`${session.instructorColor} text-white text-xs`}>
            {session.instructorAvatar}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{session.instructor}</p>
          <p className="text-xs text-gray-500">Instructor</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {session.languages.map((lang) => (
          <Badge key={lang} variant="outline" className="bg-gray-50">
            <Code className="h-3 w-3 mr-1" /> {lang}
          </Badge>
        ))}
      </div>

      {session.isCompleted ? (
        <CompletedSessionDetails session={session} getScoreColor={getScoreColor} />
      ) : (
        <OngoingSessionDetails session={session} />
      )}

      <SessionStatusIndicator session={session} />
    </>
  );
};
