import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { SectionHeader, SelectList } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Backdrop, Avatar } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors"
import { formatTimeStamp } from "../../../helpers"
import Link from "next/link"


export default function EssayWritingList(props) {
    const [writings, setWritings] = useState([])
    const [filterData, setFilterData] = useState('')
    const [menuSelected, setMenuSelected] = useState('Em andamento')
    const [showEditWritingGrade, setShowEditWritingGrade] = useState({ active: false, writing: {} })
    const [essayWritingData, setEssayWritingData] = useState({})
    const { setLoading, colorPalette, user, theme, alert } = useAppContext()
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        writingsVizualization: (item) => {
            if (menuSelected === 'Em andamento') {
                const isData = item?.corrigido !== 1
                return isData;
            } if (menuSelected === 'Aprovados') {
                return item?.corrigido === 1 && parseInt(item?.aprovado) === 1
            }
            if (menuSelected === 'Reprovados') {
                return item?.corrigido === 1 && parseInt(item?.aprovado) < 1
            } else {
                return true
            }
        }
    }




    const filter = (item) => {

        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };




    useEffect(() => {
        gerWritings();
    }, []);

    const gerWritings = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/redacao-online`)
            const { data } = response;
            console.log(data)
            setWritings(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprovedStatus = async () => {
        if (essayWritingData?.status_processo_sel && essayWritingData?.nt_redacao) {
            setLoading(true)
            try {
                let essayData = {
                    aprovado: essayWritingData?.status_processo_sel,
                    status_processo_sel: essayWritingData?.status_processo_sel,
                    nt_redacao: essayWritingData?.nt_redacao,
                    id_redacao: showEditWritingGrade?.writing?.id_redacao,
                    interesse_id: showEditWritingGrade?.writing?.interesse_id
                }
                const response = await api.patch(`/redacao-online/approved/status`, { essayData })

                if (response?.status === 200) {
                    alert.success('Nota lançada.')
                    setEssayWritingData({})
                    setShowEditWritingGrade({ active: false, writing: {} })
                    gerWritings()
                } else {
                    alert.error('Ocorreu um erro ao lançar nota. Tente novamente ou entre em contato com o Suporte.')
                }
                console.log(data)
                setWritings(data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        } else {
            alert.info('Preencha o campo de Nota e Status da redação antes de enviar.')
        }
    }



    const handleChange = (value) => {

        setEssayWritingData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
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

    const groupStatusProcess = [
        { label: 'Classificado', value: 'Classificado' },
        { label: 'Desclassificado', value: 'Desclassificado' },
        { label: 'Pendente', value: 'Pendente' },
    ]


    const statusColor = (data) => ((data === 'Enviado para o aluno' && '#ffcc00') ||
        (data?.includes('Aguardando aprovação') && '#00008b') ||
        (data?.includes('Aprovado com ressalvas') && '#006400') ||
        (data?.includes('Aprovado') && '#006400') ||
        (data?.includes('Reprovado') && 'red'))

    const handleBlurNota = (event) => {

        let nota = event.target.value;

        if (nota > 50) {
            setEssayWritingData({ ...essayWritingData, status_processo_sel: 'Classificado' })
            return
        }
        if (nota <= 50) {
            setEssayWritingData({ ...essayWritingData, status_processo_sel: 'Desclassificado' })
            return
        }
    }

    return (
        <>
            <SectionHeader
                title={`Redação Online - Correção`}
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

            {writings?.filter(filter)?.length > 0 ?
                <TableEssayWritings data={writings?.filter(filter)} setShowEditWritingGrade={setShowEditWritingGrade} showEditWritingGrade={showEditWritingGrade} />
                :
                <Text light>Não foi possível encontrar Redações cadastradas.</Text>}


            <Backdrop open={showEditWritingGrade?.active} sx={{ zIndex: 999, overflow: 'auto', }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text bold large>Lançar Nota no Sistema</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => {
                            setShowEditWritingGrade({ active: false, writing: {} })
                            setEssayWritingData({})
                        }} />
                    </Box>
                    <Divider padding={0} />
                    <Box sx={{ display: 'flex', gap: .5 }}>
                        <Text>Nome:</Text>
                        <Text bold>{showEditWritingGrade?.writing?.nome}</Text>
                    </Box>

                    <Box sx={{ display: 'flex', gap: .5 }}>
                        <Text>Curso:</Text>
                        <Text bold>{showEditWritingGrade?.writing?.nome_curso}</Text>
                    </Box>

                    <Box sx={{ display: 'flex', gap: .5 }}>
                        <Text>Realizada em:</Text>
                        <Text bold>{formatTimeStamp(showEditWritingGrade?.writing?.dt_realizacao, true)}</Text>
                    </Box>
                    <Divider padding={0} />

                    <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>
                        <TextInput placeholder='Nota da prova' name='nt_redacao'
                            type="number" onChange={handleChange}
                            onBlur={handleBlurNota}
                            value={essayWritingData?.nt_redacao || ''}
                            label='Nota da prova'
                            sx={{ flex: 1, }}
                        />
                        <SelectList fullWidth data={groupStatusProcess}
                            valueSelection={essayWritingData?.status_processo_sel} onSelect={(value) =>
                                setEssayWritingData({ ...essayWritingData, status_processo_sel: value })}
                            title="Status processo seletivo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button text="Lançar" small style={{ width: 120, height: 35 }} onClick={() => handleApprovedStatus()} />
                        <Button text="Cancelar" secondary small onClick={() => {
                            setShowEditWritingGrade({ active: false, writing: {} })
                            setEssayWritingData({})
                        }} style={{ width: 120, height: 35 }} />
                    </Box>
                </ContentContainer>
            </Backdrop>

        </>
    )
}




const TableEssayWritings = ({ data = [], filters = [], onPress = () => { },
    setShowEditWritingGrade, showEditWritingGrade }) => {
    const { setLoading, colorPalette, theme, user } = useAppContext()

    const columns = [
        { key: 'id_redacao', label: '#ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'nome_curso', label: 'Curso', task: true },
        { key: 'nivel_curso', label: 'Nível' },
        { key: 'modalidade_curso', label: 'Modalidade' },
        { key: 'periodo_interesse', label: 'Período', participants: true },
        { key: 'realizada', label: 'Realizada?' },
        { key: 'aprovado', label: 'Aprovado?' },
        { key: 'dt_realizacao', label: 'Realizada em', date: true },
        { key: 'actions', label: 'Ações' },

    ];

    const router = useRouter();

    const priorityColor = (data) => ((data === 'Alta' && 'yellow') ||
        (data === 'Urgente' && 'red') ||
        (data === 'Média' && 'green') ||
        (data === 'Baixa' && 'blue'))

    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0, backgroundColor: colorPalette.primary, boxShadow: 'none', borderRadius: 2 }}>

            <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                <Table sx={{ borderCollapse: 'collapse', width: '100%' }}>
                    <TableHead>
                        <TableRow sx={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                            {columns.map((column, index) => (
                                <TableCell key={index} sx={{ padding: '16px', }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text bold style={{ textAlign: 'center' }}>{column.label}</Text>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                            transform: filters?.filterName === column.key ? filters?.filterOrder === 'asc' ? 'rotate(-0deg)' : 'rotate(-180deg)' : 'rotate(-0deg)',
                                            transition: '.3s',
                                            width: 17,
                                            height: 17,

                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            },
                                        }}
                                            onClick={() => onPress({
                                                filterName: column.key,
                                                filterOrder: filters?.filterOrder === 'asc' ? 'desc' : 'asc'
                                            })} />
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ flex: 1, padding: 5, backgroundColor: colorPalette.secondary }}>
                        {
                            data?.map((item, index) => {
                                return (
                                    <TableRow key={`${item}-${index}`}>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.id_redacao || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '8px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '160px',
                                        }}>
                                            <Text>{item?.nome || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '8px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '160px',
                                        }}>
                                            <Text>{item?.nome_curso || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '15px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '180px',
                                        }}>
                                            <Text style={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                            }}>{item?.nivel_curso || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Text>{item?.modalidade_curso || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{item?.periodo_interesse || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.realizada === 1 ? 'Sim' : 'Não' || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{(item?.aprovado === 1 && 'Sim') || (item?.aprovado === 0 && 'Não') || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_realizacao, true) || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 2, }}>

                                                <Link href={`${process.env.NEXT_PUBLIC_REDACAO_URL}?key_writing_user=${item?.id_redacao}`} target="_blank">
                                                    <Box sx={{
                                                        display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                                                        padding: '6px 12px', borderRadius: 2, border: `1px solid ${colorPalette?.buttonColor}`,
                                                        transition: '.3s',
                                                        '&:hover': {
                                                            opacity: .7,
                                                            transform: 'scale(1.03, 1.03)'
                                                        }
                                                    }}>
                                                        <Box sx={{
                                                            ...styles.menuIcon,
                                                            width: 22, height: 22, aspectRatio: '1/1',
                                                            backgroundImage: `url('/icons/test_icon.png')`,
                                                            transition: '.3s',
                                                        }} />
                                                        <Text small bold style={{ color: colorPalette?.buttonColor }}>Ver prova</Text>
                                                    </Box>
                                                </Link>

                                                {item?.aprovado === 1 ?
                                                    <Box sx={{
                                                        display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                                                        padding: '6px 12px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor,
                                                        transition: '.3s',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            opacity: .7,
                                                            transform: 'scale(1.03, 1.03)'
                                                        }
                                                    }} onClick={() => window.open(`/administrative/users/${item?.usuario_id}`, '_target')}>
                                                        <Box sx={{
                                                            ...styles.menuIcon,
                                                            width: 22, height: 22, aspectRatio: '1/1',
                                                            backgroundImage: `url('/icons/grade_icon.png')`,
                                                            transition: '.3s',
                                                        }} />
                                                        <Text small bold style={{ color: '#fff' }}>Vizualizar nota</Text>
                                                    </Box>

                                                    : <Box sx={{
                                                        display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                                                        padding: '6px 12px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor,
                                                        transition: '.3s',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            opacity: .7,
                                                            transform: 'scale(1.03, 1.03)'
                                                        }
                                                    }} onClick={() => setShowEditWritingGrade({ active: true, writing: item })}>
                                                        <Box sx={{
                                                            ...styles.menuIcon,
                                                            width: 22, height: 22, aspectRatio: '1/1',
                                                            backgroundImage: `url('/icons/grade_icon.png')`,
                                                            transition: '.3s',
                                                        }} />
                                                        <Text small bold style={{ color: '#fff' }}>Dar nota</Text>
                                                    </Box>}

                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })

                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </ContentContainer >
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
