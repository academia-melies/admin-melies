import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../atoms"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../organisms"
import { api } from "../../api/api"
import { getUsersPerfil } from "../../validators/api-requests"
import { useAppContext } from "../../context/AppContext"
import { SelectList } from "../../organisms/select/SelectList"

export default function ListUsers(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('funcionario')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState(1)
    const router = useRouter()
    const { slug } = router.query;
    const filter = (item) => (item?.nome?.toLowerCase().includes(filterData?.toLowerCase()) || item?.cpf?.toLowerCase().includes(filterData?.toLowerCase())) && filterAtive === '' || item?.ativo === filterAtive;

    useEffect(() => {
        if (perfil) {
            getUsers();
        }
    }, [perfil]);

    const getUsers = async () => {
        setLoading(true)
        // let perfilUser = perfil === 'employee' && 'funcionario' || perfil === 'student' && 'aluno' || perfil ==;
        try {
            const response = await getUsersPerfil(perfil)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error.response.data)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'foto' },
        { key: 'email', label: 'E-mail' },
        { key: 'telefone', label: 'Telefone' },
        { key: 'cpf', label: 'CPF' },
        // { key: 'nacionalidade', label: 'Nacionalidade' },
        // { key: 'estado_civil', label: 'Estado Civil' },
        { key: 'email_melies', label: 'Email Meliés' },

    ];

    const listAtivo = [
        { label: 'todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const listUser = [
        { label: 'Funcionario', value: 'funcionario' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Interessado', value: 'interessado' },
    ]

    console.log(listUser)


    if (!slug) return <Forbidden />

    return (
        <>
            <SectionHeader
                title={`${perfil.charAt(0).toUpperCase() + perfil.slice(1)} (${usersList.filter(filter)?.length})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${slug}/new`)}
            />
            {/* <Text bold>Buscar por: </Text> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='João, Robert, Renato, etc.' style={{ padding: '15px', }} onChange={setFilterData} />
                <Box>
                    <SelectList
                        fullWidth
                        data={listUser}
                        valueSelection={perfil}
                        onSelect={(value) => setPerfil(value === 'todos' ? '' : value)}
                        title="usuário"
                        filterOpition="value"
                        sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                    />
                </Box>
                <SelectList
                    data={listAtivo}
                    valueSelection={filterAtive}
                    onSelect={(value) => setFilterAtive(value === 'todos' ? '' : value)}
                    title="status"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                />
            </Box>
            {usersList.length > 1 ?
                <Table_V1 data={usersList?.filter(filter)} columns={column} slug={perfil} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado usuarios {perfil}</Text>
                </Box>
            }
        </>
    )
}
