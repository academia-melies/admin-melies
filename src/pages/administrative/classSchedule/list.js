import { useEffect, useState } from "react";
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms";
import { SectionHeader, SelectList, Table_V1 } from "../../../organisms";
import { useAppContext } from "../../../context/AppContext";
import { useRouter } from "next/router";
import { Colors, icons } from "../../../organisms/layout/Colors";
import { api } from "../../../api/api";
import { Backdrop } from "@mui/material";


export default function ClassSheduleList(props) {

    const [dateClass, setDateClass] = useState([]);
    const [classDaySelect, setClassDaySelect] = useState([]);
    const [showClassDay, setShowClassDay] = useState(false);
    const [classScheduleId, setClassScheduleId] = useState();
    const [disciplines, setDisciplines] = useState([])
    const [professors, setProfessors] = useState([])
    const { setLoading, colorPalette, matches, alert } = useAppContext()
    const [showClassSchedulesTable, setShowClassSchedulesTable] = useState({});
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const toggleClassTable = (index) => {
        setShowClassSchedulesTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleScheduleClass = async (req, res) => {
        setLoading(true)
        try {
            const response = await api.get(`/classSchedules`)
            const { data } = response
            setDateClass(data)
        } catch (error) {
            console.log(error)
            return
        } finally {
            setLoading(false)
        }
    }

    const handleClassDay = async (req, res) => {
        setLoading(true)
        try {
            const response = await api.get(`/classDay/${classScheduleId}`)
            const { data } = response
            setClassDaySelect(data)
            if (classDaySelect) {
                const discipline = await api.get(`/classSchedule/disciplines/${classDaySelect?.turma_id}/${classDaySelect?.modulo_cronograma}`)
                let disciplinesData = discipline.data;
                const groupDisciplines = disciplinesData?.map(disciplines => ({
                    label: disciplines?.nome_disciplina,
                    value: disciplines?.id_disciplina
                }));

                setDisciplines(groupDisciplines);
            }
        } catch (error) {
            console.log(error)
            return
        } finally {
            setLoading(false)
        }
    }

    async function listProfessor() {
        const response = await api.get(`/classSchedule/disciplines/professor`)
        const { data } = response
        const groupProfessor = data?.map(professor => ({
            label: professor.nome,
            value: professor?.id
        }));

        setProfessors(groupProfessor)
    }


    const handleClassesItem = async () => {
        await handleClassDay()
        await listProfessor()
    }

    useEffect(() => {
        handleScheduleClass()
    }, [])

    useEffect(() => {
        handleClassesItem()
    }, [classScheduleId])

    const handleEditClassDay = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/classDay/update`, { classDaySelect })
            if (response?.status === 201) {
                alert.success('Aula atualizada com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Aula.');
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao atualizar Aula.');
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        if (value.target.name === 'dt_aula') {

            setClassDaySelect((prevValues) => ({
                ...prevValues,
                [value.target.name]: new Date(value.target.value)
            }));
        }

        setClassDaySelect((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const column = [
        { key: 'professor', label: 'Professor(a)' },
        { key: 'disciplina', label: 'Matéria' },
        { key: 'optativa', label: 'Matéria Optativa' },
        { key: 'dia_semana', avatar: true, label: 'Dia' },
        { key: 'dt_aula', label: 'Data', date: true },
        { key: 'observacao_dia', label: 'Observação' },

    ];

    const groupFrequency = [
        { label: 'Semanal', value: 7 },
        { label: 'Quinzenal', value: 15 },
    ]

    return (
        <>
            <SectionHeader
                title="Cronograma de aulas"
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            {dateClass ? (
                dateClass.map((item, index) => {
                    const classScheduleData = item.aulas;
                    const name = item.nome_cronograma;
                    const idCronograma = item.id_cronograma
                    return (
                        <ContentContainer key={`${item}-${index}`}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        maxWidth: '30%',
                                        "&:hover": {
                                            opacity: 0.8,
                                            cursor: 'pointer'
                                        }
                                    }}
                                    onClick={() => toggleClassTable(index)}
                                >
                                    <Text bold>{name}</Text>
                                    <Box
                                        sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                            transform: showClassSchedulesTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                            transition: '.3s',
                                            width: 17,
                                            height: 17
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1, alignItems: 'center' }}>
                                    <Button small text='Editar' style={{ padding: '5px 6px 5px 6px', width: 80 }}onClick={() => router.push(`/administrative/classSchedule/${idCronograma}`)} />
                                </Box>
                            </Box>
                            {showClassSchedulesTable[index] && (
                                <Box sx={{ ...styles.tableContainer, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '500px', overflow: 'auto', borderRadius: '12px' }}>
                                    <Table_V1
                                        data={classScheduleData}
                                        columns={column}
                                        columnId={'id_aula'}
                                        columnActive={false}
                                        tolltip={true}
                                        sx={{ flex: 1 }}
                                        onSelect={(value) => {
                                            setClassScheduleId(value)
                                            if (value) { setShowClassDay(true) }
                                        }}
                                        routerPush={false}
                                    />
                                </Box>
                            )}
                        </ContentContainer>
                    );
                })
            ) : (
                <Text>Não encontrei Cronogramas vinculadas a grade</Text>
            )}

            {
                <Backdrop open={showClassDay} sx={{ marginLeft: { md: '180px', lg: '0px' } }}>
                    {showClassDay &&
                        <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, overflowY: matches && 'auto', }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text bold large>Editar Aula</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => setShowClassDay(false)} />
                            </Box>
                            <ContentContainer>
                                <Text bold title={true} style={{ color: colorPalette.buttonColor }}>aula - {classDaySelect?.dia_semana}</Text>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={styles.inputSection}>
                                        <SelectList fullWidth data={disciplines} valueSelection={classDaySelect?.disciplina_id} onSelect={(value) => setClassDaySelect({ ...classDaySelect, disciplina_id: value })}
                                            title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, minWidth: '160px' }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList fullWidth data={professors} valueSelection={classDaySelect?.professor1_id} onSelect={(value) => setClassDaySelect({ ...classDaySelect, professor1_id: value })}
                                            title="1º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                    </Box>
                                    <Box sx={styles.inputSection}>
                                        <SelectList fullWidth data={professors} valueSelection={classDaySelect?.professor2_id} onSelect={(value) => setClassDaySelect({ ...classDaySelect, professor2_id: value })}
                                            title="2º Professor" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList fullWidth data={disciplines} valueSelection={classDaySelect?.optativa_id} onSelect={(value) => setClassDaySelect({ ...classDaySelect, optativa_id: value })}
                                            title="Optativa" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                    </Box>
                                    <Box sx={styles.inputSection}>
                                        <TextInput
                                            fullWidth
                                            placeholder='Data'
                                            name='dt_aula'
                                            onChange={handleChange}
                                            value={(classDaySelect?.dt_aula)?.split('T')[0] || ''}
                                            label='Dia da semana'
                                            type="date"
                                        />
                                        <TextInput
                                            fullWidth
                                            placeholder='Dia da semana'
                                            name='dia_semana'
                                            onChange={handleChange}
                                            value={classDaySelect?.dia_semana || ''}
                                            label='Dia da semana'
                                        />
                                    </Box>
                                    <TextInput
                                        fullWidth
                                        placeholder='Módulo'
                                        name='modulo_cronograma'
                                        value={classDaySelect?.modulo_cronograma || ''}
                                        label='Módulo'
                                    />

                                    <SelectList fullWidth data={groupFrequency} valueSelection={classDaySelect?.recorrencia} onSelect={(value) => setClassDaySelect({ ...classDaySelect, recorrencia: value })}
                                        title="Frequência" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <TextInput
                                        fullWidth
                                        placeholder='Observação'
                                        name='observacao_dia'
                                        onChange={handleChange}
                                        value={classDaySelect?.observacao_dia || ''}
                                        label='Observação'
                                        multiline
                                        maxRows={2}
                                        rows={2}
                                    />
                                </Box>
                            </ContentContainer>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                    <Button text='atualizar' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => handleEditClassDay()} />
                                </Box>
                            </Box>
                        </ContentContainer>
                    }
                </Backdrop>
            }
        </>
    )
}

const styles = {
    containerData: {
        display: 'flex',
        gap: 1,
        alignItems: 'center'
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    tableContainer: {
        overflowStyle: 'marquee,panner',
        maxHeight: '50%',
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray lightgray',
        '&::-webkit-scrollbar': {
            width: '5px',

        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'gray',
            borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'gray',

        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: Colors.primary,

        },
    }
}