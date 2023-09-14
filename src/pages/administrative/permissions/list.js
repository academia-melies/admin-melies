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
    const [firstRender, setFirstRender] = useState(true)
    const [filters, setFilters] = useState({
        filterName: 'permissao',
        filterOrder: 'asc'
    })
    useEffect(() => {
        gerPermissions();
        if (window.localStorage.getItem('list-permissions-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-permissions-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
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

    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-permissions-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortPermissions = () => {
        const { filterName, filterOrder } = filters;
    
        const sortedPermissions = [...groupPermissionsList].sort((a, b) => {
            const valueA = filterName === 'id_grupo_perm' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_grupo_perm' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_grupo_perm') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }
    
            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
    
        return sortedPermissions;
    }

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const column = [
        { key: 'id_grupo_perm', label: 'ID' },
        { key: 'permissao', label: 'Permissão' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

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
                <Table_V1 data={sortPermissions()} columns={column} columnId={'id_grupo_perm'} filters={filters} onPress={(value) => setFilters(value)} onFilter/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado permissões.</Text>
                </Box>
            }

        </>
    )
}
