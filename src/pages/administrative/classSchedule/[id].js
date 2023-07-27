import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditClassSchedule(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newClassSchedule = id === 'new';
    const [classes, setClasses] = useState([])
    const [classDays, setClassDays] = useState([])
    const [daysWeekSelected, setDaysWeekSelected] = useState()
    const [modules, setModules] = useState([])
    const [classScheduleData, setClassScheduleData] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [titleSchedule, setTitleSchedule] = useState('')

    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const gerClassSchedule = async () => {
        try {
            const response = await api.get(`/classSchedule/${id}`)
            const { data } = response
            setClassScheduleData(data)
        } catch (error) {
            console.log(error)
        }
    }

    async function listClasses() {
        try {
            const response = await api.get(`/classes`)
            const { data } = response
            const groupClasses = data.map(course => ({
                label: course.nome_turma,
                value: course?.id_turma,
            }));

            setClasses(groupClasses);
        } catch (error) {
        }
    }

    async function listDisciplines() {
        try {
            const response = await api.get(`/disciplines/active`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
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
                setClassScheduleData({ ...classScheduleData, turma_id: value })

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

    useEffect(() => {
        (async () => {
            if (newClassSchedule) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        listClasses()
        listDisciplines()
    }, [])

    useEffect(() => {
        const classId = classScheduleData?.turma_id
        const module = classScheduleData?.modulo_cronograma
        const handleClassName = classes.filter((item) => item.value === classId).map((classData) => classData.label)
        const title = `${handleClassName}-${module}SEM`
        setTitleSchedule(title)
    }, [classScheduleData?.modulo_cronograma, classScheduleData?.turma_id])


    const handleItems = async () => {
        setLoading(true)
        try {
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

    const handleDayDataChange = (dayWeek, field, value) => {
        setClassDays((prevClassDays) => ({
            ...prevClassDays,
            [dayWeek]: {
                ...prevClassDays[dayWeek],
                dia_semana: dayWeek,
                [field]: value,
            },
        }));
    };

    const handleCreate = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/classSchedule/create/${id}`);
            const { data } = response
            if (response?.status === 201) {
                alert.success('Cronograma cadastrado com sucesso.');
                router.push(`/administrative/classSchedule/${data}`)
            }
        } catch (error) {
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
            const response = await api.post(`/classSchedule/update/${id}`)
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
        { label: 'Quinzenal', value: 15 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const diasDaSemanaOrdenados = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

    return (
        <>
            <SectionHeader
                perfil={classScheduleData?.modulo_cronograma > 0 ? `${classScheduleData?.modulo_cronograma}º módulo` : ''}
                title={classScheduleData?.turma_id ? titleSchedule : 'Novo Cronograma'}
                saveButton
                saveButtonAction={newClassSchedule ? handleCreate : handleEdit}
                deleteButton={!newClassSchedule}
                deleteButtonAction={() => handleDelete()}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Cronograma</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={classes} valueSelection={classScheduleData?.turma_id} onSelect={(value) => handleClassData(value)}
                        title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    < Box sx={{ ...styles.inputSection }}>
                        <SelectList fullWidth data={modules} valueSelection={classScheduleData?.modulo_cronograma} onSelect={(value) => { setClassScheduleData({ ...classScheduleData, modulo_cronograma: value }) }}
                            title="Mòdulo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        {/* <TextInput placeholder='Modulo 1 - Arte visual e Animação 3D...' name='nome_cronograma' onChange={handleChange} value={classScheduleData?.nome_cronograma || ''} label='Nome do cronograma' sx={{ flex: 1, }} /> */}
                    </Box>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput
                        fullWidth
                        placeholder='Data de início'
                        name='dt_inicio_cronograma'
                        onChange={handleChange}
                        value={(classScheduleData?.dt_inicio_cronograma)?.split('T')[0] || ''}
                        label='Data de início'
                        type="date"
                    />
                    <TextInput
                        fullWidth
                        placeholder='Fim'
                        name='dt_fim_cronograma'
                        onChange={handleChange}
                        value={(classScheduleData?.dt_fim_cronograma)?.split('T')[0] || ''}
                        type="date"
                        label='Fim' />
                </Box>
                <RadioItem valueRadio={classScheduleData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setClassScheduleData({ ...classScheduleData, ativo: parseInt(value) })} />
            </ContentContainer>
            <ContentContainer sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, backgroundColor: 'none', boxShadow: 'none' }}>
                <Box>
                    <CheckBoxComponent
                        valueChecked={daysWeekSelected}
                        boxGroup={groupDays}
                        title="Selecione os dias de aula *"
                        horizontal={mobile ? false : true}
                        onSelect={(value) => setDaysWeekSelected(value)}
                        sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'start', flexWrap: 'wrap' }}>
                    {diasDaSemanaOrdenados.map((dayWeek) => {
                        const isSelected = daysWeekSelected?.includes(dayWeek);
                        const lengthDays = daysWeekSelected?.split(',')

                        return isSelected ? (

                            <ContentContainer style={{ flex: { xs: '', xm: '', md: '', lg: lengthDays.length > 3 ? 1 : '' } }} key={dayWeek}>
                                <Text bold title={true} style={{ color: colorPalette.buttonColor }}>{dayWeek}</Text>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <SelectList fullWidth data={disciplines} valueSelection={classDays[dayWeek]?.disciplina_id} onSelect={(value) => handleDayDataChange(dayWeek, 'disciplina_id', value)}
                                        title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, minWidth: '160px' }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList fullWidth data={disciplines} valueSelection={classDays[dayWeek]?.professor_1} onSelect={(value) => handleDayDataChange(dayWeek, 'professor_1', value)}
                                        title="1º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList fullWidth data={disciplines} valueSelection={classDays[dayWeek]?.professor_2} onSelect={(value) => handleDayDataChange(dayWeek, 'professor_2', value)}
                                        title="2º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList fullWidth data={disciplines} valueSelection={classDays[dayWeek]?.optativa} onSelect={(value) => handleDayDataChange(dayWeek, 'optativa', value)}
                                        title="Optativa" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList fullWidth data={groupFrequency} valueSelection={classDays[dayWeek]?.recorrencia} onSelect={(value) => handleDayDataChange(dayWeek, 'recorrencia', value)}
                                        title="Frequência" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    {/* <TextInput
                                        fullWidth
                                        placeholder='Observação'
                                        name='observacao_aula'
                                        onChange={(event) => handleDayDataChange(dayWeek, 'observacao_aula', event.target.value)}
                                        value={classDays[dayWeek]?.observacao_aula}
                                        multiline
                                        maxRows={2}
                                        rows={2}
                                        label='Observação' /> */}
                                </Box>
                            </ContentContainer>
                        ) : null
                    })}
                </Box>
            </ContentContainer>
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