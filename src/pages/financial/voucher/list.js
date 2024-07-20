import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { PaginationTable, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { useReactToPrint } from "react-to-print"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { Backdrop, TablePagination } from "@mui/material"
import { icons } from "../../../organisms/layout/Colors"
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import { format } from "date-fns"


export default function ListAccounts(props) {
    const [accountList, setAccountList] = useState([])
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
                normalizeString(item?.nome_cupom)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
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
        getCupom();
    }, []);

    const getCupom = async () => {
        setLoading(true)
        try {
            const response = await api.get('/cupom')
            const { data = [] } = response;
            console.log('aqui', data)
            if (data?.length > 0) {
                setAccountList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGeneratePdf = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: 'Contas - Extrato',
        onAfterPrint: () => alert.info('Tabela exportada em PDF.')
    })
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const column = [
        { key: 'id', label: 'ID' },
        { key: 'nome_cupom', label: 'Nome do Cupom' },
        { key: 'descricao', label: 'Descrição do Cupom' },
        { key: 'valor', label: 'Valor', price: true },
        { key: 'porcetagem', label: 'Porcetagem', price: true },
        { key: 'status', label: 'Status', price: true },
        { key: 'created_at', label: 'Criado em' },
        { key: 'updated_at', label: 'Atualizando em' }
    ];
    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Cupons de Desconto (${accountList?.filter(filter)?.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/financial/${pathname}/new`)}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{accountList?.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{accountList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>Cupons</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar pelo cupon" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
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
                </Box>
            </ContentContainer>

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar por conta" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />

                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={accountList?.filter(filter)?.length}
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
            
            {accountList?.length > 0 ?
           
                <div >
                    {/* <Table_V1 data={accountList?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_conta'} columnActive={true} /> */}
                    <TableAccount data={accountList?.filter(filter)} />
                </div>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Contas cadastradas</Text>
                </Box>
            }
        </>
    )
}
const TableAccount = ({ data = [], filters = [], onPress = () => { } }) => {
    console.log("aqui 2",data)
    const { setLoading, colorPalette, theme, user } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

  


    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'nome_cupom', label: 'Nome do Cupom' },
        { key: 'descricao', label: 'Descrição do Cupom' },
        { key: 'valor', label: 'Valor', price: true },
        { key: 'porcetagem', label: 'Porcetagem', price: true },
        { key: 'status', label: 'Status', price: true },
        { key: 'created_at', label: 'Criado em' },
        { key: 'updated_at', label: 'Atualizando em' }
    ];

   
    const router = useRouter();
    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const handleRowClick = (id) => {
        window.open(`/financial/voucher/${id}`, '_blank');
        return;
    };

    const valuesColor = (data) => ((data > 0 ? 'green' : 'red'));

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <ContentContainer sx={{
            display: 'flex', width: '100%', padding: 0, boxShadow: 'none', borderRadius: 2,
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
                                        {/* <Box sx={{
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
                                            })} /> */}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ flex: 1, padding: 5, backgroundColor: colorPalette.secondary }}>
                        {
                            data?.slice(startIndex, endIndex)?.map((item, index) => {
                                return (
                                    <TableRow key={`${item}-${index}`} onClick={() => handleRowClick(item?.id)} sx={{
                                        "&:hover": {
                                            cursor: 'pointer',
                                            backgroundColor: colorPalette.primary + '88'
                                        },
                                    }}>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.id || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '8px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '160px',
                                        }}>
                                            <Text>{item?.nome_cupom || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '8px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '160px',
                                        }}>
                                            <Text>{item?.descricao || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    width: 14,
                                                    height: 14,
                                                    aspectRatio: '1/1',
                                                    backgroundImage: `url('/icons/arrow_up_green_icon.png')`,
                                                    transition: '.3s',
                                                }} />
                                                <Text>{formatter.format(item?.valor) || '-'}</Text>
                                            </Box>
                                        </TableCell>                                        
                                        
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{item?.porcetagem || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.status || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{item?.created_at || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.updated_at || '-'}</Text>
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