import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {countries} from "@/constants/countries";
import {createHolidays, fetchHolidays} from "@/services/holidayService";
import {FetchedPublicHoliday} from "@/constants/types/holidayTypes";
import {toast} from "@/components/ui/use-toast";
import {getErrorMessage} from "~/utils/errorHandler.ts";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {PageHeader} from "@/core/components";

export default function ImportHolidays() {
    const [holidays, setHolidays] = useState<FetchedPublicHoliday[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();

    const fetchHolidaysList = async () => {
        if (!selectedCountry) {
            toast({
                title: "Error",
                description: "Please select a country.",
                variant: "destructive",
            });
            return;
        }

        try {
            const data = await fetchHolidays(selectedYear, selectedCountry);
            setHolidays(data);
            setSelectedHolidays([]);
            setSelectAll(false);
        } catch (error) {
            const errorMessage = getErrorMessage(error as Error);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    const toggleHolidaySelection = (date: string) => {
        setSelectedHolidays(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const toggleSelectAll = () => {
        setSelectAll((prev) => !prev);
        setSelectedHolidays(selectAll ? [] : holidays.map((holiday) => holiday.date));
    };

    const saveSelectedHolidays = async () => {
        const payload = holidays
            .filter((holiday) => selectedHolidays.includes(holiday.date))
            .map((holiday) => ({
                description: holiday.name,
                date: holiday.date,
                country: selectedCountry,
            }));

        try {
            await createHolidays(payload);
            navigate('/settings/official-holidays');
        } catch (error) {
            const errorMessage = getErrorMessage(error as Error);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <PageHeader backButton='/settings/official-holidays' title='Import Holidays'></PageHeader>

            <main className="flex flex-1 flex-col gap-4 p-4">
                <Card className="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <SelectField
                                label="Year"
                                value={String(selectedYear)}
                                options={[
                                    { label: String(new Date().getFullYear() - 1), value: String(new Date().getFullYear() - 1) },
                                    { label: String(new Date().getFullYear()), value: String(new Date().getFullYear()) },
                                    { label: String(new Date().getFullYear() + 1), value: String(new Date().getFullYear() + 1) },
                                ]}
                                onChange={(value) => setSelectedYear(Number(value))}
                            />
                            <SelectField
                                label="Country"
                                value={selectedCountry}
                                options={countries.map((country) => ({label: country.name, value: country.code,}))}
                                onChange={(value) => setSelectedCountry(value)}
                            />
                        </div>

                        <Button className="w-fit" onClick={fetchHolidaysList}>Fetch</Button>
                    </div>

                    {holidays.length > 0 && (
                        <>
                            <HolidayTable
                                holidays={holidays}
                                selectedHolidays={selectedHolidays}
                                toggleHolidaySelection={toggleHolidaySelection}
                                selectAll={selectAll}
                                toggleSelectAll={toggleSelectAll}
                            />

                            <div className="flex justify-end mt-4">
                                <Button onClick={saveSelectedHolidays}>Save</Button>
                            </div>
                        </>
                    )}
                </Card>
            </main>
        </>
    );
}


type SelectFieldProps = {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
};

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-fit">
                <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

type HolidayTableProps = {
    holidays: FetchedPublicHoliday[];
    selectedHolidays: string[];
    toggleHolidaySelection: (date: string) => void;
    selectAll: boolean;
    toggleSelectAll: () => void;
};

export function HolidayTable({holidays, selectedHolidays, toggleHolidaySelection, selectAll, toggleSelectAll,}: HolidayTableProps) {
    return (
        <Table className="mt-4">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-8">
                        <input type="checkbox" checked={selectAll} onChange={toggleSelectAll}/>
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {holidays.map((holiday) => (
                    <TableRow key={holiday.date}>
                        <TableCell className="w-8">
                            <input
                                type="checkbox"
                                checked={selectedHolidays.includes(holiday.date)}
                                onChange={() => toggleHolidaySelection(holiday.date)}
                            />
                        </TableCell>
                        <TableCell>{holiday.date}</TableCell>
                        <TableCell>{holiday.name}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}