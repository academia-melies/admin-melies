import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { api } from "../../../api/api"

export default function ListStudents(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('todos')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [classes, setClasses] = useState([])
    const [classSelected, setClassesSelected] = useState()
    const [filterEnrollStatus, setFilterEnrollStatus] = useState('todos')
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

    useEffect(() => {
        listClasses()
    }, [])

    const getUsers = async () => {
        setLoading(true)
        try {
            let query = `?perfil=aluno`;
            const response = await api.get(`/users/perfil${query}`)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    async function listClasses() {
        try {
            const response = await api.get(`/classes`)
            const { data } = response
            const groupClasses = data.map(classes => ({
                label: classes.nome_turma,
                value: classes?.id_turma
            }));
            setClasses(groupClasses);
        } catch (error) {
            return error;
        }
    }

    const column = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location' },
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
                title={`Alunos (${usersList.filter(filter)?.length})`}
                newButton
                newButtonAction={() => router.push(`/academic/${pathname}/new`)}
            />
            {/* <Text bold>Buscar por: </Text> */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <Box sx={{ display: 'flex', flex: 1 }}>
                    <SearchBar placeholder='Nome, Sobrenome, CPF.' style={{ padding: '15px', }} onChange={setFilterData} />
                </Box>
                <Box sx={{ display: 'flex', flex: 1, flexDirection: 'row', gap: 1 }}>
                    <SelectList
                        fullWidth
                        data={classes}
                        valueSelection={classSelected}
                        onSelect={(value) => setClassesSelected(value)}
                        title="Turma"
                        filterOpition="value"
                        sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />

                    <SelectList
                        fullWidth
                        data={listAtivo}
                        valueSelection={filterAtive}
                        onSelect={(value) => setFilterAtive(value)}
                        title="Status"
                        filterOpition="value"
                        sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                </Box>
            </Box>
            {usersList.length > 0 ?
                <Table_V1 data={usersList?.filter(filter)} columns={column} columnId={'id'} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não foi encontrado usuarios {perfil}</Text>
                </Box>
            }
        </>
    )
}
