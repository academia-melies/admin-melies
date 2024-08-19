import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { Avatar, Backdrop, useMediaQuery, useTheme, Tooltip } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider, } from "../../../atoms"
import { CheckBoxComponent, CustomDropzone, RadioItem, SectionHeader, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createContract, createUser, deleteFile, deleteUser, editContract, editeEnrollment, editeUser } from "../../../validators/api-requests"
import { emailValidator, formatCEP, formatCPF, formatDate, formatRg, formatTimeStamp, getRandomInt } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"
import Link from "next/link"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Dropzone from "react-dropzone"
import Cards from 'react-credit-cards'
import UserData from "./components/UserData/UserData"
import Documents from "./components/Documents/Documents"
import Enrollments from "./components/Enrollments/Enrollments"
import ContractEmployee from "./components/ContractEmployee/ContractEmployee"
import InterestAndSubscription from "./components/InterestAndSubscription/InterestAndSubscription"
import PaymentsPreference from "./components/PaymentPreference/PaymentsPreference"
require('dotenv').config();


export default function EditUser() {
    const { setLoading, alert, colorPalette, user, theme, menuItemsList, userPermissions } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newUser = id === 'new';
    const [perfil, setPerfil] = useState('')
    const [enrollmentRegisterData, setEnrollmentRegisterData] = useState({
        turma_id: null,
        modulo: null,
        qnt_disci_dp: 0,
        qnt_disci_disp: 0,
        rematricula: null,
        cursando_dp: null,
        dt_inicio: null,
        dt_final: null,
        status: null,
        motivo_desistencia: null,
        dt_desistencia: null,
        certificado_emitido: 0,
        adimplente: 0,
        preferencia_pagamento: null,
        disciplinesData: [],
    })
    const [userData, setUserData] = useState({
        perfil: ''
    })
    const [courses, setCourses] = useState([])
    const [classes, setClasses] = useState([])
    const [period, setPeriod] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [menuView, setMenuView] = useState('userData');

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const fetchData = async () => {
        try {
            const [userDataReponse, couseReponse, classReponse] = await Promise.all([
                api.get(`/userdata/${id}`),
                api.get(`/courses`),
                api.get(`/classes`),
            ])

            const userDataGet = userDataReponse.data
            console.log(userDataGet)
            setUserData(userDataGet)
            setPerfil(userDataGet?.perfil)

            const courseDataGet = couseReponse.data
            const groupCourses = courseDataGet?.filter(item => item.ativo === 1)?.map(course => ({
                label: `${course.nome_curso}_${course?.modalidade_curso}`,
                value: course?.id_curso
            }));

            setCourses(groupCourses);

            const classDataGet = classReponse.data
            const groupClass = classDataGet.filter(item => item.ativo === 1)?.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma
            }));

            const groupPeriod = classDataGet.filter(item => item.ativo === 1)?.map(turma => ({
                label: turma?.periodo,
                value: turma?.periodo,
                idClass: turma?.id_turma
            }));

            setClasses(groupClass);
            setPeriod(groupPeriod)

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchPermissions()
        fetchData()
    }, [id])


    const handleChangeUnlockingData = (value) => {

        setEnrollmentUnlockingData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeEnrollmentDisciplinesDataDestrancamento = (modulo, disciplineId, field, value) => {

        setEnrollmentUnlockingData((prevValues) => {
            const updatedDisciplinesData = prevValues?.disciplinesData?.map((m) => {
                if (modulo === m.modulo_grade) {
                    return {
                        ...m,
                        disciplinas: m.disciplinas.map((item) => {
                            if (item?.disciplina_id === disciplineId) {
                                return {
                                    ...item,
                                    [field]: value
                                }
                            }
                            return item
                        })
                    }
                }
                return m
            })

            return {
                ...prevValues,
                disciplinesData: updatedDisciplinesData
            }
        })
    }

    // const checkEnrollmentData = (enrollmentRegisterData) => {
    //     const requiredFields = ['turma_id', 'modulo', 'dt_inicio', 'dt_final', 'status', 'preferencia_pagamento', 'rematricula', 'cursando_dp'];


    //     for (const field of requiredFields) {
    //         if (enrollmentRegisterData[field] === '' || enrollmentRegisterData[field] === null) {
    //             alert.info('Preencha todos os campos obrigatórios antes de prosseguir.');
    //             return false;
    //         }
    //     }

    //     let classId = enrollmentRegisterData?.turma_id;
    //     let selectedModule = enrollmentRegisterData?.modulo;
    //     let statusEnrollment = enrollmentRegisterData?.status;
    //     if (arrayEnrollmentRegisterData?.filter(item => (item.turma_id === classId) && item?.modulo === selectedModule && item?.status === statusEnrollment)?.length > 0
    //     ) {
    //         alert.info('Já foi adicionado uma matrícula com a turma e módulo selecionados. Verifique nas matriculas já incluídas acima, para que não haja duplicidade.')
    //         return false;
    //     }

    //     return true
    // }

    // async function handleSelectModule(value) {

    //     let moduleClass = value;
    //     try {
    //         const response = await api.get(`/classSchedule/disciplines/${enrollmentRegisterData?.turma_id}/${moduleClass}`)
    //         const { data } = response
    //         const groupDisciplines = data.map(disciplines => ({
    //             nome_disciplina: disciplines.nome_disciplina,
    //             disciplina_id: disciplines?.id_disciplina,
    //             nt_final: 0,
    //             qnt_presenca: 0,
    //             qnt_falta: 0,
    //             selecionada: 1
    //         }));

    //         setDisciplinesEnrollmentRegister(groupDisciplines);
    //         setEnrollmentRegisterData({
    //             ...enrollmentRegisterData,
    //             disciplinesData: groupDisciplines
    //         })
    //     } catch (error) {
    //         return error
    //     }
    // }


    // async function handleSelectDisciplinesGrid(value) {

    //     try {
    //         const response = await api.get(`/grid/disciplines/classId/${value}`)
    //         const { data } = response
    //         const groupDisciplines = []

    //         data.forEach((objeto) => {
    //             const currentModule = objeto?.modulo_grade;
    //             const grupo = groupDisciplines.find((grupo) => grupo.modulo_grade === currentModule);

    //             if (grupo) {
    //                 grupo.disciplinas.push({
    //                     nome_disciplina: objeto?.nome_disciplina,
    //                     disciplina_id: objeto?.id_disciplina,
    //                     modulo_curso: objeto?.id_disciplina,
    //                     selecionada: objeto?.modulo_grade
    //                 });

    //             } else {
    //                 const newGrupo = {
    //                     modulo_grade: objeto?.modulo_grade,
    //                     disciplinas: [
    //                         {
    //                             nome_disciplina: objeto?.nome_disciplina,
    //                             disciplina_id: objeto?.id_disciplina,
    //                             modulo_curso: objeto?.id_disciplina,
    //                             selecionada: objeto?.modulo_grade
    //                         }
    //                     ]
    //                 };
    //                 groupDisciplines.push(newGrupo);
    //             }
    //         });

    //         setDisciplinesEnrollmentRegister(groupDisciplines);
    //         setEnrollmentUnlockingData({
    //             ...enrollmentRegisterData,
    //             disciplinesData: groupDisciplines,
    //             turma_id: value
    //         })
    //     } catch (error) {
    //         return error
    //     }
    // }

    console.log(userData.perfil)
    const menuUser = [
        {
            id: '01', icon: '/icons/user.png', text: 'Dados do Usuário', queryId: true, screen: 'userData',
            perfil: ['aluno', 'interessado', 'funcionario']
        },
        {
            id: '02', icon: '/icons/google-docs.png', text: 'Documentos', screen: 'userFiles',
            perfil: ['aluno', 'interessado', 'funcionario']
        },
        { id: '03', icon: '/icons/verify.png', text: 'Matrículas', queryId: true, screen: 'enrollments', perfil: ['aluno', 'interessado'] },
        { id: '04', icon: '/icons/exam.png', text: 'Inscrições e Interesses', queryId: true, screen: 'interests', perfil: ['aluno', 'interessado'] },
        { id: '05', icon: '/icons/signature.png', text: 'Contrato do Funcionário', queryId: true, screen: 'contractEmployee', perfil: ['funcionario'] },
        { id: '06', icon: '/icons/credit-card.png', text: 'Preferência de Pagamento', queryId: true, screen: 'paymentPerfil', perfil: ['aluno'] },
        // { id: '06', icon: '/icons/unlock.png', text: 'Destrancamento de Matrícula', queryId: true, screen: 'openEnrollment', perfil: ['aluno'] },
    ]

    return (
        <>
            <SectionHeader
                perfil={userData?.perfil}
                title={newUser ? 'Criar Usuário' : `Editar Usuário`}
            />


            <Box sx={{
                display: perfil !== '' ? 'flex' : 'none', flexWrap: 'wrap', backgroundColor: colorPalette?.secondary, padding: '8px 10px', borderRadius: 2,
                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
            }}>
                {menuUser?.map((item, index) => {
                    const isScreen = item?.screen === menuView;
                    const userProfiles = perfil?.includes(',') ? perfil?.split(',').map(profile => profile.trim()) : perfil?.trim();
                    const showMenu = item?.perfil.some(profile => userProfiles?.includes(profile));
                    return (
                        <Box key={index} sx={{
                            display: showMenu ? 'flex' : 'none', padding: '12px 15px',
                            borderRadius: 2,
                            backgroundColor: isScreen ? colorPalette.primary : colorPalette.secondary,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 2,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer',
                                transform: 'scale(1.02, 1.02)'
                            }

                        }} onClick={() => setMenuView(item?.screen)}>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 16, height: 16, aspectRatio: '1/1',
                                backgroundImage: `url('${item?.icon}')`,
                                transition: '.3s',

                            }} />
                            <Text bold style={{ color: isScreen ? colorPalette?.buttonColor : colorPalette?.textColor }}>{item?.text}</Text>
                        </Box>
                    )
                })
                }
            </Box>

            {menuView === 'userData' &&
                <UserData id={id}
                    newUser={newUser}
                    isPermissionEdit={isPermissionEdit}
                    mobile={mobile}
                    userId={usuario_id}
                    perfil={perfil}
                    setPerfil={setPerfil}
                />
            }

            {(userData.perfil && userData.perfil.includes('funcionario') && menuView === 'contractEmployee') &&
                <ContractEmployee id={id} isPermissionEdit={isPermissionEdit} newUser={newUser} />
            }

            {(userData.perfil && userData.perfil.includes('aluno') && menuView === 'enrollments') &&
                <Enrollments id={id} isPermissionEdit={isPermissionEdit} mobile={mobile} newUser={newUser} classes={classes} />}

            {(userData.perfil && (userData.perfil.includes('aluno') || userData.perfil.includes('interessado')) && menuView === 'interests') &&
                <InterestAndSubscription
                    id={id}
                    isPermissionEdit={isPermissionEdit}
                    newUser={newUser}
                    mobile={mobile}
                    userData={userData}
                    classes={classes}
                    courses={courses}
                    period={period}
                />
            }

            {menuView === 'userFiles' && <Documents id={id} />}

            {(userData.perfil && userData.perfil.includes('aluno') && menuView === 'paymentPerfil') &&
                <PaymentsPreference id={id} />}

            {(userData.perfil && userData.perfil.includes('aluno') && menuView === 'openEnrollment') && <></>
                // <>
                //     <ContentContainer style={{ ...styles.containerContract, padding: '40px', }}>
                //         <Box sx={{
                //             display: 'flex', alignItems: 'center', padding: '0px 0px 20px 0px', gap: 1, "&:hover": {
                //                 opacity: 0.8,
                //                 cursor: 'pointer'
                //             },
                //             justifyContent: 'space-between'
                //         }} onClick={() => setShowEnrollmentAdd(!showEnrollmentAdd)}>
                //             <Text title bold >Destrancamento de Matrícula</Text>
                //             <Box sx={{
                //                 ...styles.menuIcon,
                //                 backgroundImage: `url(${icons.gray_arrow_down})`,
                //                 transform: 'rotate(0deg)',
                //                 transition: '.3s',
                //                 "&:hover": {
                //                     opacity: 0.8,
                //                     cursor: 'pointer'
                //                 }
                //             }} />
                //         </Box>

                //         <>
                //             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                //                 <Divider padding={0} />
                //                 <Text bold title>Dados da Matrícula</Text>
                //                 <Box sx={styles.inputSection}>
                //                     <SelectList disabled={!isPermissionEdit && true} fullWidth data={classes} valueSelection={enrollmentUnlockingData?.turma_id}
                //                         onSelect={(value) => handleSelectDisciplinesGrid(value)}
                //                         title="Turma " filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                //                         inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                //                     />
                //                     <TextInput disabled={!isPermissionEdit && true} placeholder='Módulo/Semestre' name='modulo' onChange={handleChangeUnlockingData} type="number" value={enrollmentUnlockingData?.modulo} label='Módulo/Semestre *' sx={{ flex: 1, }} onBlur={(e) => handleSelectModule(e.target.value)} />
                //                 </Box>
                //                 <Box sx={styles.inputSection}>
                //                     <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupEnrollment} valueSelection={enrollmentUnlockingData?.rematricula} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentUnlockingData, rematricula: value })}
                //                         title="Cursando Rematrícula? *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                //                         inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                //                     />
                //                     <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupEnrollment} valueSelection={enrollmentUnlockingData?.cursando_dp} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentUnlockingData, cursando_dp: value })}
                //                         title="Cursando alguma DP? *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                //                         inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                //                     />
                //                 </Box>
                //                 <Box sx={styles.inputSection}>
                //                     <TextInput disabled={!isPermissionEdit && true} name='dt_inicio' onChange={handleChangeUnlockingData} type="date" value={(enrollmentUnlockingData?.dt_inicio)?.split('T')[0] || ''} label='Inicio *' sx={{ flex: 1, }} />
                //                     <TextInput disabled={!isPermissionEdit && true} name='dt_final' onChange={handleChangeUnlockingData} type="date" value={(enrollmentUnlockingData?.dt_final)?.split('T')[0] || ''} label='Fim *' sx={{ flex: 1, }} />
                //                     <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupSituation} valueSelection={enrollmentUnlockingData?.status} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentUnlockingData, status: value })}
                //                         title="Status/Situação *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                //                         inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                //                     />
                //                 </Box>

                //                 <SelectList disabled={!isPermissionEdit && true} fullWidth data={grouPreferPayment} valueSelection={enrollmentUnlockingData?.preferencia_pagamento} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentRegisterData, preferencia_pagamento: value })}
                //                     title="Preferência de Pagamento: *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                //                     inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                //                 />

                //                 {enrollmentUnlockingData?.disciplinesData?.length > 0 &&
                //                     <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 1.8, marginTop: 2 }}>
                //                         <Text bold>Disciplinas que o aluno irá cursar</Text>
                //                         {enrollmentUnlockingData?.disciplinesData?.map((mod, index) => {
                //                             return (
                //                                 <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                //                                     <Text bold large>{mod?.modulo_grade}º Módulo</Text>

                //                                     <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                //                                         {mod?.disciplinas?.map((item, index) => (
                //                                             <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                //                                                 <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 350 }}>
                //                                                     <Box sx={{
                //                                                         display: 'flex',
                //                                                         alignItems: 'center',
                //                                                         justifyContent: 'center',
                //                                                         width: 16,
                //                                                         height: 16,
                //                                                         borderRadius: 16,
                //                                                         cursor: 'pointer',
                //                                                         transition: '.5s',
                //                                                         border: parseInt(item?.selecionada) > 0 ? '' : `1px solid ${colorPalette.textColor}`,
                //                                                         '&:hover': {
                //                                                             opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                //                                                             boxShadow: parseInt(item?.selecionada) > 0 ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                //                                                         }
                //                                                     }}
                //                                                         onClick={() => {
                //                                                             const newValue = parseInt(item?.selecionada) > 0 ? 0 : 1;
                //                                                             handleChangeEnrollmentDisciplinesDataDestrancamento(mod?.modulo_grade, item?.disciplina_id, 'selecionada', newValue);
                //                                                         }}
                //                                                     >
                //                                                         {parseInt(item?.selecionada) > 0 ? (
                //                                                             <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                //                                                         ) : (
                //                                                             <Box
                //                                                                 sx={{
                //                                                                     width: 11,
                //                                                                     height: 11,
                //                                                                     borderRadius: 11,
                //                                                                     cursor: 'pointer',
                //                                                                     '&:hover': {
                //                                                                         opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                //                                                                         boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                //                                                                     },
                //                                                                 }}
                //                                                             />
                //                                                         )}
                //                                                     </Box>
                //                                                     <Text bold small>{item?.nome_disciplina}</Text>
                //                                                 </Box>
                //                                                 <Divider distance={0} />
                //                                             </Box>
                //                                         ))}
                //                                     </Box>
                //                                 </Box>
                //                             )
                //                         })}
                //                     </Box>}
                //             </Box>
                //             {/* <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                //                 <Button text="Adicionar" small onClick={() => handleAddEnrollmentRegister()} style={{ width: 120, height: 30 }} />
                //             </Box> */}
                //         </>


                //     </ContentContainer >
                // </>
            }
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
    containerContract: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
    },
    menuIcon: {
        backgroundSize: 'contain',
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
    },
    containerFile: {
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray lightgray',
        '&::-webkit-scrollbar': {
            width: '5px',

        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'darkgray',
            borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'gray',

        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'gray',

        },
    }
}

