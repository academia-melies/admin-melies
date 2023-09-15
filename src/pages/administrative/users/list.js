import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListUsers(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('todos')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterEnrollStatus, setFilterEnrollStatus] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filters, setFilters] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        const normalizeString = (str) => {
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };
    
        const normalizedFilterData = normalizeString(filterData);
        
        if (filterAtive === 'todos') {
            return normalizeString(item?.nome)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) || 
                   normalizeString(item?.cpf)?.toLowerCase().includes(normalizedFilterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (
                normalizeString(item?.nome)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) || 
                normalizeString(item?.cpf)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
            );
        }
    };


    useEffect(() => {
        if (perfil) {
            getUsers();
        }
        if (window.localStorage.getItem('list-users-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-users-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, [perfil]);

    const getUsers = async () => {
        setLoading(true)
        try {
            const response = await getUsersPerfil(perfil)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-users-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortUsers = () => {
        const { filterName, filterOrder } = filters;
    
        const sortedUsers = [...usersList].sort((a, b) => {
            const valueA = filterName === 'id' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }
    
            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
    
        return sortedUsers;
    }

    const column = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location' },
        { key: 'email', label: 'E-mail' },
        { key: 'cpf', label: 'CPF' },
        { key: 'email_melies', label: 'E-mail Méliès' },
        { key: 'dt_criacao', label: 'Criado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listEnrollStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pendente de nota', value: 'Pendente de nota' },
        { label: 'Reprovado', value: 'Reprovado' },
        { label: 'Aprovado - Pendente de pré-matrícula', value: 'Aprovado - Pendente de pré-matrícula' },
        { label: 'Aprovado - Em análise', value: 'Aprovado - Em análise' },
        { label: 'Matriculado', value: 'Matriculado' },
    ]

    const listUser = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Funcionário', value: 'funcionario' },
        { label: 'Interessado', value: 'interessado' },
    ]

    return (
        <>
            <SectionHeader
                title={`${perfil === 'todos' ? 'Usuários' : (perfil.charAt(0).toUpperCase() + perfil.slice(1))} (${usersList.filter(filter)?.length})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            {/* <Text bold>Buscar por: </Text> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <Box sx={{ display: 'flex', flex: 1 }}>
                    <SearchBar placeholder='Nome, Sobrenome, CPF.' style={{ padding: '15px', }} onChange={setFilterData} />
                </Box>
                <Box sx={{ display: 'flex', flex: 1, flexDirection: 'row', gap: 1 }}>
                    <SelectList
                        fullWidth
                        data={listUser}
                        valueSelection={perfil}
                        onSelect={(value) => setPerfil(value)}
                        title="usuário"
                        filterOpition="value"
                        sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />

                    <SelectList
                        data={listAtivo}
                        valueSelection={filterAtive}
                        onSelect={(value) => setFilterAtive(value)}
                        title="status"
                        filterOpition="value"
                        sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={listEnrollStatus}
                        valueSelection={filterEnrollStatus}
                        onSelect={(value) => setFilterEnrollStatus(value)}
                        title="situação/matrícula"
                        filterOpition="value"
                        sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                </Box>
            </Box>
            {usersList.length > 0 ?
                <Table_V1 data={sortUsers()?.filter(filter)} columns={column} columnId={'id'} filters={filters} onPress={(value) => setFilters(value)} onFilter />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado usuarios {perfil}</Text>
                </Box>
            }
        </>
    )
}
