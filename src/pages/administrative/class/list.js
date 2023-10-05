import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getDisciplines, getdisciplines, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import axios from "axios"
import { TablePagination } from "@mui/material"

export default function ListClasses(props) {
    const [classesList, setClasses] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        filterName: 'nome_turma',
        filterOrder: 'asc'
    })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_turma?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.nome_turma?.toLowerCase().includes(filterData?.toLowerCase()));
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
        getClasses();
        if (window.localStorage.getItem('list-classes-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-classes-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);

    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-classes-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortClasses = () => {
        const { filterName, filterOrder } = filters;
    
        const sortedClasses = [...classesList].sort((a, b) => {
            const valueA = filterName === 'id_turma' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_turma' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_turma') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }
    
            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
    
        return sortedClasses;
    }

    const getClasses = async () => {
        setLoading(true)
        try {
            const response = await api.get('/classes')
            const { data = [] } = response;
            setClasses(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const column = [
        { key: 'id_turma', label: 'ID' },
        { key: 'nome_turma', label: 'Nome'},
        { key: 'inicio', label: 'Inicio', date: true },
        { key: 'fim', label: 'Fim', date: true },
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
                title={`Turmas (${classesList.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <ContentContainer>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{classesList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{classesList?.length || 10}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>turmas</Text>
                    </Box>
                </Box>
                <SearchBar placeholder='Busque pelo nome da turma' style={{ backgroundColor: colorPalette.inputColor, transition: 'background-color 1s', }} onChange={setFilterData} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center',  }}>
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
                        count={sortClasses()?.filter(filter)?.length}
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
            {classesList.length > 0 ?
                <Table_V1 data={sortClasses()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_turma'} filters={filters} onPress={(value) => setFilters(value)} onFilter/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Turmas cadastradas</Text>
                </Box>
            }
        </>
    )
}
