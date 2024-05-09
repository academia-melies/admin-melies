import { AnimatedNumbers, Box, Text } from "../../../atoms"
import { useAppContext } from "../../../context/AppContext"
import { SectionHeader } from "../../../organisms"

export default function CommercialPainel(props) {

    const { user, colorPalette, theme, setLoading, alert, notificationUser, permissionTop15 } = useAppContext()

    return (
        <>
            <SectionHeader
                title={`Painel Comercial`}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{
                    display: permissionTop15 ? 'flex' : 'none', gap: 2, alignItems: 'center', width: '100%', borderRadius: 2,
                    padding: '12px 15px'
                }}>
                    <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                            <Text large bold>Em Andamento</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('/icons/andamento_icon.png')`,
                                transition: '.3s',
                                width: 35, height: 35,
                                aspectRatio: '1/1'
                            }} />
                        </Box>
                        <AnimatedNumbers value={450} />
                    </Box>

                    <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                            <Text large bold>Concluídas</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('/icons/concluido_icon.png')`,
                                transition: '.3s',
                                width: 35, height: 35,
                                aspectRatio: '1/1'
                            }} />
                        </Box>
                        <AnimatedNumbers value={450} />
                    </Box>

                    <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                            <Text large bold>Pendente de Assinatura do Contrato</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('/icons/contrato_assinatura_icon.png')`,
                                transition: '.3s',
                                width: 35, height: 35,
                                aspectRatio: '1/1'
                            }} />
                        </Box>
                        <AnimatedNumbers value={450} />
                    </Box>
                </Box>


                <Box sx={{
                    display: permissionTop15 ? 'flex' : 'none', gap: 2, alignItems: 'center', width: '100%', borderRadius: 2,
                    padding: '12px 15px'
                }}>
                    <Box sx={{ ...styles.graph, backgroundColor: colorPalette?.secondary }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                            <Text large bold>Matrículas Realizadas</Text>
                        </Box>
                    </Box>

                    <Box sx={{ ...styles.graph, width: '50%', padding: '15px 20px', height: 300, backgroundColor: colorPalette?.secondary }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                            <Text large bold>Matrículas Realizadas</Text>
                        </Box>
                    </Box>
                </Box>

            </Box>

        </>
    )
}

const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 15,
        height: 15,
    },
    indicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '33%',
        padding: '20px 30px',
        gap: 2,
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 'rgba(149, 157, 165, 0.4) 0px 6px 24px'
    },
    graph: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%', padding: '15px 20px', height: 300,
        gap: 2,
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 'rgba(149, 157, 165, 0.4) 0px 6px 24px'
    },
}
