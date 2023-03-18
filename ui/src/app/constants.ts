import { isNumber } from "highcharts";
import moment from "moment";

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
        }
    },
    tooltip: {
        // formatter: function() : any {
        //     const that = this as any;
        //     let displayDate = "";
        //     let zone = that.points[0].series.userOptions.userOptions.zone;
      
        //     let displayZone = zone.charAt(0).toUpperCase() + zone.slice(1);

        //     if (isNumber(that.x)) {
        //         let date = moment(that.x).format("DD MMMM YYYY");
        //         displayDate =  date;
        //     }
        //     else {
        //         displayDate = that.x;
        //     }

        //     return `            
        //         <span style="text-align: center;">${displayDate}</span>
        //         <br />
        //         <span>${displayZone} ${new Intl.NumberFormat().format(that.y)}</span>
        //     `;
        // },
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(255,255,255, 1)",
        borderColor: "#000000",
        borderWidth: 1,
        borderRadius: 15,
        shadow: false,
        style: {
            fontSize: 14,
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
}

export const supportedZones = ["atom", "osmo", "juno", "luna", "evmos", "stars"] as const;
export type Zone = typeof supportedZones[number];

export const timeSpans = ["D", "W", "M"] as const;
export type TimeSpan = typeof timeSpans[number];

export const timePeriods = ["7D", "30D", "90D", "180D", "365D", "MAX"] as const;
export type TimePeriod = typeof timePeriods[number];
