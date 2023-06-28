import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Box, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";

export const SelectList = (props) => {
    const {
        title = '',
        style = {},
        onSelect = (value) => { },
        sx = {},
        data = [],
        valueSelection = '',
        filterOpition,
        inputStyle
    } = props;


    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel
                    sx={{ ...inputStyle }}
                >{title}</InputLabel>
                <Select sx={{ ...sx }}
                    value={valueSelection}
                    label={title}
                    onChange={(event) => onSelect(event.target.value)}
                >
                    {data.map((item, index) => (
                        <MenuItem key={index} value={item[filterOpition]}>{item.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}

const styles = {
}