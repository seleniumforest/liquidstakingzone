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

    const customStyles = (width = 100, height = 40) => {
        return {
            container: (base: any) => ({
                ...base,
                display: 'inline-block',
                width: width,
            }),
            valueContainer: (base: any) => ({
                ...base,
                minHeight: height,
            })
        }
    }

    let placeholder =
        <div className={styles.placeholder}>
            <div className={styles.placeholderNumber}>{zones.length}</div>
            {` Zones`}
        </div>;

    return (
        <div className={styles.appSelect}>
            <ReactSelect
                className="sectionTest"
                options={zones}
                onChange={() => { }}
                controlShouldRenderValue={false}
                placeholder={placeholder}
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
                        boxShadow: 'none',
                        minHeight: '24px',
                        height: '24px',
                    }),
                    container: base => ({
                        ...base,
                        border: "2px solid black",
                        borderRadius: "6px",
                        minWidth: "100px"
                    }),
                    valueContainer: (provided) => ({
                        ...provided,
                        height: '24px',
                        padding: '0 6px'
                    }),
                    input: (provided) => ({
                        ...provided,
                        margin: '0px',
                    }),
                    indicatorSeparator: () => ({
                        display: 'none',
                    }),
                    indicatorsContainer: (provided) => ({
                        ...provided,
                        height: '24px',
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