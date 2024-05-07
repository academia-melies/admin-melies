import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { IconStatus } from "../../../organisms/Table/table"

export default function EditClassSchedule(props) {
    const { setLoading, alert, colorPalette, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newClassSchedule = id === 'new';
    const [classes, setClasses] = useState([])
    const [classDays, setClassDays] = useState({
        seg: { recorrencia: 7 },
        ter: { recorrencia: 7 },
        qua: { recorrencia: 7 },
        qui: { recorrencia: 7 },
        sex: { recorrencia: 7 },
        sáb: { recorrencia: 7 }
    })
    const [daysWeekSelected, setDaysWeekSelected] = useState('seg, ter, qua, qui, sex, sáb')
    const [modules, setModules] = useState([])
    const [classScheduleData, setClassScheduleData] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [professors, setProfessors] = useState([])
    const [classDaysAlternate, setClassDaysAlternate] = useState({});
    const [classDaysOptative, setClassDaysOptative] = useState([]);
    const [titleSchedule, setTitleSchedule] = useState('')
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const gerClassSchedule = async () => {
        try {
            const response = await api.get(`/classSchedules/${id}`)
            const { data } = response
            if (data) {
                const modulesClass = await api.get(`/class/modules/${data.turma_id}`)
                let modulesResponse = modulesClass.data;
                if (modulesClass.status === 201) {
                    const [module] = modulesResponse.map((item) => item?.modulos)
                    const modules = handleModules(module);
                    setModules(modules);
                }
            }
            setClassScheduleData(data)
        } catch (error) {
            console.log(error)
        }

    }

    async function listClasses() {
        try {
            const response = await api.get(`/classes`)
            const { data } = response
            const groupClasses = data.filter(item => item.ativo === 1)?.map(course => ({
                label: course?.nome_turma,
                value: course?.id_turma,
            }));

            setClasses(groupClasses);
        } catch (error) {
        }
    }

    async function handleSelectModule(value) {

        setClassScheduleData({ ...classScheduleData, modulo_cronograma: value })
        let moduleClass = value;
        try {
            const response = await api.get(`/classSchedule/disciplines/${classScheduleData?.turma_id}/${moduleClass}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
            listProfessor()
            if (response) {
                verifyDuplicityClassSchedule(classScheduleData?.turma_id, moduleClass)
            }
        } catch (error) {
            return error
        }
    }

    const handleClassData = async (value) => {

        if (value) {
            setLoading(true)
            try {
                const response = await api.get(`/class/modules/${value}`)
                const { data } = response
                if (response.status === 201) {
                    const [module] = data.map((item) => item?.modulos)
                    const modules = handleModules(module);
                    setModules(modules);
                }

                setClassScheduleData({ ...classScheduleData, turma_id: value, modulo_cronograma: null })

            } catch (error) {
                return error
            } finally {
                setLoading(false)
            }
        } else {
            setClassScheduleData({ ...classScheduleData, turma_id: value, modulo_cronograma: value })
            setModules([])
        }
    }

    const verifyDuplicityClassSchedule = async (turma_id, modulo_cronograma) => {
        setLoading(true)
        try {
            const response = await api.get(`/classSchedule/verify/${turma_id}/${modulo_cronograma}`)
            const { data } = response
            if (data?.length > 0) {
                alert.info('Já existe um cronograma para o módulo selecionado. Por favor, Escolha outro módulo')
            }
            return
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleModules = (module) => {
        const moduleArray = [];
        for (let i = 1; i <= module; i++) {
            moduleArray.push({
                label: `${i}º Módulo`,
                value: i,
            });
        }
        return moduleArray;
    }

    async function listProfessor() {
        const response = await api.get(`/classSchedule/disciplines/professor`)
        const { data } = response
        const groupProfessor = data.map(professor => ({
            label: professor.nome,
            value: professor?.id
        }));

        const sortedUsers = groupProfessor?.sort((a, b) => a.label.localeCompare(b.label))

        setProfessors(sortedUsers)
    }

    useEffect(() => {
        (async () => {
            if (newClassSchedule) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        fetchPermissions()
        listClasses()
    }, [])

    useEffect(() => {
        listProfessor()
    }, [disciplines])

    useEffect(() => {
        if (classScheduleData?.modulo_cronograma != '') {
            setDisciplines([])
            setClassDays({
                seg: { recorrencia: 7 },
                ter: { recorrencia: 7 },
                qua: { recorrencia: 7 },
                qui: { recorrencia: 7 },
                sex: { recorrencia: 7 },
                sáb: { recorrencia: 7 }
            })
            setClassDaysAlternate([])
        }
    }, [classScheduleData?.turma_id])


    useEffect(() => {
        const classId = classScheduleData?.turma_id || ''
        const moduleClass = classScheduleData?.modulo_cronograma || ''
        const handleClassName = classes.filter((item) => item.value === classId).map((classData) => classData.label)
        const title = `${handleClassName}-${moduleClass}SEM`
        setTitleSchedule(title)
        setClassScheduleData({ ...classScheduleData, nome_cronograma: title })
    }, [classScheduleData?.modulo_cronograma, classScheduleData?.turma_id])


    const handleItems = async () => {
        setLoading(true)
        try {
            listClasses()
            await gerClassSchedule()

        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Curso')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        if (value.target.name === 'dt_inicio_cronograma' || value.target.name === 'dt_fim_cronograma') {

            setClassScheduleData((prevValues) => ({
                ...prevValues,
                [value.target.name]: new Date(value.target.value)
            }));
        }

        setClassScheduleData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const addClassDayOptative = (dayWeek) => {
        setClassDaysOptative((prevClassDays) => ([
            ...prevClassDays,
            {
                [dayWeek]: {
                    dia_semana: dayWeek,
                    disciplina_id: null,
                    professor1_id: null,
                    professor2_id: null,
                    key: Math.random().toString(36).substring(7),
                }
            },
        ]));
    };



    const removeClassDayOptative = (index) => {
        const newData = [...classDaysOptative];
        newData.splice(index, 1);
        setClassDaysOptative(newData);
    };

    const handleDayDataChange = (dayWeek, field, value, isAlternate = false, isOptative = false, key) => {

        if (isAlternate) {
            setClassDaysAlternate((prevClassDays) => ({
                ...prevClassDays,
                [dayWeek]: {
                    ...prevClassDays[dayWeek],
                    dia_semana: dayWeek,
                    [field]: value,
                },
            }));
        } else if (isOptative) {
            setClassDaysOptative((prevClassDays) => prevClassDays?.map((item) => {
                if (item[dayWeek]?.dia_semana === dayWeek && item[dayWeek]?.key === key) {
                    return {
                        ...item,
                        [dayWeek]: {
                            ...item[dayWeek],
                            dia_semana: dayWeek,
                            [field]: value,
                        },
                    };
                }
                return item;
            }));
        }
        else {
            setClassDays((prevClassDays) => ({
                ...prevClassDays,
                [dayWeek]: {
                    ...prevClassDays[dayWeek],
                    dia_semana: dayWeek,
                    [field]: value,
                },
            }));
        }
    };

    const handleCreate = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/classSchedule/create`, { classScheduleData, classDays, classDaysAlternate, classDaysOptative });
            if (response?.status === 201) {
                alert.success('Cronograma cadastrado com sucesso.');
                router.push(`/administrative/classSchedule/list`)
            }
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao cadastrar o Cronograma.');
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/classSchedule/delete/${id}`)
            if (response?.status == 201) {
                alert.success('Cronograma excluído com sucesso.');
                router.push(`/administrative/classSchedule/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Cronograma.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/classSchedule/update/${id}`, { classScheduleData })
            if (response?.status === 201) {
                alert.success('Cronograma atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Cronograma.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Cronograma.');
        } finally {
            setLoading(false)
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupDays = [
        { label: 'seg', value: 'seg' },
        { label: 'ter', value: 'ter' },
        { label: 'qua', value: 'qua' },
        { label: 'qui', value: 'qui' },
        { label: 'sex', value: 'sex' },
        { label: 'sáb', value: 'sáb' },
    ]

    const groupFrequency = [
        { label: 'Semanal', value: 7 },
        { label: 'Quinzenal', value: 14 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const diasDaSemanaOrdenados = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

    return (
        <>
            <SectionHeader
                perfil={classScheduleData?.modulo_cronograma > 0 ? `${classScheduleData?.modulo_cronograma}º Módulo` : ''}
                title={classScheduleData?.turma_id ? titleSchedule : 'Novo Cronograma'}
                saveButton={isPermissionEdit}
                saveButtonAction={newClassSchedule ? handleCreate : handleEdit}
                inativeButton={!newClassSchedule && isPermissionEdit}
                inativeButtonAction={(event) => setShowConfirmationDialog({
                    active: true,
                    event,
                    acceptAction: handleDelete,
                    title: 'Deseja Inativar o cronograma?',
                    message: 'A Grade será inativada, e ficará por um tempo no banco de dados, até que seja excluída. Essa ação afeterá as aulas, notas e chamada vinculádas a esse semestre.'
                })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                    <Text title bold>Cronograma</Text>
                    <IconStatus
                        style={{ backgroundColor: classScheduleData.ativo >= 1 ? 'green' : 'red', boxShadow: classScheduleData.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={classes} valueSelection={classScheduleData?.turma_id} onSelect={(value) => handleClassData(value)}
                        title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    < Box sx={{ ...styles.inputSection }}>
                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={modules} valueSelection={classScheduleData?.modulo_cronograma} onSelect={(value) => { handleSelectModule(value) }}
                            title="Mòdulo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput
                        disabled={!isPermissionEdit && true}
                        fullWidth
                        name='dt_inicio_cronograma'
                        onChange={handleChange}
                        value={(classScheduleData?.dt_inicio_cronograma)?.split('T')[0] || ''}
                        label='Data de início'
                        type="date"
                    />
                    <TextInput
                        disabled={!isPermissionEdit && true}
                        fullWidth
                        placeholder='Fim'
                        name='dt_fim_cronograma'
                        onChange={handleChange}
                        value={(classScheduleData?.dt_fim_cronograma)?.split('T')[0] || ''}
                        type="date"
                        label='Fim' />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={classScheduleData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setClassScheduleData({ ...classScheduleData, ativo: parseInt(value) })} />
            </ContentContainer>

            {newClassSchedule &&
                <ContentContainer sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, backgroundColor: 'none', boxShadow: 'none' }}>
                    <Box>
                        <CheckBoxComponent
                            disabled={!isPermissionEdit && true}
                            valueChecked={daysWeekSelected}
                            boxGroup={groupDays}
                            title="Selecione os dias de aula *"
                            horizontal={mobile ? false : true}
                            onSelect={(value) => setDaysWeekSelected(value)}
                            sx={{ flex: 1, }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'start', flexDirection: 'column' }}>
                        {diasDaSemanaOrdenados.map((dayWeek) => {
                            const classOptative = classDaysOptative?.map(item => item && item[dayWeek]?.dia_semana === dayWeek)
                            const isSelected = daysWeekSelected?.includes(dayWeek);
                            const lengthDays = daysWeekSelected?.split(',')

                            return isSelected ? (
                                <Box sx={{
                                    display: 'flex', gap: 2, justifyContent: 'start',
                                    // border: classDays[dayWeek]?.recorrencia === 14 && `1px solid ${colorPalette.buttonColor}`,
                                    border: classOptative?.length > 0 && `1px solid ${colorPalette.buttonColor}`,
                                    borderRadius: classDays[dayWeek]?.recorrencia === 14 && '8px', padding: classDays[dayWeek]?.recorrencia === 14 && 1,
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'start', padding: classDays[dayWeek]?.recorrencia === 14 && 1, flex: 1 }}>

                                        <ContentContainer style={{ flex: 1 }} key={dayWeek}>
                                            <Text bold title={true} style={{ color: colorPalette.buttonColor }}>{dayWeek}</Text>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={disciplines} valueSelection={classDays[dayWeek]?.disciplina_id} onSelect={(value) => handleDayDataChange(dayWeek, 'disciplina_id', value)}
                                                    title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, minWidth: lengthDays.length < 4 ? '200px' : '' }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                />
                                                <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={professors} valueSelection={classDays[dayWeek]?.professor1_id} onSelect={(value) => handleDayDataChange(dayWeek, 'professor1_id', value)}
                                                    title="1º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                />
                                                <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={professors} valueSelection={classDays[dayWeek]?.professor2_id} onSelect={(value) => handleDayDataChange(dayWeek, 'professor2_id', value)}
                                                    title="2º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                />
                                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupFrequency} valueSelection={classDays[dayWeek]?.recorrencia || 7} onSelect={(value) => handleDayDataChange(dayWeek, 'recorrencia', value)}
                                                    title="Frequência" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                />
                                                <Box sx={{
                                                    display: 'flex', gap: 1, alignItems: 'center', padding: '8px 12px', borderRadius: 2,
                                                    border: `1px solid green`, width: 220, justifyContent: 'space-between',
                                                    transition: '.3s',
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    }
                                                }} onClick={() => addClassDayOptative(dayWeek)}>
                                                    <Text bold>Adicionar optativa</Text>
                                                    <Box sx={{
                                                        backgroundSize: 'cover',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center',
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        backgroundImage: `url(/icons/include_icon.png)`,
                                                    }} />
                                                </Box>
                                            </Box>
                                        </ContentContainer>
                                        {classDays[dayWeek]?.recorrencia === 14 &&
                                            <ContentContainer style={{ flex: 1 }} key={dayWeek}>
                                                <Text bold title={true} style={{ color: colorPalette.buttonColor, display: 'flex', alignItems: 'end', gap: 5 }}>
                                                    {dayWeek}
                                                    <Text bold small style={{ padding: '0px 0px 5px 0px' }}>aula alternada</Text>
                                                </Text>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={disciplines}
                                                        valueSelection={classDaysAlternate[dayWeek]?.disciplina_id}
                                                        onSelect={(value) => handleDayDataChange(dayWeek, 'disciplina_id', value, true)}
                                                        title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, minWidth: lengthDays.length < 4 ? '200px' : '' }}
                                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    />
                                                    <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={professors}
                                                        valueSelection={classDaysAlternate[dayWeek]?.professor1_id}
                                                        onSelect={(value) => handleDayDataChange(dayWeek, 'professor1_id', value, true)}
                                                        title="1º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    />
                                                    <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={professors} valueSelection={classDaysAlternate[dayWeek]?.professor2_id} onSelect={(value) => handleDayDataChange(dayWeek, 'professor2_id', value, true)}
                                                        title="2º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    />
                                                </Box>

                                            </ContentContainer>
                                        }
                                    </Box>
                                    {

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {classDaysOptative?.map((item, index) => {
                                                const classDay = item && item[dayWeek]?.dia_semana === dayWeek;

                                                if (classDay) {
                                                    return (
                                                        <ContentContainer key={index} style={{ flex: 1 }}>
                                                            <Text bold title={true} style={{ color: colorPalette.buttonColor, display: 'flex', alignItems: 'end', gap: 5 }}>
                                                                {dayWeek}
                                                                <Text bold small style={{ padding: '0px 0px 5px 0px' }}>{index + 1}º optativa</Text>
                                                            </Text>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={disciplines}
                                                                    valueSelection={item[dayWeek]?.disciplina_id}
                                                                    onSelect={(value) => handleDayDataChange(dayWeek, 'disciplina_id', value, false, true, item[dayWeek]?.key)}
                                                                    title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, minWidth: lengthDays.length < 4 ? '200px' : '' }}
                                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                                />
                                                                <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={professors}
                                                                    valueSelection={item[dayWeek]?.professor1_id}
                                                                    onSelect={(value) => handleDayDataChange(dayWeek, 'professor1_id', value, false, true, item[dayWeek]?.key)}
                                                                    title="1º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                                />
                                                                <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={professors} valueSelection={item[dayWeek]?.professor2_id} onSelect={(value) => handleDayDataChange(dayWeek, 'professor2_id', value, false, true, item[dayWeek]?.key)}
                                                                    title="2º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                                />
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex', gap: 1, alignItems: 'center', padding: '8px 12px', borderRadius: 2,
                                                                border: `1px solid red`, width: 220, justifyContent: 'space-between',
                                                                transition: '.3s',
                                                                "&:hover": {
                                                                    opacity: 0.8,
                                                                    cursor: 'pointer'
                                                                }
                                                            }} onClick={() => removeClassDayOptative(index)}>
                                                                <Text bold style={{ color: 'red' }}>Remover optativa</Text>
                                                                <Box sx={{
                                                                    backgroundSize: 'cover',
                                                                    backgroundRepeat: 'no-repeat',
                                                                    backgroundPosition: 'center',
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    backgroundImage: `url(/icons/exclude.png)`,
                                                                }} />
                                                            </Box>
                                                        </ContentContainer>
                                                    )
                                                }
                                            })}
                                        </Box>

                                    }
                                </Box>
                            ) : null
                        })}
                    </Box>
                </ContentContainer>
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