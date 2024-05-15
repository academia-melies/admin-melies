import { useState } from "react"
import { api } from "../../../api/api"
import { AnimatedNumbers, Box, Button, Text, TextInput } from "../../../atoms"
import { useAppContext } from "../../../context/AppContext"
import { SectionHeader } from "../../../organisms"

export default function CommercialPainel(props) {

    const { user, colorPalette, theme, setLoading, alert, notificationUser, permissionTop15 } = useAppContext()
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    })
    const [startSearch, setStartSearch] = useState(false)
    const [reportIndicators, setReportIndicators] = useState({})


    const getEnrollments = async () => {
        try {
            const response = await api.get(`/reports/commercial/enrollments?startDate=${filters?.startDate}&endDate=${filters?.endDate}`)
            if (response?.data) {
                setReportIndicators(response?.data)
            } else {
                setReportIndicators({})
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleLastEnrollments = async () => {
        setLoading(true)
        try {
            const response = await api.get('/student/enrollments/lastEnrollments')
            if (response.status === 200) {
                setLastEnrollments(response.data)
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleFiltered = async () => {
        if (filters?.startDate && filters?.endDate) {
            try {
                setLoading(true)
                await getEnrollments()
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
                setStartSearch(true)
            }
        } else {
            alert.info('Preencha as datas de Ínicio e Fim, antes de buscar.')
        }
    }


    return (
        <>
            <SectionHeader
                title={`Painel Comercial`}
            />

            <Box>
                <Box sx={{
                    ...styles.filterSection, gap: 1, width: 600
                }}>
                    <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} sx={{ flex: 1, }}
                        InputProps={{
                            style: {
                                backgroundColor: colorPalette?.secondary,
                                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                            }
                        }} />
                    <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} sx={{ flex: 1, }}
                        InputProps={{
                            style: {
                                backgroundColor: colorPalette?.secondary,
                                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                            }
                        }} />
                    <Button text="Buscar" style={{ borderRadius: 2, width: 130 }} onClick={() => handleFiltered()} />
                </Box>
            </Box >
            {startSearch && <>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{
                        display: permissionTop15 ? 'flex' : 'none', gap: 2, alignItems: 'center', width: '100%', borderRadius: 2,
                        padding: '12px 15px'
                    }}>

                        <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                <Text large bold>Em Processo de Matrícula</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url('/icons/andamento_icon.png')`,
                                    transition: '.3s',
                                    width: 35, height: 35,
                                    aspectRatio: '1/1'
                                }} />
                            </Box>
                            <AnimatedNumbers value={reportIndicators?.emProcessoDeRequerimento || 0} />
                        </Box>

                        <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                <Text large bold>Aguardando Assinatura</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url('/icons/contrato_assinatura_icon.png')`,
                                    transition: '.3s',
                                    width: 35, height: 35,
                                    aspectRatio: '1/1'
                                }} />
                            </Box>
                            <AnimatedNumbers value={reportIndicators?.aguardandoAssinatura || 0} />
                        </Box>

                        <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                <Text large bold>Concluídas</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url('/icons/contract_icon.png')`,
                                    transition: '.3s',
                                    width: 35, height: 35,
                                    aspectRatio: '1/1'
                                }} />
                            </Box>
                            <AnimatedNumbers value={reportIndicators?.aguardandoInicio || 0} />
                        </Box>

                        <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                <Text large bold>Cursando</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url('/icons/andamento_icon.png')`,
                                    transition: '.3s',
                                    width: 35, height: 35,
                                    aspectRatio: '1/1'
                                }} />
                            </Box>
                            <AnimatedNumbers value={reportIndicators?.emAndamento || 0} />
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
            }

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
    filterSection: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}
