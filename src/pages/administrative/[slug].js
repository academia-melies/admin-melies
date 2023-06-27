import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../atoms"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../organisms"
import { api } from "../../api/api"
import { getUsersPerfil } from "../../validators/api-requests"
import { useAppContext } from "../../context/AppContext"

export default function ListUsers(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('')
    const { setLoading } = useAppContext()
    const router = useRouter()
    const { slug } = router.query;
    const filter = (item) => (item?.nome?.toLowerCase().includes(filterData?.toLowerCase())) || (item?.cpf?.toLowerCase().includes(filterData?.toLowerCase()));

    useEffect(() => {
        if (slug === "employee") {
            setPerfil("employee");
        } else if (slug === "student") {
            setPerfil("student");
        }
    }, [slug]);

    useEffect(() => {
        if (perfil) {
            getUsers();
        }
    }, [perfil]);

    const getUsers = async () => {
        setLoading(true)
        let perfilUser = perfil === 'employee' ? 'funcionario' : 'aluno';
        try {
            const response = await getUsersPerfil(perfilUser)
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

    if (!slug) return <Forbidden />

    return (
        <>
            <SectionHeader
                title={`${slug === 'employee' ? 'Funcionarios' : 'Alunos'} (${usersList?.length})`}
                newButton
                newButtonAction={() => router.push(`/administrative/${slug}/new`)}
            />
            <Box>
                <Text bold style={{ margin: '0px 5px 5px 5px', }}>Buscar por: </Text>
                <SearchBar placeholder='João, Robert, Renato, etc.' style={{ padding: '15px' }} onChange={setFilterData} />
            </Box>
            <Table_V1 data={usersList?.filter(filter)} columns={column} slug={slug} />
        </>
    )
}
