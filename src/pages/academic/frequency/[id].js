import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatDate, formatTimeStamp, formattedStringInDate } from "../../../helpers"
import { icons } from "../../../organisms/layout/Colors"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function EditFrequency(props) {
    const { setLoading, alert, colorPalette, user, theme, userPermissions, menuItemsList } = useAppContext()
    let idUser = user?.id;
    const router = useRouter()
    const query = router.query
    const partQuery = query?.id?.split('=');
    const id = partQuery[0];
    const classday = partQuery[1] === 'day' ? true : false;
    const [classData, setClass] = useState({})
    const [frequencyData, setFrequencyData] = useState({
        disciplina_id: null,
        modulo_turma: null
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [disciplines, setDisciplines] = useState([])
    const [modules, setModules] = useState([])
    const [studentData, setStudentData] = useState([])
    const [classDays, setClassDays] = useState([])
    const [showStudents, setShowStudents] = useState(false)
    const [newCallList, setNewCallList] = useState(false)
    const [hasStudents, setHasStudents] = useState(false)
    const [studentsList, setStudentsList] = useState([])
    const [showClassTable, setShowClassTable] = useState({});
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
    const date = new Date()
    const today = formatDate(date)

    const toggleClassTable = (index) => {
        setShowClassTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };



    const getClass = async () => {
        try {
            const response = await api.get(`/class/${id}`)
            const { data } = response
            setClass(data)
            return data
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        fetchPermissions()
        if (classday) {
            handleClassDayDatas()
        }
        handleItems();
    }, [id])

    const handleClassDayDatas = async () => {
        setLoading(true)
        try {
            const classData = await handleClassDay()
            if (classData) {
                const response = await handleModuleData(id)
                await handleSelectModule(1)
                if (response.status === 201) {
                    setFrequencyData({ ...frequencyData, modulo_turma: 1, disciplina_id: classData?.disciplina_id })
                }
            }
        } catch (error) {
            return error
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setFrequencyData({ ...frequencyData, disciplina_id: null })
    }, [frequencyData?.modulo_turma])

    useEffect(() => {
        if (frequencyData?.disciplina_id) {
            handleFrequencyList(frequencyData?.disciplina_id)
        }
    }, [frequencyData?.disciplina_id])

    const handleFrequencyList = async (disciplina_id) => {
        setLoading(true)
        try {
            const students = await handleStudentsDiscipline(disciplina_id)
            if (!students.length > 0) {
                alert.error('A turma não possui estudantes cadastrados para esse módulo.')
                setStudentData([])
                return
            }

            const classesDays = await listClassDay(disciplina_id)
            if (!classesDays.length > 0) {
                alert.info('A turma ainda não iniciou as aulas ou não existe cronograma/ aulas agendadas para essa disciplina.')
                setStudentData([])
                return
            }

            let dataFrequency = [];
            classesDays.forEach(classDay => {
                const classDayData = {
                    aula_id: classDay.value,
                    dt_aula: classDay.label,
                    turma: students.map(student => ({
                        aula_id: classDay.value,
                        disciplina_id: disciplina_id,
                        periodo_1: null,
                        periodo_2: null,
                        professor_id_1: null,
                        professor_id_2: null,
                        turma_id: parseInt(id),
                        usuario_id: student.usuario_id,
                        nome: student.nome,
                        nome_social: student.nome_social
                    })),
                };

                dataFrequency.push(classDayData);
            });

            if (dataFrequency?.length > 0) {
                await handleStudent(dataFrequency)
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleStudentsDiscipline = async (disciplina_id) => {
        const students = await listStudents(disciplina_id, frequencyData?.modulo_turma)
        return students
    }

    const handleClassDay = async () => {
        try {
            const response = await api.get(`/classDay/frequency/${idUser}`)
            const { data } = response
            if (data) {
                let datas = { modulo_turma: 1, disciplina_id: data?.disciplina_id }
                return datas
            } else {
                return alert.info(`Você não possui aula hoje para a disciplina informada. Altere os dados para buscar sua próxima aula.`)
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao o dia.')
            return error
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const response = await getClass()
            if (response) {
                await handleModuleData(id)
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Turma')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setFrequencyData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }


    const handleChangeFrequency = (userId, field, value, aulaId) => {
        const updatedStudents = studentData.map(day => {
            const turmaCopy = [...day.turma];
            const studentToUpdate = turmaCopy.find(item => item.usuario_id === userId);
            if (studentToUpdate && studentToUpdate.aula_id === aulaId) {
                studentToUpdate[field] = value;
                studentToUpdate.disciplina_id = frequencyData?.disciplina_id;
                studentToUpdate.turma_id = parseInt(id);
                if (field === 'periodo_2') {
                    studentToUpdate.professor_id_2 = idUser;
                } else if (field === 'periodo_1') {
                    studentToUpdate.professor_id_1 = idUser;
                }
            }
            return {
                ...day,
                turma: turmaCopy,
            };
        });
        setStudentData(updatedStudents);
    };

    const handleCreateFrequency = async () => {
        setLoading(true)
        try {
            let disciplineId = frequencyData?.disciplina_id;
            const newFrequencyStudentListArray = studentData?.flatMap(day => day.turma.filter(student => !student.id_freq_aluno && (student['periodo_1'] !== null || student['periodo_2'] !== null)));
            const updateFrequencyStudentListArray = studentData?.flatMap(day => day.turma.filter(student => student.id_freq_aluno));
            let status;

            if (newFrequencyStudentListArray.length > 0) {
                const response = await api.post(`/frequency/create`, { newFrequencyStudentListArray });
                if (response?.status === 201) {
                    status = 201;
                } else {
                    status = 422
                }
            }

            if (updateFrequencyStudentListArray.length > 0) {
                const response = await api.patch(`/frequency/update`, { updateFrequencyStudentListArray });
                if (response?.status === 201) {
                    status = 201;
                } else {
                    status = 422
                }
            }
            if (status === 201) {
                alert.success('Chamada atualizada com sucesso.');
                await getClass()
                await handleItems()
                await handleFrequencyList(disciplineId)
                return
            } else {
                alert.error('Ocorreu um erro ao atualizar lista de chamada.')
                return
            }
        } catch (error) {
            alert.error('Tivemos um problema ao lançar chamada.');
        } finally {
            setLoading(false)
        }
    }


    const handleStudent = async (dataFrequency) => {
        let disciplineId = frequencyData?.disciplina_id;
        try {
            const response = await api.get(`/frequency/discipline/${disciplineId}/${id}`)
            const { data } = response
            if (data.length > 0) {
                const updatedStudentData = [...dataFrequency];
                data.forEach(newClassDayData => {
                    const existingClassDayDataIndex = updatedStudentData.findIndex(existingClassDayData =>
                        existingClassDayData.aula_id === newClassDayData.aula_id
                    );

                    if (existingClassDayDataIndex !== -1) {
                        // Verificar cada aluno na turma individualmente
                        newClassDayData.turma.forEach(newStudent => {
                            const existingStudentIndex = updatedStudentData[existingClassDayDataIndex].turma.findIndex(
                                existingStudent => existingStudent.usuario_id === newStudent.usuario_id
                            );

                            if (existingStudentIndex !== -1) {
                                // Atualizar dados do aluno existente
                                updatedStudentData[existingClassDayDataIndex].turma[existingStudentIndex] = newStudent;
                            } else {
                                // Adicionar novo aluno à turma existente
                                updatedStudentData[existingClassDayDataIndex].turma.push(newStudent);
                            }
                        });
                    } else {
                        // Adicionar totalmente novo dia de aula
                        updatedStudentData.push(newClassDayData);
                    }
                });



                setStudentData(updatedStudentData);
                setShowStudents(true);
                setNewCallList(false)
            } else {
                setStudentData(dataFrequency);
                setShowStudents(true);
                setNewCallList(true)
            }
        } catch (error) {
            console.log(error)
            return error;
        }
    }

    async function handleSelectModule(value) {

        setFrequencyData({ ...frequencyData, modulo_turma: value })
        let moduleClass = value;
        try {
            const response = await api.get(`/classSchedule/disciplines/${id}/${moduleClass}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines?.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
        }
    }

    const handleModuleData = async (value) => {

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
                return response
            } catch (error) {
                return error
            } finally {
                setLoading(false)
            }
        } else {
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

    async function listStudents(disciplineId, moduleStudent) {
        try {
            const response = await api.get(`/class/students/${id}/${disciplineId}/?moduleStudent=${moduleStudent}`)
            const { data } = response
            if (data) {
                setHasStudents(true)
                setStudentsList(data)
                return data
            } else {
                setHasStudents(false)
                setStudentsList([])
                alert.error('A turma não possui estudantes cadastrados para esse módulo.')
                return false
            }

        } catch (error) {
            return error;
        }
    }


    async function listClassDay(disciplineId) {
        try {
            const response = await api.get(`/classDay/discipline/${id}/${disciplineId}`)
            const { data } = response

            if (data.length > 0) {
                const groupClassDay = data.map(day => {
                    const dateObject = new Date(day?.dt_aula);
                    const adjustedDate = new Date(dateObject.getTime() + dateObject.getTimezoneOffset() * 60000);
                    return {
                        label: day?.dt_aula,
                        value: day?.id_aula,
                        dateObject: adjustedDate,
                    };
                });
                groupClassDay.sort((a, b) => a.dateObject - b.dateObject);
                const sortedClassDays = groupClassDay.map(({ dateObject, ...rest }) => rest);
                setClassDays(sortedClassDays);
                return sortedClassDays
            }
            else {
                return false
            }

        } catch (error) {
            return error;
        }
    }

    const groupFrequency = [
        { label: 'Presente', value: 1 },
        { label: 'Ausente', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const sortedStudentData = [...studentData].sort((a, b) => {
        let dateA = formattedStringInDate(a.dt_aula);
        let dateB = formattedStringInDate(b.dt_aula);

        dateA = new Date(a.dt_aula);
        dateB = new Date(b.dt_aula);
        return dateB - dateA;
    });

    const getStatusDoDia = (classData) => {
        for (const aluno of classData) {
            if (aluno.periodo_1 === null || aluno.periodo_2 === null) {
                return "Pendente";
            }
        }
        return "Concluída";
    };

    return (
        <>
            <SectionHeader
                perfil={classData?.nome_turma}
                title={'Lista de Chamada'}
                saveButton={(studentData.length > 0 && isPermissionEdit) ? true : false}
                saveButtonAction={handleCreateFrequency}
            />
            <ContentContainer row style={{ display: 'flex', justifyContent: 'space-between', gap: 1.8, padding: 5, alignItems: 'center' }}>
                <SelectList fullWidth data={modules} valueSelection={frequencyData?.modulo_turma || ''} onSelect={(value) => handleSelectModule(value)}
                    title="Módulo/Semestre" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                <SelectList fullWidth data={disciplines} valueSelection={frequencyData?.disciplina_id || ''} onSelect={(value) => setFrequencyData({ ...frequencyData, disciplina_id: value })}
                    title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />

                {/* {newCallList && hasStudents && frequencyData?.disciplina_id && (
                    <Button secondary text="criar chamada" small onClick={() => handleCreateFrequency()} style={{ width: 120, height: 30 }} />
                )} */}
            </ContentContainer>


            {frequencyData?.disciplina_id && showStudents ?

                showStudents && studentData.length > 0 ?
                    (<>
                        {sortedStudentData.map((item, index) => {
                            const classData = item?.turma;
                            const aulaId = item?.aula_id;
                            const dt_class = formatTimeStamp(item?.dt_aula);
                            const statusFreq = getStatusDoDia(classData);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const classDay = new Date(item?.dt_aula);
                            classDay.setHours(0, 0, 0, 0);
                            const yesterday = new Date(today);
                            const todayClass = classDay.getTime() === yesterday.getTime();

                            return (
                                <Box key={`${item}-${index}`} sx={{ position: 'relative' }}>
                                    {todayClass && <Box sx={{
                                        padding: '5px 15px', backgroundColor: colorPalette?.buttonColor, position: 'absolute', top: -10, left: 5, zIndex: 99999,
                                        borderRadius: 8
                                    }}><Text bold small style={{ color: '#fff' }}>Aula do dia</Text></Box>}
                                    <ContentContainer sx={{ display: 'flex', gap: 2, flexDirection: 'column', border: todayClass && `1px solid ${colorPalette?.buttonColor}` }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                width: 350,
                                                justifyContent: 'space-between',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer',
                                                    color: colorPalette.buttonColor
                                                }
                                            }}
                                            onClick={() => toggleClassTable(index)}
                                        >
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', gap: 4, width: 150, justifyContent: 'space-between',
                                            }}>
                                                <Text bold style={{ color: !theme ? '#fff' : colorPalette.textColor }}>{dt_class}</Text>
                                                <Box
                                                    sx={{
                                                        ...styles.menuIcon,
                                                        backgroundImage: `url(${icons.gray_arrow_down})`,
                                                        transform: showClassTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                                        transition: '.3s',
                                                        width: 17,
                                                        height: 17
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ backgroundColor: statusFreq === 'Pendente' ? 'red' : 'green', borderRadius: 2, padding: '5px 12px 2px 12px', transition: 'background-color 1s', }}>
                                                <Text xsmall bold style={{ color: "#fff", }}>{statusFreq}</Text>
                                            </Box>
                                        </Box>
                                        {showClassTable[index] && (
                                            <Box sx={{ display: 'flex' }}>

                                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '100%' }}>
                                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Aluno</th>
                                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>1º Periodo</th>
                                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>2º Periodo</th>
                                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody style={{ flex: 1 }}>
                                                            {
                                                                classData?.sort((a, b) => a.nome.localeCompare(b.nome))?.map((item, index) => {
                                                                        const name = item?.nome;
                                                                        return (
                                                                            <tr key={`${item}-${index}`}>
                                                                                <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid lightgray' }}>
                                                                                    <Text>{name}</Text>
                                                                                </td>
                                                                                <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid lightgray' }}>
                                                                                    <RadioItem
                                                                                        disabled={!isPermissionEdit && true}
                                                                                        valueRadio={item?.periodo_1}
                                                                                        group={groupFrequency}
                                                                                        horizontal={true}
                                                                                        onSelect={(value) => handleChangeFrequency(item?.usuario_id, 'periodo_1', parseInt(value), aulaId)}
                                                                                    />
                                                                                </td>
                                                                                <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid lightgray' }}>
                                                                                    <RadioItem
                                                                                        disabled={!isPermissionEdit && true}
                                                                                        valueRadio={item?.periodo_2}
                                                                                        group={groupFrequency}
                                                                                        horizontal={true}
                                                                                        onSelect={(value) => handleChangeFrequency(item?.usuario_id, 'periodo_2', parseInt(value), aulaId)}
                                                                                    />

                                                                                </td>
                                                                                <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid lightgray' }}>
                                                                                    <TextInput disabled={!isPermissionEdit && true}
                                                                                        fullWidth name='obs_freq' value={item?.obs_freq || ''} sx={{ flex: 1, }} />
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })

                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </Box>
                                        )}
                                    </ContentContainer>
                                </Box>
                            )
                        })}
                    </>
                    )
                    :
                    (
                        !newCallList ? <></>
                            :
                            <Text light style={{ textAlign: 'center' }}>A turma não possui uma lista de chamada para a disciplina e modulo selecionado. Por favor, crie uma chamada.</Text>

                    )
                :
                frequencyData?.modulo_turma && showStudents ? (

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column', marginTop: 5 }}>
                        <CircularProgress />
                        <Text bold>Aguardando selecionar disciplina..</Text>
                    </Box>
                ) : (<></>)
            }
        </>
    )
}

const styles = {
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