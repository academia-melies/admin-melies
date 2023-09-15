import { useEffect, useState } from "react";
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms";
import { CheckBoxComponent, SectionHeader, SelectList, Table_V1 } from "../../../organisms";
import { useAppContext } from "../../../context/AppContext";
import { useRouter } from "next/router";
import { Colors, icons } from "../../../organisms/layout/Colors";
import { api } from "../../../api/api";
import { Backdrop, useMediaQuery, useTheme } from "@mui/material";
import { formatDate, formatTimeStamp } from "../../../helpers";


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
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

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

            if (data) {
                const discipline = await api.get(`/classSchedule/disciplines/${data?.turma_id}/${data?.modulo_cronograma}`)
                let disciplinesData = discipline.data;
                const groupDisciplines = disciplinesData?.map(disciplines => ({
                    label: disciplines?.nome_disciplina,
                    value: disciplines?.id_disciplina
                }));

                setDisciplines(groupDisciplines);
            }

            setClassDaySelect(data)

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
        listProfessor()
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
                handleScheduleClass()
                setShowClassDay(false)
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
        { key: 'optativa', label: 'Optativa' },
        { key: 'dia_semana', avatar: true, label: 'Dia' },
        { key: 'dt_aula', label: 'Data', date: true },
        { key: 'observacao_dia', label: 'Observação' },

    ];

    const groupFrequency = [
        { label: 'Semanal', value: 7 },
        { label: 'Quinzenal', value: 14 },
    ]

    const groupOptative = [
        {
            label: 'Optativa',
            value: 'Optativa'
        },
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

                    const aulasPorDiaSemana = {};
                    classScheduleData.forEach((classData) => {
                        const diaSemana = classData.dia_semana;
                        if (!aulasPorDiaSemana[diaSemana]) {
                            aulasPorDiaSemana[diaSemana] = [];
                        }
                        aulasPorDiaSemana[diaSemana].push(classData);
                    });
                    return (
                        <ContentContainer key={`${item}-${index}`}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                                    <Button small text='Editar' style={{ padding: '5px 6px 5px 6px', width: 80 }} onClick={() => router.push(`/administrative/classSchedule/${idCronograma}`)} />
                                </Box>
                            </Box>
                            {showClassSchedulesTable[index] && (
                                <Box sx={{ ...styles.tableContainer, display: 'flex', maxHeight: '500px', overflow: 'auto', borderRadius: '12px' }}>
                                    {Object.entries(aulasPorDiaSemana).map(([diaSemana, aulas]) => (
                                        <Box key={diaSemana} sx={{ padding: 2, flex: diaSemana.length > 3 && 1 }}>
                                            <Text bold
                                                style={{
                                                    textAlign: 'center',
                                                    margin: '0px 0px 10px 0px',
                                                    backgroundColor: colorPalette.buttonColor,
                                                    color: '#fff'
                                                }}>
                                                {diaSemana}
                                            </Text>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: diaSemana.length > 2 && 1 }}>
                                                {aulas.map((classData, index) => (
                                                    <ContentContainer fullWidth key={`${index}-${classData}`} sx={{
                                                        // maxHeight: '370px',
                                                        transition: '0.3s',
                                                        // maxWidth: '160px',
                                                        flex: diaSemana.length > 2 && 1,
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer',
                                                            transform: 'scale(0.9)',
                                                        }
                                                    }}
                                                        onClick={() => {
                                                            setClassScheduleId(classData.id_aula)
                                                            if (classData.id_aula) { setShowClassDay(true) }
                                                        }}
                                                    >
                                                        <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Professor 1: </Text>
                                                            <Text bold small>{classData?.professor1}</Text>
                                                        </Box>
                                                        <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Professor 2: </Text>
                                                            <Text bold small>{classData?.professor2}</Text>
                                                        </Box>
                                                        <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Disciplina: </Text>
                                                            <Text bold small>{classData?.disciplina}</Text>
                                                        </Box>

                                                        {/* <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Optativa: </Text>
                                                            <Text bold small>{classData?.optativa || 'não'}</Text>
                                                        </Box> */}
                                                        {/* <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Dia da semana: </Text>
                                                            <Text bold small>{classData?.dia_semana}</Text>
                                                        </Box> */}
                                                        <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Data: </Text>
                                                            <Text bold small>{formatDate(classData?.dt_aula)}</Text>
                                                        </Box>
                                                        <Box sx={styles.containerClass}>
                                                            <Text bold small style={{ color: colorPalette.buttonColor }}>Observação: </Text>
                                                            <Text bold small>{classData?.observacao_dia}</Text>
                                                        </Box>
                                                    </ContentContainer>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
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
                                <Text bold large>{classDaySelect?.dia_semana} - {formatTimeStamp(classDaySelect?.dt_aula)}</Text>
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
                            <ContentContainer style={{ backgroundColor: 'none', boxShadow: 'none' }}>
                                {/* <Text bold title={true} style={{ color: colorPalette.buttonColor }}>aula - {classDaySelect?.dia_semana}</Text> */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <SelectList fullWidth data={disciplines} valueSelection={classDaySelect?.disciplina_id} onSelect={(value) => setClassDaySelect({ ...classDaySelect, disciplina_id: value })}
                                        title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, minWidth: '160px' }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList fullWidth data={professors} valueSelection={classDaySelect?.professor1} onSelect={(value) => setClassDaySelect({ ...classDaySelect, professor1: value })}
                                        title="Professor 1" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList fullWidth data={professors} valueSelection={classDaySelect?.professor2} onSelect={(value) => setClassDaySelect({ ...classDaySelect, professor2: value })}
                                        title="Professor 2" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
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
                                    {/* <CheckBoxComponent
                                        boxGroup={groupOptative}
                                        valueChecked={classDaySelect?.optativa || ''}
                                        horizontal={mobile ? false : true}
                                        onSelect={(value) => setClassDaySelect({ ...classDaySelect, optativa: value })}
                                        sx={{ width: 1 }} /> */}
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
    },
    containerClass: {
        display: 'flex',
        flexDirection: 'column'
    }
}