import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { icons } from "../../../organisms/layout/Colors"

export default function ListGrid(props) {
    const [gridList, setGrid] = useState([])
    const [filterData, setFilterData] = useState('')
    const [showGridTable, setShowGridTable] = useState({});

    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState(1)
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
        { key: 'id_disciplina', label: 'ID_Disciplina' },
        { key: 'nome_disciplina', label: 'Disciplinas' },
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
                title={`Grades (${gridList.filter(filter)?.length || '0'})`}
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
                />
            </Box>
            {gridList ? (
                gridList.map((item, index) => {
                    const gridData = gridList[index];
                    const name = gridList[index].map((name) => name.nome_grade);
                    
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
                                <Box sx={{}}>
                                    <Table_V1
                                        data={gridData?.filter(filter)}
                                        columns={column}
                                        columnActive={false}
                                        columnId={'id_grade'}
                                    />
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
