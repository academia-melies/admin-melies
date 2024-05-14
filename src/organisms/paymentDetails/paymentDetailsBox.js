import { Box, Text } from "../../atoms"

export const PaymentDetailsBox = ({ gap = 2, column = false, align = 'center', justifyContent = 'space-around', children }) => {

    return (

        <Box sx={{
            display: 'flex', gap: gap, alignItems: align, padding: '0px 30px', justifyContent: justifyContent,
            flexDirection: column ? 'column' : 'row'
        }}>
            {children}
        </Box>
    )
}