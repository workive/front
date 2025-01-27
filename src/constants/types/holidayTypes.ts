export type HolidaysCreateRequest = {
    description: string;
    date: string;
    country: string
}

export  type FetchedPublicHoliday = {
    date: string;
    type: string;
    name: string
}

export type HolidayResponse = {
    id: number;
    description: string;
    date: string;
    country: string
}

export type HolidayOverviewResponse = {
    count: number;
    year: number;
    countryCode: string
}