import { FormControl, InputLabel, Select, MenuItem, InputAdornment } from "@mui/material";
import { Box, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";

export const SelectList = (props) => {
    const {
        title = '',
        style = {},
        onSelect = (value) => { },
        sx = {},
        data = [],
        valueSelection = '',
        filterOpition,
        inputStyle,
        fullWidth = false,
        clean = true,
        minWidth = 120
    } = props;

    const { colorPalette } = useAppContext()
    const [showClearButton, setShowClearButton] = useState(false);


    return (
        <Box sx={{ minWidth: minWidth, flex: fullWidth && 1, borderRadius: "8px", }}>
            <FormControl fullWidth>
                <InputLabel sx={{ ...inputStyle }}>{title}</InputLabel>
                <Select
                    sx={{ borderRadius: "8px", backgroundColor: colorPalette.inputColor, height: 45, color: colorPalette.textColor, ...sx, maxHeight: 45, transition: 'background-color 1s' }}
                    value={valueSelection}
                    label={title}
                    onChange={(event) => onSelect(event.target.value)}
                    endAdornment={clean ?
                        <InputAdornment position="end">
                            {valueSelection && (
                                <Box
                                    sx={{
                                        backgroundSize: "cover",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center",
                                        width: 15,
                                        height: 15,
                                        marginRight: 2,
                                        backgroundImage: `url(/icons/remove_icon.png)`,
                                        transition: ".3s",
                                        "&:hover": {
                                            opacity: 0.8,
                                            cursor: "pointer",
                                        },
                                    }}
                                    onClick={() => onSelect("")}
                                />
                            )}
                        </InputAdornment>
                        : false
                    }
                >
                    {data.map((item, index) => (
                        <MenuItem key={index} value={item[filterOpition]}>
                            {item.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}

const styles = {
}

{/* <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                                {item[filterOpition]}
                                <Box sx={{
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    width: 15,
                                    height: 15,
                                    backgroundImage: `url(/icons/remove_icon.png)`,
                                    transition: '.3s',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => onSelect('')} />
                            </Box> */}