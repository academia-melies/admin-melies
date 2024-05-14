import { Box, Text } from "../../atoms"

export const PaymentDetailsInfo = ({ header = '',
    gap = 1,
    value = '',
    icon = false,
    location = '',
    flexDirection = 'column',
    align = 'start',
    textLarge = false,
    textSmall = false }) => {
    return (
        <Box sx={{ display: 'flex', gap: gap, alignItems: align, flexDirection: flexDirection }}>
            {header && <Text bold>{header}</Text>}
            {icon && <Box sx={{
                ...styles.menuIcon,
                backgroundImage: `url(${location})`,
                transition: '.3s',
                width: 18, height: 18,
                aspectRatio: '1/1'
            }} />}
            <Text large={textLarge} small={textSmall} light>{value}</Text>
        </Box >
    )
}

const styles = {
    icon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '15px',
        height: '15px',
        marginRight: '0px',
        backgroundImage: `url('/favicon.svg')`,
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,

    },
}