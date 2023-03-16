import React from 'react';

import styles from './timeSpanSelector.module.scss';
import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';

const buttons = ["D", "W", "M"];

export function TimeSpanSelector(props: TimeSpanProps) {
    return (
        <div className={joinClasses(appStyles.timeSpanSelector, props.className)}>
            {buttons.map(btn => (
                <button key={btn} onClick={() => props.setTimeSpan(btn)}>{btn}</button>
            ))}
        </div>
    );
}

interface TimeSpanProps {
    className?: string,
    setTimeSpan?: any
}