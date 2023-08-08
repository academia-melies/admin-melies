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

    useEffect(() => {
        gerPermissions();
    }, []);

    const gerPermissions = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/permissions`)
            const { data } = response
            setGroupPermissionsList(data)
        } catch (error) {
            console.log(error)
        } finally{
        setLoading(false)
        }
    }

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const column = [
        { key: 'id_grupo_perm', label: 'ID' },
        { key: 'permissao', label: 'Permissão' },
    ];

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

            {groupPermissionsList.length > 0 ?
                <Table_V1 data={groupPermissionsList} columns={column} columnId={'id_grupo_perm'} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado permissões.</Text>
                </Box>
            }

        </>
    )
}
