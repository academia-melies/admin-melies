import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { Box, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";

export const RadioItem = (props) => {
    const { title = '', style = {}, onSelect = (value) => { }, sx = {}, group = [], horizontal = false, valueRadio = '' } = props;
    const { colorPalette, theme } = useAppContext()

    const getChecked = (optionValue) => {
        if (valueRadio !== '' && valueRadio === optionValue) {
           return valueRadio;
        }
        return false;
     };

    return (
        <FormControl sx={{ padding: '5px 13px', }}>
            <FormLabel sx={{ fontFamily: 'MetropolisBold', color: colorPalette.textColor, fontSize: '12px' }}>{title}</FormLabel>
            <RadioGroup sx={{ gap: 1, ...style, ...sx }} row={horizontal}>
                {group?.map((item) => (
                    <FormControlLabel
                        key={item.value}
                        value={item?.value}
                        control={
                            <Radio sx={{ color: colorPalette.textColor, }} onChange={(event) => onSelect(event.target.value)}
                            checked={getChecked(item.value)} />
                        } label={item?.label} sx={{ color: colorPalette.textColor, }} />
                ))
                }
            </RadioGroup>
        </FormControl>
    )
}

const styles = {
}