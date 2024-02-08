import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { icons } from "../../../organisms/layout/Colors"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatTimeStamp } from "../../../helpers"
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';


export default function StudentDetailsMEC(props) {
    const [tasksList, setTasksList] = useState([])
    const [responsibles, setResponsibles] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList, user, theme } = useAppContext()
    const [filters, setFilters] = useState({
        status: 'Finalizado',
        startDate: '',
        endDate: '',
        avaliation: 'com avaliacao'
    })
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filtersOrders, setFiltersOrders] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        status: (item) => filters.status === 'todos' || item.status_chamado === filters.status,
        avaliation: (item) => {
            if (filters.avaliation === 'todos') {
                return true;
            } else if (filters.avaliation === 'com avaliacao') {
                return item.avaliacao_nota > 0;
            } else {
                return item.avaliacao_nota === null;
            }
        },
        date: (item) => (filters?.startDate !== '' && filters?.endDate !== '') ? rangeDate(item.vencimento, filters?.startDate, filters?.endDate) : item,
    };
    const [showFilterMobile, setShowFilterMobile] = useState(false)

    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return date >= start && date <= end;
    }

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);
        const normalizedTituloChamado = normalizeString(item.titulo_chamado);
        const normalizedIdChamado = item?.id_chamado?.toString();

        return (
            normalizedTituloChamado?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) ||
            normalizedIdChamado?.includes(filterData.toString())
        ) && Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };




    useEffect(() => {
        fetchPermissions()
        getTasks();
        listUsers()
        if (window.localStorage.getItem('list-tasks-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-tasks-filters') || null);
            setFiltersOrders({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);

    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-tasks-filters', JSON.stringify({ filterName: filtersOrders.filterName, filterOrder: filtersOrders.filterOrder }));
    }, [filtersOrders])

    useEffect(() => {
        setShowFilterMobile(false)
    }, [filters])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;


    const sortTasks = () => {
        const { filterName, filterOrder } = filtersOrders;

        const sortedTasks = [...tasksList].sort((a, b) => {
            const valueA = filterName === 'id_chamado' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_chamado' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_chamado') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedTasks;
    }

    const getTasks = async () => {
        setLoading(true)
        try {
            const response = await api.get('/tasks/report/avaliation')
            const { data } = response;
            setTasksList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function listUsers() {
        try {
            const response = await api.get(`/users`)
            const { data } = response
            const groupResponsibles = [
                {
                    label: 'Todos',
                    value: 'todos'
                },
                ...data.map(responsible => ({
                    label: responsible.nome,
                    value: responsible?.id
                }))
            ];

            setResponsibles(groupResponsibles)
        } catch (error) {
            return error
        }
    }

    const column = [
        { key: 'id_chamado', label: '#Ticket' },
        { key: 'prioridade_chamado', label: 'Prioridade', task: true },
        { key: 'titulo_chamado', label: 'Título' },
        { key: 'autor', label: 'Autor' },
        { key: 'nome', label: 'Executor' },
        { key: 'status_chamado', label: 'Status' },
        { key: 'dt_criacao', label: 'Criado em', date: true },
        { key: 'dt_atualizacao', label: 'Atualizado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Em aberto', value: 'Em aberto' },
        { label: 'Em análise', value: 'Em análise' },
        { label: 'Finalizado', value: 'Finalizado' },
        { label: 'Pendente', value: 'Pendente' },
    ]

    const groupAvaliationFilter = [
        { label: 'Com avaliação', value: 'com avaliacao' },
        { label: 'Sem avaliação', value: 'sem avaliacao' },
        { label: 'Todos', value: 'todos' },
    ]

    const groupPriority = [
        { label: 'Todos', value: 'todos' },
        { label: 'Urgente', value: 'Urgente' },
        { label: 'Alta', value: 'Alta' },
        { label: 'Média', value: 'Média' },
        { label: 'Baixa', value: 'Baixa' },
    ]

    const groupAvaliation = [
        { label: '', value: 1 },
        { label: '', value: 2 },
        { label: '', value: 3 },
        { label: '', value: 4 },
        { label: '', value: 5 },
    ]

    let someAvaliations = tasksList?.filter(item => item.avaliacao_nota !== null)
    let qntAvaliations = someAvaliations?.length;
    let somaAvaliacoes = someAvaliations.reduce((acc, item) => acc + item.avaliacao_nota, 0);
    let mediaAvaliations = qntAvaliations > 0 ? (somaAvaliacoes / qntAvaliations).toFixed(1) : 0;

    const exportToExcel = () => {
        const headers = ['Ticket', 'Comentário', 'Avaliação', 'Data', 'Autor', 'Atendente'];

        const dataToExport = [
            headers,
            ...tasksList?.filter(filter)?.map(item => [
                item?.id_chamado,
                item?.avaliacao_comentario,
                item?.avaliacao_nota ? `nota: ${item.avaliacao_nota}` : 'Sem avaliação',
                formatTimeStamp(item?.dt_criacao, true) || '-',
                item?.autor || '-',
                item?.nome || 'Sem atendimento'
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Avaliações_chamados');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'avaliações_chamados.xlsx');
    };

    return (
        <>
            <SectionHeader
                title={`Área de Dados dos Alunos para MEC`}
            />

            <Box>
                <Box sx={{
                    display: 'flex', padding: '10px 20px',
                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                }}>
                    <Text>Prontuário do Aluno</Text>
                </Box>
            </Box>

        </>
    )
}

const TableReport = ({ data = [], groupAvaliation }) => {
    const { setLoading, colorPalette, userPermissions, menuItemsList, user } = useAppContext()

    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0, backgroundColor: colorPalette.primary, boxShadow: 'none', borderRadius: 2 }}>

            <div style={{ overflow: 'auto', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                            <th style={{ padding: '16px' }}><Text bold>#ticket</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Comentário</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Avaliação</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Data</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Autor</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Atendente</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, padding: 5, backgroundColor: colorPalette.secondary }}>
                        {
                            data?.map((item, index) => {
                                return (
                                    <tr key={`${item}-${index}`}>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.id_chamado}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.avaliacao_comentario}</Text>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                                            {item?.avaliacao_nota ?
                                                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', alignItems: 'center' }}>
                                                    {groupAvaliation?.map((star, index) => {
                                                        const complete = star?.value <= item?.avaliacao_nota ? true : false
                                                        return (
                                                            <Box key={index} sx={{
                                                                display: 'flex', justifyContent: 'center', alignItems: 'center'
                                                            }} >
                                                                <Box sx={{
                                                                    ...styles.menuIcon,
                                                                    width: 15,
                                                                    height: 15,
                                                                    aspectRatio: '1:1',
                                                                    backgroundImage: complete ? `url('/icons/star_complete_icon.png')` : `url('/icons/star_underline_icon.png')`,
                                                                    transition: '.3s',
                                                                    zIndex: 9999,
                                                                }} />
                                                            </Box>
                                                        )
                                                    })}
                                                </Box>
                                                : <Text>Sem avaliação</Text>}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_criacao, true) || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.autor || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text> {item?.nome || 'Sem atendimento'}</Text>
                                        </td>
                                    </tr>
                                );
                            })

                        }
                    </tbody>
                </table>
            </div>
        </ContentContainer>
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
