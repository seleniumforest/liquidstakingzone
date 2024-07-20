export const backendUrl = process.env.REACT_APP_API_BASEURL;

export const baseChartOptions = {
    chart: {
        backgroundColor: 'transparent',
        type: 'column',
        borderColor: 'transparent',
        height: "50%"
    },
    yAxis: {
        tickLength: 10,
        tickWidth: 1,
        tickColor: "#000000",
        lineColor: '#000000',
        lineWidth: 2,
        gridLineColor: 'transparent',
        title: {
            text: null
        }
    },
    xAxis: {
        type: "datetime",
        crosshair: true,
        lineColor: '#000000',
        lineWidth: 2,
        tickLength: 10,
        tickWidth: 1,
        tickColor: '#000000',
        labels: {
            format: '{value:%b %Y}'
        },
        tickmarkPlacement: "between",
        minTickInterval: 30 * 24 * 3600 * 1000,
        tickAmount: 5
    },
    tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(255,255,255, 1)",
        borderColor: "#000000",
        borderWidth: 1,
        borderRadius: 15,
        shadow: false,
        style: {
            fontSize: "14px",
            fontFamily: "Space Grotesk"
        }
    },
    plotOptions: {
        column: {
            borderRadius: 0,
            pointPadding: 0,
            borderWidth: 0
        }
    },
    legend: { enabled: false },
    title: false,
    subtitle: false,
    credits: {
        enabled: false
    },
    series: [{
        marker: {
            enabled: false,
        },
        color: "#18C7FF",
        data: [0.4, 0.41, 0.45, 0.42, 0.43, 0.5, 0.2, 0.3] as any
    }]
} as any;

export const supportedZones = ["cosmos", "osmo", "juno", "terra", "evmos", "stars", "inj", "umee", "comdex", "dydx", "haqq", "saga", "somm"] as const;
export type Zone = typeof supportedZones[number];

export type ZoneInfo = {
    zone: Zone,
    coingeckoId: string,
    sortOrder: number,
    ticker?: string,
    zoneColor: string
}

export const timeSpans = ["D", "W", "M"] as const;
export type TimeSpan = typeof timeSpans[number];

export const timePeriods = ["7D", "30D", "90D", "180D", "365D", "MAX"] as const;
export type TimePeriod = typeof timePeriods[number];
