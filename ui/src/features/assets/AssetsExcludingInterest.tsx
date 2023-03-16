import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { baseChartOptions } from '../../app/constants';

import { ChartCard } from '../../reusable/chartCard/ChartCard';
import { headersData } from './constants';

export function AssetsExcludingInterest() {
    let [zone, setZone] = useState("atom");
    const { isLoading, error, data } = useQuery(['assetsDeposited', zone], () => 
        fetch(`${process.env.REACT_APP_API_BASEURL}/assetsDeposited?zone=${zone}`).then(res => res.json())
    );

    if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = data?.map((x: any) => ([Number(x.date), Number(x.amount)]));
    chartOpts.xAxis = {
        type: "datetime",
        crosshair: true,
        labels: {
            format: '{value:%m-%Y}'
        }
    };
    chartOpts.series[0].color = "#008BF0";

    return (
        <>
            <ChartCard {...headersData.exclInterest} chartOpts={chartOpts} chartData={chartData} setZone={setZone} />
        </>
    );
}

export const fetchAssets = async (): Promise<Response> => {
    return await fetch(`${process.env.REACT_APP_API_BASEURL}/assetsDeposited?zone=atom`).then(res => res.json());
}