import { Checkbox, FormLabel, FormGroup, FormControlLabel, FormHelperText, FormControl } from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { Box, Text } from "../../atoms";
import { useState, useEffect } from "react";

export const CheckBoxComponent = (props) => {
    const { title = '',
        style = {},
        onSelect = () => { },
        sx = {},
        horizontal = false,
        label,
        boxGroup = [],
        valueChecked = '',
        padding = true,
        gap = true,
        disabled = false,
        onClick = () => { }
    } = props;

    const { colorPalette, theme } = useAppContext()
    const [selectedValues, setSelectedValues] = useState([]);

    useEffect(() => {
        if (valueChecked) {
            const initialValues = valueChecked.split(',').map(value => value.trim());
            setSelectedValues(initialValues);
        } else {
            setSelectedValues([]);
        }
    }, [valueChecked]);

    useEffect(() => {

        const formattedValue = selectedValues.join(', ');
        onSelect(formattedValue);
    }, [selectedValues]);

    const handleCheckboxChange = (value) => {
        setSelectedValues((prevSelectedValues) => {
            if (prevSelectedValues.includes(value)) {
                return prevSelectedValues.filter((val) => val !== value);
            } else {
                return [...prevSelectedValues, value];
            }
        });
    };

    const getChecked = (value) => {
        return selectedValues.includes(value);
    };

    return (
        <FormControl sx={{ padding: padding ? '5px 13px' : '', gap: gap && 0 }}>
            <FormLabel sx={{ fontFamily: 'MetropolisBold', color: colorPalette.textColor, fontSize: '12px' }}>{title}</FormLabel>
            <FormGroup sx={{ ...style, ...sx }} row={horizontal} onClick={onClick}>
                {boxGroup?.map((item) => (
                    <FormControlLabel
                        key={item.value}
                        value={item?.value}
                        control={
                            <Checkbox
                                sx={{ fontFamily: 'MetropolisBold', color: colorPalette.textColor, fontSize: '12px' }}
                                onChange={disabled ? () => { } : () => handleCheckboxChange(item.value)}
                                checked={getChecked(item.value)}
                            />
                        }
                        label={item?.label}
                        sx={{
                            '& .MuiTypography-root': {
                                fontFamily: 'MetropolisRegular',
                                color: colorPalette.textColor,
                                fontSize: '13px'
                            }
                        }} />
                ))
                }
            </FormGroup>
        </FormControl>
    )
}

const styles = {
}