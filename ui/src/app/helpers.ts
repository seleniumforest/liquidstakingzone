import big from 'big.js';

export const joinClasses = (...classes: (string | undefined)[]) => classes.join(" ");

//todo get rid of this on ui
export const fromBaseUnit = (amount: string | number, zone: string, dp: number  | undefined = undefined) => {
    let demicrofied = big(amount.toString().replace(",", "."))
        .div(Math.pow(10, (zone === "evmos" || zone === "inj") ? 18 : 6))
        .toFixed(dp);
        
    return typeof amount === "string" ? demicrofied.toString() : demicrofied;
}

export const formatNum = (num: any) =>  new Intl.NumberFormat().format(num);

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);