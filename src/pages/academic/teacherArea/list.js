import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { api } from "../../../api/api"
import { Backdrop, TablePagination } from "@mui/material"
import { icons } from "../../../organisms/layout/Colors"

export default function ListStudents(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('todos')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [classes, setClasses] = useState([])
    const [classSelected, setClassesSelected] = useState()
    const [filterEnrollStatus, setFilterEnrollStatus] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [page, setPage] = useState(0);
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome?.toLowerCase().includes(filterData?.toLowerCase()) || item?.cpf?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.nome?.toLowerCase().includes(filterData?.toLowerCase()) || item?.cpf?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    useEffect(() => {
        if (perfil) {
            getUsers();
            if (window.localStorage.getItem('list-users-filters')) {
                const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-users-filters') || null);
                setFilters({
                    filterName: meliesLocalStorage?.filterName,
                    filterOrder: meliesLocalStorage?.filterOrder
                })
            }
        }
    }, [perfil]);

    useEffect(() => {
        listClasses()
    }, [])

    useEffect(() => {
        setShowFilterMobile(false)
    }, [classSelected, filterAtive])

    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-users-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortUsers = () => {
        const { filterName, filterOrder } = filters;

        const sortedUsers = [...usersList].sort((a, b) => {
            const valueA = filterName === 'id' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedUsers;
    }

    const getUsers = async () => {
        setLoading(true)
        try {
            let query = `?perfil=aluno`;
            const response = await api.get(`/users/perfil${query}`)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    async function listClasses() {
        try {
            const response = await api.get(`/classes`)
            const { data } = response
            const groupClasses = data.map(classes => ({
                label: classes.nome_turma,
                value: classes?.id_turma
            }));
            setClasses(groupClasses);
        } catch (error) {
            return error;
        }
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
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location' },
        { key: 'email', label: 'E-mail' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listEnrollStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pendente de nota', value: 'Pendente de nota' },
        { label: 'Reprovado', value: 'Reprovado' },
        { label: 'Aprovado - Pendente de pré-matrícula', value: 'Aprovado - Pendente de pré-matrícula' },
        { label: 'Aprovado - Em análise', value: 'Aprovado - Em análise' },
        { label: 'Matriculado', value: 'Matriculado' },
    ]

    const listUser = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Funcionário', value: 'funcionario' },
        { label: 'Interessado', value: 'interessado' },
    ]

    return (
        <>
            <SectionHeader
                title={`Alunos (${usersList.filter(filter)?.length})`}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{usersList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{usersList?.length || 10}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>alunos</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar Nome, Sobrenome, CPF.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        <SelectList
                            fullWidth
                            data={classes}
                            valueSelection={classSelected}
                            onSelect={(value) => setClassesSelected(value)}
                            title="Turma"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />

                        <SelectList
                            fullWidth
                            data={listAtivo}
                            valueSelection={filterAtive}
                            onSelect={(value) => setFilterAtive(value)}
                            title="Status"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setClassesSelected('')
                            setFilterAtive('todos')
                            setFilterData('')
                        }} />
                    </Box>
                    <TablePagination
                        component="div"
                        count={sortUsers()?.filter(filter)?.length}
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
                <TextInput placeholder="Buscar pelo nome.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{
                    flex: 1,
                }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={sortUsers()?.filter(filter)?.length}
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
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', flexDirection: 'column' }}>
                                <SelectList
                                    fullWidth
                                    data={classes}
                                    valueSelection={classSelected}
                                    onSelect={(value) => setClassesSelected(value)}
                                    title="Turma"
                                    filterOpition="value"
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                    clean={false}
                                />

                                <SelectList
                                    fullWidth
                                    data={listAtivo}
                                    valueSelection={filterAtive}
                                    onSelect={(value) => setFilterAtive(value)}
                                    title="Status"
                                    filterOpition="value"
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                    clean={false}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setClassesSelected('')
                                setFilterAtive('todos')
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {usersList.length > 0 ?
                <Table_V1 data={sortUsers()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id'} filters={filters} onPress={(value) => setFilters(value)} onFilter />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado usuarios {perfil}</Text>
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