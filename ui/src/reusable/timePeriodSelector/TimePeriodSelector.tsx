import React from 'react';

import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';

const defaultButtons: [string, number][] = [
    ["7D", 7],
    ["30D", 30],
    ["90D", 90],
    ["180D", 180],
    ["365D", 365],
    ["MAX", -1]
];

export function TimePeriodSelector(props: TimePeriodSelectorProps) {
    return (
        <div className={joinClasses(appStyles.timeSpanSelector, props.className)}>
            {defaultButtons.map(([label, val]) => (
                <button className={props.selectedValue === val ? appStyles.btnSelected : ""} key={val} onClick={() => props.setTimePeriod(val)}>{label}</button>
            ))}
        </div>
    );
}

interface TimePeriodSelectorProps {
    className?: string,
    setTimePeriod?: any,
    selectedValue?: number
}