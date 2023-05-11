export const joinClasses = (...classes: (string | undefined)[]) => classes.join(" ");

export const formatNum = (num: any) =>  new Intl.NumberFormat().format(num);

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);