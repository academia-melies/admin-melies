import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListTasks(props) {
    const [tasksList, setTasksList] = useState([])
    const [responsibles, setResponsibles] = useState([])
    const [filterData, setFilterData] = useState('')
    const [filters, setFilters] = useState({
        responsible: 'todos',
        status: 'todos',
        priority: 'todos',
        participant: 'todos',
        actor: 'todos',
        type: 'todos'
    })
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filterFunctions = {
        responsible: (item) => filters.responsible === 'todos' || item.responsavel_chamado === filters.responsible,
        status: (item) => filters.status === 'todos' || item.status_chamado === filters.status,
        priority: (item) => filters.priority === 'todos' || item.prioridade_chamado === filters.priority,
        // participant: (item) => filters.participant === 'todos' || item.participant === filters.participant,
        actor: (item) => filters.actor === 'todos' || item.autor_chamado === filters.actor,
        type: (item) => filters.type === 'todos' || item.tipo_chamado === filters.type
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };


    useEffect(() => {
        getTasks();
        listUsers()
    }, []);

    const getTasks = async () => {
        setLoading(true)
        try {
            const response = await api.get('/tasks')
            const { data } = response;
            setTasksList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function listUsers() {
        try {
            const response = await api.get(`/users`)
            const { data } = response
            const groupResponsibles = [
                {
                    label: 'Todos',
                    value: 'todos'
                },
                ...data.map(responsible => ({
                    label: responsible.nome,
                    value: responsible?.id
                }))
            ];

            setResponsibles(groupResponsibles)
        } catch (error) {
            return error
        }
    }

    const column = [
        { key: 'id_chamado', label: 'ID' },
        { key: 'prioridade_chamado', label: 'Prioridade' },
        { key: 'titulo_chamado', label: 'Título' },
        { key: 'autor_chamado', label: 'Autor' },
        { key: 'nome', label: 'Executor' },
        { key: 'status_chamado', label: 'Status' },
        { key: 'dt_criacao', label: 'Criado em', date: true },
        { key: 'dt_atualizacao', label: 'Atualizado em', date: true },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Em aberto', value: 'Em aberto' },
        { label: 'Em andamento', value: 'Em andamento' },
        { label: 'Finalizado', value: 'Finalizado' },
    ]

    const groupType = [
        { label: 'Todos', value: 'todos' },
        { label: 'Solicitação', value: 'Solicitação' },
        { label: 'Alteração', value: 'Alteração' },
        { label: 'Erro', value: 'Erro' },
    ]

    const groupPriority = [
        { label: 'Todos', value: 'todos' },
        { label: 'Urgente', value: 'Urgente' },
        { label: 'Alta', value: 'Alta' },
        { label: 'Média', value: 'Média' },
        { label: 'Baixa', value: 'Baixa' },
    ]


    return (
        <>
            <SectionHeader
                // title={`Chamados (${tasksList?.length || '0'})`}
                title={`Chamados (${tasksList?.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/suport/${pathname}/new`)}
            />
            <ContentContainer>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{tasksList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{tasksList?.length || 10}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>chamados</Text>

                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <SearchBar placeholder='Busque pelo nome ou numero do chamado' style={{ backgroundColor: colorPalette.inputColor, transition: 'background-color 1s', }} onChange={setFilterData} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                    <SelectList
                        fullWidth
                        data={groupPriority}
                        valueSelection={filters?.priority}
                        onSelect={(value) => setFilters({ ...filters, priority: value })}
                        title="Prioridade"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={groupType}
                        valueSelection={filters?.type}
                        onSelect={(value) => setFilters({ ...filters, type: value })}
                        title="Tipo"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={responsibles}
                        valueSelection={filters?.responsible}
                        onSelect={(value) => setFilters({ ...filters, responsible: value })}
                        title="Executor"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={listStatus}
                        valueSelection={filters?.status}
                        onSelect={(value) => setFilters({ ...filters, status: value })}
                        title="Status"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={listStatus}
                        valueSelection={filters?.participant}
                        onSelect={(value) => setFilters({ ...filters, participant: value })}
                        title="Participante"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120 }} onClick={() => setFilters({
                            responsible: 'todos',
                            status: 'todos',
                            priority: 'todos',
                            participant: 'todos',
                            actor: 'todos',
                            type: 'todos'
                        })} />
                    </Box>
                </Box>
            </ContentContainer >
            <Table_V1 data={tasksList.filter(filter)} columns={column} columnId={'id_chamado'} columnActive={false} onFilter />
        </>
    )
}
