import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import appStyles from './../../App.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { backendUrl, baseChartOptions, Zone } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, LineSeries
} from "react-jsx-highstock"

import { headersData } from './constants';
import { capitalize, cutDataByTime } from '../../app/helpers';
import { useQuery } from 'react-query';
import moment from 'moment';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { LoadingError } from '../../reusable/error/error';
import { getChartColor } from '../../app/helpers';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

export function RedemptionRate() {
    let [zone, setZone] = useState<Zone>("cosmos");
    let [timePeriod, setTimePeriod] = useState<number>(90);
    
    const { isLoading, error, data } = useQuery(['redemptionRates', zone], () =>
        fetch(`${backendUrl}/redemptionRates?zone=${zone}`)
            .then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions };
    let chartData = isLoading ? [] : [ ...data ];
    let cuttedData = cutDataByTime(timePeriod, chartData, (el: any) => el.date);

    let rateSeries = cuttedData?.map((x: any) => ([x.date, x.rate])) || [];
    let priceSeries = cuttedData?.map((x: any) => ([x.date, x.price])) || [];

    return (
        <div className={appStyles.chartCard}>
            <div className={appStyles.chartCardHeader}>
                <h3>{headersData.redemptionRate.headerText}</h3>
                <AppTooltip text={headersData.redemptionRate.tooltipText} />
            </div>
            <div className={appStyles.chartCardOptions}>
                <div>
                    <ZonesSelector setZone={setZone} />
                </div>
                <div className={appStyles.timeSelectorsContainer}>
                    <TimePeriodSelector setTimePeriod={setTimePeriod} selectedValue={timePeriod} />
                </div>
            </div>
            <div className={appStyles.chartCardCumulativeSwitch}>
            </div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <LineSeries
                            data={rateSeries}
                            color={getChartColor(zone)}
                        />
                        <LineSeries
                            data={priceSeries}
                            color={"black"}
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={tooltipFormatter(zone)}
                        {...chartOpts.tooltip}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}

const tooltipFormatter = (zone: Zone) => {
    return function (this: TooltipFormatterContextObject) {
        let that = this as any;

        let rate = that.points[0].y.toFixed(4);
        let price = that.points[1].y.toFixed(4);

        return `
            <span style="text-align: center;">${moment(this.x).format("DD MMMM YYYY")}</span>
            <br>
            <span>Redemption rate: ${rate}</span>
            <br>
            <span>${capitalize(zone)}/st${capitalize(zone)} market price: ${price}</span>
        `;
    };
} 