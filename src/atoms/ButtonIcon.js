
import { Box, Text } from "../atoms";
import { useAppContext } from "../context/AppContext";
import { Colors } from "../organisms";

export const ButtonIcon = (props) => {

    const { colorPalette, theme } = useAppContext()

    const {
        small = false,
        onClick = () => { },
        text = '',
        style = {},
        icon = '',
        disabled = false,
        color = colorPalette?.textColor
    } = props;

    return (
        <Box
            sx={{
                ...styles.buttonContainer,
                backgroundColor: colorPalette.buttonColor,
                color: color,
                transition: 'background-color 1s',
                "&:hover": {
                    backgroundColor: colorPalette.buttonColor + 'dd',
                    cursor: !disabled && 'pointer'
                },
                ...(small && { width: '100%', maxWidth: 130 }),
                ...style,
                ...disabled && { opacity: 0.3 }
            }}
            onClick={!disabled ? onClick : () => { }}
        >
             <Box sx={{ ...styles.iconFilter, backgroundImage: `url(${icon})` }} />
            <Text small={small} bold style={{ color: 'inherit' }}>{text}</Text>
        </Box>
    )
}

const styles = {
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        padding: '8px 15px',
        borderRadius: 3,
    },
    iconFilter: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ascpectRatio: '1/1',
        width: 16,
        height: 16,
        transition: '.3s',
    },
}