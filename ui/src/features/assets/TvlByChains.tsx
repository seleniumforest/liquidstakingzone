import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './chartCard.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
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

    let chartOpts = { ...baseChartOptions } as any;

    let zoneData = isLoading ? [] : data?.filter(x => selectedZones.includes(x.zone));
    let timeData = zoneData?.map(x => ({
        zone: x.zone,
        data: cutDataByTime(timePeriod, x.data, (el: TVLDataRecord) => el.date)
    })) || [];
    let sortedByTvl = timeData.sort((a, b) => a.data.at(-1)?.tvl > b.data.at(-1)?.tvl ? 1 : -1);

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headersData.tvlByChains.headerText}</h3>
                <Tooltip id="my-tooltip"
                    noArrow
                    style={{
                        backgroundColor: "white",
                        color: "black",
                        border: "3px solid black",
                        borderRadius: "6px",
                        fontFamily: 'Space Grotesk',
                        fontSize: "14px",
                        lineHeight: "18px",
                        textAlign: "center",
                        padding: "10px",
                        maxWidth: "200px",
                        zIndex: 10
                    }} />
                <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={headersData.tvlByChains.tooltipText}
                    className={styles.tooltipQuestionMark}
                    data-tooltip-place="bottom"
                >
                    ?
                </a>
            </div>
            <div className={styles.chartCardOptions}>
                <div>
                    <MultipleZonesSelector selectedZones={selectedZones} setSelectedZones={setSelectedZones} />
                </div>
                <div className={styles.timeSelectorsContainer}>
                    <TimePeriodSelector setTimePeriod={setTimePeriod} selectedValue={timePeriod} />
                </div>
            </div>
            <div className={styles.chartCardCumulativeSwitch}>
            </div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}
                        tickmarkPlacement={"between"}
                        minTickInterval={30 * 24 * 3600 * 1000}
                        tickAmount={5}>
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
                        formatter={
                            function (this: TooltipFormatterContextObject) {
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
                            }}
                        backgroundColor={"rgba(255,255,255, 1)"}
                        borderColor={"#000000"}
                        borderWidth={1}
                        borderRadius={15}
                        shadow={false}
                        style={{
                            fontSize: "14px",
                            fontFamily: "Space Grotesk"
                        }}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}