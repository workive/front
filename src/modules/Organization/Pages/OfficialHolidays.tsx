import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card} from "@/components/ui/card";
import {HolidayResponse} from "@/constants/types/holidayTypes";
import {getHolidays, getHolidaysOverview} from "@/services/holidayService";
import {toast} from "@/components/ui/use-toast";
import {UserContext} from "@/contexts/UserContext";
import {getErrorMessage} from "~/utils/errorHandler.ts";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {countries} from "@/constants/countries";
import {PageHeader} from "@/core/components";

export default function OfficialHolidays() {
    const { user } = useContext(UserContext);
    const [holidays, setHolidays] = useState<HolidayResponse[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedCountry, setSelectedCountry] = useState<string>(countries.find(c => c.code === user?.country)?.code || "");
    const [yearOptions, setYearOptions] = useState<{ label: string; value: string }[]>([]);
    const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
    const navigate = useNavigate();

    // Fetch holidays overview for dropdowns
    useEffect(() => {
        const fetchHolidaysOverview = async () => {
            try {
                const overview = await getHolidaysOverview();

                // Populate Year and Country dropdown options
                const yearDropdownOptions = [...new Set(overview.map(o => o.year))].map(year => ({
                    label: year.toString(),
                    value: year.toString(),
                }));

                const countryDropdownOptions = [...new Set(overview.map(o => o.countryCode))]
                    .map(code => {
                        const country = countries.find(c => c.code === code);
                        return {label: country?.name, value: code};
                    })

                setYearOptions(yearDropdownOptions);
                setCountryOptions(countryDropdownOptions);
            } catch (error) {
                const errorMessage = getErrorMessage(error as Error);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        };

        fetchHolidaysOverview();
    }, []);

    // Fetch holidays whenever selectedYear or selectedCountry changes
    useEffect(() => {
        const fetchHolidays = async () => {
            if (!selectedYear || !selectedCountry) return;

            try {
                setHolidays([]);
                const fetchedHolidays = await getHolidays(selectedYear, selectedCountry);
                setHolidays(fetchedHolidays);
            } catch (error) {
                const errorMessage = getErrorMessage(error as Error);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        };

        fetchHolidays();
    }, [selectedYear, selectedCountry]);

    return (
        <>
            <PageHeader backButton='/settings' title='Official Holidays'>
                <Button className="px-2 h-9"
                        onClick={() => navigate('/settings/official-holidays/import')}>Import</Button>
            </PageHeader>

            <main className="flex flex-1 flex-col gap-4 p-4">
                <Card className="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <SelectField
                            label="Year"
                            value={String(selectedYear)}
                            options={yearOptions}
                            onChange={(value) => setSelectedYear(Number(value))}
                        />
                        <SelectField
                            label="Country"
                            value={selectedCountry}
                            options={countryOptions}
                            onChange={(value) => setSelectedCountry(value)}
                        />
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Holiday Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holidays.map((holiday) => (
                                <TableRow key={holiday.date}>
                                    <TableCell className="font-medium">{holiday.date}</TableCell>
                                    <TableCell>{holiday.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        {holidays.length === 0 && (
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">
                                        No holidays found. Click the "Import" button above to fetch official holidays.
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
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

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
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