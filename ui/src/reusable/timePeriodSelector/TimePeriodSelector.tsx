import React from 'react';

import styles from './timePeriodSelector.module.scss';
import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';
import { TimePeriod } from '../../app/constants';

export function TimePeriodSelector(props: TimePeriodSelectorProps) {
    let defaultButtons = ["7D", "30D", "90D", "180D", "365D", "MAX"]

    return (
        <div className={joinClasses(appStyles.timeSpanSelector, props.className)}>
            {defaultButtons.map(btn => (
                <button className={props.selectedValue === btn ? appStyles.btnSelected : ""} key={btn} onClick={() => props.setTimePeriod(btn)}>{btn}</button>
            ))}
        </div>
    );
}

interface TimePeriodSelectorProps {
    className?: string,
    setTimePeriod?: any,
    selectedValue?: TimePeriod
}