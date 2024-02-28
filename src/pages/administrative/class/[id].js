import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import Link from "next/link"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { IconStatus } from "../../../organisms/Table/table"

export default function EditClass(props) {
    const { setLoading, alert, colorPalette, setShowConfirmationDialog, theme, userPermissions, menuItemsList } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newClass = id === 'new';
    const [classData, setClassData] = useState({
        nome_turma: null,
        usuario_resp: null,
        ativo: null,
        inicio: null,
        fim: null,
        qnt_alunos: null,
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [courses, setCourses] = useState([])
    const [grids, setGrids] = useState([])
    const [numberRegistrations, setNumberRegistrations] = useState(0)
    const [enrolledStudents, setEnrolledStudents] = useState([])
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

    const getClass = async () => {
        try {
            const response = await api.get(`/class/${id}`)
            const { data } = response
            setClassData(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        fetchPermissions()
        listCourses()
        listGrids()
    }, [id])

    useEffect(() => {
        listGrids(classData?.curso_id)
    }, [classData?.curso_id])


    useEffect(() => {
        (async () => {
            if (newClass) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            const classData = await getClass()
            if (classData) {
                await listGrids(classData?.curso_id)
                await handleInterestByClass()
                await handleStudents()
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Turma')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setClassData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!classData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateClass = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createClass(classData);
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Turma cadastrado com sucesso.');
                    router.back(`/administrative/class/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar turma.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteClass = async () => {
        setLoading(true)
        try {
            const response = await deleteClass(id)
            if (response?.status === 200) {
                alert.success('Turma excluído com sucesso.');
                router.push(`/administrative/class/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a turma.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClass = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editClass({ id, classData })
                if (response?.status === 201) {
                    alert.success('Turma atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Turma.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Turma.');
            } finally {
                setLoading(false)
            }
        }
    }

    async function listCourses() {
        try {
            const response = await api.get(`/courses`)
            const { data } = response
            const groupCourses = data.map(course => ({
                label: `${course.nome_curso}_${course?.modalidade_curso}`,
                value: course?.id_curso
            }));

            setCourses(groupCourses);
        } catch (error) {
        }
    }

    async function listGrids(courseId) {

        try {
            const response = await api.get(`/grid/course/${courseId}`)
            const { data } = response
            const groupGrids = data.map(grid => ({
                label: grid.nome_grade,
                value: grid?.id_grade
            }));

            setGrids(groupGrids);
        } catch (error) {
            return error
        }
    }

    const handleInterestByClass = async () => {
        try {
            const response = await api.get(`/interest/classes/${id}`)
            const { numero_de_interesses } = response.data
            setNumberRegistrations(numero_de_interesses)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleStudents = async () => {
        try {
            const response = await api.get(`/class/students/${id}`)
            const { data } = response
            setEnrolledStudents(data)
        } catch (error) {
            console.log(error)
            return error
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

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={'turma'}
                title={classData?.nome_turma || `Nova Turma`}
                saveButton={isPermissionEdit}
                saveButtonAction={newClass ? handleCreateClass : handleEditClass}
                inativeButton={!newClass && isPermissionEdit}
                inativeButtonAction={(event) => setShowConfirmationDialog({
                    title: 'Tem certeza que deseja desativar a Turma?',
                    message: 'A turma será inativada, e ficará por um tempo no banco de dados, até que seja excluída.',
                    active: true,
                    event,
                    acceptAction: handleDeleteClass
                })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px'}}>
                    <Text title bold>Dados da Turma</Text>
                    <IconStatus
                        style={{ backgroundColor: classData.ativo >= 1 ? 'green' : 'red', boxShadow: classData.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name='nome_turma' onChange={handleChange} value={classData?.nome_turma || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Inicio' name='inicio' onChange={handleChange} value={(classData?.inicio)?.split('T')[0] || ''} type="date" label='Inicio' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Fim' name='fim' onChange={handleChange} value={(classData?.fim)?.split('T')[0] || ''} label='Fim' type="date" sx={{ flex: 1, }} />
                    <SelectList disabled={!isPermissionEdit && true} data={grouperiod} valueSelection={classData?.periodo} onSelect={(value) => setClassData({ ...classData, periodo: value })}
                        title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={courses} valueSelection={classData?.curso_id} onSelect={(value) => setClassData({ ...classData, curso_id: value })}
                        title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={grids} valueSelection={classData?.grade_id} onSelect={(value) => setClassData({ ...classData, grade_id: value })}
                        title="Grade" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Quantidade de alunos' name='qnt_alunos' onChange={handleChange} type="number" value={classData?.qnt_alunos || ''} label='Quantidade de alunos' sx={{ flex: 1, }} />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={classData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setClassData({ ...classData, ativo: parseInt(value) })} />
                {!newClass &&
                    <Box sx={{
                        padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', borderRadius: `12px`,
                        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, maxWidth: 160
                    }}>
                        <Text bold>Nº de inscritos:</Text>
                        <Text title>{numberRegistrations}</Text>
                    </Box>
                }

            </ContentContainer>

            {!newClass &&
                <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                    <Box>
                        <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Lista de alunos mátriculados ({enrolledStudents?.length})</Text>
                    </Box>
                    {enrolledStudents?.length > 0 ?
                        <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', borderRadius: '8px', }}>
                                <thead>
                                    <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Aluno</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Area acadêmica</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Cadastro</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nota Final</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        enrolledStudents?.map((item, index) => {
                                            const studentAcademic = `/academic/teacherArea/${item?.usuario_id}`
                                            const userDatas = `/administrative/users/${item?.usuario_id}`
                                            return (
                                                <tr key={`${item}-${index}`}>
                                                    <td style={{ padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.nome}
                                                    </td>
                                                    <td style={{ padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        <Link href={studentAcademic} target="_blank" style={{ color: theme ? 'blue' : 'red', }}>
                                                            link das notas
                                                        </Link>
                                                    </td>
                                                    <td style={{ padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        <Link href={userDatas} target="_blank" style={{ color: theme ? 'blue' : 'red', }}>
                                                            Cadastro do aluno
                                                        </Link>
                                                    </td>
                                                    <td style={{ padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        -
                                                    </td>
                                                    <td style={{ padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        -
                                                    </td>
                                                </tr>
                                            );
                                        })

                                    }
                                </tbody>
                            </table>
                        </div>
                        :
                        <Text light>Não existem alunos matrículados nessa turma</Text>}
                </ContentContainer >
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