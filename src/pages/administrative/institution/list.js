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

export default function ListInstitution(props) {
    const [institutionList, setInstitutionList] = useState([])
    const [filters, setFilters] = useState({
        status: 'todos'
    })
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filtersOrders, setFiltersOrders] = useState({
        filterName: 'nome_instituicao',
        filterOrder: 'asc'
    })
    const router = useRouter()
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showFilterMobile, setShowFilterMobile] = useState(false)

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
    const filterFunctions = {
        status: (item) => filters.status === 'todos' || item.ativo === filters.status,
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };

    useEffect(() => {
        fetchPermissions()
        getInstitution();
        if (window.localStorage.getItem('list-institution-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-institution-filters') || null);
            setFiltersOrders({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);



    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-institution-filters', JSON.stringify({ filterName: filtersOrders.filterName, filterOrder: filtersOrders.filterOrder }));
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


    const sortInstitution = () => {
        const { filterName, filterOrder } = filtersOrders;

        const sortedInstitution = [...institutionList].sort((a, b) => {
            const valueA = filterName === 'id_instituicao' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_instituicao' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_instituicao') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedInstitution;
    }

    const getInstitution = async () => {
        setLoading(true)
        try {
            const response = await api.get('/institutions')
            const { data = [] } = response;
            setInstitutionList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_instituicao', label: 'ID' },
        { key: 'mantenedora', label: 'Mantenedora' },
        { key: 'cnpj', label: 'CNPJ' },
        { key: 'mantida', label: 'Mantida' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Instituições (${institutionList?.filter(filter)?.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{institutionList?.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{institutionList?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>chamados</Text>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextInput placeholder="Buscar por instituição" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                    <SelectList
                        fullWidth
                        data={listAtivo}
                        valueSelection={filters?.status}
                        onSelect={(value) => setFilters({ ...filters, status: value })}
                        title="Status"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120 }} onClick={() => setFilters({
                            status: 'todos'
                        })} />
                    </Box>
                    <TablePagination
                        component="div"
                        count={institutionList?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />
                </Box>
            </ContentContainer >

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar pelo nome.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{
                    flex: 1,
                }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={institutionList?.filter(filter)?.length}
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
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, alignItems: 'start', flexDirection: 'column' }}>
                            <SelectList
                                fullWidth
                                data={listAtivo}
                                valueSelection={filters?.status}
                                onSelect={(value) => setFilters({ ...filters, status: value })}
                                title="Status"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => () => setFilters({
                                status: 'todos'
                            })} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {institutionList?.length >= 1 ?
                <Table_V1 data={sortInstitution()?.filter(filter)} columns={column} columnId={'id_instituicao'} filters={filtersOrders} onPress={(value) => setFiltersOrders(value)} onFilter />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não consegui encontrar instituições cadastradas</Text>
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
