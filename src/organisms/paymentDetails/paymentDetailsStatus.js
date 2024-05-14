import { Box, Text } from "../../atoms"
import { useAppContext } from "../../context/AppContext"

export const PaymentDetailsStatus = ({ header = '', value = '', flexDirection = 'column',
    align = 'start', }) => {
    const { colorPalette, theme } = useAppContext()

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Cancelado' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Erro com o pagamento' && 'red') ||
        (data === 'Estornada' && '#f0f0f0'))


    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: align, flexDirection: flexDirection }}>
            {header && <Text bold>{header}</Text>}
            <Box
                sx={{
                    display: 'flex',
                    height: 22,
                    backgroundColor: colorPalette.primary,
                    gap: 1,
                    alignItems: 'center',
                    borderRadius: 2,
                    justifyContent: 'start',
                }}
            >
                <Box sx={{ display: 'flex', backgroundColor: priorityColor(value), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                <Text small bold style={{ textAlign: 'center', padding: '0px 15px', }}>{value || ''}</Text>
            </Box>
        </Box>
    )
}
