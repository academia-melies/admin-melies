import { Box } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
import { Colors } from "../layout/Colors";


export const IconTheme = (props) => {
    const { left = false, right = false } = props

    const { logout, user, colorPalette, setColorPalette, setTheme, theme } = useAppContext();


    return (

        <Box sx={{
            display: 'flex',
            position: 'absolute',
            // backgroundColor: !theme ? Colors.backgroundPrimary : '#F2F4F8 ',
            transition: 'background-color 1s',
            top: 50,
            right: right && 5,
            left: left && 20,
            padding: '5px 20px',
            borderRadius: '5px',
            "&:hover": {
                opacity: 0.8,
                cursor: 'pointer'
            }
        }} onClick={() => setTheme(!theme)}>
            <Box sx={{
                width: '30px', height: '30px', backgroundImage: theme ? `url('/icons/theme_icon.png')` : `url('/icons/theme_icon_dark.png')`, color: theme ? '#fff' : Colors.backgroundPrimary, transition: 'background-color 1s',
            }} />
        </Box>
    )
}

const styles = {

}