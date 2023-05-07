import React from 'react';
import styles from './multipleZonesSelector.module.scss';
import Select, { components } from "react-select";
import { supportedZones, Zone } from '../../app/constants';
import { capitalize, getChartColor } from '../../features/assets/helpers';

const InputOption = (props: any) => {
    return (
        <components.Option {...props} key={props.value} className={styles.zoneOption}>
            <input type="checkbox" onChange={() => { }} checked={props.isSelected} style={{ accentColor: getChartColor(props.value) }} />
            {props.children}
        </components.Option>
    );
};

const allOptions = supportedZones.map(x => ({
    value: x,
    label: capitalize(x)
}));

interface multipleZonesSelectorProps {
    selectedZones: Zone[],
    setSelectedZones: any
}

export function MultipleZonesSelector({ selectedZones, setSelectedZones }: multipleZonesSelectorProps) {
    let placeholder =
        <div className={styles.placeholder}>
            <div className={styles.placeholderNumber}>{allOptions.length}</div>
            {` Zones`}
        </div>;

    return (
        <div className={styles.appSelect}>
            <Select
                className="sectionTest"
                isClearable={false}
                isOptionSelected={(option) => { return selectedZones.includes(option.value) }}
                isMulti
                closeMenuOnSelect={false}
                defaultValue={allOptions}
                hideSelectedOptions={false}
                onChange={(options) => {
                    if (Array.isArray(options)) {
                        setSelectedZones(options.map((opt: any) => opt.value));
                    }
                }}
                options={allOptions}
                placeholder={placeholder}
                controlShouldRenderValue={false}
                components={{
                    Option: InputOption
                }}
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
                        height: '24px'
                    }),
                    option: (provided) => ({
                        ...provided,
                        backgroundColor: "transparent",
                        color: "initial"
                    })
                }}
            />
        </div>
    );
}
