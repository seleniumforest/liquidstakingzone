import React from 'react';

import styles from './multipleZonesSelector.module.scss';
import appStyles from "../../App.module.scss";
import { useState } from "react";
import Select, { components } from "react-select";

// export function MultipleZonesSelector() {
//     const [zoneName, setPersonName] = React.useState<string[]>([]);

//     const handleChange = (event: SelectChangeEvent<typeof zoneName>) => {
//         const {
//             target: { value },
//         } = event;
//         setPersonName(
//             // On autofill we get a stringified value.
//             typeof value === 'string' ? value.split(',') : value,
//         );
//     };
//     let zones = ["Atom", "Osmo", "Juno", "Stars", "Luna", "Evmos"];

//     return (
//         <div className={styles.appSelect}>
//             <FormControl sx={{ m: 1, width: 300 }}>
//                 <Select
//                     labelId="demo-multiple-checkbox-label"
//                     id="demo-multiple-checkbox"
//                     multiple
//                     value={zoneName}
//                     onChange={handleChange}
//                     renderValue={(selected) => `${selected.length} Zones`}
//                     MenuProps={MenuProps}
//                 >
//                     {zones.map((z) => (
//                         <MenuItem key={z} value={z}>
//                             <Checkbox checked={zoneName.indexOf(z) > -1} />
//                             <ListItemText primary={z} />
//                         </MenuItem>
//                     ))}
//                 </Select>
//             </FormControl>
//         </div>
//     );
// }

const InputOption = (props: any) => {
    return (
        <components.Option {...props} className={styles.zoneOption}>
            <input type="checkbox" checked={props.isSelected} className={styles.zoneCheckbox} />
            {props.children}
        </components.Option>
    );
};

const allOptions = [
    { value: "option 1", label: "option 1" },
    { value: "option 2", label: "option 2" },
    { value: "option 3", label: "option 3" },
    { value: "option 4", label: "option 4" }
];

export function MultipleZonesSelector() {
    const [selectedOptions, setSelectedOptions] = useState<{ value: string, label: string }[]>([]);

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
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={(options) => {
                    if (Array.isArray(options)) {
                        setSelectedOptions(options.map((opt: any) => opt.value));
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
