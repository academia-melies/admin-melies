import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListUsers(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('aluno')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [screen, setScreen] = useState('users')
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
        if (perfil) {
            getUsers();
        }
    }, [perfil]);

    const getUsers = async () => {
        setLoading(true)
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
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
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
                title={`${perfil === 'todos' ? 'Usuarios' : (perfil.charAt(0).toUpperCase() + perfil.slice(1)) } (${usersList.filter(filter)?.length})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            {/* <Text bold>Buscar por: </Text> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='João, Robert, Renato, etc.' style={{ padding: '15px', }} onChange={setFilterData} />
                <Box>
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
                </Box>
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
            {usersList.length > 0 ?
                <Table_V1 data={usersList?.filter(filter)} columns={column} columnId={'id'}/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado usuarios {perfil}</Text>
                </Box>
            }
        </>
    )
}
