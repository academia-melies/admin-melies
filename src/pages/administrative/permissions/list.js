import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"

export default function GroupPermissions(props) {
    const [groupPermissionsList, setGroupPermissionsList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    // const filter = (item) => {
    //     if (filterAtive === 'todos') {
    //         return item?.nome_instituicao?.toLowerCase().includes(filterData?.toLowerCase())
    //     } else {
    //         return item?.ativo === filterAtive && (item?.nome_instituicao?.toLowerCase().includes(filterData?.toLowerCase()));
    //     }
    // };

    useEffect(() => {
        getPermissions();
    }, []);

    const getPermissions = async () => {
        setLoading(true)
        try {
            const response = await api.get('/groupPermissions')
            const { data = [] } = response;
            setGroupPermissionsList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Permissões (${groupPermissionsList?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Master, professor..' style={{ padding: '15px', }} onChange={setFilterData} />
            </Box>

            <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                <Text bold>Não existem permissões cadastradas</Text>
            </Box>

        </>
    )
}
