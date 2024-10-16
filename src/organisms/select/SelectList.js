import { FormControl, InputLabel, Select, MenuItem, InputAdornment, Autocomplete, TextField } from "@mui/material";
import { Box } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";

export const SelectList = (props) => {
    const {
        title = '',
        style = {},
        onSelect = (value, label) => { },
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
        filterValue = null,
        small = false
    } = props;

    const { colorPalette } = useAppContext();
    const [showClearButton, setShowClearButton] = useState(false);
    const [filterData, setFilterData] = useState('');

    const filteredData = data.filter(item => {
        return filterData.trim() === '' || item[filterOpition].toLowerCase().includes(filterData.toLowerCase());
    });

    const handleSelectChange = (event) => {
        const value = event.target.value;
        let label = ""
        if (title == "Turma/Modulo") {
            let nome_turma = data.filter((item) => item.value == value)
            label = nome_turma[0].label;
        }

        onSelect(value, label);
    };

    return (
        <>
            {onFilter ? (
                <Box sx={{ minWidth: minWidth, flex: fullWidth && 1, borderRadius: "8px" }}>
                    <Autocomplete
                        options={filteredData}
                        getOptionLabel={(option) => option[filterValue]}
                        value={data.find(item => item[filterOpition] === valueSelection) || null}
                        onChange={(event, newValue) => {
                            const value = newValue ? newValue[filterOpition] : "";
                            const label = newValue ? newValue[filterValue] : "";
                            onSelect(value, label);
                        }}
                        disableClearable
                        sx={{
                            // height: '45px',
                            ...(small && {
                                // height: 30,
                                fontSize: '11px'
                            })
                        }}
                        renderInput={(params) => (
                            <TextField
                            size="small"
                                {...params}
                                label={title}
                                InputProps={{
                                    ...params.InputProps,
                                    style: {
                                        borderRadius: '8px',
                                        ...params.InputProps.style,
                                        padding: '0 14px',
                                        ...(small && {
                                            fontSize: '11px'
                                        })
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
                                    '&.disabled': {
                                        color: 'white',
                                    },
                                    ...inputStyle,
                                }}
                            />
                        )}
                    />
                </Box>
            ) : (
                <Box sx={{ minWidth: minWidth, flex: fullWidth && 1, borderRadius: "8px" }}>
                    <FormControl fullWidth>
                        <InputLabel
                            size="small"
                            InputLabelProps={{ sx: { fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' } } }}
                            sx={{ fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' }, ...inputStyle }}
                        >
                            {title}
                        </InputLabel>
                        <Select
                            size="small"
                            disabled={disabled}
                            sx={{
                                borderRadius: "8px",
                                backgroundColor: colorPalette.inputColor,
                                color: colorPalette.textColor,
                                transition: 'background-color 1s',
                                fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' },
                                ...sx,
                                ...style
                            }}
                            value={valueSelection}
                            label={title}
                            onChange={disabled ? () => { } : handleSelectChange}
                            endAdornment={clean ? (
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
                                            onClick={() => onSelect("", "")}
                                        />
                                    )}
                                </InputAdornment>
                            ) : false}
                        >
                            {data.map((item, index) => (
                                <MenuItem key={index} value={item[filterOpition]} sx={{ fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' } }}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}
        </>
    );
};
