import React from 'react';
import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';
import { TimeSpan } from '../../app/constants';

const buttons = ["D", "W", "M"];

export function TimeSpanSelector(props: TimeSpanProps) {
    return (
        <div className={joinClasses(appStyles.timeSpanSelector, props.className)}>
            {buttons.map(btn => (
                <button className={props.selectedValue === btn ? appStyles.btnSelected : ""} key={btn} onClick={() => props.setTimeSpan(btn)}>{btn}</button>
            ))}
        </div>
    );
}

interface TimeSpanProps {
    className?: string,
    setTimeSpan?: any,
    selectedValue: TimeSpan
}