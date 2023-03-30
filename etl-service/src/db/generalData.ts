import { insertData } from ".";

export const insertGeneralData = async (data: GeneralData[]) => {
    return await insertData('general_data', data);
}

export interface GeneralData {
    mcap: number,
    vol: number,
    id: string,
    date: number,
} 