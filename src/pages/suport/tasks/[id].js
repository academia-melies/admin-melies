import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { ContainDropzone, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../helpers"

export default function EditTask(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newTask = id === 'new';
    const [responsibles, setResponsibles] = useState([])
    const [taskData, setTaskData] = useState({})
    const [filesTask, setFilesTask] = useState([])
    const [newInteration, setNewInteration] = useState({ interacao_chamado: '' })
    const [interationsTask, setInterationsTask] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getTask = async () => {
        try {
            const response = await api.get(`/task/${id}`)
            const { data } = response
            setTaskData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function listUsers() {
        try {
            const response = await api.get(`/users`)
            const { data } = response
            const groupResponsibles = data.map(responsible => ({
                label: responsible.nome,
                value: responsible?.id
            }));

            setResponsibles(groupResponsibles)
        } catch (error) {
            return error
        }
    }

    useEffect(() => {
        if (!newTask) {
            handleItems();
        }

    }, [id]);

    useEffect(() => {
        listUsers()
    }, [])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getTask()
            await listUsers()
            // if (serviceResponse) {
            //     await getContracts(serviceResponse.tipo_servico)
            // }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar serviço')
        } finally {
            setLoading(false)
        }
    }

    const checkRequiredFields = () => {
        if (!taskData?.titulo_chamado) {
            alert?.error('O título é obrigatório')
            return false
        }
        if (!taskData?.autor_chamado) {
            alert?.error('O autor é obrigatório')
            return false
        }
        if (!taskData?.prioridade_chamado) {
            alert?.error('A prioridade é obrigatória')
            return false
        }
        if (!taskData?.responsavel_chamado) {
            alert?.error('O responsável do chamado é obrigatório')
            return false
        }
        return true
    }

    const handleCreateTask = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/task/create`, { taskData, userId });
                if (response?.status === 201) {
                    alert.success('Tarefa cadastrada com sucesso.');
                    router.push(`/suport/tasks/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao criar a Tarefa.');
            }
            finally {
                setLoading(false)
            }
            return
        }
        setLoading(false)
    }

    const handleDeleteTask = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/task/delete/${id}`)
            if (response?.status === 200) {
                alert.success('Tarefa excluída com sucesso.');
                router.push(`/suport/task/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Tarefa.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditTask = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/task/update/${id}`, { taskData })
            if (response?.status === 201) {
                alert.success('Tarefa atualizada com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar a Tarefa.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar a Tarefa.');
        } finally {
            setLoading(false)
        }
    }


    const handleChange = (event) => {
        setTaskData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    };


    const handleChangeInteration = (event) => {
        setNewInteration((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    };


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupContract = [
        { label: 'Solicitação', value: 'Solicitação' },
        { label: 'Alteração', value: 'Alteração' },
        { label: 'Erro', value: 'Erro' },
    ]

    const groupPriority = [
        { label: 'Urgente', value: 'Urgente' },
        { label: 'Alta', value: 'Alta' },
        { label: 'Média', value: 'Média' },
        { label: 'Baixa', value: 'Baixa' },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });


    return (
        <>
            <SectionHeader
                perfil={taskData?.tipo_chamado}
                title={`(#${taskData?.id_chamado}).${taskData?.titulo_chamado}` || `Novo Chamado`}
                saveButton
                saveButtonAction={newTask ? handleCreateTask : handleEditTask}
                deleteButton={!newTask}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteTask })}
            />
            {newTask ?
                (<>
                    <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2.5, padding: 5, }}>
                        <Box sx={styles.inputSection}>
                            <SelectList fullWidth data={groupContract} valueSelection={taskData?.tipo_chamado} onSelect={(value) => setTaskData({ ...taskData, tipo_chamado: value })}
                                title="Tipo *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <SelectList fullWidth data={groupPriority} valueSelection={taskData?.prioridade_chamado} onSelect={(value) => setTaskData({ ...taskData, prioridade_chamado: value })}
                                title="Prioridade *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <TextInput placeholder='Nome de quem está solicitando' name='autor_chamado' onChange={handleChange} value={taskData?.autor_chamado || ''} label='Autor *' sx={{ flex: 1, }} />
                            <SelectList fullWidth data={responsibles} valueSelection={taskData?.responsavel_chamado} onSelect={(value) => setTaskData({ ...taskData, responsavel_chamado: value })}
                                title="Responsável *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>
                        <TextInput placeholder='Resumo do problema/solicitação' name='titulo_chamado' onChange={handleChange} value={taskData?.titulo_chamado || ''} label='Título' sx={{ flex: 1, }} />
                        <TextInput
                            placeholder='Descreva aqui o problema/solicitação'
                            name='descricao_chamado'
                            onChange={handleChange} value={taskData?.descricao_chamado || ''}
                            label='Descrição' sx={{ flex: 1, }}
                            multiline
                            maxRows={8}
                            rows={6}
                        />
                    </ContentContainer>
                    <ContainDropzone
                        title="Arquivos"
                        text="Arraste e solte seus arquivos aqui ou clique para selecionar."
                        data={filesTask}
                        callback={(file) => {
                            if (file.status === 201 || file === 200) {
                                handleItems()
                            }
                        }}
                        // screen={serviceData?.tipo_servico}
                        servicoId={id}
                        userId={userId}
                    />
                </>)
                : (
                    <Box sx={{ display: 'flex', flexDirection: { xs: `column`, xm:'row', md:'row', lg:'row' }, gap: 2, backgroundColor: 'none', boxShadow: 'none' }}>
                        <ContentContainer fullWidth style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 5, }}>

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Text bold>Descrição:</Text>
                                <Text>{taskData?.descricao_chamado}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Text bold>Interações:</Text>
                                {interationsTask?.map((item, index) => {
                                    return (
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', flex: 1 }} key={index}>
                                            <Box sx={{ display: 'flex', gap: 0.5, flex: 1, backgroundColor: colorPalette.buttonColor, padding: '10px 10px' }}>
                                                <Text style={{ color: '#d6d6d6' }} light>Por</Text>
                                                <Text bold style={{ color: '#d6d6d6' }} light>{item?.respo_interacao}</Text>
                                                <Text style={{ color: '#d6d6d6' }} light>em</Text>
                                                <Text bold style={{ color: '#d6d6d6' }} light>{formatTimeStamp(item?.dt_criacao, true)}</Text>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
                                                <Text>{item?.descr_interacao}</Text>
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextInput
                                    placeholder='Digite sua nova interação'
                                    name='interacao_chamado'
                                    onChange={handleChangeInteration}
                                    value={newInteration?.interacao_chamado || ''}
                                    sx={{ flex: 1, }}
                                    multiline
                                    maxRows={8}
                                    rows={6}
                                />
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                                    <Button secondary text="Adicionar interação" small style={{ width: 160 }} />
                                </Box>
                            </Box>
                        </ContentContainer>
                        <ContentContainer sx={{
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            minWidth: { xs: `0px`, xm: `300px`, md: `300px`, lg: `300px` },
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Prioridade:</Text>
                                <Text>{taskData?.prioridade_chamado}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Aberto por:</Text>
                                <Text>{taskData?.autor_chamado}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Data de criação:</Text>
                                <Text>{formatTimeStamp(taskData?.dt_criacao, true)}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Responsável:</Text>
                                <Text>{taskData?.nome}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Participantes:</Text>
                                <Text>{''}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Status:</Text>
                                <Text>{taskData?.status_chamado}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Text bold>Tipo de tarefa:</Text>
                                <Text>{taskData?.tipo_chamado}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                <Text bold>Anexos:</Text>
                                <Text>{''}</Text>
                            </Box>
                            <Button text="Finalizar Tarefa" small style={{ flex: 1, height: 30 }} />
                            <Button secondary text="Registrar Tempo" small style={{ flex: 1, height: 30 }} />
                            <Button secondary text="Alterar Prioridade" small style={{ flex: 1, height: 30 }} />
                            <Button secondary text="Alterar Responsável" small style={{ flex: 1, height: 30 }} />
                            <Button secondary text="Adicionar Participante" small style={{ flex: 1, height: 30 }} />
                            <Button text="Excluir Tarefa" small style={{ flex: 1, height: 30 }} />

                        </ContentContainer>
                    </Box>
                )
            }
        </>
    )
}

const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}