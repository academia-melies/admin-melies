import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getDisciplines, getdisciplines, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import axios from "axios"
import TablePagination from '@mui/material/TablePagination'
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function ListDiscipline(props) {
    const [disciplineList, setDiscipline] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filters, setFilters] = useState({
        filterName: 'nome_disciplina',
        filterOrder: 'asc'
    })
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
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
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };
        const normalizedFilterData = normalizeString(filterData);

        if (filterAtive === 'todos') {
            return normalizeString(item?.nome_disciplina)?.toLowerCase().includes(normalizedFilterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (normalizeString(item?.nome_disciplina)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()));
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;



    useEffect(() => {
        fetchPermissions()
        getDiscipline();
        if (window.localStorage.getItem('list-discipline-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-discipline-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);


    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-discipline-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortDiscipline = () => {
        const { filterName, filterOrder } = filters;

        const sortedDiscipline = [...disciplineList].sort((a, b) => {
            const valueA = filterName === 'id_disciplina' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_disciplina' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_disciplina') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedDiscipline;
    }

    const getDiscipline = async () => {
        setLoading(true)
        try {
            const response = await api.get('/disciplines')
            const { data = [] } = response;
            setDiscipline(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_disciplina', label: 'ID' },
        { key: 'nome_disciplina', label: 'Nome' },
        { key: 'carga_hr_dp', label: 'Carga Horária' },
        { key: 'objetivo_dp', label: 'Objetivo' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listUser = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Funcionario', value: 'funcionario' },
        { label: 'Interessado', value: 'interessado' },
    ]

    return (
        <>
            <SectionHeader
                title={`Disciplinas (${disciplineList.filter(filter)?.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <ContentContainer>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{disciplineList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{disciplineList?.length || 10}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>disciplinas</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar por disciplina.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        <SelectList
                            data={listAtivo}
                            valueSelection={filterAtive}
                            onSelect={(value) => setFilterAtive(value)}
                            title="status"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFilterAtive('todos')
                            setFilterData('')
                        }} />
                    </Box>
                    <TablePagination
                        component="div"
                        count={sortDiscipline()?.filter(filter)?.length}
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

            {disciplineList.length > 0 ?
                <Table_V1 data={sortDiscipline()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_disciplina'} filters={filters} onPress={(value) => setFilters(value)} onFilter />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar disciplinas cadastradas</Text>
                </Box>
            }
        </>
    )
}
