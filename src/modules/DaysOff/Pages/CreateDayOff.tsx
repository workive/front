import React, {useContext, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useNavigate} from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {createDayoff} from '~/services/WorkiveApiClient.ts';
import {getErrorMessage} from '~/utils/errorHandler.ts';
import {PageTitle} from '../../../core/components';
import DatePicker from '../Components/DatePicker';
import {dayOffleaveType} from '~/constants/index.ts';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {toast} from "@/components/ui/use-toast";
import {DayOffType} from '~/constants/types.ts';
import {getNextWorkingDay, isDateInHoliday, isDateInWeekend} from "@/utils/dateUtils";
import {getHolidays} from "@/services/WorkiveApiClient";
import {HolidayResponse} from "@/constants/types";
import {UserContext} from "@/contexts/UserContext";

dayjs.extend(isBetween);

const FormSchema = z.object({
    dayOffType: z.nativeEnum(DayOffType, {errorMap: () => ({message: "Please select a valid leave type."})}),
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().optional(),
});

export default function CreateDayOff() {
    const [holidays, setHolidays] = useState<Date[]>([]);
    const {user} = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dayOffType: dayOffleaveType[0].value as DayOffType,
            startDate: new Date(),
            endDate: new Date(),
            reason: '',
        },
    });

    const {handleSubmit, control, watch, setValue, formState: {errors}} = form;
    const startDate = watch('startDate');
    const endDate = watch('endDate');

    // Get holidays
    useEffect(() => {
        getHolidays(new Date().getFullYear(), user?.countryCode)
            .then((data: HolidayResponse[]) => {
                console.log("Success:", data);
                // Convert data to Date[]
                const holidaysDates = data.map(holiday => new Date(holiday.date));
                setHolidays(holidaysDates);
            })
            .catch((error) => {
                console.error("Error:", error);
                const errorMessage = getErrorMessage(error);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                });
            });
    }, [user]);

    const weekendsDays: string[] = ['Saturday', 'Sunday'];

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        const {dayOffType, startDate, endDate, reason} = data;
        const payload = {
            type: dayOffType,
            start: dayjs(startDate).toISOString(),
            end: dayjs(endDate).toISOString(),
            reason: reason,
            createdAt: dayjs().toISOString(),
            distance: calculateDistance(startDate, endDate, holidays),
        };

        createDayoff(payload)
            .then(() => {
                navigate('/dayoff/pending');
            })
            .catch((error: any) => {
                const errorMessage = getErrorMessage(error);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            });
    };

    const calculateDistance = (startDate: Date, endDate: Date, holidaysDate: Date[]): number => {
        const distance = dayjs(endDate).diff(startDate, 'day') + 1;
        const filteredHolidays = holidaysDate.filter((h: Date) =>
            dayjs(h).isBetween(dayjs(startDate), dayjs(endDate), 'days', '[]')
        );
        return distance - filteredHolidays.length;
    };

    useEffect(() => {
        if (isDateInWeekend(startDate, weekendsDays) || isDateInHoliday(startDate, holidays)) {
            setValue("startDate", getNextWorkingDay(startDate, holidays, weekendsDays));
        }
    }, [holidays]);

    useEffect(() => {
        let startDateDayJs = dayjs(startDate);
        let endDateDayJs = dayjs(endDate);
        if (endDateDayJs.isBefore(startDateDayJs)) {
            setValue('endDate', startDateDayJs.toDate());
        }
    }, [startDate]);

    return (
        <>
            <PageTitle title="Send Leave Request"></PageTitle>

            {errorMessage && (
                <Alert>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <main className="flex flex-1 flex-col gap-4 p-4">
                <Card className="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm p-4 gap-4">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField
                                control={control}
                                name="dayOffType"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Leave Type</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a type"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dayOffleaveType.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage>{errors.dayOffType && errors.dayOffType.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <section className="grid grid-cols-2 gap-4">
                                <DatePicker
                                    title="Start"
                                    handleDateSelected={(date: Date) => setValue('startDate', date)}
                                    selectedDate={startDate}
                                    daysBefore={new Date()}
                                    holidays={holidays}
                                    weekendsDays={weekendsDays}
                                />
                                <DatePicker
                                    title="End"
                                    handleDateSelected={(date: Date) => setValue('endDate', date)}
                                    selectedDate={endDate}
                                    daysBefore={startDate}
                                    holidays={holidays}
                                    weekendsDays={weekendsDays}
                                />
                            </section>

                            <p className="p-2 text-center text-sm">
                                Day off request is
                                for {calculateDistance(startDate, endDate, holidays)} {calculateDistance(startDate, endDate, holidays) === 1 ? 'Day' : 'Days'}
                            </p>

                            <FormField
                                control={control}
                                name="reason"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Reason</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-32"/>
                                        </FormControl>
                                        <FormMessage>{errors.reason && errors.reason.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-fit">Submit</Button>
                        </form>
                    </Form>
                </Card>
            </main>
        </>
    );
}