import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { ContainDropzone, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../helpers"
import { icons } from "../../../organisms/layout/Colors"
import Link from "next/link"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"

export default function EditTask(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newTask = id === 'new';
    const [responsibles, setResponsibles] = useState([])
    const [taskData, setTaskData] = useState({
        status_chamado: '',
        responsavel_chamado: '',
        autor_chamado: user?.id
    })
    const [alterationTask, setAlterationTask] = useState(false)
    const [showPriorityAltern, setShowPriorityAltern] = useState(false)
    const [showAlternUsers, setShowAlternUsers] = useState({
        responsible: false,
        participant: false
    })
    const [statusAlteration, setStatusAlteration] = useState({ finalizado: false, reaberto: false })
    const [filesTask, setFilesTask] = useState([])
    const [newInteration, setNewInteration] = useState({ descr_interacao: '' })
    const [interationsTask, setInterationsTask] = useState([])
    const [participantsTask, setParticipantsTask] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const priorityColor = (data) => ((data === 'Alta' && 'yellow') ||
        (data === 'Urgente' && 'red') ||
        (data === 'Média' && 'green') ||
        (data === 'Baixa' && 'blue'))

    const getTask = async () => {
        try {
            const response = await api.get(`/task/${id}`)
            const { data } = response
            if (response?.status === 200) {
                setTaskData(data)
                return true
            }
            return false
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function listUsers() {
        try {
            const response = await api.get(`/users/area?area=${'TI - Suporte'}`)
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

    const getInterationsTask = async () => {
        try {
            const response = await api.get(`/task/interation/${id}`)
            const { data } = response
            if (data?.length > 0) {
                setInterationsTask(data)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getParticipantsTask = async () => {
        try {
            const response = await api.get(`/task/participant/${id}`)
            const { data } = response
            setParticipantsTask(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getTaskFiles = async () => {
        try {
            const response = await api.get(`/task/files/${id}`)
            const { data } = response
            setFilesTask(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }



    useEffect(() => {
        if (!newTask) {
            handleItems();
            setNewInteration({ ...newInteration, usuario_id: userId, chamado_id: id })
            return
        }
        setTaskData({ ...taskData, autor_chamado: user?.id, status_chamado: 'Em aberto' })

    }, [id]);

    useEffect(() => {
        listUsers()
    }, [])

    useEffect(() => {
        if (taskData?.status_chamado !== '' && alterationTask) {
            handleEditTask(statusAlteration)
        }
    }, [taskData?.status_chamado])


    const handleItems = async () => {
        setLoading(true)
        try {
            const task = await getTask()
            if (task) {
                await listUsers()
                await getInterationsTask()
                await getParticipantsTask()
                await getTaskFiles()
                await setAlterationTask(false)
            }
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
                const response = await api.post(`/task/create`, { taskData, userId, userName: user?.nome, filesTask });
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
                router.push(`/suport/tasks/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Tarefa.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditTask = async ({ finalizado = false, reaberto = false, priority = false, responsible = false }) => {
        setLoading(true)
        let status = (finalizado && 'finalizada') || (reaberto && 're-aberta') || false;
        if (priority) { taskData.prioridade_chamado = priority }
        if (responsible) { taskData.responsavel_chamado = responsible }

        try {
            const response = await api.patch(`/task/update/${id}`, { taskData, status, newInteration, userName: user?.nome })
            if (response?.status === 201) {
                alert.success('Tarefa atualizada com sucesso.');
                setNewInteration({ ...newInteration, descr_interacao: '' })
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

    const handleAddInteration = async (description) => {
        setLoading(true)
        if (description) { newInteration.descr_interacao = description }
        try {
            const response = await api.post(`/task/interation/create`, { newInteration });
            if (response?.status === 201) {
                alert.success('Interação adicionada com sucesso.');
                setNewInteration({ ...newInteration, descr_interacao: '' })
                handleItems()
            }
        } catch (error) {
            alert.error('Tivemos um problema ao criar a Tarefa.');
            return error
        }
        finally {
            setLoading(false)
        }
    }

    const handleChangePriority = async (value) => {
        try {
            if (value) {
                setTaskData({ ...taskData, prioridade_chamado: value })
            }
            let description = `A prioridade da tarefa foi alterada para ${value}.`
            await handleEditTask({ finalizado: false, reaberto: false, priority: value })
            await handleAddInteration(description)
            setShowPriorityAltern(false)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const handleChangeResponsible = async (value, label) => {
        try {
            if (value) {
                setTaskData({ ...taskData, responsavel_chamado: value })
            }
            let description = `${user?.nome} alterou o responsável para ${label}.`
            await handleEditTask({ finalizado: false, reaberto: false, responsible: value })
            await handleAddInteration(description)
            setShowAlternUsers({ responsible: false, participant: false })
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleAddParticipant = async (value, label) => {
        setLoading(true)
        try {
            const response = await api.post(`/task/participant/create/${id}`, { participante_id: value, usuario_id: taskData?.usuario_id })
            if (response?.status === 201) {
                let description = `${user?.nome} adicionou ${label} á esta tarefa.`
                await handleAddInteration(description)
            }
            setShowAlternUsers({ responsible: false, participant: false })
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteParticipant = async (value, label) => {
        setLoading(true)
        try {
            const response = await api.delete(`/task/participant/delete/${value}`)
            if (response?.status === 200) {
                let description = `${user?.nome} removeu ${label} desta tarefa.`
                await handleAddInteration(description)
            }
            setShowAlternUsers({ responsible: false, participant: false })
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteFile = async (fileId, key) => {
        setLoading(true)
        try {
            let query = `?key=${key}`;
            const response = await api.delete(`/task/file/delete/${fileId}${query}`)
            if (response.status === 200) {
                alert.info('Arquivo excluído.')
                handleItems()
            }
        } catch (error) {
            return error
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

    const handleChangeFiles = (fileId, filePreview) => {
        setFilesTask((prevClassDays) => [
            ...prevClassDays,
            {
                id_arq_chamado: fileId,
                location: filePreview,
                name_file: filePreview,
            }
        ]);
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

            {!taskData && <Forbidden />}
            {taskData && <> <SectionHeader
                perfil={taskData?.tipo_chamado}
                title={taskData?.titulo_chamado ? (`(#${taskData?.id_chamado || 'ID'}).${taskData?.titulo_chamado}`) : `Novo Chamado`}
                saveButton={newTask && true}
                saveButtonAction={newTask && handleCreateTask}
            />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
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
                                    <TextInput placeholder='Id de quem está solicitando' name='autor_chamado' onChange={handleChange} value={taskData?.autor_chamado || user?.nome} label='ID Autor *' sx={{ flex: 1, }} />
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
                        </>)
                        : (
                            <Box sx={{ display: 'flex', flexDirection: { xs: `column`, xm: 'row', md: 'row', lg: 'row' }, gap: 1.8, backgroundColor: 'none', boxShadow: 'none' }}>
                                <ContentContainer fullWidth style={{ display: 'flex', flexDirection: 'column', gap: 1.8, padding: 5, }}>

                                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                        <Text bold>Descrição:</Text>
                                        <Text>{taskData?.descricao_chamado}</Text>
                                    </Box>
                                    <Divider distance={0} />
                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', marginTop: 5 }}>
                                        <Text bold>Interações:</Text>
                                        {interationsTask?.map((item, index) => {
                                            return (
                                                <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', flex: 1, border: `1px solid #d6d6d6`, borderRadius: '9px' }} key={index}>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flex: 1, backgroundColor: colorPalette.buttonColor, padding: '10px 10px', borderRadius: '8px 8px 0px 0px' }}>
                                                        <Text style={{ color: '#FFF' }} light>Por</Text>
                                                        <Text bold style={{ color: '#FFF' }}>{item?.criado_por}</Text>
                                                        <Text style={{ color: '#FFF' }} light>em</Text>
                                                        <Text bold style={{ color: '#FFF' }}>{formatTimeStamp(item?.dt_criacao, true)}</Text>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'start', padding: '5px 0px 15px 15px' }}>
                                                        <Text>{item?.descr_interacao}</Text>
                                                    </Box>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                    {taskData?.status_chamado !== 'Finalizado' && <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <TextInput
                                            placeholder='Digite sua nova interação'
                                            name='descr_interacao'
                                            onChange={handleChangeInteration}
                                            value={newInteration?.descr_interacao || ''}
                                            sx={{ flex: 1, }}
                                            multiline
                                            maxRows={8}
                                            rows={6}
                                        />
                                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                                            <Button secondary text="Adicionar interação" small style={{ width: 160 }} onClick={() => handleAddInteration()} />
                                        </Box>
                                    </Box>}
                                </ContentContainer>
                                <ContentContainer sx={{
                                    display: 'flex', flexDirection: 'column', minWidth: { xs: `0px`, xm: `300px`, md: `300px`, lg: `300px` },
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Text bold>Prioridade:</Text>
                                        <Box sx={{
                                            display: 'flex',
                                            backgroundColor: colorPalette.primary,
                                            height: 25,
                                            gap: 2,
                                            alignItems: 'center',
                                            maxWidth: 100,
                                            borderRadius: 2,
                                            justifyContent: 'start'
                                        }}>
                                            <Box sx={{ display: 'flex', backgroundColor: priorityColor(taskData?.prioridade_chamado), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                            <Text bold>{taskData?.prioridade_chamado}</Text>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Text bold>Aberto por:</Text>
                                        <Text>{taskData?.autor}</Text>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Text bold>Data de criação:</Text>
                                        <Text>{formatTimeStamp(taskData?.dt_criacao, true)}</Text>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Text bold>Responsável:</Text>
                                        <Text>{taskData?.nome}</Text>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 }}>
                                        <Text bold>Participantes:</Text>
                                        {participantsTask?.map((item, index) => {
                                            return (
                                                <Box key={index} sx={{ display: 'flex', gap: 1, maxWidth: 180, backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                                    <Text small>{item?.nome}</Text>
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        width: 12,
                                                        height: 12,
                                                        aspectRatio: '1:1',
                                                        backgroundImage: `url(${icons.gray_close})`,
                                                        transition: '.3s',
                                                        zIndex: 999999999,
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} onClick={() => handleDeleteParticipant(item?.id_participante_ch, item?.nome)} />
                                                    
                                                </Box>
                                                
                                            )
                                        })}
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
                                    <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: 5, gap: .5 }}>
                                        <Text bold>Anexos:</Text>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: .5 }}>
                                            {filesTask?.map((item, index) => {
                                                return (
                                                    <Box key={index} sx={{
                                                        display: 'flex',
                                                        alignItems: 'start',
                                                        width: '100%',
                                                        justifyContent: 'space-between',
                                                        cursor: 'pointer',
                                                        transition: '.5s',
                                                        borderRadius: 2,
                                                        padding: '1px 8px',
                                                        backgroundColor: colorPalette.primary
                                                    }}>
                                                        <Link href={item?.location} target="_blank" sx={{ overflow: 'hidden', flexGrow: 1 }}>
                                                            <Text small light sx={{
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                maxWidth: 150,
                                                                color: colorPalette.buttonColor,
                                                                "&:hover": {
                                                                    opacity: 0.7,
                                                                    cursor: 'pointer',
                                                                }
                                                            }}>
                                                                {item?.name_file}
                                                            </Text>
                                                        </Link>
                                                        <Box sx={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px', borderRadius: 20, transition: '.3s', "&:hover": {
                                                                opacity: 0.8,
                                                                cursor: 'pointer',
                                                                backgroundColor: 'lightcoral'
                                                            }
                                                        }} onClick={() => handleDeleteFile(item?.id_arq_chamado, item?.key_file)}>
                                                            <Box sx={{
                                                                ...styles.menuIcon,
                                                                width: 12,
                                                                height: 12,
                                                                aspectRatio: '1:1',
                                                                backgroundImage: `url(${icons.gray_close})`,
                                                                transition: '.3s',
                                                                zIndex: 999999999,
                                                            }} />
                                                        </Box>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Box>
                                    {taskData?.status_chamado !== 'Finalizado' && <Button text="Finalizar Tarefa" small style={{ height: 35 }} onClick={() => {
                                        setTaskData({ ...taskData, status_chamado: 'Finalizado' })
                                        setStatusAlteration({ finalizado: true, reaberto: false })
                                        setAlterationTask(true)
                                    }} />}
                                    {taskData?.status_chamado === 'Finalizado' && <Button text="Reabrir Tarefa" small style={{ height: 35 }} onClick={() => {
                                        setTaskData({ ...taskData, status_chamado: 'Em aberto' })
                                        setStatusAlteration({ finalizado: false, reaberto: true })
                                        setAlterationTask(true)
                                    }} />}
                                    <Button secondary text="Alterar Prioridade" small style={{ height: 35 }} onClick={() => setShowPriorityAltern(true)} />
                                    <Button secondary text="Alterar Responsável" small style={{ height: 35 }} onClick={() => setShowAlternUsers({ participant: false, responsible: true })} />
                                    <Button secondary text="Adicionar Participante" small style={{ height: 35 }} onClick={() => setShowAlternUsers({ responsible: false, participant: true })} />
                                    <Button text="Excluir Tarefa" small style={{ height: 35 }}
                                        onClick={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteTask })} />

                                </ContentContainer>
                            </Box>
                        )
                    }
                    <Backdrop open={showPriorityAltern} sx={{ zIndex: 999999 }}>
                        <ContentContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                                <Text bold large>Selecione a prioridade</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => setShowPriorityAltern(false)} />
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                                {groupPriority?.map((item, index) => {
                                    return (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            backgroundColor: colorPalette.primary,
                                            height: 25,
                                            gap: 2,
                                            alignItems: 'center',
                                            maxWidth: 100,
                                            borderRadius: 2,
                                            justifyContent: 'start',
                                            marginBottom: 2,
                                            flexBasis: '50%',
                                            cursor: 'pointer',
                                            transition: '.5s',
                                            "&:hover": {
                                                opacity: 0.7,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => handleChangePriority(item?.value)}>
                                            <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.value), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                            <Text bold>{item?.label}</Text>
                                        </Box>
                                    )
                                })}
                            </Box>

                        </ContentContainer>
                    </Backdrop>

                    <Backdrop open={showAlternUsers.responsible || showAlternUsers.participant} sx={{ zIndex: 999999 }}>
                        <ContentContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                                <Text bold large>{(showAlternUsers.responsible && 'Selecione o novo responsável') || (showAlternUsers.participant && 'Selecione o usuário participante')}</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => setShowAlternUsers({ responsible: false, participant: false })} />
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', marginTop: 2,  flexDirection: 'column', alignItems: 'center', justifyContent: 'start', maxHeight: 280, overflow: 'auto', borderRadius: 2 }}>
                                {responsibles?.map((item, index) => {
                                    return (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            backgroundColor: colorPalette.primary,
                                            padding: '8px 12px',
                                            alignItems: 'center',
                                            width: '100%',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: '.5s',
                                            "&:hover": {
                                                // opacity: 0.7,
                                                cursor: 'pointer',
                                                backgroundColor: colorPalette.primary + '22'
                                            }
                                        }} onClick={() => {
                                            showAlternUsers.responsible && handleChangeResponsible(item?.value, item?.label) ||
                                                showAlternUsers.participant && handleAddParticipant(item?.value, item?.label)

                                        }}>
                                            <Text bold>{item?.label}</Text>
                                        </Box>
                                    )
                                })}
                            </Box>

                        </ContentContainer>
                    </Backdrop>
                    <ContainDropzone
                        title="Arquivos"
                        text="Arraste e solte seus arquivos aqui ou clique para selecionar."
                        data={filesTask}
                        callback={(file) => {
                            if (file.status === 201 || file === 200) {
                                if (!newTask) { handleItems() }
                                else {
                                    handleChangeFiles(file.fileId, file.filePreview)
                                }
                            }
                        }}
                        userId={user?.id}
                        taskId={id}
                        filesContainer={newTask ? true : false}
                    />
                </Box>
            </>}
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