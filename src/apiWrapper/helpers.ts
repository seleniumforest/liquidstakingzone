import { Int53 } from "@cosmjs/math";

export const apiToSmallInt = (input: string | number) => {
    const asInt = Int53.fromString(input.toString());
    return asInt.toNumber();
}

export const tryParseJson = (data: string): any => {
    try {
        return JSON.parse(data);
    } catch (err: any) { }
}