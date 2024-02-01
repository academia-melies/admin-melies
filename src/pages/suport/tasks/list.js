import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { icons } from "../../../organisms/layout/Colors"

export default function ListTasks(props) {
    const [tasksList, setTasksList] = useState([])
    const [responsibles, setResponsibles] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList, user, theme } = useAppContext()
    const [filters, setFilters] = useState({
        responsible: 'todos',
        status: 'Em aberto, Pendente, Em análise',
        priority: 'todos',
        participant: 'todos',
        actor: 'todos',
        type: 'todos',
    })
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filtersOrders, setFiltersOrders] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [menuSelected, setMenuSelected] = useState('Atríbuidos a mim')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        responsible: (item) => filters.responsible === 'todos' || item.responsavel_chamado === filters.responsible,
        status: (item) => filters.status === 'todos' || filters.status?.includes(item?.status_chamado),
        priority: (item) => filters.priority === 'todos' || item.prioridade_chamado === filters.priority,
        actor: (item) => filters.actor === 'todos' || item.autor === filters.actor,
        type: (item) => filters.type === 'todos' || item.tipo_chamado === filters.type,
        taskVizualization: (item) => {
            if (menuSelected === 'Atríbuidos a mim') {
                return item.responsavel_chamado === user?.id
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
            let query;
            if (user?.area === "TI - Suporte") {
                query = '/tasks';
                setFilters({ ...filters, status: 'Em aberto, Pendente, Em análise' })
            } else {
                query = `/task/user/${user?.id}`;
                setFilters({ ...filters, status: 'Em aberto, Pendente, Em análise' })
            }
            const response = await api.get(query)
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
        { key: 'area', label: 'Para Área' },
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

    const menusFilters = [
        { id: '01', text: 'Atríbuidos a mim', value: 'Atríbuidos a mim' },
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
                <CheckBoxComponent disabled={!isPermissionEdit && true}
                    boxGroup={listStatus}
                    valueChecked={filters?.status || null}
                    horizontal={true}
                    onSelect={(value) => {
                        setFilters({ ...filters, status: value })
                    }}
                    sx={{ width: 1 }} />
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

            <Table_V1 data={sortTasks().filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_chamado'} columnActive={false} filters={filtersOrders} onPress={(value) => setFiltersOrders(value)} onFilter targetBlank />
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
