import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createCourse, deleteCourse, editCourse } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { EditFile } from "../users/[id]"

export default function EditCourse(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newCourse = id === 'new';
    const [courseData, setCourseData] = useState({
        nome_curso: null,
        nivel_curso: null,
        modalidade_curso: null,
        carga_hr_curso: null,
        sigla: null,
        pt_autorizacao: null,
        dt_autorizacao: null,
        pt_reconhecimento: null,
        dt_reconhecimento: null,
        usuario_resp: null,
        ativo: null,
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [arrayRecognition, setArrayRecognition] = useState([])
    const [recognition, setRecognition] = useState({})
    const [showNewRecognition, setShowNewRecognition] = useState(false)
    const [showEditFile, setShowEditFiles] = useState(false)
    const [files, setFiles] = useState([])



    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getCourse = async () => {
        try {
            const response = await api.get(`/course/${id}`)
            const { data } = response
            setCourseData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newCourse) {
                fetchPermissions()
                return
            }
            await handleItems();
        })();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await fetchPermissions()
            await getCourse()
            await getRecognition()
            await getFiles()
            setShowNewRecognition(false)
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Curso')
        } finally {
            setLoading(false)
        }
    }

    const handleBlurValue = (event) => {
        const { value } = event.target;
        let valueFormatted = formatter.format(value)
        setCourseData({ ...courseData, valor: valueFormatted })
    };

    const handleChange = (event) => {

        if (event.target.name === 'valor') {
            event.target.value = event.target.value.replace(',', '.');
        }

        setCourseData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!courseData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateCourse = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createCourse(courseData, userId, files);
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Curso cadastrado com sucesso.');
                    router.push(`/administrative/course/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o curso.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteCourse = async () => {
        setLoading(true)
        try {
            const response = await deleteCourse(id)
            if (response?.status == 201) {
                alert.success('Curso excluído com sucesso.');
                router.push(`/administrative/course/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o curso.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditCourse = async () => {
        setLoading(true)
        try {
            const response = await editCourse({ id, courseData })
            if (response?.status === 201) {
                alert.success('Curso atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Curso.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Curso.');
        } finally {
            setLoading(false)
        }
    }

    const getRecognition = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/course/recognitions/${id}`)
            const { data } = response
            if (data) setArrayRecognition(data)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const getFiles = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/course/files/${id}`)
            const { data } = response
            if (data) setFiles(data)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleChangeRecognition = (value) => {
        setRecognition((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const addRecognition = () => {
        setArrayRecognition((prevArray) => [...prevArray, { ren_reconhecimento: recognition.ren_reconhecimento, dt_renovacao_rec: recognition.dt_renovacao_rec }])
        setRecognition({ ren_reconhecimento: '', dt_renovacao_rec: '' })
        setShowNewRecognition(false)
    }

    const deleteRecognition = (index) => {

        if (newCourse) {
            setArrayRecognition((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };


    const handleAddRecognition = async () => {
        setLoading(true)
        let recognitionData = {};

        try {
            if (Object.keys(recognition).length > 0) {
                recognitionData = recognition;
                const response = await api.post(`/course/recognition/create/${id}/${userId}`, { recognitionData })
                if (response?.status === 201) {
                    alert.success('Renovação adicionada')
                    setRecognition({ ren_reconhecimento: '', dt_renovacao_rec: '' })
                    handleItems()
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRecognition = async (id_renovacao_rec) => {
        setLoading(true)
        try {
            if (recognition) {
                const response = await api.delete(`/course/recognition/delete/${id_renovacao_rec}`)
                if (response?.status === 200) {
                    alert.success('Renovação excluida.');
                    handleItems()
                }
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupModal = [
        { label: 'Presencial', value: 'Presencial' },
        { label: 'EAD', value: 'EAD' },
        { label: 'Hibrido', value: 'Hibrido' },
    ]

    const groupNivel = [
        { label: 'Bacharelado', value: 'Bacharelado' },
        { label: 'Tecnólogo', value: 'Tecnólogo' },
        { label: 'Pós-Graduação', value: 'Pós-Graduação' },
        { label: 'Extensão', value: 'Extensão' },
    ]

    const groupDuration = [
        { label: '1 - Módulo', value: 1 },
        { label: '2 - Módulos', value: 2 },
        { label: '3 - Módulos', value: 3 },
        { label: '4 - Módulos', value: 4 },
        { label: '5 - Módulos', value: 5 },
        { label: '6 - Módulos', value: 6 },
        { label: '7 - Módulos', value: 7 },
        { label: '8 - Módulos', value: 8 },
    ]

    const groupInstallments = [
        { label: '1x', value: 1 },
        { label: '2x', value: 2 },
        { label: '3x', value: 3 },
        { label: '4x', value: 4 },
        { label: '5x', value: 5 },
        { label: '6x', value: 6 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const formatarParaReal = (valor) => {
        if (!valor || typeof valor !== 'number') {
            return '';
        }
        return formatter.format(valor);
    };

    const handleChangeFiles = (file) => {
        setFiles((prevClassDays) => [
            ...prevClassDays,
            {
                status: file.status,
                id_doc_curso: file.fileId,
                filePreview: file.filePreview
            }
        ]);
    };


    return (
        <>
            <SectionHeader
                perfil={courseData?.modalidade_curso}
                title={courseData?.nome_curso || `Novo Curso`}
                saveButton={isPermissionEdit}
                saveButtonAction={newCourse ? handleCreateCourse : handleEditCourse}
                deleteButton={!newCourse && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({
                    active: true,
                    event,
                    acceptAction: handleDeleteCourse,
                    title: 'Excluír Curso',
                    message: 'Tem certeza que deseja excluír o Curso? Uma vez excluído, não será possível recupera-lo.'
                })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Curso</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name='nome_curso' onChange={handleChange} value={courseData?.nome_curso || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='TPA ...' name='sigla' onChange={handleChange} value={courseData?.sigla || ''} label='Sigla' sx={{ flex: 1, }} />
                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupDuration} valueSelection={courseData?.duracao} onSelect={(value) => setCourseData({ ...courseData, duracao: value })}
                        title="Duração" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={courseData?.modalidade_curso} group={groupModal} title="Modalidade" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, modalidade_curso: value })} sx={{ flex: 1, }} />

                <Divider padding={0} />
                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1, padding: '0px 0px 0px 5px' }}>
                    <Text bold>Ato Regulatório do Curso:</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url('${icons.file}')`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => setShowEditFiles(true)} />
                </Box>
                <EditFile
                    isPermissionEdit={isPermissionEdit}
                    columnId="id_doc_curso"
                    open={showEditFile}
                    newCourse={newCourse}
                    onSet={(set) => {
                        setShowEditFiles(set)
                    }}
                    title='Ato Regulatório do Curso'
                    text='Faça o upload do seu Documento, depois clique em salvar. Para os cursos de graduação, insira a portaria do Mec. Para os cursos de pós-graduação insira a portaria do Consup.'
                    textDropzone='Arraste ou clique para enviar o arquivo.'
                    fileData={files}
                    usuarioId={id}
                    courseId={id}
                    callback={(file) => {
                        if (file.status === 201 || file.status === 200) {
                            if (!newCourse) { handleItems() }
                            else {
                                handleChangeFiles(file)
                            }
                        }
                    }}
                />
                <Divider padding={0} />


                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria MEC/Autorização' name='pt_autorizacao' onChange={handleChange} value={courseData?.pt_autorizacao || ''} label='Portaria MEC/Autorização' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_autorizacao' onChange={handleChange} value={(courseData?.dt_autorizacao)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria MEC/Reconhecimento' name='pt_reconhecimento' onChange={handleChange} value={courseData?.pt_reconhecimento || ''} label='Portaria MEC/Reconhecimento' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_reconhecimento' onChange={handleChange} value={(courseData?.dt_reconhecimento)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <ContentContainer sx={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                    <Text bold>Renovações</Text>
                    {arrayRecognition.map((rec, index) => (
                        <>
                            <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput disabled={!isPermissionEdit && true} label="Portaria MEC/ Renovação de Reconhecimento" placeholder='Portaria MEC/ Renovação de Reconhecimento' name={`ren_reconhecimento-${index}`} onChange={handleChangeRecognition} value={rec.ren_reconhecimento} sx={{ flex: 1 }} />
                                <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name={`dt_renovacao_rec-${index}`} onChange={handleChangeRecognition} value={(rec?.dt_renovacao_rec)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                                {newCourse && <Box sx={{
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    width: 25,
                                    height: 25,
                                    backgroundImage: `url(/icons/remove_icon.png)`,
                                    transition: '.3s',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => {
                                    newCourse ? deleteRecognition(index) : handleDeleteRecognition(rec?.id_renovacao_rec_p)
                                }} />}
                            </Box>
                        </>
                    ))}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button disabled={!isPermissionEdit && true} small text="novo" style={{ width: 100, height: 25 }} onClick={() => setShowNewRecognition(true)} />
                        {showNewRecognition && <Button disabled={!isPermissionEdit && true} secondary small text="cancelar" style={{ width: 100, height: 25 }} onClick={() => setShowNewRecognition(false)} />}
                    </Box>

                    <Backdrop open={showNewRecognition} sx={{ zIndex: 99999, }}>
                        <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '280px' }, }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                                <Text bold large>Adicionar Nova Renovação</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => setShowNewRecognition(false)} />
                            </Box>
                            <Divider padding={0} />
                            <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput disabled={!isPermissionEdit && true} label="Portaria MEC/ Renovação de Reconhecimento" placeholder='Portaria MEC/ Renovação de Reconhecimento' name={`ren_reconhecimento`} onChange={handleChangeRecognition} value={recognition.ren_reconhecimento} sx={{ flex: 1 }} />
                                <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name='dt_renovacao_rec' onChange={handleChangeRecognition} value={(recognition?.dt_renovacao_rec)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button disabled={!isPermissionEdit && true} small text="adicionar" style={{ width: 100, height: 25 }} onClick={() => { newCourse ? addRecognition() : handleAddRecognition() }} />
                                <Button disabled={!isPermissionEdit && true} secondary small text="cancelar" style={{ width: 100, height: 25 }} onClick={() => setShowNewRecognition(false)} />
                            </Box>
                        </ContentContainer>
                    </Backdrop>

                </ContentContainer>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Carga horária' name='carga_hr_curso' onChange={handleChange} value={courseData?.carga_hr_curso || ''} label='Carga horária' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} label='Data de ínicio' name='dt_inicio' onChange={handleChange} value={(courseData?.dt_inicio)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={courseData?.nivel_curso} group={groupNivel} title="Nível do curso" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, nivel_curso: value })} sx={{ flex: 1, }} />
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={courseData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, ativo: parseInt(value) })} />

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