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

export default function EditStudentGrade(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    let idUser = user?.id;
    const router = useRouter()
    const query = router.query
    const partQuery = query?.id?.split('=');
    const id = partQuery[0];
    const [classData, setClass] = useState({})
    const [teachingPlan, setTeachingPlan] = useState({})
    const [newGrade, setNewGrade] = useState()
    const [studentGradeData, setStudentGradeData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [disciplines, setDisciplines] = useState([])
    const [studentData, setStudentData] = useState([])
    const [moduleDiscipline, setModuleDiscipline] = useState()
    const [showStudents, setShowStudents] = useState(false)

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

    const getTeachingPlan = async () => {
        try {
            const response = await api.get(`/class/teachingPlan/${id}`)
            const { data } = response
            setTeachingPlan(data)
            return data
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        handleItems();
    }, [id])

    useEffect(() => {
        if (studentGradeData?.disciplina_id != null) {
            handleStudent(id)
        }
    }, [studentGradeData?.disciplina_id])

    const handleItems = async () => {
        setLoading(true)
        try {
            const response = await getClass()
            if (response) {
                await getTeachingPlan()
                await listModules()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao carregar a Turma')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (userId, field, value) => {

        setStudentData((prevValues) => {
            return prevValues.map((student) => {
                if (student.usuario_id === userId) {
                    // Clona o objeto do aluno e atualiza o campo desejado
                    const updatedStudent = {
                        ...student,
                        [field]: value,
                    };

                    if (updatedStudent.nt_avaliacao_sem !== null || updatedStudent.nt_avaliacao_sem !== "") {
                        updatedStudent.nt_final = updatedStudent.nt_avaliacao_sem?.toString();
                    }
                    if (updatedStudent.nt_substitutiva !== null && updatedStudent.nt_substitutiva !== "") {
                        updatedStudent.nt_final = updatedStudent.nt_substitutiva?.toString();
                    }
                    if (updatedStudent?.nt_exame !== null && updatedStudent?.nt_exame !== "") {
                        updatedStudent.nt_final = updatedStudent?.nt_exame?.toString();
                    }

                    return updatedStudent;
                }
                return student; // Mantém outros alunos inalterados
            });
        });
    };


    const handleCreateStudentGrade = async () => {
        setLoading(true)
        let disciplineId = studentGradeData?.disciplina_id
        try {
            const response = await api.post(`/studentGrade/create`, { studentData, disciplineId });
            if (response?.status === 201) {
                alert.success('Turma cadastrado com sucesso.');
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar turma.');
        } finally {
            setLoading(false)
        }
    }

    const handleEditStudentGrade = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/studentGrade/update`, { studentData });
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


    const checkSearch = (studentGradeData) => {
        const { disciplina_id, modulo_nota } = studentGradeData
        if (!disciplina_id) {
            alert.error("Antes de buscar, selecione sua disciplina.")
            return false
        }
        if (!modulo_nota) {
            alert.error("Antes de buscar, selecione a data da aula.")
            return false
        }
        return true;
    }

    const handleStudent = async () => {
        if (checkSearch(studentGradeData)) {
            setLoading(true)
            try {
                const response = await api.get(`/studentGrade/module/${studentGradeData?.modulo_nota}/${studentGradeData?.disciplina_id}`)
                const { data } = response
                if (data.length > 0) {
                    const groupStudents = data.map(student => ({
                        ...student,
                        plano_avaliacao_id: student?.plano_avaliacao_id,
                        usuario_id: student?.usuario_id,
                        disciplina_id: student?.disciplina_id,
                        turma_id: student?.turma_id,
                        modulo_nota: student?.modulo_nota,
                        nome: student?.nome,
                        nt_avaliacao_sem: student?.nt_avaliacao_sem,
                        nt_substitutiva: student?.nt_substitutiva,
                        nt_exame: student?.nt_exame,
                        nt_final: student?.nt_final,
                        obs_nt: student?.obs_nt,
                        avaliacao_status: student?.avaliacao_status
                    }));

                    groupStudents.sort((a, b) => a.nome.localeCompare(b.nome));

                    setStudentData(groupStudents)
                    setNewGrade(false)
                    setShowStudents(true);
                } else {
                    listStudents()
                    setNewGrade(true)
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

    // async function listdisciplines() {
    //     try {
    //         const response = await api.get(`/disciplines`)
    //         const { data } = response
    //         const groupDisciplines = data.map(grid => ({
    //             label: grid.nome_disciplina,
    //             value: grid?.id_disciplina
    //         }));
    //         setDisciplines(groupDisciplines);
    //     } catch (error) {
    //         return error;
    //     }
    // }

    async function handleSelectModule(value) {
        setStudentGradeData({ ...studentGradeData, modulo_nota: value })
        try {
            const response = await api.get(`/classSchedule/disciplines/${id}/${value}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines?.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
            return error
        }
    }


    async function listModules() {
        try {
            const response = await api.get(`/class/modules/${id}`)
            const { data } = response
            if (response.status === 201) {
                const [module] = data.map((item) => item?.modulos)
                const modules = handleModules(module);
                setModuleDiscipline(modules);
            }
        } catch (error) {
            return error;
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


    async function listStudents(value) {
        setLoading(true)
        try {
            if (value) {
                setStudentGradeData({ ...studentGradeData, disciplina_id: value })
            }
            const response = await api.get(`/class/students/${id}`)
            const { data } = response
            const studentsFrequency = data.map(student => ({
                plano_avaliacao_id: teachingPlan?.id_plano_avaliacao || null,
                usuario_id: student?.usuario_id || null,
                disciplina_id: studentGradeData?.disciplina_id || null,
                turma_id: parseInt(id),
                modulo_nota: studentGradeData?.modulo_nota || null,
                nome: student.nome,
                avaliacao_status: 0,
                nt_avaliacao_sem: null,
                nt_substitutiva: null,
                nt_exame: null,
                nt_final: null,
                obs_nt: null
            }));

            studentsFrequency.sort((a, b) => a.nome.localeCompare(b.nome));

            setStudentData(studentsFrequency);
        } catch (error) {
            return error;
        } finally {
            setLoading(false)
        }
    }

    const groupAvaliationStatus = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={classData?.nome_turma}
                title={teachingPlan?.nome_pl || 'Plano de avaliação'}
                saveButton
                saveButtonAction={newGrade ? handleCreateStudentGrade : handleEditStudentGrade}
            />

            {/* usuario */}
            <ContentContainer row style={{ display: 'flex', justifyContent: 'space-between', gap: 1.8, padding: 5, alignItems: 'center' }}>
                <SelectList fullWidth data={moduleDiscipline} valueSelection={studentGradeData?.modulo_nota} onSelect={(value) => handleSelectModule(value)}
                    title="Modulo/Semestre" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                <SelectList fullWidth data={disciplines} valueSelection={studentGradeData?.disciplina_id} onSelect={(value) => listStudents(value)}
                    title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
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
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Aluno</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Realizou a avaliação?</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Avaliação Semestral</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Substitutiva</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Exame</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nota Final</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ flex: 1 }}>
                                            {
                                                studentData?.map((item, index) => {

                                                    let avaliation = item?.nt_avaliacao_sem ? parseFloat(item.nt_avaliacao_sem) : null;
                                                    let substitutive = item?.nt_substitutiva ? parseFloat(item.nt_substitutiva) : null;
                                                    let ntFinally = parseFloat(item.nt_final || 0);

                                                    const isExam = (avaliation !== null && avaliation < 6)
                                                        ||
                                                        (item?.avaliacao_status === 0 && (substitutive !== null && substitutive < 6));


                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nome}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <RadioItem
                                                                    valueRadio={item?.avaliacao_status}
                                                                    group={groupAvaliationStatus}
                                                                    horizontal={true}
                                                                    onSelect={(value) => handleChange(item?.usuario_id, 'avaliacao_status', parseInt(value))}
                                                                />
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.avaliacao_status === 1 ?
                                                                    <TextInput name='nt_avaliacao_sem' value={item?.nt_avaliacao_sem || ''} sx={{ width: '60px' }} onChange={(e) => handleChange(item.usuario_id, 'nt_avaliacao_sem', e.target.value)} />
                                                                    : "-"}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.avaliacao_status === 0 ?
                                                                    <TextInput name='nt_substitutiva' value={item?.nt_substitutiva || ''} sx={{ width: '60px' }} onChange={(e) => handleChange(item.usuario_id, 'nt_substitutiva', e.target.value)} />
                                                                    : "-"}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {isExam ?
                                                                    <TextInput name='nt_exame' value={item?.nt_exame || ''} sx={{ width: '60px' }} onChange={(e) => handleChange(item.usuario_id, 'nt_exame', e.target.value)} />
                                                                    : "-"}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {ntFinally}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <TextInput fullWidth name='obs_nt' value={item?.obs_nt || ''} sx={{ flex: 1, }} onChange={(e) => handleChange(item.usuario_id, 'obs_nt', e.target.value)} />
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