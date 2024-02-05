import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { useReactToPrint } from "react-to-print"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { Backdrop, TablePagination } from "@mui/material"
import { icons } from "../../../organisms/layout/Colors"

export default function ListCostCenter(props) {
    const [costCentersList, setCostCentersList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, alert, userPermissions, menuItemsList } = useAppContext()
    const router = useRouter()
    const [filters, setFilters] = useState({
        status: 'todos',
    })
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const filterFunctions = {
        status: (item) => filters.status === 'todos' || item.ativo === filters.status,
    };

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);

        return (
            Object.values(filterFunctions).every(filterFunction => filterFunction(item)) &&
            (
                normalizeString(item?.nome_cc)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
            )
        );
    };

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
    const componentPDF = useRef()

    // const filterRegex = (name) => {
    //     let filterRegex = name.match(/\b[\wáéíóúâêîôûãõç]+\b/gi)
    //     return filterRegex
    // }

    useEffect(() => {
        fetchPermissions()
        getFees();
    }, []);

    const getFees = async () => {
        setLoading(true)
        try {
            const response = await api.get('/costCenters')
            const { data = [] } = response;
            console.log(response)
            setCostCentersList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGeneratePdf = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: 'Centro de Custos',
        onAfterPrint: () => alert.info('Tabela exportada em PDF.')
    })


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
        { key: 'id_centro_custo', label: 'ID' },
        { key: 'nome_cc', label: 'Centro de Custo' },
        { key: 'area', label: 'Área' }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Centro de Custos (${costCentersList?.filter(filter)?.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/financial/${pathname}/new`)}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{costCentersList?.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{costCentersList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>centro de custo</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar pelo Centro de custo" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
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
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFilters({
                                status: 'todos',
                            })
                            setFilterData('')
                        }} />
                    </Box>
                    <TablePagination
                        component="div"
                        count={costCentersList?.filter(filter)?.length}
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
                        count={costCentersList?.filter(filter)?.length}
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
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilters({
                                    status: 'todos',
                                })
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>
            {costCentersList?.length > 0 ?
                <div ref={componentPDF}>
                    <Table_V1 data={costCentersList?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_centro_custo'} columnActive={true} />
                </div>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Centro de custos</Text>
                </Box>
            }
            {costCentersList?.length > 0 &&
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.8, flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <Text bold>Exportar:</Text>
                    <Box sx={{
                        backgroundImage: `url('/icons/pdf_icon.png')`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        width: { xs: '30px', sm: 35, md: 35, lg: 35, xl: 35 },
                        aspectRatio: '1/1',
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={handleGeneratePdf} />
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