import { useRouter } from "next/router"
import { useEffect, useReducer, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { getUsersPerfil } from "../../../../validators/api-requests"
import { ConfirmationModal, useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { api } from "../../../../api/api"
import { Backdrop, TablePagination } from "@mui/material"
import { formatTimeStamp, getDialogPosition } from "../../../../helpers"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { icons } from "../../../../organisms/layout/Colors"

export default function ListMaterialsLoans(props) {
    const [loansData, setLoansData] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [filtersField, setFiltersField] = useState({
        type: 'todos',
        category: 'todos',
        search: '',
        status: 'todos'
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
    const reducer = (prev, next) => {
        let dialogPosition = null
        if (next.event) dialogPosition = getDialogPosition(next.event, 200);
        return { ...prev, ...next, ...(dialogPosition && { position: dialogPosition }) }
    };

    const [showConfirmationDialog, setShowConfirmationDialog] = useReducer(reducer, { active: false, position: { left: 0, top: 0 }, captureValue: null, acceptAction: null, title: 'Deseja confirmar a devolução?', message: 'Uma vez devolvido, será necessário alugar novamente gerando um novo empréstimo.' })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        type: (item) => filtersField.type === 'todos' || item.tipo_material === filtersField.type,
        category: (item) => filtersField.category === 'todos' || item.categoria === filtersField.category,
        status: (item) => filtersField.status === 'todos' || item.status_emprestimo === filtersField.status,
        search: (item) => {
            const normalizedSearchTerm = removeAccents(filtersField.search.toLowerCase());
            const normalizedItemTitle = removeAccents((item.titulo || '').toLowerCase());
            const normalizedItemNome = removeAccents((item.nome || '').toLowerCase());
            return normalizedItemTitle.includes(normalizedSearchTerm) || normalizedItemNome.includes(normalizedSearchTerm);
        }
    };

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };

    useEffect(() => {
        fetchPermissions()
        getLoans();
        if (window.localStorage.getItem('list-loans-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-loans-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);


    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-loans-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortLoans = () => {
        const { filterName, filterOrder } = filters;

        const sortedLoans = [...loansData].sort((a, b) => {
            const valueA = filterName === 'id_emprestimo' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_emprestimo' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_emprestimo') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedLoans;
    }

    const getLoans = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/loans`)
            const { data } = response;
            if (response?.status === 200) {
                setLoansData(data)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    useEffect(() => {
        setShowFilterMobile(false)
    }, [filtersField])

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;


    const column = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location' },
        { key: 'email', label: 'E-mail' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Devolvido', value: 'devolvido' },
        { label: 'Emprestado', value: 'emprestado' },
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
                title={`Empréstimos por Materiais (${loansData.filter(filter)?.length})`}
            // newButton
            // newButtonAction={() => router.push(`/library/${pathname}/new`)}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{loansData.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{loansData?.length || 10}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>Empréstimos</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar" name='filters' type="search" onChange={(event) => setFiltersField({ ...filtersField, search: event.target.value })} value={filtersField?.search} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        <SelectList
                            fullWidth
                            data={listAtivo}
                            valueSelection={filtersField?.status}
                            onSelect={(value) => setFiltersField({ ...filtersField, status: value })}
                            title="Status"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <SelectList
                            data={groupMaterials}
                            valueSelection={filtersField?.type}
                            onSelect={(value) => setFiltersField({ ...filtersField, type: value })}
                            title="Tipo de Material:"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <SelectList
                            data={groupCategory(filtersField?.type)}
                            valueSelection={filtersField?.category}
                            onSelect={(value) => setFiltersField({ ...filtersField, category: value })}
                            title="Categoria:"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFiltersField({
                                type: 'todos',
                                category: 'todos',
                                search: '',
                                status: 'todos'
                            })
                        }}
                        />
                    </Box>
                    <TablePagination
                        component="div"
                        count={sortLoans()?.filter(filter)?.length}
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
                <TextInput placeholder="Buscar" name='filters' type="search" onChange={(event) => setFiltersField({ ...filtersField, search: event.target.value })} value={filtersField?.search} sx={{ flex: 1 }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={sortLoans()?.filter(filter)?.length}
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
                                data={listAtivo}
                                valueSelection={filtersField?.status}
                                onSelect={(value) => setFiltersField({ ...filtersField, status: value })}
                                title="Status"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList fullWidth
                                data={groupMaterials}
                                valueSelection={filtersField?.type}
                                onSelect={(value) => setFiltersField({ ...filtersField, type: value })}
                                title="Tipo de Material:"
                                filterOpition="value"
                                sx={{ flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList fullWidth
                                data={groupCategory(filtersField?.type)}
                                valueSelection={filtersField?.category}
                                onSelect={(value) => setFiltersField({ ...filtersField, category: value })}
                                title="Categoria:"
                                filterOpition="value"
                                sx={{ flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFiltersField({
                                    type: 'todos',
                                    category: 'todos',
                                    search: '',
                                    status: 'todos'
                                })
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {loansData?.filter(filter)?.length > 0 ?
                <TableLoans isPermissionEdit={isPermissionEdit} loansData={sortLoans()?.filter(filter).slice(startIndex, endIndex)} setFiltersField={setFiltersField} getLoans={getLoans}
                    showConfirmationDialog={showConfirmationDialog} setShowConfirmationDialog={setShowConfirmationDialog} />
                // <Table_V1 data={sortLoans()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_emprestimo'} filters={filters} onPress={(value) => setFilters(value)} onFilter route={`/library/loans/materials`} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrados Materiais emprestados.</Text>
                </Box>
            }

        </>
    )
}


const TableLoans = ({ isPermissionEdit, loansData = [], getLoans, setFiltersField }) => {

    const { setLoading, colorPalette, theme, alert, setShowConfirmationDialog } = useAppContext()

    const getRowBackground = (index) => {
        if (theme) {
            return index % 2 === 0 ? '#F2F4F8' : '#FFF';
        } else {
            return index % 2 === 0 ? '#0E0D15' : '#221F32';
        }
    };

    const handleReturnLoan = async (loanId) => {
        try {
            setLoading(true)
            let loanData = {
                dt_devolucao: new Date(),
                status_emprestimo: 'devolvido'
            }
            const response = await api.patch(`/loan/update/${loanId}`, { loanData })
            if (response?.status === 200) {
                alert.success('Devolução registrada.');
                setFiltersField({
                    type: 'todos',
                    category: 'todos',
                    search: '',
                    status: 'todos'
                })
                getLoans()
                return
            }
            alert.error('Tivemos um problema ao registrar devolução.');
        } catch (error) {
            alert.error('Tivemos um problema ao registrar devolução.');
        } finally {
            setLoading(false)
        }
    }


    const priorityColor = (data) => ((data === 'emprestado' && 'yellow') ||
        (data === 'devolvido' && 'green') || (data === 'atrasado' && 'red'))


    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0 }}>

            <div style={{ borderRadius: '8px', overflow: 'auto', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>#ID</Text></th>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>Aluno</Text></th>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>Material</Text></th>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>Data prevista devolução</Text></th>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>Data devolução</Text></th>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>Renovações</Text></th>
                            <th style={{ padding: '16px' }}><Text bold style={{ color: '#fff' }}>Status</Text></th>
                            <th style={{ padding: '16px' }}></th>
                            <th style={{ padding: '16px' }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, padding: 5 }}>
                        {
                            loansData?.map((item, index) => {
                                const dateDevolution = formatTimeStamp(item?.dt_prev_devolucao)
                                return (
                                    <tr key={`${item}-${index}`}>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Text>{item?.id_emprestimo}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Text>{item?.nome}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Text>{item?.titulo}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Text>{dateDevolution || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_devolucao, true) || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Text> {item?.renovacoes || 0}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    backgroundColor: getRowBackground(index + 1),
                                                    height: 30,
                                                    gap: 1,
                                                    alignItems: 'center',
                                                    width: 100,
                                                    borderRadius: 2,
                                                    justifyContent: 'flex-start',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.status_emprestimo), padding: '5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                <Text small bold style={{ textAlign: 'start' }}>{item?.status_emprestimo}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            {item?.status_emprestimo === 'emprestado' ? <Button disabled={!isPermissionEdit && true} secondary small text="Renovar" style={{ height: 30, borderRadius: 2 }} /> : '-'}
                                        </td>
                                        <td style={{ padding: '8px 10px', backgroundColor: getRowBackground(index), textAlign: 'center' }}>
                                            {item?.status_emprestimo === 'emprestado' ? <Button disabled={!isPermissionEdit && true} small text="Devolver" style={{ height: 30, borderRadius: 2 }} onClick={(event) =>
                                                setShowConfirmationDialog({
                                                    active: true,
                                                    event,
                                                    acceptAction: () => handleReturnLoan(item.id_emprestimo),
                                                    title: 'Deseja confirmar a devolução?',
                                                    message: 'Uma vez devolvido, será necessário alugar novamente gerando um novo empréstimo.'
                                                })} /> : '-'}
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
