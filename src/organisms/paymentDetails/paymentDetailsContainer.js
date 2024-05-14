import { Box, Text } from "../../atoms"
import { useAppContext } from "../../context/AppContext"

export const PaymentDetailsContainer = ({ width = '100%', children }) => {
    const { colorPalette, theme } = useAppContext()


    return (
        <Box sx={{
            display: 'flex', gap: 2, padding: '20px 0px', backgroundColor: colorPalette?.secondary, borderRadius: 2, flexDirection: 'column',
            width: width, boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
        }}>
            {children}
        </Box>
    )
}