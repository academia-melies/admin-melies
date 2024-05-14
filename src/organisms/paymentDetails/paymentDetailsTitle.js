import { Box, Divider, Text } from "../../atoms"
import { useAppContext } from "../../context/AppContext"

export const PaymentDetailsTitle = ({ title = '' }) => {
    const { colorPalette } = useAppContext()
    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 30px' }}>
                <Box sx={{ display: 'flex', height: 25, width: 4, backgroundColor: colorPalette?.buttonColor }} />
                <Text bold large>{title}</Text>
            </Box>
            <Divider />
        </>
    )
}