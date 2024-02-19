import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../../../atoms"
import { SectionHeader } from "../../../../../organisms"
import { api } from "../../../../../api/api"
import { useAppContext } from "../../../../../context/AppContext"


export default function RequerimentList(props) {
    const [requeriments, setRequeriments] = useState([])
    const [filterData, setFilterData] = useState('')
    const [menuSelected, setMenuSelected] = useState('Em andamento')
    const { setLoading, colorPalette, user, theme } = useAppContext()
    const [filters, setFilters] = useState({
        status: 'Finalizado',
        startDate: '',
        endDate: '',
        avaliation: 'com avaliacao'
    })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        requerimentsVizualization: (item) => {
            if (menuSelected === 'Em andamento') {
                const isData = item?.aprovado === null
                return isData;
            } else if (menuSelected === 'Aprovados') {
                return item?.aprovado === 1
            }
            else if (menuSelected === 'Reprovados') {
                return parseInt(item?.aprovado) < 1
            } else {
                return true
            }
        }
    }


    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);
        const normalizedTituloChamado = normalizeString(item.nome_curso);

        return (
            normalizedTituloChamado?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
        ) && Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };




    useEffect(() => {
        getRequeriments();
    }, []);

    const getRequeriments = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/requeriments`)
            const { data } = response;
            setRequeriments(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const menuUserStudent = [
        { id: '01', icon: '/icons/folder_icon.png', text: 'Meu Prontuário', to: '', query: true },
        {
            id: '02', icon: '/icons/folder_icon.png', text: 'Requerimento de Matrícula', to: `/documents/requerimentEnrollment?userId=2&classId=10&moduleEnrollment=1&courseId=5`,
            query: true
        },

    ]

    const menusFilters = [
        { id: '01', text: 'Em andamento', value: 'Em andamento' },
        { id: '02', text: 'Aprovados', value: 'Aprovados' },
        { id: '03', text: 'Reprovado', value: 'Reprovados' },
    ]


    const statusColor = (data) => ((data === 'Enviado para o aluno' && '#ffcc00') ||
        (data?.includes('Aguardando aprovação') && '#00008b') ||
        (data?.includes('Aprovado com ressalvas') && '#8b0000') ||
        (data?.includes('Aprovado aprovação') && '#006400'))


    return (
        <>
            <SectionHeader
                title={`Requerimentos de Matrícula`}
            />

            <Box sx={{ display: 'flex', alignItems: 'end' }}>
                <Text light style={{ marginRight: 10 }}>vizualizar por:</Text>
                {menusFilters?.map((item, index) => {
                    const menu = item?.value === menuSelected;
                    return (
                        <Box key={index} sx={{
                            display: 'flex',
                            padding: '5px 28px',
                            backgroundColor: menu ? colorPalette.buttonColor : colorPalette.primary,
                            borderTop: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                            borderRight: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                            borderLeft: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                            // transition: 'border-bottom 0.1s ease-in-out',
                            transition: 'backdround-color 0.1s ease-in-out',
                            "&:hover": {
                                opacity: !menu && 0.8,
                                cursor: 'pointer'
                            },
                            borderRadius: '5px 5px 0px 0px',
                            boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                            position: 'relative'
                        }} onClick={() => {
                            setMenuSelected(item?.value)
                        }}>
                            <Text large style={{ color: menu ? '#fff' : colorPalette.textColor }}>{item?.text}</Text>
                        </Box>
                    )
                })}
            </Box>

            {requeriments?.filter(filter)?.length > 0 ? <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', maxWidth: 800 }}>
                {requeriments?.filter(filter)?.map((item, index) => {
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
                            <Text bold>{title}</Text>
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
            </Box> :
                <Text light>Não foi possível encontrar requerimentos cadastrados.</Text>}

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
}
