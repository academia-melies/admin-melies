import { FormControlLabel, Checkbox, FormGroup } from "@mui/material";
import { Box, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";

export const Chackbox = (props) => {
    const { title = '', style = {}, onSelect = (value) => { }, sx = {}, group = [], horizontal = false } = props;
    const { colorPalette, theme } = useAppContext()

    return (
        <FormControlLabel sx={{ padding: '5px 13px', }}>
            <FormLabel sx={{ fontFamily: 'MetropolisBold', color: colorPalette.textColor, fontSize: '12px' }}>{title}</FormLabel>
            <FormGroup sx={{ gap: 1, ...style, ...sx }} row={horizontal}>
                {group?.map((item) => (
                    <>
                        <Checkbox />
                    </>
                ))}
            </FormGroup>
        </FormControlLabel>
    )
}

const styles = {
}