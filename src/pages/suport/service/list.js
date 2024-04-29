import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { Backdrop, TablePagination } from "@mui/material"
import { icons } from "../../../organisms/layout/Colors"

export default function ListServices(props) {
    const [servicesList, setServicesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const [filterService, setFilterService] = useState('todos')
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [firstRender, setFirstRender] = useState(true)
    const [filterAtive, setFilterAtive] = useState('todos')
    const [page, setPage] = useState(0);
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [filters, setFilters] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterService === 'todos') {
            return item?.nome_servico?.toLowerCase().includes(filterData?.toLowerCase())
        }
        else if (filterAtive === 'todos') {
            return item?.nome_servico?.toLowerCase().includes(filterData?.toLowerCase()) && (item.tipo_servico === filterService);
        } else {
            return item?.ativo === filterAtive && (item?.nome_servico?.toLowerCase().includes(filterData?.toLowerCase())) && (item.tipo_servico === filterService);
        }
    };

    useEffect(() => {
        fetchPermissions()
        getServices();
        if (window.localStorage.getItem('list-users-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-users-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);


    useEffect(() => {
        setShowFilterMobile(false)
    }, [filterService, filterAtive])

    const getServices = async () => {
        setLoading(true)
        try {
            const response = await api.get('/services')
            const { data } = response;
            setServicesList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-services-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortServices = () => {
        const { filterName, filterOrder } = filters;

        const sortedServices = [...servicesList].sort((a, b) => {
            const valueA = filterName === 'id_servico' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_servico' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_servico') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedServices;
    }


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const column = [
        { key: 'id_servico', label: 'ID' },
        { key: 'nome_servico', label: 'Serviço' },
        { key: 'fornecedor', label: 'Fornecedor(a)' },
        { key: 'dt_inicio_contrato', label: 'Inicio de Contrato', date: true },
        { key: 'dt_fim_contrato', label: 'Fim do Contrato', date: true }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const groupServices = [
        { label: 'Todos', value: 'todos' },
        { label: 'Serviços Gerais', value: 'Serviços Gerais' },
        { label: 'Software', value: 'Software' },
        { label: 'Domínio', value: 'Domínio' },
        { label: 'Servidor', value: 'Servidor' },
    ]

    return (
        <>
            <SectionHeader
                title={`Serviços (${servicesList.filter(filter)?.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/suport/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' }, justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <TextInput placeholder="Buscar por AutoDesk, Adobe..." name='filters' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <SelectList

                    data={groupServices}
                    valueSelection={filterService}
                    onSelect={(value) => setFilterService(value)}
                    title="serviço"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                    clean={false}
                />
                <SelectList

                    data={listAtivo}
                    valueSelection={filterAtive}
                    onSelect={(value) => setFilterAtive(value)}
                    title="status"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                    clean={false}
                />
            </Box>

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar por AutoDesk, Adobe..." name='filters' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={sortServices()?.filter(filter)?.length}
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
                                data={groupServices}
                                valueSelection={filterService}
                                onSelect={(value) => setFilterService(value)}
                                title="serviço"
                                filterOpition="value"
                                sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList
                                fullWidth
                                data={listAtivo}
                                valueSelection={filterAtive}
                                onSelect={(value) => setFilterAtive(value)}
                                title="status"
                                filterOpition="value"
                                sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilterAtive('todos')
                                setFilterService('todos')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {servicesList.length > 0 ?
                <Table_V1 data={servicesList?.filter(filter)} columns={column} columnId={'id_servico'} filters={filters} onPress={(value) => setFilters(value)} onFilter />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar nenhum Serviço Cadastrado</Text>
                </Box>
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
}
