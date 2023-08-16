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
        valueChecked = ''
    } = props;

    const { colorPalette, theme } = useAppContext()
    const [selectedValues, setSelectedValues] = useState([]);

    useEffect(() => {
        if (valueChecked !== '' && valueChecked !== null) {
            const cleanedValue = valueChecked.replace(/null/g, ''); // Remover todas as ocorrências de 'null'
            const initialValues = cleanedValue !== '' ? cleanedValue.split(',').map((value) => value.trim()) : [];
            setSelectedValues(initialValues);
        } else if (valueChecked === null) {
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
        <FormControl sx={{ padding: '5px 13px', }}>
            <FormLabel sx={{ fontFamily: 'MetropolisBold', color: colorPalette.textColor, fontSize: '12px' }}>{title}</FormLabel>
            <FormGroup sx={{ gap: 1, ...style, ...sx }} row={horizontal}>
                {boxGroup?.map((item) => (
                    <FormControlLabel
                        key={item.value}
                        value={item?.value}
                        control={
                            <Checkbox
                                sx={{ color: colorPalette.textColor, }}
                                onChange={() => handleCheckboxChange(item.value)}
                                checked={getChecked(item.value)}
                            />
                        }
                        label={item?.label}
                        sx={{ color: colorPalette.textColor, }} />
                ))
                }
            </FormGroup>
        </FormControl>
    )
}

const styles = {
}