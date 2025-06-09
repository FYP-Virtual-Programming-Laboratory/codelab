import { ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionStatus, Session } from "@/lib/types";

interface JoinSessionButtonProps {
  session: Session;
  handleJoinSession: (session: Session) => void;
}

export const JoinSessionButton = ({ session, handleJoinSession }: JoinSessionButtonProps) => {
  const buttonClassName = `w-full text-white ${
    session.isCompleted
      ? "bg-green-600 hover:bg-green-700"
      : session.status === "ONGOING"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-teal-800 hover:bg-teal-700"
  }`;

  return (
    <Button onClick={() => handleJoinSession(session)} className={buttonClassName}>
      {session.isCompleted ? (
        <>
          <Eye className="mr-2 h-4 w-4" />
          View Results
        </>
      ) : session.isCollaborative ? (
        <>
          Select Group
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      ) : session.status === "ONGOING" ? (
        <>
          Join Ongoing Session
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      ) : (
        <>
          Join Session
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
