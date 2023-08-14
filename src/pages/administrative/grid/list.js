import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { icons } from "../../../organisms/layout/Colors"

export default function ListGrid(props) {
    const [gridList, setGrid] = useState([])
    const [filterData, setFilterData] = useState('')
    const [showGridTable, setShowGridTable] = useState({});
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_grade?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.nome_grade?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    const toggleGridTable = (index) => {
        setShowGridTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    useEffect(() => {
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
        // { key: 'id_grade', label: 'ID Grade' },
        { key: 'id_disciplina', label: 'ID Disciplina' },
        { key: 'nome_disciplina', label: 'Disciplinas' },
        { key: 'carga_hr_dp', label: 'Carga horaria Teorica' },
        { key: 'carga_hr_dp', label: 'Carga horaria Pratica' },
        { key: 'carga_hr_dp', label: 'Carga horaria Disciplina' },
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Grades (${gridList.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Artes visuais, Desenvolvimento de Games ...' style={{ padding: '15px', }} onChange={setFilterData} />
                <SelectList
                    data={listAtivo}
                    valueSelection={filterAtive}
                    onSelect={(value) => setFilterAtive(value)}
                    title="status"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                    clean={false}
                />
            </Box>
            {gridList ? (
                gridList.filter(filter).map((item, index) => {
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
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    {Object.entries(disciplinesByModule).map(([modulo, disciplinas]) => (
                                        <ContentContainer key={`modulo-${modulo}`}>
                                            <Text bold style={{color: colorPalette.buttonColor}}>{`${modulo}º Módulo`}</Text>
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