export const EditFile = (props) => {
    const {
        open = false,
        onSet = () => { },
        callback = () => { },
        title = '',
        text = '',
        textDropzone = '',
        campo = '',
        tipo = '',
        bgImage = '',
        usuarioId,
        newUser,
        fileData = [],
        columnId = '',
        matriculaId,
        isPermissionEdit,
        courseId,
        setFilesUser,
        filesUser,
        setFileCallback
    } = props

    const { alert, setLoading, matches, theme, colorPalette } = useAppContext()

    const handleDeleteFile = async (files) => {
        setLoading(true)
        const response = await deleteFile({ fileId: files?.[columnId], usuario_id: usuarioId, campo: files.campo, key: files?.key_file, matriculaId, courseId })
        const { status } = response
        let file = {
            status
        }
        if (status === 200) {
            alert.success('Aqruivo removido.');
            callback(file)
        } else {
            alert.error('Ocorreu um erro ao remover arquivo.');
        }
        setLoading(false)
    }


    const onDropFiles = async (files) => {
        try {
            setLoading(true)
            const uploadedFiles = files.map(file => ({
                file,
                id: getRandomInt(1, 999),
                name: file.name,
                preview: URL.createObjectURL(file),
                progress: 0,
                uploaded: false,
                error: false,
                url: null,
                campo: campo,
                tipo: tipo,
                usuario_id: usuarioId,
                matricula_id: matriculaId,
                courseId: courseId
            }));

            const [filePerfil] = uploadedFiles;
            if (campo === 'foto_perfil') {
                setFileCallback(filePerfil);
            }

            setFilesUser(prevFilesDrop => [...prevFilesDrop, ...uploadedFiles]);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleRemoveFile = (file) => {
        const arquivosAtualizados = filesUser.filter((uploadedFile) => uploadedFile.id !== file.id);
        setFilesUser(arquivosAtualizados);
    };


    const statusColor = (data) => ((data === 'Pendente de assinatura' && 'yellow') ||
        (data === 'Assinado' && 'green'))

    return (
        <>
            <Backdrop open={open} sx={{ zIndex: 99999, }}>
                <ContentContainer style={{
                    ...styles.containerFile, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '0px' }, overflowY: matches && 'scroll',
                    maxWidth: 550,
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 2, alignItems: 'center', padding: '0px 0px 8px 0px' }}>
                        <Text bold>{title}</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 15,
                            height: 15,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => {
                            onSet(false)
                        }} />
                    </Box>
                    <Divider />
                    <Box sx={{
                        display: 'flex',
                        whiteSpace: 'wrap',
                        // maxWidth: 280,
                        justifyContent: 'center'
                    }}>
                        <Text>{text}</Text>
                    </Box>
                    {isPermissionEdit &&
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            {!newUser ?
                                <CustomDropzone
                                    txt={textDropzone}
                                    bgImage={bgImage}
                                    bgImageStyle={{
                                        backgroundImage: `url(${bgImage})`,
                                        backgroundSize: campo === 'foto_perfil' ? 'cover' : 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center center',
                                        width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                        borderRadius: campo === 'foto_perfil' ? '50%' : '',
                                        aspectRatio: '1/1',
                                    }}
                                    callback={(file) => {
                                        if (file.status === 201) {
                                            callback(file)
                                        }
                                    }}
                                    usuario_id={usuarioId}
                                    campo={campo}
                                    tipo={tipo}
                                    matricula_id={matriculaId}
                                    courseId={courseId}
                                />
                                : <Dropzone
                                    accept={{ 'image/jpeg': ['.jpeg', '.JPEG', '.jpg', '.JPG'], 'image/png': ['.png', '.PNG'], 'application/pdf': ['.pdf'] }}
                                    onDrop={onDropFiles}
                                    addRemoveLinks={true}
                                    removeLink={(file) => handleRemoveFile(file)}
                                >
                                    {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                                        <Box {...getRootProps()}
                                            sx={{
                                                // ...styles.dropZoneContainer,
                                                // border: `2px dashed ${colorPalette.primary + 'aa'}`,
                                                // backgroundColor: isDragActive && !isDragReject ? colorPalette.secondary : isDragReject ? '#ff000042' : colorPalette.primary,
                                            }}
                                        >
                                            <input {...getInputProps()} />
                                            <Box sx={{ textAlign: 'center', display: 'flex', fontSize: 12, gap: 0, alignItems: 'center' }}>
                                                <Button small style={{ height: 25, borderRadius: '6px 0px 0px 6px' }} text="Selecionar" />
                                                <Box sx={{ textAlign: 'center', display: 'flex', border: `1px solid ${(theme ? '#eaeaea' : '#404040')}`, padding: '0px 15px', maxWidth: 400, height: 25, alignItems: 'center' }}>
                                                    <Text light small>{textDropzone}</Text>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Dropzone>}

                        </Box>}

                    {bgImage &&
                        <>
                            <Divider padding={0} />

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>

                                {newUser &&
                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text bold>Atual</Text>
                                        <Avatar src={bgImage} sx={{
                                            height: 'auto',
                                            borderRadius: '16px',
                                            width: { xs: 150, sm: 150, md: 200, lg: 250 },
                                            aspectRatio: '1/1',
                                        }} variant="square" />
                                    </Box>
                                }
                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                    <Button disabled={!isPermissionEdit && true} secondary small text='Remover' style={{ padding: '5px 10px 5px 10px', width: 120 }}
                                        onClick={() => {
                                            if (newUser) {
                                                callback("")
                                                setFileCallback({})
                                            } else {
                                                handleDeleteFile()
                                            }
                                        }} />
                                </Box>
                            </Box>
                        </>
                    }

                    {campo != 'foto_perfil' && fileData?.length > 0 &&
                        <ContentContainer style={{ boxShadow: 'none', padding: '15px' }}>
                            <Text bold>Arquivos</Text>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflow: 'auto', padding: '15px 10px' }}>
                                {fileData?.map((file, index) => {
                                    const typePdf = file?.name_file
                                        ?.includes('pdf') || null;
                                    const fileName = file?.name_file || file?.name
                                    const fileLocation = file?.location || file?.preview
                                    return (
                                        <Box key={`${file}-${index}`} sx={{
                                            display: 'flex', flexDirection: 'column',
                                            gap: 1,
                                            maxWidth: '200px',
                                            padding: '10px 8px', backgroundColor: colorPalette?.primary, borderRadius: 2
                                        }}>

                                            <Link
                                                style={{ display: 'flex', position: 'relative', border: `1px solid gray`, borderRadius: '8px' }}
                                                href={fileLocation || ''} target="_blank">
                                                <Box
                                                    sx={{
                                                        backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : fileLocation}')`,
                                                        backgroundSize: 'contain',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center center',
                                                        width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                                        aspectRatio: '1/1',
                                                    }}>
                                                </Box>
                                                {isPermissionEdit && <Box sx={{
                                                    backgroundSize: "cover",
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "center",
                                                    width: 22,
                                                    height: 22,
                                                    backgroundImage: `url(/icons/remove_icon.png)`,
                                                    position: 'absolute',
                                                    top: -5,
                                                    right: -5,
                                                    transition: ".3s",
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: "pointer",
                                                    },
                                                    zIndex: 9999999,
                                                }} onClick={(event) => {
                                                    event.preventDefault()
                                                    if (newUser) {
                                                        handleRemoveFile(file)
                                                    } else {
                                                        handleDeleteFile(file)
                                                    }
                                                }} />}
                                            </Link>
                                            <Box sx={{ display: 'flex', gap: .5, padding: '5px', borderRadius: 2, flexDirection: 'column', backgroundColor: colorPalette?.secondary }}>
                                                <Text xsmall sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Nome: <strong>{decodeURIComponent(fileName)}</strong>
                                                </Text>
                                                {file?.dt_criacao && <Text xsmall sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Dt Criação: <strong>{formatTimeStamp(file?.dt_criacao, true)}</strong>
                                                </Text>}
                                                {(columnId === 'id_contrato_aluno' && file?.status_assinaturas) &&
                                                    <Box sx={{ display: 'flex', gap: .3 }}>
                                                        <Text xsmall sx={{ whiteSpace: 'nowrap' }}>
                                                            Status:</Text>
                                                        <Box sx={{ display: 'flex', padding: '2px 5px', backgroundColor: statusColor(file?.status_assinaturas), borderRadius: 2 }}>
                                                            <Text bold xsmall sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {file?.status_assinaturas}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                }
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </Box>
                        </ContentContainer>
                    }
                </ContentContainer>
            </Backdrop>
        </>
    )
}
