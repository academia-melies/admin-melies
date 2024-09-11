import { useState, useEffect } from "react";
import { Box, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
import Image from "next/image";
import { Tooltip, darken } from "@mui/material";

export const CheckBoxComponent = (props) => {
    const {
        title = '',
        onSelect = () => { },
        horizontal = false,
        boxGroup = [],
        valueChecked = '',
        disabled = false,
        padding = '5px',
        sx = {}
    } = props;

    const { colorPalette } = useAppContext();
    const [selectedValues, setSelectedValues] = useState('');

    useEffect(() => {
        setSelectedValues(valueChecked);
    }, [valueChecked]);

    const handleCheckboxChange = (value) => {
        const valuesArray = selectedValues ? selectedValues.split(', ').filter(v => v) : [];
        const alreadySelected = valuesArray.includes(value);
        const updatedValues = alreadySelected
            ? valuesArray.filter(v => v !== value)
            : [...valuesArray, value];

        const updatedString = updatedValues.join(', ');
        setSelectedValues(updatedString);
        onSelect(updatedString);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column', padding: padding, ...sx}}>
                {title && <Text bold>{title}</Text>}
                <Box sx={{
                    display: 'flex', alignItems: horizontal ? 'center' : 'start', justifyContent: 'start', gap: 2,
                    flexDirection: horizontal ? 'row' : 'column'
                }}>
                    {boxGroup.map((item) => {
                        const selected = selectedValues ? selectedValues.split(', ').includes(item.value) : false;
                        const baseColor = colorPalette.buttonColor;
                        const hoverColor = selected ? darken(baseColor, 0.2) : darken(baseColor, 0.1);
                        return (
                            <Box key={item.value} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                                <Tooltip title={disabled && 'Você não possúi permissão.'}>
                                    <Box
                                        sx={{
                                            opacity: disabled ? .7 : 1,
                                            display: 'flex', gap: 1, width: 19, height: 19, border: !selected && `1.5px solid #d1d5db`, borderRadius: '3px',
                                            alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: selected && colorPalette.buttonColor, position: 'relative',
                                            "&:hover": {
                                                transition: '.1s',
                                                opacity: 0.8,
                                                cursor: 'pointer',
                                                border: (!selected && !disabled) && `2px solid ${colorPalette.buttonColor}`,
                                                backgroundColor: (selected && !disabled) ? hoverColor : 'transparent',
                                            }
                                        }}
                                        onClick={() => {
                                            if (!disabled) {
                                                handleCheckboxChange(item.value)
                                            }
                                        }}
                                    >
                                        {selected &&
                                            <Box sx={styles.checkBox}>
                                                <Image src={`/icons/check-icon.png`} width={12} height={12} />
                                            </Box>
                                        }
                                    </Box>
                                </Tooltip>
                                <Text light>{item.label}</Text>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

const styles = {
    checkBox: {
        width: '100%', height: '100%',
        borderRadius: '3px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        bottom: 0, top: 0, right: 0, left: 0,
        position: 'absolute',
        transition: '.1s',
    }
}