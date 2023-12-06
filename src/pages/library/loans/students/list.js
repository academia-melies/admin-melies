import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text, TextInput } from "../../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { getUsersPerfil } from "../../../../validators/api-requests"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { api } from "../../../../api/api"
import { TablePagination } from "@mui/material"

export default function ListStudentsLoans(props) {
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
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const [filtersField, setFiltersField] = useState({
        search: '',
        classStudent: 'todos',
        status: 'todos'
    })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        status: (item) => filtersField.status === 'todos' || item.ativo === filtersField.status,
        search: (item) => {
            const normalizedSearchTerm = removeAccents(filtersField.search.toLowerCase());
            const normalizedItemName = removeAccents(item.nome.toLowerCase());
            return normalizedItemName.includes(normalizedSearchTerm);
        },
    };

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };;

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
            setClasses([...groupClasses, { label: 'Todos', value: 'todos' }]);
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
                title={`Empréstimos por aluno (${usersList.filter(filter)?.length})`}
            // newButton
            // newButtonAction={() => router.push(`/library/${pathname}/new`)}
            />
            <ContentContainer>
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
                <TextInput placeholder="Buscar por nome, sobrenome" name='filters' type="search" onChange={(event) => setFiltersField({ ...filtersField, search: event.target.value })} value={filtersField?.search} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        {/* <SelectList
                            fullWidth
                            data={classes}
                            valueSelection={filtersField?.classStudent}
                            onSelect={(value) => setFiltersField({ ...filtersField, classStudent: value })}
                            title="Turma"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        /> */}

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
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFiltersField({
                                search: '',
                                classStudent: 'todos',
                                status: 'todos'
                            })
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

            {usersList.length > 0 ?
                <Table_V1 data={sortUsers()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id'} filters={filters} onPress={(value) => setFilters(value)} onFilter route={`/library/loans/students`} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrados alunos.</Text>
                </Box>
            }
        </>
    )
}
