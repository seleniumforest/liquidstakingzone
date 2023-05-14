import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import appStyles from './../../App.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { baseChartOptions, supportedZones, Zone } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, AreaSeries
} from "react-jsx-highstock"
import { headersData } from './constants';
import { capitalize, cutDataByTime } from '../../app/helpers';
import { useQuery } from 'react-query';
import moment from 'moment';
import { MultipleZonesSelector } from '../../reusable/multipleZonesSelector/MultipleZonesSelector';
import { LoadingError } from '../../reusable/error/error';
import { getChartColor } from '../../app/helpers';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

type TVLData = {
    zone: Zone,
    data: TVLDataRecord[]
}

type TVLDataRecord = {
    date: number,
    tvl: number;
}

export function TvlByChains() {
    let [timePeriod, setTimePeriod] = useState<number>(90);
    let [selectedZones, setSelectedZones] = useState<Zone[]>([...supportedZones]);
    const { isLoading, error, data } = useQuery<TVLData[]>(['tvlByChains'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/tvlByChains`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions };

    let zoneData = isLoading ? [] : data?.filter(x => selectedZones.includes(x.zone));
    let timeData = zoneData?.map(x => ({
        zone: x.zone,
        data: cutDataByTime(timePeriod, x.data, (el: TVLDataRecord) => el.date)
    })) || [];
    let sortedByTvl = timeData.sort((a, b) => a.data.at(-1)?.tvl > b.data.at(-1)?.tvl ? 1 : -1);

    return (
        <div className={appStyles.chartCard}>
            <div className={appStyles.chartCardHeader}>
                <h3>{headersData.tvlByChains.headerText}</h3>
                <AppTooltip text={headersData.tvlByChains.tooltipText} />
            </div>
            <div className={appStyles.chartCardOptions}>
                <div>
                    <MultipleZonesSelector selectedZones={selectedZones} setSelectedZones={setSelectedZones} />
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
                        {sortedByTvl.map(dt => (
                            <AreaSeries
                                stacking={"normal"}
                                color={getChartColor(dt.zone)}
                                key={dt.zone}
                                name={dt.zone}
                                data={dt.data.map(x => [x.date, x.tvl])}
                            />
                        ))}
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={tooltipFormatter}
                        {...chartOpts.tooltip}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}

function tooltipFormatter(this: TooltipFormatterContextObject) {
    let result = `<span style="text-align: center;">${moment(this.x).format("DD MMMM YYYY")}</span>`;

    let totalTvl = 0;
    let zoneLabels = this.points?.map(point => {
        let zone = capitalize(point.series.name);
        let tvl = new Intl.NumberFormat().format(Math.ceil(point.y as number));
        totalTvl += Number(point.y);

        let markerColor = getChartColor(point.series.name as Zone);
        return `<br>
        <span style="color: ${markerColor}; border-radius: 50%;">●</span>
        <span>${zone} $${tvl}</span>`;
    })

    if (this.points?.length! > 1)
        result += `<br><br><span>Total: $${new Intl.NumberFormat().format(Math.ceil(totalTvl))}</span>`;

    zoneLabels?.forEach(x => result += x);
    return result;
}