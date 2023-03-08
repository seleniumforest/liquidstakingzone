import React from 'react';

import styles from './multipleZonesSelector.module.scss';
import appStyles from "../../App.module.scss";
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export function MultipleZonesSelector() {
    const [zoneName, setPersonName] = React.useState<string[]>([]);

    const handleChange = (event: SelectChangeEvent<typeof zoneName>) => {
        const {
            target: { value },
        } = event;
        setPersonName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    let zones = ["Atom", "Osmo", "Juno", "Stars", "Luna", "Evmos"];

    return (
        <div className={styles.appSelect}>
            <FormControl sx={{ m: 1, width: 300 }}>
                <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={zoneName}
                    onChange={handleChange}
                    renderValue={(selected) => `${selected.length} Zones`}
                    MenuProps={MenuProps}
                >
                    {zones.map((z) => (
                        <MenuItem key={z} value={z}>
                            <Checkbox checked={zoneName.indexOf(z) > -1} />
                            <ListItemText primary={z} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}