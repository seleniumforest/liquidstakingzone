import React from 'react';

import styles from './zonesSelector.module.scss';
import { components } from "react-select";
import { default as ReactSelect } from "react-select";

export function ZonesSelector() {
    let zones = [
        { value: "Atom", label: "Atom" },
        { value: "Osmo", label: "Osmo" },
        { value: "Juno", label: "Juno" },
        { value: "Stars", label: "Stars" },
        { value: "Luna", label: "Luna" },
        { value: "Evmos", label: "Evmos" }
    ];

    return (
        <div className={styles.appSelect}>
            <ReactSelect
                className="basic-single"
                options={zones}
                onChange={() => { }}
                controlShouldRenderValue={false}
                placeholder={<div className={styles.placeholder}>{`${zones.length} Tokens`}</div>}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: '#E91179',
                      primary: '#E91179',
                    },
                  })}
                styles={{
                    control: base => ({
                        ...base,
                        border: "0",
                        boxShadow: 'none'
                    }),
                    container: base => ({
                        ...base,
                        border: "3px solid black",
                        borderRadius: "6px"
                    }),
                    option: base => ({
                        ...base,
                    })
                }}
                components={{
                    Option
                }}
            />
        </div>
    );
}

const Option = (props: any) => {
    return (
        <div>
            <components.Option {...props}>
                <label>{props.label}</label>
            </components.Option>
        </div>
    );
};