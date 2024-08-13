import { useNavigate } from 'react-router-dom';
import { Toolbar, Button } from '../../../core/components';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function PendingDayOff() {
  const navigate = useNavigate();

  const viewCalendar = () => {
    navigate('/calendar');
  };

  return (
      <div className="fixed top-16 md:top-0 bottom-0 right-0 h-screen md:w-4/5 w-full overflow-y-auto mb-2">
        <div className="pt-5 py-4 md:mx-auto md:w-full md:max-w-[70%]">
          <Toolbar title="Pending Request" />

          <div className="absolute top-0 bottom-0 right-4 left-4 flex flex-col justify-center items-center text-center">
            <ClockIcon className="h-12 w-12 mb-2 text-indigo-500" aria-hidden="true" />
            <p className="font-semibold mb-4">Your request has been registered.</p>
            <Button onClick={viewCalendar} text="View Calendar" />
          </div>
        </div>
      </div>
  );
}