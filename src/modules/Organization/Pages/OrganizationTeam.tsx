import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Dialog} from '@headlessui/react'
import {toast} from "react-toastify";
import {getErrorMessage} from "~/utils/errorHandler.ts"
import {ChevronLeftIcon, PencilSquareIcon, TrashIcon, XMarkIcon} from '@heroicons/react/24/outline'
import {PlusIcon} from '@heroicons/react/20/solid';
import {TeamResponse, UserResponse} from "~/constants/types.ts";
import {deleteTeam, getTeam} from "~/services/WorkiveApiClient.ts";

export default function OrganizationTeam() {
    const [teamList, setTeamList] = useState<TeamResponse[]>([])
    const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const navigate = useNavigate()

    const goBack = () => navigate('/organization');

    useEffect(() => {
        getTeam()
            .then((response: TeamResponse[]) => {
                setTeamList(response);
                console.log((response))
            })
            .catch((error) => {
                const errorMessage = getErrorMessage(error);
                toast.error(errorMessage)
            });
    }, []);

    const viewCreateTeam = () => {
        navigate('/organization/team/create')
    }

    const updateTeam = (teamName: string, id: number) => {
        navigate(`/organization/team/update/${teamName}/${id}`)
    }

    const removeTeam = (id: number) => {
        deleteTeam(id)
            .then((data: TeamResponse) => {
                setIsProcessing(false);
                console.log('Success:', data);
                setTeamList(teamList.filter((team: TeamResponse) => team.id !== id));
            })
            .catch(error => {
                setIsProcessing(false);
                console.error('Error:', error);
                const errorMessage = getErrorMessage(error);
                toast.error(errorMessage);
            });
    }

    const handleAccept = async (team: TeamResponse) => {
        setIsProcessing(true);
        try {
            setTeamList((prevExamples) => prevExamples.filter((e) => e.name !== team.name));
            toast.success('Team removed successfully');
        } catch (error) {
            const errorMessage = getErrorMessage(error as string | Error);
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
            setSelectedTeam(null);
        }
    }

    return (
        <div className='md:w-4/5 overflow-y-auto w-full mb-2 fixed top-16 md:top-0 bottom-0 right-0 h-screen'>
            <div className='pt-5 md:mx-auto md:w-full md:max-w-[70%]'>
                <div
                    className='flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 pb-4'>
                    <div className="flex items-center">
                        <button onClick={goBack}>
                            <ChevronLeftIcon className='w-5 h-5 mr-4 text-indigo-600'></ChevronLeftIcon>
                        </button>
                        <h1 className="text-lg md:text-xl font-semibold text-indigo-900 dark:text-indigo-200">Teams</h1>
                    </div>

                    <button onClick={viewCreateTeam}
                            className='flex items-center rounded-md px-2 py-1 shadow-sm bg-indigo-600 text-indigo-100 text-sm font-semibold hover:bg-indigo-600'>
                        <PlusIcon className='h-5 w-5 mr-2 text-indigo-300'></PlusIcon>
                        Add Team
                    </button>
                </div>

                {errorMessage &&
                    <p className="mb-4 text-center text-red-500 bg-red-200 dark:bg-red-900 dark:text-red-300 py-2 text-sm px-4 rounded-md right-0 left-0 mx-auto max-w-lg">{errorMessage}</p>}

                <div className="p-4">
                    <div className="inline-block min-w-full align-middle">
                        <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {teamList.map((t) => (
                                <TeamItem key={t.name} t={t} removeTeam={removeTeam} isProcessing={isProcessing}
                                          updateTeam={updateTeam}/>
                            ))}
                        </ul>
                    </div>
                </div>

                {selectedTeam && <DeleteModal team={selectedTeam} handleReject={() => setSelectedTeam(null)}
                                              handleAccept={handleAccept}/>}
            </div>
        </div>
    )
}

type TeamItemProps = {
    t: TeamResponse;
    isProcessing: boolean;
    removeTeam: (id: number) => void;
    updateTeam: (name: string, id: number) => void;
}

function TeamItem({t, isProcessing, removeTeam, updateTeam}: TeamItemProps) {
    return (
        <li className="col-span-1 border-indigo-100 dark:border-slate-700 rounded-lg bg-indigo-50 dark:bg-slate-800 dark:text-indigo-100 text-indigo-800 shadow-sm">
            <div className="flex flex-col w-full items-center justify-between p-6">
                <h3 className="flex items-center text-sm font-semibold">{t.name}</h3>
                {/*<p className="mt-1 text-sm text-indigo-800 dark:text-indigo-300">{t.length} members</p>*/}
            </div>
            <div>
                <div className="-mt-px flex">
                    <div className="flex w-0 flex-1">
                        <button onClick={() => updateTeam(t.name, t.id)}
                                className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-1 rounded-bl-lg border border-gray-200 dark:border-gray-700 py-4 text-sm font-semibold">
                            <PencilSquareIcon className="h-5 w-5 text-indigo-500" aria-hidden="true"/>
                            {isProcessing ? "Waiting ..." : "Edit"}
                        </button>
                    </div>
                    <div className="-ml-px flex w-0 flex-1">
                        <button onClick={() => removeTeam(t.id)}
                                className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-1 rounded-br-lg border border-gray-200 dark:border-gray-700 py-4 text-sm font-semibold">
                            <TrashIcon className="h-5 w-5 text-red-500" aria-hidden="true"/>
                            {isProcessing ? "Waiting ..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </li>
    )
}

type DeleteModalProps = {
    handleAccept: (team: TeamResponse) => void;
    handleReject: () => void;
    team: TeamResponse;
}

function DeleteModal({handleAccept, handleReject, team}: DeleteModalProps) {
    return (
        <Dialog open={true} onClose={handleReject}>
            <div className='fixed inset-0 overflow-y-auto top-[-22px] bg-[#1111118c] z-40'>
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Dialog.Panel
                        className="w-full max-w-md transform overflow-hidden rounded-2xl border-indigo-100 dark:border-slate-700 bg-indigo-50 dark:bg-slate-800 dark:text-indigo-100 text-indigo-800 p-6 text-left align-middle transition-all">
                        <div className='flex items-center mb-6'>
                            <XMarkIcon onClick={handleReject}
                                       className='w-5 h-5 mr-2 cursor-pointer text-red-600'></XMarkIcon>
                            <h1 className='font-semibold md:text-lg'>Remove Team</h1>
                        </div>

                        <p className="fullname text-sm text-center mb-12">Are you sure you want to remove
                            the {team.name} team?</p>

                        <section className='flex text-center justify-center'>
                            <button onClick={handleReject}
                                    className='rounded-lg p-2 shadow-md border border-red-600 w-1/2'>No
                            </button>
                            <button onClick={() => handleAccept(team)}
                                    className='rounded-lg p-2 shadow-md ml-4 bg-red-600 w-1/2 text-white'>Yes
                            </button>
                        </section>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    )
}