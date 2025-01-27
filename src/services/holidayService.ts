import {
    FetchedPublicHoliday,
    HolidayOverviewResponse,
    HolidayResponse,
    HolidaysCreateRequest
} from "@/constants/types/holidayTypes";
import axiosInstance from "./httpService";

const baseURL = '/holidays';

async function getHolidaysOverview(): Promise<HolidayOverviewResponse[]> {
    const response = await axiosInstance.get(baseURL)
    return response.data;
}

async function getHolidays(year: number, countryCode: string): Promise<HolidayResponse[]> {
    const response = await axiosInstance.get(`${baseURL}/${countryCode}/${year}`)
    return response.data;
}

async function fetchHolidays(year: number, countryCode: string): Promise<FetchedPublicHoliday[]> {
    const response = await axiosInstance.get(`${baseURL}/fetch`, {
        params: {year, countryCode}
    })
    return response.data;
}

async function createHolidays(payload: HolidaysCreateRequest[]): Promise<HolidayResponse> {
    const response = await axiosInstance.post(`${baseURL}/batch`, payload);
    return response.data;
}

export {getHolidaysOverview, fetchHolidays, createHolidays, getHolidays}