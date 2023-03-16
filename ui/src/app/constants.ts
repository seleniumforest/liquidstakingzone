export const baseChartOptions = {
    chart: {
        backgroundColor: 'transparent',
        type: 'column',
        borderColor: 'transparent',
        height: "50%"
    },
    yAxis: {
        gridLineColor: 'transparent',
        title: {
            text: null
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
        data: [0.4, 0.41, 0.45, 0.42, 0.43, 0.5, 0.2, 0.3] as any,
        fillColor: {
            linearGradient: [0, 0, 0, 300],
            stops: [
                [0, "#18C7FF"],
                [1, "#ffffff"]
            ]
        }
    }]
}

export const supportedZones = ["atom", "osmo", "juno", "luna", "evmos", "stars"] as const;
export type Zone = typeof supportedZones[number];

export const timeSpans = ["D", "W", "M"] as const;
export type TimeSpan = typeof timeSpans[number];

export const timePeriods = ["7D", "30D", "90D", "180D", "365D", "MAX"] as const;
export type TimePeriod = typeof timePeriods[number];
