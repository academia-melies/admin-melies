import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, Text, TextInput } from "../../../../../atoms"
import { SectionHeader, SelectList } from "../../../../../organisms"
import { api } from "../../../../../api/api"
import { useAppContext } from "../../../../../context/AppContext"
import { formatTimeStamp } from "../../../../../helpers"
import { CircularProgress } from "@mui/material"


export default function RequerimentList(props) {
    const [requeriments, setRequeriments] = useState([])
    const [filterData, setFilterData] = useState('')
    const [menuSelected, setMenuSelected] = useState('Em andamento')
    const { setLoading, colorPalette, alert, theme } = useAppContext()
    const [filters, setFilters] = useState({
        year: 2025,
        semestre: '1º Semestre',
        classId: 'todos',
        status: 'todos',
        name: ''
    })
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(0);
    const router = useRouter()
    const [loadingData, setLoadingData] = useState(false)

    const handleFiltered = async () => {
        if (filters?.year && filters?.semestre) {
            try {
                setLoadingData(true)
                await getRequeriments()
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoadingData(false)
            }
        } else {
            alert.info('Preencha o Ano e Semestre, antes de buscar.')
        }
    }


    const getRequeriments = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/requeriments/enrollment`, {
                params: {
                    year: filters?.year,
                    semestre: filters?.semestre,
                    status: filters?.status,
                    name: filters?.name,
                    page: page || 0, // exemplo
                    limit: limit || 20,    // exemplo
                }
            })
            const { data, total, totalPages, currentPage } = response.data
            console.log(data)
            setRequeriments(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const groupMonths = [
        { label: '1º Semestre', value: '1º Semestre' },
        { label: '2º Semestre', value: '2º Semestre' },
    ]

    const groupReenrollment = [
        { label: 'Matrícula', value: 'Matrícula' },
        { label: 'Rematrícula', value: 'Rematrícula' },
    ]

    const groupStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Em andamento', value: 'Em andamento' },
        { label: 'Aprovados', value: 'Aprovados' },
        { label: 'Reprovado', value: 'Reprovado' },
    ]


    const statusColor = (data) => ((data === 'Enviado para o aluno' && '#ffcc00') ||
        (data?.includes('Aguardando aprovação') && '#00008b') ||
        (data?.includes('Aprovado com ressalvas') && '#006400') ||
        (data?.includes('Aprovado') && '#006400') ||
        (data?.includes('Reprovado') && 'red'))


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'flex-start' }}>
            <SectionHeader
                title={`Requerimentos de Matrícula (${requeriments?.length})`}
            />

            {loadingData &&
                <Box sx={styles.loadingContainer}>
                    <CircularProgress />
                </Box>}

            <Box>
                <Box sx={{
                    ...styles.filterSection, gap: 1, width: 'auto'
                }}>

                    <TextInput
                    fullWidth
                        InputProps={{
                            style: { backgroundColor: colorPalette?.secondary, }
                        }}
                        placeholder="Buscar pelo nome"
                        name='filterData'
                        type="search"
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        value={filters?.name || ''}
                    />

                    <TextInput label="Ano:" name='year' onChange={(e) => setFilters({ ...filters, year: e.target.value })} type="number" value={filters?.year || ''} sx={{ maxWidth: 200 }}
                        InputProps={{
                            style: {
                                backgroundColor: colorPalette?.secondary,
                                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                            }
                        }} />

                    <SelectList clean={false} data={groupMonths} valueSelection={filters?.semestre} onSelect={(value) => setFilters({ ...filters, semestre: value })}
                        title="Semestre:" filterOpition="value"
                        sx={{
                            backgroundColor: colorPalette?.secondary,
                            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                            color: colorPalette.textColor, maxWidth: 280
                        }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList clean={false} data={groupStatus} valueSelection={filters?.status} onSelect={(value) => setFilters({ ...filters, status: value })}
                        title="Status:" filterOpition="value"
                        sx={{
                            backgroundColor: colorPalette?.secondary,
                            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                            color: colorPalette.textColor, maxWidth: 280
                        }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />

                    <Button text="Buscar" style={{ borderRadius: 2, width: 130 }} onClick={() => handleFiltered()} />
                </Box>
            </Box >


            {requeriments?.length > 0 ?
                <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', justifyContent: 'flex-start' }}>
                    {requeriments?.map((item, index) => {
                        const title = `#${item?.id_req_matricula} Requerimento - ${item?.nome}. ${item?.nome_curso}-${item?.modalidade_curso}${item?.nome_turma}_${item?.modulo_matricula}`;

                        return (
                            <Box key={index} sx={{
                                display: 'flex', padding: '25px',
                                position: 'relative',
                                borderRadius: 2,
                                backgroundColor: colorPalette.secondary,
                                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 2,
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer',
                                    transform: 'scale(1.1, 1.1)'
                                }

                            }} onClick={() => router.push(`/secretary/studentDetails/requeriments/student/${item?.id_req_matricula}`)}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 22, height: 22, aspectRatio: '1/1',
                                    backgroundImage: `url('/icons/folder_icon.png')`,
                                    transition: '.3s',
                                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',

                                }} />
                                <Box sx={{ display: 'flex', gap: .3, flexDirection: 'column', alignItems: 'start', justifyContent: 'flex-end' }}>
                                    <Text bold>{title}</Text>
                                    <Box sx={{ display: 'flex', gap: 4, marginTop: 1 }}>
                                        <Text xsmall light style={{ color: 'gray' }}><Text xsmall style={{ color: colorPalette?.buttonColor }}>Responsável por análisar: </Text>{item?.analisado_por || '-'}</Text>
                                        <Text xsmall light style={{ color: 'gray' }}><Text xsmall style={{ color: colorPalette?.buttonColor }}>Enviado em: </Text>{formatTimeStamp(item?.dt_criacao, true)}</Text>
                                        <Text xsmall light style={{ color: 'gray' }}><Text xsmall style={{ color: colorPalette?.buttonColor }}>Última atualização: </Text>{formatTimeStamp(item?.dt_atualizacao, true)}</Text>
                                    </Box>
                                </Box>

                                <Box sx={{
                                    display: 'flex', gap: 1, position: 'absolute', zIndex: 999, right: 5, top: -10,
                                    padding: '5px', borderRadius: 2, backgroundColor: colorPalette?.secondary, alignItems: 'center',
                                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                                }}>
                                    <Box sx={{
                                        display: 'flex', width: 10, height: '20px', backgroundColor: statusColor(item?.status)
                                    }} />
                                    <Text bold small >{item?.status}</Text>
                                </Box>
                            </Box>
                        )
                    })
                    }
                </Box>
                :
                <Box sx={{ display: 'flex', justifyContent: 'center', opacity: loadingData ? .6 : 1 }}>
                    <Box sx={styles.emptyData}>
                        <Text bold small light>Nenhum Dados.</Text>
                        <Text light large>Não foi possível encontrar requerimentos cadastrados.</Text>
                        <Box sx={styles.noResultsImage} />
                    </Box>
                </Box>
            }
        </Box>
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
    filterSection: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
    emptyData: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noResultsImage: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 350, height: 250,
        backgroundImage: `url('/background/no_results.png')`,
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        heigth: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
}
