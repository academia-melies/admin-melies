import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditPages(props) {
    const { setLoading, colorPalette } = useAppContext()
    const [imagesList, setImagesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        item?.campo?.toLowerCase().includes(filterData?.toLowerCase())
    }

    // useEffect(() => {
    //     getCourse();
    // }, [perfil]);

    // const getCourse = async () => {
    //     setLoading(true)
    //     try {
    //         const response = await api.get('/courses')
    //         const { data = [] } = response;
    //         setCourseList(data)
    //     } catch (error) {
    //         console.log(error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

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
                title={`Imagens (${imagesList.filter(filter)?.length || '0'})`}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Pagina login, Banner Inicial ...' style={{ padding: '15px', }} onChange={setFilterData} />
            </Box>
            <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                <Text bold>Não consegui encontrar nenhuma pagina</Text>
            </Box>
        </>
    )
}
