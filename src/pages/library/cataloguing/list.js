import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getDisciplines, getdisciplines, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import axios from "axios"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { icons } from "../../../organisms/layout/Colors"

export default function CatalogList(props) {
    const [cataloguesList, setCataloguesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const router = useRouter()
    const [filtersOrder, setFiltersOrder] = useState({
        filterName: 'nome_curso',
        filterOrder: 'asc'
    })
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        type: 'todos',
        category: 'todos',
        status: 'todos',
    })
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
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        type: (item) => filters.type === 'todos' || item.tipo_material === filters.type,
        category: (item) => filters.category === 'todos' || item.categoria === filters.category,
        status: (item) => filters.status === 'todos' || item.ativo === filters.status,
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };

    const getCatalogues = async () => {
        setLoading(true)
        try {
            const response = await api.get('/catalogues')
            const { data } = response;
            if (response?.status === 200) {
                setCataloguesList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchPermissions()
        getCatalogues();
        if (window.localStorage.getItem('list-catalog-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-catalog-filters') || null);
            setFiltersOrder({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);


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


    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-catalog-filters', JSON.stringify({ filterName: filtersOrder.filterName, filterOrder: filtersOrder.filterOrder }));
    }, [filtersOrder])


    const sortMaterials = () => {
        const { filterName, filterOrder } = filtersOrder;

        const sortedMaterials = [...cataloguesList].sort((a, b) => {
            const valueA = filterName === 'id_material' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_material' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_material') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedMaterials;
    }

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const column = [
        { key: 'id_material', label: 'ID' },
        { key: 'tipo_material', label: 'Tipo' },
        { key: 'titulo', label: 'Título' },
        { key: 'categoria', label: 'Categoria' },
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const groupMaterials = [
        { label: 'Livros | Obra de Referência', value: 'Livros | Obra de Referência' },
        { label: 'DVDs | Áudio | CD-ROM', value: 'DVDs | Áudio | CD-ROM' },
        { label: 'Periódicos (Revistas | Gibis | Mangás | Folhetos)', value: 'Periódicos (Revistas | Gibis | Mangás | Folhetos)' },
        { label: 'Todos', value: 'todos' },

    ]

    const groupCategory = (value) => {
        let data;
        if (value === 'Livros | Obra de Referência') {
            data = [
                { label: 'Livro', value: 'Livro' },
                { label: 'Obra de Referência', value: 'Obra de Referência' },
                { label: 'Anuários', value: 'Anuários' },
                { label: 'Guías', value: 'Guías' },
                { label: 'Folhetos', value: 'Folhetos' },
                { label: 'Todos', value: 'todos' },

            ];
            return data
        }
        if (value === 'DVDs | Áudio | CD-ROM') {
            data = [
                { label: 'DVDs', value: 'DVDs' },
                { label: 'Áudio', value: 'Áudio' },
                { label: 'CD-ROM', value: 'CD-ROM' },
                { label: 'Todos', value: 'todos' },

            ];
            return data
        }
        if (value === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)') {
            data = [
                { label: 'Revistas', value: 'Revistas' },
                { label: 'Gibis', value: 'Gibis' },
                { label: 'Mangás', value: 'Mangás' },
                { label: 'Folhetos', value: 'Folhetos' },
                { label: 'Todos', value: 'todos' },

            ];
            return data
        }

        data = [
            { label: 'Livro', value: 'Livro' },
            { label: 'Obra de Referência', value: 'Obra de Referência' },
            { label: 'Anuários', value: 'Anuários' },
            { label: 'Guías', value: 'Guías' },
            { label: 'Folhetos', value: 'Folhetos' },
            { label: 'Todos', value: 'todos' },
            { label: 'DVDs', value: 'DVDs' },
            { label: 'Áudio', value: 'Áudio' },
            { label: 'CD-ROM', value: 'CD-ROM' },
            { label: 'Revistas', value: 'Revistas' },
            { label: 'Gibis', value: 'Gibis' },
            { label: 'Mangás', value: 'Mangás' },
            { label: 'Folhetos', value: 'Folhetos' },
            { label: 'Todos', value: 'todos' },
        ]
        return data;
    }

    return (
        <>
            <SectionHeader
                title={`livros, DVDs e Periódicos (${cataloguesList?.filter(filter)?.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/library/${pathname}/new`)}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{cataloguesList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{cataloguesList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>materiais</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar 50 anos luz, câmera e ação.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        <SelectList
                            data={listAtivo}
                            valueSelection={filters?.status}
                            onSelect={(value) => setFilters({ ...filters, status: value })}
                            title="Status:"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <SelectList
                            data={groupMaterials}
                            valueSelection={filters?.type}
                            onSelect={(value) => setFilters({ ...filters, type: value })}
                            title="Tipo de Material:"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <SelectList
                            data={groupCategory(filters?.type)}
                            valueSelection={filters?.category}
                            onSelect={(value) => setFilters({ ...filters, category: value })}
                            title="Categoria:"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFilters({
                                type: 'todos',
                                category: 'todos',
                                status: 'todos',
                            })
                            setFilterData('')
                        }} />
                    </Box>
                    <TablePagination
                        component="div"
                        count={sortMaterials()?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />
                </Box>
            </ContentContainer>

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar 50 anos luz, câmera e ação.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />

                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={sortMaterials()?.filter(filter)?.length}
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
                            <SelectList fullWidth
                                data={listAtivo}
                                valueSelection={filters?.status}
                                onSelect={(value) => setFilters({ ...filters, status: value })}
                                title="Status:"
                                filterOpition="value"
                                sx={{ width: '100%' }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList fullWidth
                                data={groupMaterials}
                                valueSelection={filters?.type}
                                onSelect={(value) => setFilters({ ...filters, type: value })}
                                title="Tipo de Material:"
                                filterOpition="value"
                                sx={{ flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList fullWidth
                                data={groupCategory(filters?.type)}
                                valueSelection={filters?.category}
                                onSelect={(value) => setFilters({ ...filters, category: value })}
                                title="Categoria:"
                                filterOpition="value"
                                sx={{ flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilters({
                                    type: 'todos',
                                    category: 'todos',
                                    status: 'todos',
                                })
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {cataloguesList.length > 0 ?
                <Table_V1 data={sortMaterials()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_material'} onFilter={true} filters={filtersOrder} onPress={(value) => setFiltersOrder(value)} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Materiais cadastrados</Text>
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
