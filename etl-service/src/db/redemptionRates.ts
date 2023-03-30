import { client, insertData } from "./";

export const getRedemptionRates = async () : Promise<RedemptionRate[]> => {
    let response = await client.query({
        query: `
            SELECT *
            FROM Stride.redemptionRates
        `,
        clickhouse_settings: {
            wait_end_of_query: 1,
        },
    });
    let data = ((await response.json()) as any).data;

    return data.map((rate: RedemptionRate) => rate);
}

export const setRedemptionRate = async (rate: RedemptionRate) => {
    return await insertData("redemptionRates", rate);
}
export const deleteRedemptionRate = async (epoch: number, zone: string) => {
    await client.exec({
        query: `
            ALTER TABLE Stride.redemptionRates 
            DELETE WHERE epochNumber = ${epoch} AND zone = '${zone}'`,
        clickhouse_settings: {
            wait_end_of_query: 1,
        }
    });
}

export interface RedemptionRate {
    epochNumber: number,
    dateStart: number,
    dateEnd: number,
    redemptionRate: number,
    zone: string
}