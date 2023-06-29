import { Checkbox } from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { Box, Text } from "../../atoms";

export const CheckBoxComponent = (props) => {
    const { title = '', style = {}, onSelect = () => { }, sx = {}, horizontal = false, label} = props;
    const { colorPalette, theme } = useAppContext()

    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}> 
            <Checkbox
                onChange={(event) => onSelect(event.target.checked)}
                sx={{ color: colorPalette.textColor, }}
            />
            <Text bold>{label}</Text>
        </Box>
    )
}

const styles = {
}