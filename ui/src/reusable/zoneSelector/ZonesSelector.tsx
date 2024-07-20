import React, { Dispatch, SetStateAction } from 'react';

import styles from './zonesSelector.module.scss';
import { components } from "react-select";
import { default as ReactSelect } from "react-select";
import { Zone } from '../../app/constants';

const zones = [
    { value: "cosmos", label: "Cosmos" },
    { value: "osmo", label: "Osmo" },
    { value: "juno", label: "Juno" },
    { value: "stars", label: "Stars" },
    { value: "terra", label: "Terra" },
    { value: "evmos", label: "Evmos" },
    { value: "inj", label: "Injective" },
    { value: "umee", label: "Umee" },
    { value: "comdex", label: "Comdex" },
    { value: "dydx", label: "DYDX" },
    { value: "haqq", label: "Islamic coin" },
    { value: "saga", label: "Saga" },
    { value: "somm", label: "Sommelier" }
];

export function ZonesSelector({ setZone }: { setZone: Dispatch<SetStateAction<Zone>> }) {
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
                onChange={(val) => setZone(val?.value as Zone)}
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