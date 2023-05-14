import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import appStyles from './../../App.module.scss';

export function AppTooltip(props: { text: string }) {
    return (
        <>
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
                data-tooltip-content={props.text}
                className={appStyles.tooltipQuestionMark}
                data-tooltip-place="bottom"
            >
                ?
            </a>
        </>
    )
}