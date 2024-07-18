import { FormControl, InputLabel, Select, MenuItem, InputAdornment, Autocomplete, TextField } from "@mui/material";
import { Box, Text, TextInput } from "../../atoms";
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
        minWidth = 120,
        disabled = false,
        onFilter = false,
        filterValue = null
    } = props;

    const { colorPalette } = useAppContext()
    const [showClearButton, setShowClearButton] = useState(false);
    const [filterData, setFilterData] = useState('')

    const filteredData = data.filter(item => {
        return filterData.trim() === '' || item[filterOpition].toLowerCase().includes(filterData.toLowerCase());
    });

    return (
        <>
            {onFilter ?
                <Box sx={{ minWidth: minWidth, flex: fullWidth && 1, borderRadius: "8px" }}>
                    <Autocomplete
                        options={filteredData}
                        getOptionLabel={(option) => option[filterValue]}
                        value={data.find(item => item[filterOpition] === valueSelection) || null}
                        onChange={(event, newValue) => onSelect(newValue ? newValue[filterOpition] : "")}
                        disableClearable
                        sx={{ height: '45px' }} 
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={title}
                                InputProps={{
                                    ...params.InputProps,
                                    style: {
                                        borderRadius: '8px',
                                        ...params.InputProps.style,
                                        height: '45px',
                                        padding: '0 14px',
                                    },
                                }}
                                InputLabelProps={{
                                    sx: {
                                        color: colorPalette.textColor,
                                        fontSize: {
                                            xs: '16px',
                                            xm: '13px',
                                            md: '13px',
                                            lg: '13px',
                                            xl: '14px'
                                        },
                                        fontFamily: 'MetropolisBold',
                                    }
                                }}
                                sx={{
                                    transition: 'background-color 1s',
                                    disableUnderline: true,
                                    borderRadius: '8px',
                                    fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' },
                                    fontFamily: 'MetropolisRegular',
                                    backgroundColor: colorPalette.inputColor,
                                    color: colorPalette.textColor,
                                    height: '45px',
                                    '&.disabled': {
                                        color: 'white',
                                    },
                                    ...inputStyle,
                                }}
                            />
                        )}
                    />
                </Box>
                :
                <Box sx={{ minWidth: minWidth, flex: fullWidth && 1, borderRadius: "8px" }}>
                    <FormControl fullWidth>
                        <InputLabel
                            InputLabelProps={{ sx: { fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' } } }}
                            sx={{ ...inputStyle, fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' } }}>{title}</InputLabel>
                        <Select
                            disabled={false}
                            sx={{
                                borderRadius: "8px", backgroundColor: colorPalette.inputColor, height: 45, color: colorPalette.textColor, ...sx, maxHeight: 45, transition: 'background-color 1s',
                                fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' }
                            }}
                            value={valueSelection}
                            label={title}
                            onChange={disabled ? () => { } : (event) => onSelect(event.target.value)}
                            endAdornment={clean ?
                                <InputAdornment position="end">
                                    {(valueSelection && !disabled) && (
                                        <Box
                                            sx={{
                                                backgroundSize: "cover",
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition: "center",
                                                width: 15,
                                                height: 15,
                                                marginRight: 2,
                                                backgroundImage: `url(/icons/clean_filtro.png)`,
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
                                <MenuItem key={index} value={item[filterOpition]} sx={{ fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' } }}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            }
        </>
    )
}

const styles = {
}