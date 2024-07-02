import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { CircularProgress, responsiveFontSizes, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatDate } from "../../../helpers"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function EditStudentGrade(props) {
    const { setLoading, alert, colorPalette, user, userPermissions, menuItemsList } = useAppContext()
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
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [moduleChange, setModuleChange] = useState(0)
    const [disciplineChange, setDisciplinaChange] = useState(0)


    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

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
        fetchPermissions()
        handleItems();
    }, [id])

    useEffect(() => {
        setStudentGradeData({ ...studentGradeData, disciplina_id: null })
    }, [studentGradeData?.modulo_nota])

    // useEffect(() => {
    //     if (studentGradeData?.disciplina_id != null) {
    //         handleStudent(id)
    //     }
    // }, [studentGradeData?.disciplina_id])

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
                    const updatedStudent = {
                        ...student,
                        [field]: value,
                    };
                    if (updatedStudent.avaliacao_status == 0) {
                        if (parseFloat(updatedStudent.nt_avaliacao_sem) < 6) {
                            updatedStudent.nt_exame = null
                        }
                        updatedStudent.nt_avaliacao_sem = null;
                    }
                    if (updatedStudent.avaliacao_status == 1) {
                        if (parseFloat(updatedStudent.nt_substitutiva) < 6) {
                            updatedStudent.nt_exame = null
                        }
                        updatedStudent.nt_substitutiva = null;
                    }

                    if (updatedStudent.nt_avaliacao_sem !== null || updatedStudent.nt_avaliacao_sem !== "") {
                        updatedStudent.nt_final = updatedStudent?.nt_avaliacao_sem?.toString().replace(",", ".");
                    }

                    if (updatedStudent.nt_substitutiva !== null && updatedStudent.nt_substitutiva !== "") {
                        updatedStudent.nt_final = updatedStudent?.nt_substitutiva?.toString().replace(",", ".");
                    }

                    if (updatedStudent?.nt_exame !== null && updatedStudent?.nt_exame !== "") {
                        updatedStudent.nt_final = updatedStudent?.nt_exame?.toString().replace(",", ".");
                    }

                    if ((updatedStudent.nt_avaliacao_sem !== '' || updatedStudent.nt_avaliacao_sem !== null) && (parseFloat(updatedStudent.nt_avaliacao_sem) > parseFloat(updatedStudent?.nt_exame))) {
                        updatedStudent.nt_final = updatedStudent?.nt_avaliacao_sem?.toString().replace(",", ".");
                    }

                    if ((updatedStudent.nt_substitutiva !== '' || updatedStudent.nt_substitutiva !== null) && (parseFloat(updatedStudent.nt_substitutiva) > parseFloat(updatedStudent?.nt_exame))) {
                        updatedStudent.nt_final = updatedStudent?.nt_substitutiva?.toString().replace(",", ".");
                    }

                    if (updatedStudent.avaliacao_status == 0 &&
                        !updatedStudent.nt_avaliacao_sem &&
                        !updatedStudent.nt_substitutiva &&
                        !updatedStudent?.nt_exame) {
                        updatedStudent.nt_final = 0
                    }

                    return updatedStudent;
                }

                return student;
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
        studentData.map(async item => {
            if (item.modulo_nota == null) {
                item.modulo_nota = moduleChange
            }
            if (item.disciplina_id == null) {
                item.disciplina_id = disciplineChange
            }

        })

        setLoading(true)
        try {
            const response = await api.patch(`/studentGrade/update`, { studentData });
            if (response?.status === 201) {
                alert.success('Chamada atualizada com sucesso.');
                await handleItems()
                if (studentGradeData?.disciplina_id) {
                    handleStudent(studentGradeData?.disciplina_id)
                }
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

    const handleStudent = async (value) => {

        if (checkSearch({ ...studentGradeData, disciplina_id: value })) {
            setLoading(true)
            try {

                if (value) {
                    setDisciplinaChange(value)
                    setStudentGradeData({ ...studentGradeData, disciplina_id: value })
                }
                const response = await api.get(`/studentGrade/module/${studentGradeData?.modulo_nota}/${value}/${id}`)
                const { data } = response

                if (data?.length > 0) {
                    const groupStudents = data?.map(student => ({
                        ...student,
                        plano_avaliacao_id: student?.plano_avaliacao_id,
                        usuario_id: student?.usuario_id,
                        disciplina_id: student?.disciplina_id,
                        turma_id: student?.turma_id,
                        modulo_nota: student?.modulo_nota,
                        nome: student?.nome,
                        nome_social: student?.nome_social,
                        nt_avaliacao_sem: student?.nt_avaliacao_sem?.toString() ? student?.nt_avaliacao_sem?.toFixed(1) : null,
                        nt_substitutiva: student?.nt_substitutiva?.toString() ? student?.nt_substitutiva.toFixed(1) : null,
                        nt_exame: student?.nt_exame?.toString() ? student?.nt_exame.toFixed(1) : null,
                        nt_final: student?.nt_final?.toString() ? student?.nt_final.toFixed(1) : null,
                        obs_nt: student?.obs_nt,
                        avaliacao_status: student?.avaliacao_status
                    }));

                    groupStudents.sort((a, b) => a.nome.localeCompare(b.nome));

                    setStudentData(groupStudents)
                    setNewGrade(false)
                    setShowStudents(true);
                } else {
                    listStudents(value)
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

    async function handleSelectModule(value) {
        await setModuleChange(value)
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
            const response = await api.get(`/class/students/${id}/${value}/?moduleStudent=${studentGradeData?.modulo_nota}`)
            const { data } = response
            const studentsFrequency = data.map(student => ({
                plano_avaliacao_id: teachingPlan?.id_plano_avaliacao || null,
                usuario_id: student?.usuario_id || null,
                disciplina_id: studentGradeData?.disciplina_id || null,
                turma_id: parseInt(id),
                modulo_nota: studentGradeData?.modulo_nota || null,
                nome: student?.nome,
                nome_social: student?.nome_social,
                avaliacao_status: 0,
                nt_avaliacao_sem: null,
                nt_substitutiva: null,
                nt_exame: null,
                nt_final: null,
                obs_nt: null
            }));

            studentsFrequency.sort((a, b) => a.nome.localeCompare(b.nome));

            await setStudentData(studentsFrequency);
        } catch (error) {
            return error;
        } finally {
            setLoading(false)
        }
    }

    const getStatusGrade = (item) => {

        if (parseFloat(item.nt_final) < 6) {
            return "Reprovado";
        }

        if (parseFloat(item.nt_final) >= 6) {
            return "Aprovado";
        }

        return "Pendente";
    };


    const groupAvaliationStatus = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const disciplineName = disciplines?.filter(item => item.value === studentGradeData?.disciplina_id).map(item => item?.label)

    return (
        <>
            <SectionHeader
                perfil={classData?.nome_turma}
                title={teachingPlan?.nome_pl || 'Plano de avaliação'}
                saveButton={isPermissionEdit}
                saveButtonAction={newGrade ? handleCreateStudentGrade : handleEditStudentGrade}
            />

            {/* usuario */}
            <ContentContainer row style={{ display: 'flex', justifyContent: 'space-between', gap: 1.8, padding: 5, alignItems: 'center' }}>
                <SelectList fullWidth data={moduleDiscipline} valueSelection={studentGradeData?.modulo_nota} onSelect={(value) => handleSelectModule(value)}
                    title="Modulo/Semestre" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                <SelectList fullWidth data={disciplines} valueSelection={studentGradeData?.disciplina_id} onSelect={(value) => handleStudent(value)}
                    title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
            </ContentContainer>

            {(showStudents && studentGradeData?.disciplina_id) ?
                <ContentContainer>
                    {studentData.length > 0 ?
                        (<>
                            <Box>
                                <Text bold>{classData?.nome_turma} - {disciplineName}</Text>
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
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Resultado</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ flex: 1 }}>
                                            {

                                                studentData?.map((item, index) => {

                                                    const statusGrade = getStatusGrade(item)
                                                    const colorStatus = (statusGrade === 'Aprovado' && 'green') || (statusGrade === 'Reprovado' && 'red') || (statusGrade === 'Pendente' && 'gray');
                                                    let avaliation = item?.nt_avaliacao_sem ? parseFloat(item.nt_avaliacao_sem) : null;
                                                    let substitutive = item?.nt_substitutiva ? parseFloat(item.nt_substitutiva) : null;
                                                    let ntFinally = item?.nt_final?.toString() ? parseFloat(item?.nt_final) : 'Aguardando nota';

                                                    const isExam = (avaliation !== null && avaliation < 6)
                                                        ||
                                                        (item?.avaliacao_status === 0 && (substitutive !== null && substitutive < 6));

                                                    const name = item?.nome_social || item?.nome;

                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {name}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <RadioItem
                                                                    disabled={!isPermissionEdit && true}
                                                                    valueRadio={item?.avaliacao_status}
                                                                    group={groupAvaliationStatus}
                                                                    horizontal={true}
                                                                    onSelect={(value) => handleChange(item?.usuario_id, 'avaliacao_status', parseInt(value))}
                                                                />
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.avaliacao_status === 1 ?
                                                                    <TextInput disabled={!isPermissionEdit && true} name='nt_avaliacao_sem' value={item?.nt_avaliacao_sem || ''} sx={{ width: '60px' }} onChange={(e) => handleChange(item.usuario_id, 'nt_avaliacao_sem', e.target.value)} />
                                                                    : "-"}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.avaliacao_status === 0 ?
                                                                    <TextInput disabled={!isPermissionEdit && true} name='nt_substitutiva' value={item?.nt_substitutiva || ''} sx={{ width: '60px' }} onChange={(e) => handleChange(item.usuario_id, 'nt_substitutiva', e.target.value)} />
                                                                    : "-"}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {isExam ?
                                                                    <TextInput disabled={!isPermissionEdit && true} name='nt_exame' value={item?.nt_exame || ''} sx={{ width: '60px' }} onChange={(e) => handleChange(item.usuario_id, 'nt_exame', e.target.value)} />
                                                                    : "-"}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {ntFinally}
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <Box sx={{ backgroundColor: colorStatus, borderRadius: 2, padding: '5px 12px 2px 12px', transition: 'background-color 1s', }}>
                                                                    <Text xsmall bold style={{ color: "#fff", }}>{statusGrade}</Text>
                                                                </Box>
                                                            </td>
                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <TextInput disabled={!isPermissionEdit && true} fullWidth name='obs_nt' value={item?.obs_nt || ''} sx={{ flex: 1, }} onChange={(e) => handleChange(item.usuario_id, 'obs_nt', e.target.value)} />
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
                :
                studentGradeData?.modulo_nota && showStudents ? (

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