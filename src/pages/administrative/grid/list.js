import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { icons } from "../../../organisms/layout/Colors"
import { api } from "../../../api/api"
import { TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function ListGrid(props) {
    const [gridList, setGrid] = useState([])
    const [filterData, setFilterData] = useState('')
    const [showGridTable, setShowGridTable] = useState({});
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
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
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_grade?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.nome_grade?.toLowerCase().includes(filterData?.toLowerCase()));
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

    const toggleGridTable = (index) => {
        setShowGridTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };


    useEffect(() => {
        fetchPermissions()
        getGrid();
    }, []);

    const getGrid = async () => {
        setLoading(true)
        try {
            const response = await api.get('/grids')
            const { data = [] } = response;
            setGrid(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_disciplina', label: 'ID Disciplina' },
        { key: 'nome_disciplina', label: 'Disciplinas' },
        { key: 'carga_hr_dp', label: 'Carga horaria Teorica' },
        { key: 'carga_hr_dp', label: 'Carga horaria Pratica' },
        { key: 'carga_hr_dp', label: 'Carga horaria Disciplina' },
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Grades (${gridList.length || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <ContentContainer>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{gridList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{gridList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>grades</Text>
                    </Box>
                </Box>
                <SearchBar placeholder='Artes visuais, Desenvolvimento de Games...' style={{ backgroundColor: colorPalette.inputColor, transition: 'background-color 1s', }} onChange={setFilterData} />
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
                        count={gridList?.filter(filter)?.length}
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

            {gridList ? (
                gridList.filter(filter).slice(startIndex, endIndex).map((item, index) => {
                    const gridData = item.disciplinas;
                    const name = item.nome_grade;
                    const disciplinesByModule = {};
                    gridData.forEach((disciplina) => {
                        const modulo = disciplina.modulo;
                        if (!disciplinesByModule[modulo]) {
                            disciplinesByModule[modulo] = [];
                        }
                        disciplinesByModule[modulo].push(disciplina);
                    });

                    return (
                        <ContentContainer key={`${item}-${index}`}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }}
                                onClick={() => toggleGridTable(index)}
                            >
                                <Text bold>{name}</Text>
                                <Box
                                    sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url(${icons.gray_arrow_down})`,
                                        transform: showGridTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                        transition: '.3s',
                                        width: 17,
                                        height: 17
                                    }}
                                />
                            </Box>
                            {showGridTable[index] && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {Object.entries(disciplinesByModule).map(([modulo, disciplinas]) => (
                                        <ContentContainer key={`modulo-${modulo}`}>
                                            <Text bold style={{ color: colorPalette.buttonColor }}>{`${modulo}º Módulo`}</Text>
                                            <Table_V1
                                                data={disciplinas}
                                                columns={column}
                                                columnActive={false}
                                                columnId={'id_grade'}
                                                center
                                            />
                                        </ContentContainer>
                                    ))}
                                </Box>
                            )}
                        </ContentContainer>
                    );
                })
            ) : (
                <Text>Não encontrei disciplinas vinculadas a grade</Text>
            )}
        </>
    )
}

const styles = {
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    }
}
