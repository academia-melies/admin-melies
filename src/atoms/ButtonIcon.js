
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
        filter = false,
        iconLarge = false,
        disabled = false,
        secondary = false,
        gap = 1,
        color = colorPalette?.textColor
    } = props;

    return (
        <Box
            sx={{
                ...styles.buttonContainer,
                backgroundColor: colorPalette.buttonColor,
                color: color,
                gap: gap,
                transition: 'background-color 1s',
                transition: '.3s',
                "&:hover": {
                    backgroundColor: colorPalette.buttonColor + 'dd',
                    cursor: !disabled && 'pointer',
                    transform: 'scale(1.02, 1.02)'
                },
                ...(small && { width: '100%', maxWidth: 130, height: 30 }),
                ...(secondary && {
                    backgroundColor: colorPalette.secondary,
                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                    color: colorPalette.textColor,
                    border: `1px solid ${colorPalette.primary}`,
                    transition: '.3s',
                    "&:hover": {
                        backgroundColor: colorPalette.secondary + 'dd',
                        cursor: !disabled && 'pointer',
                        transform: 'scale(1.02, 1.02)'
                    },
                }),
                ...style,
                ...disabled && { opacity: 0.3 }
            }}
            onClick={!disabled ? onClick : () => { }}
        >
            <Box sx={{
                ...styles.iconFilter, backgroundImage: `url(${icon})`,
                ...(filter && { filter: 'brightness(0) invert(1)', }),
                ...(iconLarge && {
                    width: 18,
                    height: 18,
                }),
            }} />
            <Text xsmall={small} bold style={{ color: 'inherit' }}>{text}</Text>
        </Box>
    )
}

const styles = {
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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