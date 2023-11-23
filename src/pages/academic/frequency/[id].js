import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatDate, formatTimeStamp } from "../../../helpers"
import { icons } from "../../../organisms/layout/Colors"

export default function EditFrequency(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
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
        if(frequencyData?.disciplina_id){
            handleStudentsDiscipline()
            listClassDay(frequencyData?.disciplina_id)
        }
    }, [frequencyData?.disciplina_id])

    const handleStudentsDiscipline = async () => {
        const students = await listStudents(frequencyData?.disciplina_id, frequencyData?.modulo_turma)
        if (frequencyData?.disciplina_id !== null && students) {
            handleStudent(id)
        }
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
        // Copie os dados dos alunos em uma nova matriz (mantenha a imutabilidade)
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

        // Atualize o estado com os dados atualizados
        setStudentData(updatedStudents);
    };

    const handleCreateFrequency = async () => {

        let disciplineId = frequencyData?.disciplina_id
        if (classDays?.length < 1) {
            alert.info('Não existe cronograma/ aulas agendadas para essa disciplina.')
            return
        } else {
            setLoading(true)
            try {
                const response = await api.post(`/frequency/create`, { studentsList, classDays, disciplineId });
                if (response?.status === 201) {
                    alert.success('Turma cadastrado com sucesso.');
                    await handleItems()
                    await handleStudent()
                    await listClassDay(disciplineId)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar turma.');
            } finally {
                setLoading(false)
            }
        }
    }


    const handleEditFrequency = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/frequency/update`, { studentData });
            if (response?.status === 201) {
                alert.success('Chamada atualizada com sucesso.');
                return
            }
            alert.error('Tivemos um problema ao atualizar Chamada.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Chamada.');
        } finally {
            setLoading(false)
        }
    }

    const handleStudent = async () => {
        setLoading(true)
        let disciplineId = frequencyData?.disciplina_id;
        try {
            const response = await api.get(`/frequency/discipline/${disciplineId}/${id}`)
            const { data } = response
            if (data.length > 0) {
                setStudentData(data)
                setShowStudents(true);
                setNewCallList(false)
            } else {
                alert.info('A turma não possui uma lista de chamada para a disciplina e modulo selecionado. Por favor, crie uma chamada.')
                setShowStudents(true);
                setNewCallList(true)
                setStudentData([])
            }
        } catch (error) {
            console.log(error)
            return error;
        }
        finally {
            setLoading(false)
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
        setLoading(true)
        try {
            const response = await api.get(`/class/students/${id}/${disciplineId}/?moduleStudent=${moduleStudent}`)
            const { data } = response
            if (data) {
                setHasStudents(true)
                setStudentsList(data)
                return true
            } else {
                setHasStudents(false)
                alert.error('A turma não possui estudantes cadastrados')
                return false
            }

        } catch (error) {
            return error;
        } finally {
            setLoading(false)
        }
    }


    async function listClassDay(disciplineId) {
        try {
            const response = await api.get(`/classDay/discipline/${id}/${disciplineId}`)
            const { data } = response
            if (data.length > 0) {
                const groupClassDay = data.map(day => ({
                    label: formatDate(day?.dt_aula),
                    value: day?.id_aula,
                    dateObject: new Date(day?.dt_aula),
                }));

                groupClassDay.sort((a, b) => a.dateObject - b.dateObject);
                const sortedClassDays = groupClassDay.map(({ dateObject, ...rest }) => rest);

                setClassDays(sortedClassDays);
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
        const dateA = new Date(a.dt_aula);
        const dateB = new Date(b.dt_aula);

        return dateA - dateB;
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
                perfil={'turma'}
                title={classData?.nome_turma}
                saveButton={studentData.length > 0 ? true : false}
                saveButtonAction={handleEditFrequency}
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

                {newCallList && hasStudents && frequencyData?.disciplina_id && (
                    <Button secondary text="criar chamada" small onClick={() => handleCreateFrequency()} style={{ width: 120, height: 30 }} />
                )}
            </ContentContainer>


            {frequencyData?.disciplina_id && showStudents ?

                showStudents && studentData.length > 0 ?
                    (<>
                        {sortedStudentData.map((item, index) => {
                            const classData = item?.turma;
                            const aulaId = item?.aula_id
                            const dt_class = formatTimeStamp(item?.dt_aula)
                            const statusFreq = getStatusDoDia(classData)

                            return (
                                <ContentContainer key={`${item}-${index}`} sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
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
                                            <Text bold style={{ color: 'inherit' }}>{dt_class}</Text>
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
                                                            classData?.map((item, index) => {
                                                                return (
                                                                    <tr key={`${item}-${index}`}>
                                                                        <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                            {item?.nome}
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                            <RadioItem
                                                                                valueRadio={item?.periodo_1}
                                                                                group={groupFrequency}
                                                                                horizontal={true}
                                                                                onSelect={(value) => handleChangeFrequency(item?.usuario_id, 'periodo_1', parseInt(value), aulaId)}
                                                                            />
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                            <RadioItem
                                                                                valueRadio={item?.periodo_2}
                                                                                group={groupFrequency}
                                                                                horizontal={true}
                                                                                onSelect={(value) => handleChangeFrequency(item?.usuario_id, 'periodo_2', parseInt(value), aulaId)}
                                                                            />
                                                                        </td>
                                                                        <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                            <TextInput fullWidth name='obs_freq' value={item?.obs_freq || ''} sx={{ flex: 1, }} />
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