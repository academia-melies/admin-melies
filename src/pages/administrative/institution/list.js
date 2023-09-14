import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListInstitution(props) {
    const [institutionList, setInstitutionList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filters, setFilters] = useState({
        filterName: 'nome_instituicao',
        filterOrder: 'asc'
    })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_instituicao?.toLowerCase().includes(filterData?.toLowerCase())
        } else {
            return item?.ativo === filterAtive && (item?.nome_instituicao?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    useEffect(() => {
        getInstitution();
        if (window.localStorage.getItem('list-institution-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-institution-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);


    
    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-institution-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortInstitution = () => {
        const { filterName, filterOrder } = filters;
    
        const sortedInstitution = [...institutionList].sort((a, b) => {
            const valueA = filterName === 'id_instituicao' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id_instituicao' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id_instituicao') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }
    
            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
    
        return sortedInstitution;
    }

    const getInstitution = async () => {
        setLoading(true)
        try {
            const response = await api.get('/institutions')
            const { data = [] } = response;
            setInstitutionList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_instituicao', label: 'ID' },
        { key: 'nome_instituicao', label: 'Nome' },
        { key: 'cnpj', label: 'CNPJ' },
        { key: 'mantenedora', label: 'Mantenedora' },
        { key: 'mantida', label: 'Mantida' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Instituições (${institutionList?.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Melies ...' style={{ padding: '15px', }} onChange={setFilterData} />
                <SelectList
                    data={listAtivo}
                    valueSelection={filterAtive}
                    onSelect={(value) => setFilterAtive(value)}
                    title="status"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px',  }}
                    clean={false}
                />
            </Box>
            {institutionList?.length >= 1 ?
                <Table_V1 data={sortInstitution()?.filter(filter)} columns={column} columnId={'id_instituicao'} filters={filters} onPress={(value) => setFilters(value)} onFilter/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não consegui encontrar instituições cadastradas</Text>
                </Box>
            }
        </>
    )
}
