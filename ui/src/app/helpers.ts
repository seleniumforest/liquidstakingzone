import big from 'big.js';

export const joinClasses = (...classes: (string | undefined)[]) => classes.join(" ");
export const fromBaseUnit = (amount: string | number, zone: string, dp: number  | undefined = undefined) => {
    let demicrofied = big(amount.toString().replace(",", "."))
        .div(Math.pow(10, zone === "evmos" ? 18 : 6))
        .toFixed(dp);
        
    return typeof amount === "string" ? demicrofied.toString() : demicrofied;
}