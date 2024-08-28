import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { Box, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";

export const RadioItem = (props) => {
    const { title = '', style = {}, onSelect = (value) => { }, sx = {}, group = [], small = false, horizontal = false, valueRadio = '', disabled = false } = props;
    const { colorPalette, theme } = useAppContext()

    const getChecked = (optionValue) => {

        if (typeof valueRadio === 'string') {
            return valueRadio === optionValue;

        } else if (typeof valueRadio === 'number') {
            if (isNaN(optionValue)) {
                return false;
            }
            return Number(valueRadio) === Number(optionValue);
        }
        return false;
    };


    return (
        <FormControl sx={{ padding: '5px 5px', }}>
            <FormLabel sx={{ fontFamily: 'MetropolisBold', color: colorPalette.textColor, fontSize: '12px' }}>{title}</FormLabel>
            <RadioGroup sx={{ gap: 1, ...style, ...sx }} row={horizontal}>
                {group?.map((item) => (
                    <FormControlLabel
                        key={item.value}
                        value={item?.value}
                        control={
                            <Radio 
                            size={small ? 'small' : 'medium'}
                            sx={{
                                '& .MuiTypography-root': {
                                    fontFamily: 'MetropolisRegular',
                                    color: colorPalette.textColor,
                                    fontSize: '9px'
                                }
                            }} onChange={disabled ? () => { } : (event) => onSelect(event.target.value)}
                                checked={getChecked(item.value)}
                            />
                        } label={item?.label} sx={{
                            '& .MuiTypography-root': {
                                fontFamily: 'MetropolisRegular',
                                color: colorPalette.textColor,
                                fontSize: small ? '9px' : '12px'
                            }
                        }} />
                ))
                }
            </RadioGroup>
        </FormControl>
    )
}

const styles = {
}