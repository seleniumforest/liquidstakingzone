import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { baseChartOptions, Zone } from '../../app/constants';

import { ChartCard } from '../../reusable/chartCard/ChartCard';
import { headersData } from './constants';

export function AssetsExcludingInterest() {
    let [zone, setZone] = useState<Zone>("atom");
    const { isLoading, error, data } = useQuery(['assetsDeposited', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/assetsDeposited?zone=${zone}`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = data?.map((x: any) => ([Number(x.date), Number(x.amount)]));

    return (
        <>
            <ChartCard {...headersData.exclInterest} chartOpts={chartOpts} chartData={isLoading ? [] : chartData} setZone={setZone} zone={zone} />
        </>
    );
}


export function AssetsRedeemed() {
    let [zone, setZone] = useState<Zone>("atom");
    const { isLoading, error, data } = useQuery(['assetsRedeemed', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/assetsRedeemed?zone=${zone}`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = data?.map((x: any) => ([Number(x.date), Number(x.amount)]));

    return (
        <>
            <ChartCard {...headersData.redeemedAssets} chartOpts={chartOpts} chartData={isLoading ? [] : chartData} setZone={setZone} zone={zone} />
        </>
    );
}

export function FeesAndRevenue() {
    const { isLoading, error, data } = useQuery(['protocolRevenue'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/protocolRevenue`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartData = data?.map((x: any) => ({
        date: Number(x.date),
        fee: Number(x.fee),
        restake: Number(x.restake)
    }));

    let chartOpts = { ...baseChartOptions } as any;
    chartOpts.plotOptions = {
        column: {
            stacking: 'normal'
        }
    };

    chartOpts.series = [{
        name: "Fees",
        data: chartData?.map((x: any)=> ([x.date, x.fee])),
    }, {
        name: "Revenue",
        data: chartData?.map((x: any)=> ([x.date, x.restake])),
    }];

    return (
        <>
            <ChartCard {...headersData.feesAndRevenue} chartOpts={chartOpts} />
        </>
    );
}

// export function RedemptionRates() {
//     let [zone, setZone] = useState<Zone>("atom");
//     const { isLoading, error, data } = useQuery(['redemptionRates', zone], () => 
//         fetch(`${process.env.REACT_APP_API_BASEURL}/redemptionRates?zone=${zone}`).then(res => res.json())
//     );

//     //if (isLoading) return <>'Loading...'</>;
//     if (error) return <>'Error...'</>;

//     let chartOpts = { ...baseChartOptions } as any;
//     let chartData = data?.map((x: any) => ([Number(x.date), Number(x.amount)]));
//     chartOpts.
//     return (
//         <>
//             <ChartCard {...headersData.redemptionRate} chartOpts={chartOpts} chartData={isLoading ? [] : chartData} setZone={setZone} zone={zone} />
//         </>
//     );
// }

export const fetchAssets = async (): Promise<Response> => {
    return await fetch(`${process.env.REACT_APP_API_BASEURL}/assetsDeposited?zone=atom`).then(res => res.json());
}