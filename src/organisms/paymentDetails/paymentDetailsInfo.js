import { Box, Text } from "../../atoms"

export const PaymentDetailsInfo = ({ header = '',
    gap = 1,
    value = '',
    icon = false,
    location = '',
    flexDirection = 'column',
    align = 'start',
    textLarge = false,
    link = false,
    textSmall = false }) => {
    return (
        <Box sx={{
            display: 'flex', gap: gap, alignItems: align, flexDirection: flexDirection,
            '&:hover': {
                cursor: link && 'pointer'
            }
        }} onClick={() => {
            if (link) {
                window.open(link, '_blank')
            }
        }}>
            {header && <Text bold>{header}</Text>}
            {icon && <Box sx={{
                ...styles.menuIcon,
                backgroundImage: `url(${location})`,
                transition: '.3s',
                width: 18, height: 18,
                aspectRatio: '1/1'
            }} />}
            <Box sx={{ display: 'flex', gap: .5 }}>
                <Text style={{
                    ...(link && {
                        textDecoration: 'underline',
                        color: 'blue'
                    }),
                }} large={textLarge} small={textSmall} light>{value}</Text>
                {link && <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url('/icons/external_link_icon.png')`,
                    transition: '.3s',
                    width: 18, height: 18,
                    aspectRatio: '1/1'
                }} />}
            </Box>
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