import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {LeaveResponse} from '@/constants/types/leaveTypes.ts';
import {LeaveStatus} from '@/constants/types/enums';
import {Button} from '@/components/ui/button';
import {formatDurationRange} from '@/utils/dateUtils';
import {Avatar} from '@/core/components';

type LeaveModalProps = {
    selectedRequest: LeaveResponse | null;
    teamRequests: LeaveResponse[];
    toggleModal: () => void;
    handleRequest: (status: LeaveStatus, id: number) => void;
    isProcessing: boolean;
};

export default function LeaveModal({selectedRequest, teamRequests, toggleModal, handleRequest, isProcessing,}: LeaveModalProps) {
    const [dayOverlap, setDayOverlap] = useState<LeaveResponse[]>([]);
    const navigate = useNavigate();
    const {id, startAt, endAt, user, activatedType, reason, duration} = selectedRequest;
    const durationText = formatDurationRange(duration, startAt, endAt);

    //Navigate to the balance page for the specific user.
    const viewBalance = (id: number) => {
        navigate(`/employee/${id}/balance`);
    };

     //Identify overlapping leave requests in the same team.
    // useEffect(() => {
    //     const startLeave: Dayjs = dayjs(startAt);
    //     const endLeave: Dayjs = dayjs(endAt);
    //     const overlap: LeaveResponse[] = teamRequests.filter((r) =>
    //         r.id !== id &&
    //         dayjs(r.startAt).isBefore(endLeave, 'day') &&
    //         dayjs(r.endAt).isAfter(startLeave, 'day')
    //     );
    //     setDayOverlap(overlap);
    // }, [id, teamRequests, startAt, endAt]);

    return (
        <Dialog open={true} onOpenChange={toggleModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave Request Details</DialogTitle>
                    <DialogDescription className="py-1">
                        <UserInfo user={user} onClick={() => viewBalance(user.id)} />
                        <LeaveDetails
                            durationText={durationText}
                            duration={duration}
                            type={activatedType.name}
                            reason={reason}
                        />
                    </DialogDescription>
                </DialogHeader>

                {/*{dayOverlap.length > 0 && <OverlappingRequests overlap={dayOverlap} />}*/}

                <FooterButtons
                    handleRequest={handleRequest}
                    id={id}
                    isProcessing={isProcessing}
                />
            </DialogContent>
        </Dialog>
    );
}

type UserInfoProps = {
    user: LeaveResponse['user'];
    onClick: () => void;
};

function UserInfo({ user, onClick }: UserInfoProps) {
    return (
        <div className="flex items-center mb-4">
            <Avatar avatar={user.avatar} avatarSize={8} />
            <button
                onClick={onClick}
                className="cursor-pointer text-sm ml-2 font-medium text-blue-600 hover:text-blue-800"
            >
                {user.firstName} {user.lastName}
            </button>
        </div>
    );
}

type LeaveDetailsProps = {
    durationText: string;
    duration: number;
    type: string;
    reason?: string;
};

function LeaveDetails({ durationText, duration, type, reason }: LeaveDetailsProps) {
    return (
        <div className="grid grid-cols-4 gap-4 mb-4 text-black text-xs">
            <div className="col-span-2">
                <h5 className="text-[10px] text-gray-600 mb-1">Date</h5>
                <span>{durationText}</span>
            </div>
            <div>
                <h5 className="text-[10px] text-gray-600 mb-1">Duration</h5>
                <span>{duration} {duration === 1 ? "Day" : "Days"}</span>
            </div>
            <div>
                <h5 className="text-[10px] text-gray-600 mb-1">Type</h5>
                <span>{type}</span>
            </div>
            {reason && (
                <div className="col-span-4">
                    <h5 className="text-[10px] text-gray-600 mb-1">Description</h5>
                    <span>{reason}</span>
                </div>
            )}
        </div>
    );
}

// type OverlappingRequestsProps = {
//     overlap: LeaveResponse[];
// };
//
// function OverlappingRequests({ overlap }: OverlappingRequestsProps) {
//     return (
//         <div className="rounded-lg mb-4">
//             <div className="text-red-500 text-xs mb-1 flex items-center">
//                 <CircleAlert className="w-4 h-4 mr-1" />
//                 {overlap.length} Other teammates also on leave
//             </div>
//             {overlap.map((r) => (<RequestItem response={r} key={r.id} />))}
//         </div>
//     );
// }

type RequestItemProps = {
    response: LeaveResponse;
};

function RequestItem({ response }: RequestItemProps) {
    const durationText = formatDurationRange(response.duration, response.startAt, response.endAt);

    return (
        <div className="mb-2">
            <h2 className="font-medium">{response.user.firstName} {response.user.lastName}</h2>
            <p>{durationText}</p>
        </div>
    );
}

type FooterButtonsProps = {
    handleRequest: (status: LeaveStatus, id: number) => void;
    id: number;
    isProcessing: boolean;
};

function FooterButtons({ handleRequest, id, isProcessing }: FooterButtonsProps) {
    return (
        <DialogFooter className="flex justify-center">
            <Button
                onClick={() => handleRequest(LeaveStatus.REJECTED, id)}
                variant="outline"
                disabled={isProcessing}
            >
                {isProcessing ? "Waiting ..." : "Reject"}
            </Button>
            <Button
                onClick={() => handleRequest(LeaveStatus.ACCEPTED, id)}
                className="ml-4 bg-[#088636]"
                disabled={isProcessing}
            >
                {isProcessing ? "Waiting ..." : "Accept"}
            </Button>
        </DialogFooter>
    );
}