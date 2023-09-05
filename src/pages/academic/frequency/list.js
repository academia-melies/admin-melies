import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getDisciplines, getdisciplines, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import axios from "axios"

export default function FrequencyStudent(props) {
    const [frequencyList, setFrequency] = useState([])
    const [classes, setClasses] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, user } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const id = router?.query?.id || null
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_turma?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.nome_turma?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    useEffect(() => {
        let query = `?userId=${id}`
        if (id !== null) {
            getFrequencyStudents({ route: `/classes${query}` });
        }
        else {
            getFrequencyStudents({ route: `/classes` });
        }
    }, []);

    const getFrequencyStudents = async ({ route }) => {
        setLoading(true)
        try {
            const response = await api.get(route)
            const { data = [] } = response;
            setFrequency(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_turma', label: 'ID' },
        { key: 'nome_turma', label: 'Nome' },
        { key: 'periodo', label: 'Periodo' },
        // { key: 'inicio', label: 'Inicio', date: true },
        // { key: 'fim', label: 'Fim', date: true }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
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
                title={`Frequência - Chamada (${frequencyList?.filter(filter)?.length || '0'})`}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Artes visuais, Desenvolvimento de Games ...' style={{ padding: '15px', }} onChange={setFilterData} />
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
            {frequencyList.length > 0 ?
                <Table_V1 data={frequencyList?.filter(filter)} columns={column} columnId={'id_turma'} query={id ? `=day` : '' } />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Turmas cadastradas para chamada.</Text>
                </Box>
            }
        </>
    )
}
