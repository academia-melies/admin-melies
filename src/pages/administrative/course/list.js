import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getCourses, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListCourse(props) {
    const [courseList, setCourseList] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('aluno')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_curso?.toLowerCase().includes(filterData?.toLowerCase())
        } else {
            return item?.ativo === filterAtive && (item?.nome_curso?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    useEffect(() => {
        getCourse();
    }, [perfil]);

    const getCourse = async () => {
        setLoading(true)
        try {
            const response = await api.get('/courses')
            const { data = [] } = response;
            setCourseList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_curso', label: 'ID' },
        { key: 'nome_curso', avatar: true, label: 'Nome', avatarUrl: 'foto' },
        { key: 'modalidade_curso', label: 'Modalidade' },
        { key: 'nivel_curso', label: 'Nivél Curso' },
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Cursos (${courseList.filter(filter)?.length || '0'})`}
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
            {courseList.length >= 1 ?
                <Table_V1 data={courseList?.filter(filter)} columns={column} columnId={'id_curso'}/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não consegui encontrar cursos cadastrados</Text>
                </Box>
            }
        </>
    )
}
