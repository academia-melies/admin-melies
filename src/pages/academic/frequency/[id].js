import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { responsiveFontSizes, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatDate } from "../../../helpers"

export default function EditFrequency(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    let idUser = user?.id;
    const router = useRouter()
    const query = router.query
    const partQuery = query?.id?.split('=');
    const id = partQuery[0];
    const classday = partQuery[1] === 'day' ? true : false;
    const [classData, setClass] = useState({})
    const [newFrequency, setNewFrequency] = useState()
    const [frequencyData, setFrequencyData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [students, setStudents] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [studentData, setStudentData] = useState([])
    const [classDays, setClassDays] = useState([])
    const [showStudents, setShowStudents] = useState(false)
    const date = new Date()
    const today = formatDate(date)

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
        handleItems();
        if (classday) {
            handleClassDay()
        }
    }, [id])

    useEffect(() => {
        listClassDay(frequencyData?.disciplina_id)
    }, [frequencyData?.disciplina_id])



    const handleClassDay = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/classDay/frequency/${idUser}`)
            const { data } = response
            if (data) {
                return setFrequencyData({ ...frequencyData, aula_id: data?.id_aula, disciplina_id: data?.disciplina_id })
            } else {
                return alert.info(`Você não possui aula hoje para a disciplina informada. Altere os dados para buscar sua próxima aula.`)
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao o dia.')
        } finally {
            setLoading(false)
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const response = await getClass()
            if (response) {
                await listdisciplines()
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


    const handleChangeFrequency = (userId, field, value) => {

        // Copie os dados dos alunos em uma nova matriz
        const updatedStudents = [...studentData];

        // Encontre o aluno com base no userId
        const studentToUpdate = updatedStudents.find((item) => item.usuario_id === userId);

        if (studentToUpdate) {
            // Atualize o campo desejado para o aluno encontrado
            studentToUpdate[field] = value;
            studentToUpdate.disciplina_id = frequencyData?.disciplina_id
            studentToUpdate.turma_id = parseInt(id)
            studentToUpdate.aula_id = frequencyData?.aula_id

            if (field === 'periodo_2') {
                studentToUpdate.professor_id_2 = idUser;
            } else if (field === 'periodo_1') {
                studentToUpdate.professor_id_1 = idUser;
            }

            setStudentData([...updatedStudents]);
        }
    }


    const handleCreateFrequency = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/frequency/create`, { studentData });
            if (response?.status === 201) {
                alert.success('Turma cadastrado com sucesso.');
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar turma.');
        } finally {
            setLoading(false)
        }
    }

    const handleEditFrequency = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/frequency/update`, { studentData });
            if (response?.status === 201) {
                alert.success('Chamada atualizada com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Chamada.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Chamada.');
        } finally {
            setLoading(false)
        }
    }

    const checkSearch = (frequencyData) => {
        const { disciplina_id, aula_id } = frequencyData
        if (!disciplina_id) {
            alert.error("Antes de buscar, selecione sua disciplina.")
            return false
        }
        if (!aula_id) {
            alert.error("Antes de buscar, selecione a data da aula.")
            return false
        }
        return true;
    }

    const handleStudent = async () => {
        if (checkSearch(frequencyData)) {
            setLoading(true)
            try {
                const response = await api.get(`/frequency/aula/${frequencyData.aula_id}`)
                const { data } = response
                if (data.length > 0) {
                    const groupStudents = data.map(student => {

                        return {
                            ...student,
                            periodo_1: parseInt(student?.periodo_1),
                            periodo_2: parseInt(student?.periodo_2),
                        }
                    });

                    groupStudents.sort((a, b) => a.nome.localeCompare(b.nome));

                    setStudentData(groupStudents)
                    setNewFrequency(false)
                    setShowStudents(true);
                } else {
                    listStudents()
                    setNewFrequency(true)
                    setShowStudents(true);
                }
            } catch (error) {
                console.log(error)
                return error;
            }
            finally {
                setLoading(false)
            }
        }
    }

    async function listdisciplines() {
        try {
            const response = await api.get(`/disciplines`)
            const { data } = response
            const groupDisciplines = data.map(grid => ({
                label: grid.nome_disciplina,
                value: grid?.id_disciplina
            }));
            setDisciplines(groupDisciplines);
        } catch (error) {
            return error;
        }
    }


    async function listStudents(value) {
        setLoading(true)
        try {
            if (value) {
                setFrequencyData({ ...frequencyData, disciplina_id: value })
            }
            const response = await api.get(`/class/students/${id}`)
            const { data } = response
            const studentsFrequency = data.map(student => ({
                nome: student.nome,
                disciplina_id: frequencyData?.disciplina_id,
                periodo_1: null,
                periodo_2: null,
                professor_id_1: null,
                professor_id_2: null,
                usuario_id: student?.usuario_id,
                turma_id: parseInt(id),
                aula_id: frequencyData?.aula_id,
                totalFrequencia: 100
            }));

            studentsFrequency.sort((a, b) => a.nome.localeCompare(b.nome));

            setStudentData(studentsFrequency);
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
            const groupClassDay = data.map(day => ({
                label: formatDate(day?.dt_aula),
                value: day?.id_aula,
                dateObject: new Date(day?.dt_aula),
            }));

            groupClassDay.sort((a, b) => a.dateObject - b.dateObject);
            const sortedClassDays = groupClassDay.map(({ dateObject, ...rest }) => rest);

            setClassDays(sortedClassDays);

        } catch (error) {
            return error;
        }
    }



    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]


    const grouperiod = [
        { label: 'Manhã', value: 'Manhã' },
        { label: 'Tarde', value: 'Tarde' },
        { label: 'Noite', value: 'Noite' }
    ]

    const groupFrequency = [
        { label: 'Presente', value: 1 },
        { label: 'Ausente', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={'turma'}
                title={classData?.nome_turma}
                saveButton
                saveButtonAction={newFrequency ? handleCreateFrequency : handleEditFrequency}
            // deleteButton={!newFrequency}
            // deleteButtonAction={() => handleDeleteFrequency()}
            />

            {/* usuario */}
            <ContentContainer row style={{ display: 'flex', justifyContent: 'space-between', gap: 1.8, padding: 5, alignItems: 'center' }}>
                <SelectList fullWidth data={disciplines} valueSelection={frequencyData?.disciplina_id} onSelect={(value) => listStudents(value)}
                    title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                <SelectList fullWidth data={classDays} valueSelection={frequencyData?.aula_id} onSelect={(value) => setFrequencyData({ ...frequencyData, aula_id: value })}
                    title="Data da aula" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                {/* <TextInput fullWidth placeholder='Data da aula' name='dt_aula' onChange={handleChange} value={(frequencyData?.dt_aula)?.split('T')[0] || ''} type="date" label='Data da aula' sx={{ flex: 1, }} /> */}
                <Button text="buscar" small onClick={() => handleStudent(id)} style={{ width: 120, height: 30 }} />
            </ContentContainer>

            {showStudents &&
                <ContentContainer>
                    {studentData.length > 0 ?
                        (<>
                            <Box>
                                <Text bold>Alunos - {classData?.nome_turma}</Text>
                            </Box>


                            <Box sx={{ display: 'flex' }}>

                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '100%' }}>
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Aluno</th>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Frequência (Semestre)</th>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>1º Periodo</th>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>2º Periodo</th>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>

                                            </tr>
                                        </thead>
                                        <tbody style={{ flex: 1 }}>
                                            {
                                                studentData?.map((item, index) => {
                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nome}
                                                            </td>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.totalFrequencia || 100}%
                                                            </td>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <RadioItem
                                                                    valueRadio={item?.periodo_1}
                                                                    group={groupFrequency}
                                                                    horizontal={true}
                                                                    onSelect={(value) => handleChangeFrequency(item?.usuario_id, 'periodo_1', parseInt(value))}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <RadioItem
                                                                    valueRadio={item?.periodo_2}
                                                                    group={groupFrequency}
                                                                    horizontal={true}
                                                                    onSelect={(value) => handleChangeFrequency(item?.usuario_id, 'periodo_2', parseInt(value))}
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
                        </>
                        )
                        :
                        (
                            <Text light> Não encontrei alunos matrículados</Text>
                        )}
                </ContentContainer>
            }
        </>
    )
}

{/* <Box sx={{ display: 'flex', alignItem: 'center', flexDirection: 'row' }}
key={`${item}-${index}`}>

<Text bold style={{ color: colorPalette.buttonColor }}>{item.nome}</Text>
<CheckBoxComponent
    // valueChecked={valueCheckedItem}
    boxGroup={groupFrequency}
    horizontal={mobile ? false : true}
    // onSelect={(value) => {
    //     handleScreenPermissionChange(menu.text, 'action', value, menu.id_item)
    // }}
    sx={{ flex: 1, }}
/>
</Box> */}

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