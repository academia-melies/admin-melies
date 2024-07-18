import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, PaginationTable, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { icons } from "../../../organisms/layout/Colors"
import { formatTimeStamp } from "../../../helpers"
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import Link from "next/link"
import { Divide } from "hamburger-react"

export default function ListTasks(props) {
    const [tasksList, setTasksList] = useState([])
    const [responsibles, setResponsibles] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList, user, theme } = useAppContext()
    const [filters, setFilters] = useState({
        responsible: 'todos',
        status: 'Em aberto, Em análise',
        priority: 'todos',
        participant: 'todos',
        actor: 'todos',
        type: 'todos',
    })
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [vizualizedForm, setVizualizedForm] = useState({
        cards: false,
        list: true
    })
    const [filtersOrders, setFiltersOrders] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [menuSelected, setMenuSelected] = useState('Atribuídos a mim')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        responsible: (item) => filters.responsible === 'todos' || item.responsavel_chamado === filters.responsible,
        status: (item) => filters.status?.includes('todos') || filters.status?.includes(item?.status_chamado),
        priority: (item) => filters.priority === 'todos' || item.prioridade_chamado === filters.priority,
        actor: (item) => filters.actor === 'todos' || item.autor === filters.actor,
        type: (item) => filters.type === 'todos' || item.tipo_chamado === filters.type,
        taskVizualization: (item) => {
            if (menuSelected === 'Atribuídos a mim') {
                const isResponsible = item.responsavel_chamado === user?.id;
                const isParticipant = item?.participantes?.some(participante => participante.id_participante === user?.id);

                return isResponsible || isParticipant;
            } else if (menuSelected === 'Abertos por mim') {
                return item.autor_chamado === user?.id
            }
            else if (menuSelected === 'Pendente de responsável') {
                return item.responsavel_chamado === null
            } else {
                return true
            }
        }
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
        ) && (Object.values(filterFunctions).every(filterFunction => filterFunction(item)));
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
            setFilters({ ...filters, status: 'Em aberto, Em análise' })
            const response = await api.get('/tasks')
            const { data } = response;
            const dataFiltered = data?.filter(item => item?.area === user?.area)
            setTasksList(dataFiltered)
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



    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Em aberto', value: 'Em aberto' },
        { label: 'Em análise', value: 'Em análise' },
        { label: 'Finalizado', value: 'Finalizado' }
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

    const menusFilters = [
        { id: '01', text: 'Atribuídos a mim', value: 'Atribuídos a mim' },
        { id: '01', text: 'Abertos por mim', value: 'Abertos por mim' },
        { id: '02', text: `Chamados da Área`, value: `Chamados da Área` },
        { id: '01', text: 'Pendente de responsável', value: 'Pendente de responsável' },
    ]


    return (
        <>
            <SectionHeader
                // title={`Chamados (${tasksList?.length || '0'})`}
                title={`Chamados (${tasksList?.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/suport/${pathname}/new`)}
            />

            <Box sx={{ display: 'flex', position: 'absolute', top: 130, right: 60 }}>
                <Button text="Novo" style={{ width: 130 }} onClick={() => router.push(`/suport/${pathname}/new`)} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'end' }}>
                <Text light style={{ marginRight: 10 }}>visualizar por:</Text>
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
                            {item.value === "Pendente de responsável" && <Box sx={{
                                display: 'flex', padding: '2px 5px', backgroundColor: 'red', opacity: 0.8,
                                position: 'absolute', top: -15, right: -15, borderRadius: 2, zIndex: 999
                            }}>
                                <Text xsmall style={{ color: '#fff' }}>IMPORTANTE</Text>
                            </Box>}
                            <Text large style={{ color: menu ? '#fff' : colorPalette.textColor }}>{item?.text}</Text>
                        </Box>
                    )
                })}
            </Box>

            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{tasksList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{tasksList?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>chamados</Text>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextInput placeholder="Buscar pelo nome ou numero do chamado" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                    <SelectList
                        fullWidth
                        data={groupPriority}
                        valueSelection={filters?.priority}
                        onSelect={(value) => setFilters({ ...filters, priority: value })}
                        title="Prioridade"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={groupType}
                        valueSelection={filters?.type}
                        onSelect={(value) => setFilters({ ...filters, type: value })}
                        title="Tipo"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={responsibles}
                        valueSelection={filters?.responsible}
                        onSelect={(value) => setFilters({ ...filters, responsible: value })}
                        title="Executor"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    {/* <SelectList
                        fullWidth
                        data={listStatus}
                        valueSelection={filters?.status}
                        onSelect={(value) => setFilters({ ...filters, status: value })}
                        title="Status"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    /> */}
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120 }} onClick={() => setFilters({
                            responsible: 'todos',
                            status: 'todos',
                            priority: 'todos',
                            participant: 'todos',
                            actor: 'todos',
                            type: 'todos'
                        })} />
                    </Box>
                    {vizualizedForm?.cards && <TablePagination
                        component="div"
                        count={sortTasks()?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                        boxGroup={listStatus}
                        valueChecked={filters?.status || null}
                        horizontal={true}
                        onSelect={(value) => {
                            setFilters({ ...filters, status: value })
                        }}
                        sx={{ width: 1 }} />

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                        <Text bold xsmall>Vizualizar como: </Text>
                        <Tooltip title="Card/Grade">
                            <div>
                                <Box sx={{
                                    display: 'flex',
                                    backgroundColor: vizualizedForm?.cards && colorPalette?.primary,
                                    transform: vizualizedForm?.cards && 'scale(1.2, 1.2)',
                                    transition: '.2s',
                                    borderRadius: 2,
                                    padding: '5px',
                                    "&:hover": {
                                        cursor: 'pointer',
                                        backgroundColor: colorPalette?.primary + '66',
                                    },
                                }} onClick={() => setVizualizedForm({ cards: true, list: false })} >
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url('/icons/icon_card.png')`,
                                        transition: '.3s',
                                        width: 22,
                                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                        height: 22,
                                        "&:hover": {
                                            opacity: 0.8,
                                            cursor: 'pointer'
                                        },
                                    }}
                                    />
                                </Box>
                            </div>
                        </Tooltip>
                        <Tooltip title="Lista/Tabela">
                            <div>
                                <Box sx={{
                                    display: 'flex',
                                    backgroundColor: vizualizedForm?.list && colorPalette?.primary,
                                    transform: vizualizedForm?.list && 'scale(1.2, 1.2)',
                                    transition: '.2s',
                                    borderRadius: 2,
                                    padding: '5px',
                                    "&:hover": {
                                        cursor: 'pointer',
                                        backgroundColor: colorPalette?.primary + '66',
                                    },
                                }} onClick={() => setVizualizedForm({ cards: false, list: true })}>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                        backgroundImage: `url('/icons/icon_list.png')`,
                                        transition: '.3s',
                                        width: 22,
                                        height: 22,
                                        "&:hover": {
                                            opacity: 0.8,
                                            cursor: 'pointer'
                                        },
                                    }}
                                    />
                                </Box>
                            </div>
                        </Tooltip>
                    </Box>
                </Box>

            </ContentContainer >

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


            <Backdrop open={showFilterMobile} sx={{ zIndex: 999, width: '100%' }}>
                <ContentContainer sx={{ height: '100%', position: 'absolute', marginTop: 18, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                        <Text bold large>Filtros</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowFilterMobile(false)} />
                    </Box>
                    <Divider padding={0} />
                    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'start', flexDirection: 'column', position: 'relative', }}>
                        <Box sx={{
                            display: 'flex', gap: 2, alignItems: 'start', flexDirection: 'column', width: '100%',
                        }}>
                            <SelectList
                                fullWidth
                                data={groupPriority}
                                valueSelection={filters?.priority}
                                onSelect={(value) => setFilters({ ...filters, priority: value })}
                                title="Prioridade"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList
                                fullWidth
                                data={groupType}
                                valueSelection={filters?.type}
                                onSelect={(value) => setFilters({ ...filters, type: value })}
                                title="Tipo"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList
                                fullWidth
                                data={responsibles}
                                valueSelection={filters?.responsible}
                                onSelect={(value) => setFilters({ ...filters, responsible: value })}
                                title="Executor"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList
                                fullWidth
                                data={listStatus}
                                valueSelection={filters?.status}
                                onSelect={(value) => setFilters({ ...filters, status: value })}
                                title="Status"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => setFilters({
                                responsible: 'todos',
                                status: 'todos',
                                priority: 'todos',
                                participant: 'todos',
                                actor: 'todos',
                                type: 'todos'
                            })} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>
            {vizualizedForm?.list &&
                <TableReport
                    data={sortTasks().filter(filter)}
                    filters={filtersOrders} onPress={(value) => setFiltersOrders(value)}
                />
            }
            {vizualizedForm?.cards &&
                <CardReport
                    vizualizedForm={vizualizedForm}
                    data={sortTasks().filter(filter).slice(startIndex, endIndex)}
                    filters={filtersOrders} onPress={(value) => setFiltersOrders(value)}
                />
            }
            {/* <Table_V1 data={sortTasks().filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_chamado'} columnActive={false} filters={filtersOrders} onPress={(value) => setFiltersOrders(value)} onFilter targetBlank /> */}
        </>
    )
}


const TableReport = ({ data = [], filters = [], onPress = () => { } }) => {
    const { setLoading, colorPalette, theme, user } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    console.log(data)

    const columns = [
        { key: 'id_chamado', label: '#Ticket' },
        { key: 'area', label: 'Para Área' },
        { key: 'prioridade_chamado', label: 'Prioridade', task: true },
        { key: 'titulo_chamado', label: 'Título' },
        { key: 'autor', label: 'Autor' },
        { key: 'nome', label: 'Atendente', participants: true },
        { key: 'status_chamado', label: 'Status' },
        { key: 'dt_criacao', label: 'Criado em', date: true },
        { key: 'dt_atualizacao', label: 'Atualizado em', date: true },

    ];

    const router = useRouter();
    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const handleRowClick = (id) => {
        window.open(`/suport/tasks/${id}`, '_blank');
        return;
    };

    const priorityColor = (data) => ((data === 'Alta' && 'yellow') ||
        (data === 'Urgente' && 'red') ||
        (data === 'Média' && 'green') ||
        (data === 'Baixa' && 'blue'))

    return (
        <ContentContainer sx={{
            display: 'flex', width: '100%', padding: 0, backgroundColor: colorPalette.secondary, boxShadow: 'none', borderRadius: 2,
            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
        }}>

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
                            data?.slice(startIndex, endIndex)?.map((item, index) => {
                                return (
                                    <TableRow key={`${item}-${index}`} onClick={() => handleRowClick(item?.id_chamado)} sx={{
                                        "&:hover": {
                                            cursor: 'pointer',
                                            backgroundColor: colorPalette.primary + '88'
                                        },
                                    }}>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.id_chamado || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '8px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '160px',
                                        }}>
                                            <Text>{item?.area || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    backgroundColor: colorPalette.primary,
                                                    height: 30,
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    // width: 100,
                                                    borderRadius: 2,
                                                    justifyContent: 'start',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.prioridade_chamado), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                <Text small bold>{item?.prioridade_chamado}</Text>
                                            </Box>
                                        </TableCell>
                                        <Tooltip title={item?.titulo_chamado}>
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
                                                }}>{item?.titulo_chamado || '-'}</Text>
                                            </TableCell>
                                        </Tooltip>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Text>{item?.autor || '-'}</Text>
                                        </TableCell>
                                        <Tooltip title={item?.participantes?.map(participante => participante.nome_participante).join(', ')}>
                                            <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                    <Text>{item?.atendente || '-'}</Text>
                                                    {item?.participantes?.length > 0 &&
                                                        <Text xsmall style={{ color: 'darkgray' }}>+{item?.participantes?.length} Participantes</Text>
                                                    }
                                                </Box>
                                            </TableCell>
                                        </Tooltip>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.status_chamado || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_criacao, true) || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_atualizacao, true) || '-'}</Text>
                                        </TableCell>
                                    </TableRow>
                                );
                            })

                        }
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationTable data={data}
                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
            />
        </ContentContainer >
    )
}


const CardReport = ({ data = [], vizualizedForm }) => {
    const { setLoading, colorPalette, theme, user } = useAppContext()
    const [visibleCards, setVisibleCards] = useState(0);

    const router = useRouter();
    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const handleRowClick = (id) => {
        window.open(`/suport/tasks/${id}`, '_blank');
        return;
    };

    const priorityColor = (data) => ((data === 'Alta' && 'yellow') ||
        (data === 'Urgente' && 'red') ||
        (data === 'Média' && 'green') ||
        (data === 'Baixa' && 'blue'))


    const statusColor = (data) => ((data === 'Em aberto' && 'yellow') ||
        (data === 'Pendente' && 'red') ||
        (data === 'Finalizado' && 'green') ||
        (data === 'Em análise' && 'blue'))


    useEffect(() => {
        // Adicionando atraso para simular o efeito de carregamento
        const delay = 80; // Ajuste conforme necessário

        const showCard = (index) => {
            setTimeout(() => {
                setVisibleCards(index + 1);
            }, (index + 1) * delay);
        };

        // Mostrando os cards gradualmente
        data.forEach((item, index) => {
            showCard(index);
        });

        // Simulando o fim do carregamento após todos os cards serem exibidos
        setTimeout(() => {
        }, (data.length + 1) * delay); // +1 para garantir tempo suficiente após o último card
    }, [data]);

    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0, backgroundColor: colorPalette.primary, boxShadow: 'none', borderRadius: 2 }}>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: vizualizedForm?.cards ? 'wrap' : 'nowrap', transition: 'opacity 1s ease-in-out', }}>
                {data?.map((item, index) => {
                    return (
                        <Box key={index} sx={{
                            display: 'flex',
                            gap: 3,
                            flexDirection: 'column',
                            width: 350,
                            padding: '30px 20px',
                            backgroundColor: colorPalette?.secondary,
                            borderRadius: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer',
                                transition: '.3s',
                                backgroundColor: colorPalette?.secondary + '88'
                            },
                            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                            opacity: index < visibleCards ? 1 : 0,
                            transition: `opacity 0.5s ease-in-out`,
                        }}
                            onClick={() => handleRowClick(item?.id_chamado)}
                        >


                            <Box
                                sx={{
                                    display: 'flex',
                                    backgroundColor: colorPalette.primary,
                                    height: 30,
                                    gap: 2,
                                    alignItems: 'center',
                                    maxWidth: 150,
                                    borderRadius: 2,
                                    justifyContent: 'start',
                                }}
                            >
                                <Box sx={{ display: 'flex', backgroundColor: statusColor(item?.status_chamado), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                <Text small bold>{item?.status_chamado}</Text>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                                <Text xsmall bold>Aberto por:</Text>
                                <Text xsmall>{item?.autor}</Text>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', padding: '20px', border: `1px solid ${theme ? '#eaeaea' : '#404040'}` }}>

                                <Text bold>{item?.titulo_chamado}</Text>

                                <Box sx={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    maxHeight: '50px',
                                }}>
                                    <Text small style={{
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'wrap',
                                        maxHeight: 60,
                                        overflow: 'hidden',
                                    }}>{item?.descricao_chamado}</Text>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Text small bold>Prioridade: </Text>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        backgroundColor: colorPalette.primary,
                                        height: 30,
                                        gap: 2,
                                        alignItems: 'center',
                                        // width: 100,
                                        borderRadius: 2,
                                        justifyContent: 'start',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.prioridade_chamado), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                    <Text small bold>{item?.prioridade_chamado}</Text>
                                </Box>
                            </Box>

                            <Divider distance={0} />
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                                    <Text xsmall bold>criado:</Text>
                                    <Text xsmall>{formatTimeStamp(item?.dt_criacao, true) || '-'}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                                    <Text xsmall bold>atualizado:</Text>
                                    <Text xsmall>{formatTimeStamp(item?.dt_atualizacao, true) || '-'}</Text>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
                                <Text small bold>para:</Text>
                                <Text small>{item?.atendente}</Text>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
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
