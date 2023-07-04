import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getDisciplines, getdisciplines, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import axios from "axios"
import { icons } from "../../../organisms/layout/Colors"

export default function ListGrid(props) {
    const [gridList, setGrid] = useState([])
    const [filterData, setFilterData] = useState('')
    const [showGridTable, setShowGridTable] = useState(false)
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState(1)
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
        getGrid();
    }, []);

    const getGrid = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/grids')
            const { data = [] } = response;
            setGrid(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'disciplinas', label: 'Disciplinas' },
        { key: 'carga_hr_t_disciplina', label: 'Carga horaria Teórica' },
        { key: 'carga_hr_p_disciplina', label: 'Carga horaria Prática' },
        { key: 'carga_hr_disciplina', label: 'Carga horaria Disciplina' },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
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
            <ContentContainer>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 4, "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => setShowGridTable(!showGridTable)}>
                    <Text bold>{'2023.1 - Bimestre'}</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transform: showGridTable ? 'rotate(0)' : 'rotate(-90deg)',
                        transition: '.3s',
                        width: 17,
                        height: 17
                    }} />
                </Box>
                {showGridTable &&
                    <Box sx={{}}>
                        <Table_V1 data={gridList?.filter(filter)} columns={column} columnActive={false} />
                    </Box>
                }
            </ContentContainer>
            <ContentContainer>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 4, "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => setShowGridTable(!showGridTable)}>
                    <Text bold>{'2023.2 - Bimestre'}</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transform: showGridTable ? 'rotate(0)' : 'rotate(-90deg)',
                        transition: '.3s',
                        width: 17,
                        height: 17,
                    }} />
                </Box>
                {showGridTable &&
                    <Box sx={{}}>
                        <Table_V1 data={gridList?.filter(filter)} columns={column} columnActive={false} />
                    </Box>
                }
            </ContentContainer>
            {/* {gridList.length > 1 ?
                <Table_V1 data={gridList?.filter(filter)} columns={column}/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar grades cadastradas</Text>
                </Box>
            } */}
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
