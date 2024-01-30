import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
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


export default function ReportAvaliations(props) {
    const [tasksList, setTasksList] = useState([])
    const [responsibles, setResponsibles] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList, user, theme } = useAppContext()
    const [filters, setFilters] = useState({
        status: 'Finalizado',
        startDate: '',
        endDate: ''
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

    const groupType = [
        { label: 'Todos', value: 'todos' },
        { label: 'Solicitação', value: 'Solicitação' },
        { label: 'Alteração', value: 'Alteração' },
        { label: 'Erro', value: 'Erro' },
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

    let someAvaliations = tasksList?.map(item => item.avaliacao_nota)?.reduce((acc, curr) => acc + curr, 0)
    let qntAvaliations = tasksList?.map(item => item.avaliacao_nota)?.length
    let mediaAvaliations = parseFloat(someAvaliations / qntAvaliations).toFixed(1)

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
                // title={`Chamados (${tasksList?.length || '0'})`}
                title={`Relatório de Avaliacões (${tasksList?.filter(filter)?.length || '0'})`}
            />

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar pelo nome ou numero do chamado" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={sortTasks()?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Items"
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />
                </Box>
                <Divider distance={0} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' } }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around', alignItems: 'center' }}>
                        <Text bold indicator>{mediaAvaliations || 0}</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url('/icons/star_complete_icon.png')`,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                    </Box>

                    <Text light>Média de Avaliação</Text>
                </ContentContainer>
                <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around', alignItems: 'center' }}>
                        <Text bold indicator>{qntAvaliations}</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 20,
                            height: 20,
                            backgroundImage: `url('/icons/arrow_up_green_icon.png')`,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                    </Box>

                    <Text light>Quantidade Avaliação</Text>
                </ContentContainer>
                <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around', alignItems: 'center' }}>
                        <Text bold indicator>{tasksList?.length}</Text>
                        <CheckCircleIcon style={{ color: 'green', fontSize: 25 }} />
                    </Box>
                    <Text light>Chamados Resolvidos</Text>
                </ContentContainer>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextInput placeholder="Buscar pelo numero do chamado" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />

                <Box sx={{ display: 'flex', gap: 2, padding: '20px 0px' }}>
                    <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} />
                    <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', width: '100%' }}>
                    <Button secondary text="Limpar" small style={{ width: 120, height: '30px' }} onClick={() => {
                        setFilters({
                            status: 'Finalizado',
                            startDate: '',
                            endDate: ''
                        })
                        setFilterData('')
                    }} />
                </Box>
            </Box>


            <Backdrop open={showFilterMobile} sx={{ zIndex: 999, width: '100%' }}>
                <ContentContainer sx={{ height: '100%', position: 'absolute', marginTop: 18, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                        <Text bold large>Filtros</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 9999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowFilterMobile(false)} />
                    </Box>
                    <Divider padding={0} />
                    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'start', flexDirection: 'column', position: 'relative', }}>
                        <Box sx={{
                            display: 'flex', gap: 2, alignItems: 'start', flexDirection: 'row', width: '100%',
                        }}>
                            <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} />
                            <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilters({
                                    status: 'Finalizado',
                                    startDate: '',
                                    endDate: ''
                                })
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' }, justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Text bold>Exportar relatório: </Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        width: 20,
                        height: 20,
                        backgroundImage: `url('/icons/sheet.png')`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => exportToExcel()} />
                </Box>
                <Box sx={{ display: 'flex', height: 30, width: 2, backgroundColor: theme ? '#eaeaea' : '#404040' }} />
                <TablePagination
                    component="div"
                    count={sortTasks()?.filter(filter)?.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    style={{ color: colorPalette.textColor }} // Define a cor do texto
                    backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                    nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                />
            </Box>
            <TableReport data={sortTasks().filter(filter).slice(startIndex, endIndex)} groupAvaliation={groupAvaliation} />
            {/* <Table_V1 data={sortTasks().filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_chamado'} columnActive={false} filters={filtersOrders} onPress={(value) => setFiltersOrders(value)} onFilter targetBlank /> */}

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
