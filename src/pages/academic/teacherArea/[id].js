import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, Backdrop, CircularProgress, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { formatDate, formatTimeStamp } from "../../../helpers"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Link from "next/link"

export default function StudentData(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const [studentData, setStudentData] = useState({})
    const [showEnrollTable, setShowEnrollTable] = useState({})
    const [showClass, setShowClass] = useState({ turma_id: null, nome_turma: null, modulo_turma: 1 })
    const [frequencyData, setFrequency] = useState([])
    const [gradesData, setGrades] = useState([])
    const [activityList, setActivityList] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [enrollmentData, setEnrollment] = useState([])
    const [moduleStudent, setModuleStudent] = useState(1)
    const [loadingActivities, setLoadingActivities] = useState(false)
    const [showFiles, setShowFiles] = useState({ active: false, item: [] })
    const [showComentaryReprovved, setShowComentaryReprovved] = useState({ active: false, item: [], commentary: '', onlyRead: false })
    const [isDp, setIsDp] = useState(false)
    const [bgPhoto, setBgPhoto] = useState({})
    const [statusGradeFinally, setStatusGradeFinally] = useState('Pendente')
    const [showBox, setShowBox] = useState({
        disciplines: false,
        frequency: false,
        grades: false,
        additionalActivities: false
    });
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const toggleEnrollTable = (index) => {
        setShowEnrollTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const getStudent = async () => {
        try {
            const userResponse = await api.get(`/user/${id}`)
            setStudentData(userResponse.data)
        } catch (error) {
            console.log(error)
            return error
        }
        
    }

    const getPhoto = async () => {
        try {
            const response = await api.get(`/photo/${id}`)
            const { data } = response
            setBgPhoto(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getEnrollment = async (turma_id) => {
        try {
            const response = await api.get(`/enrollment/${id}`);
            const { data } = response;
            setEnrollment(data);
            let [enrollment] = data;

            if (turma_id) {
                enrollment = data?.filter(item => item.turma_id === turma_id);
            }

            if (enrollment[0]?.cursando_dp === 1) {
                setIsDp(true)
            } else {
                setIsDp(false)
            }

            if (turma_id && turma_id === showClass?.turma_id) {
               
                return data;
            }

      
           /*  setShowClass({
                turma_id: enrollment?.turma_id,
                nome_turma: enrollment?.nome_turma
            });  */
            
            await setModuleStudent(data[data.length - 1]?.modulo)
             await setShowClass({
                turma_id: data[data.length - 1]?.turma_id,
                nome_turma: data[data.length - 1]?.nome_turma
            }); 

            return enrollment;
        } catch (error) {
            console.log(error);
            return error;
        }
    };


    const getFrequency = async (turma_id, moduleStudent) => {
        try {
            const response = await api.get(`/frequency/student/${id}/${turma_id}/${moduleStudent}`)
            const { data } = response
            setFrequency(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getGrades = async (moduleStudent, turma_id) => {
        try {
            const response = await api.get(`/studentGrade/student/${id}/${moduleStudent}/${turma_id}`)
            const { data } = response
            setGrades(data)
            await getStatusGradeFinally(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getComplementaryActivities = async (moduleStudent, turma_id) => {
        setLoadingActivities(true)
        try {
            if (turma_id) {
                const response = await api.get(`/atividade-complementar/user/${id}/${turma_id}`)
                const { data } = response
                const sortedActivities = data.sort((a, b) => new Date(a.dt_criacao) - new Date(b.dt_criacao));
                setActivityList(sortedActivities);
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingActivities(false)
        }
    }



    async function handleSelectModule(turma_id, moduleStudent) {
        try {
            if (turma_id) {
                const response = await api.get(`/student/enrrolments/disciplines/${id}/${turma_id}?moduleStudent=${moduleStudent}`)
                const { data } = response
                setDisciplines(data);
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }


    useEffect(() => {
        const previousTurmaId = showClass?.turma_id;
        const previousModule = moduleStudent;
        

        handleItems();

        return () => {
            // Evitar chamada desnecessária se o valor não mudou
            if (previousTurmaId !== showClass?.turma_id || previousModule !== moduleStudent) {
                handleItems();
            }
        };
    }, [showClass?.turma_id, moduleStudent]);


    // useEffect(() => {
    //     if (showClass?.turma_id) {
    //         handleUpdateInfoEnrollment()
    //     }
    // }, [showClass?.turma_id])

    // const handleUpdateInfoEnrollment = async () => {
    //     setLoading(true)
    //     try {
    //         await getFrequency(showClass?.turma_id)
    //         await getGrades(moduleStudent, showClass?.turma_id)
    //         await handleSelectModule(showClass?.turma_id, moduleStudent)
    //     } catch (error) {
    //         console.log(error)
    //         return error
    //     } finally {
    //         setLoading(false)
    //     }
    // }


    const handleItems = async () => {
        setLoading(true)
        try {
            let enrollmentData = showClass?.turma_id;
          
            await getStudent()
            await getPhoto()
            const enrollment = await getEnrollment(enrollmentData)
            await handleSelectModule(showClass?.turma_id, moduleStudent)
            await getFrequency(showClass?.turma_id, moduleStudent)
            await getGrades(moduleStudent, showClass?.turma_id)
            await getComplementaryActivities(moduleStudent, showClass?.turma_id)
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Dados')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setStudentData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!studentData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleUpdateAprovvedActivity = async ({ activityId, aprovved, commentary = null }) => {
        setLoading(true)
        try {
            const activityData = {
                aprovado: aprovved,
                comentario: commentary,
                aprovado_por: user?.id
            }
            const response = await api.patch(`/atividade-complementar/update/aprovved/${activityId}`, { activityData })
            if (response?.status === 200) {
                alert.success('Atividade Complementar atualizada com sucesso.');
                setShowComentaryReprovved({ active: false, item: [], commentary: '' })
                setShowFiles({ active: false, item: [] })
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Atividade Complementar.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Atividade Complementar.');
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


    const getStatusGradeFinally = async (data) => {

        let status;

        const gradesStudent = data?.map((item, index) => {

            const disciplinesGrades = {
                qnt: index + 1,
                nota_final: item?.nt_final
            }

            return disciplinesGrades;
        })

        let nt_reprovado = gradesStudent.filter(item => item.nota_final < 6)

        if (gradesStudent?.length > 0) {
            if (nt_reprovado.length > 2) {
                status = 'Reprovado'
            } else {
                status = "Aprovado";
            }
        } else {
            status = "Pendente"
        }

        if (status) {
            setStatusGradeFinally(status)
        }
    }


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const statusColor = (data) => (
        (data === 'Reprovado' && 'red') ||
        (data === 'Aprovado' && 'green') ||
        (data === 'Aguardando Aprovação' && 'yellow')
    )

    const totalHoursApproved = activityList?.length > 0 && activityList?.filter(item => item?.carga_hr && parseInt(item?.aprovado) === 1)?.map(item => parseInt(item?.carga_hr))
        ?.reduce((accumulator, currentValue) => accumulator += currentValue, 0)


    const calculationEndEnrollment = () => {
        let [endDate] = enrollmentData?.length > 0 && (enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id && item.modulo === moduleStudent)?.map(item => item?.dt_fim_cronograma || item?.dt_final) || '')
        let currentDate = new Date();
        const endEnrollment = currentDate > new Date(endDate);
        return endEnrollment
    }


    return (
        <>
            <SectionHeader
                perfil={'dados da faculdade'}
                title={studentData?.nome || studentData?.nome_social}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Acadêmico Aluno</Text>
                    <Box sx={{ display: 'flex' }}>
                        {enrollmentData?.length > 0 &&
                            enrollmentData?.map((item, index) => {
                                const titleButton = `${item?.nome_turma}_${item?.modulo}`;
                                const isDpEnrolled = item?.cursando_dp > 0;
                                return (
                                    <Box sx={{ display: 'flex', position: 'relative' }} key={index}>
                                        <Button small secondary={(item?.turma_id === showClass?.turma_id && item?.modulo === moduleStudent) ? false : true} text={titleButton} onClick={() => {
                                            
                                            setShowClass({
                                                turma_id: item?.turma_id,
                                                nome_turma: item?.nome_turma,
                                                modulo_turma: item?.modulo
                                            })
                                            setModuleStudent(item?.modulo)
                                        }} style={{ height: '30px', borderRadius: 0 }} />

                                        {isDpEnrolled && <Box sx={{
                                            backgroundColor: 'red',
                                            width: 16,
                                            height: 16,
                                            borderRadius: 16,
                                            padding: '1px',
                                            display: 'flex',
                                            position: 'absolute',
                                            top: 2,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Text bold xsmall style={{ color: '#fff', textAlign: 'center', fontSize: 8 }}>DP</Text>
                                        </Box>}
                                    </Box>
                                )
                            })}
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 2.5, flexDirection: 'column', flex: 1, marginTop: 2 }}>
                        {isDp && <Box sx={{ padding: '5px 15px', backgroundColor: 'red', borderRadius: 2, width: 110 }}>
                            <Text bold small style={{ color: '#fff' }}>Cursando DP</Text>
                        </Box>}
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Nome: </Text>
                            <Text>{studentData?.nome}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Registro (RA): </Text>
                            <Text>{studentData?.id}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Cursando: </Text>
                            <Text>{enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id && item.modulo === moduleStudent)?.map(item => item?.modulo) || '1'}º Modulo/Semestre</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'start' }}>
                            <Text bold>Inicio Matricula: </Text>
                            <Text>{formatTimeStamp(enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id && item.modulo === moduleStudent)?.map(item => item?.dt_inicio_cronograma || item?.dt_inicio) || '')}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Status: </Text>
                            <Text>{enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id && item.modulo === moduleStudent)?.map(item => item?.status)}</Text>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', padding: 5, width: 260 }}>
                        <Avatar src={bgPhoto?.location} sx={{
                            height: 'auto',
                            borderRadius: '16px',
                            width: { xs: '100%', sm: 180, md: 180, lg: 180 },
                            aspectRatio: '1/1',
                        }} variant="square" />
                    </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => setShowBox({ ...showBox, disciplines: !showBox?.disciplines })}
                    >
                        <Text bold>Materias (Cursando):</Text>
                        <Box
                            sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showBox?.disciplines ? 'rotate(0)' : 'rotate(-90deg)',
                                transition: '.3s',
                                width: 17,
                                height: 17
                            }}
                        />
                    </Box>
                    {showBox?.disciplines && (
                        disciplines?.length > 0 ?
                            <Box sx={{ display: 'flex' }}>

                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', }}>
                                    <table style={{ borderCollapse: 'collapse', }}>
                                        <thead>
                                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>#</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Disciplina</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Status</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Módulo/Semestre</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                disciplines?.map((item, index) => {
                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.disciplina_id}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nome_disciplina}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.status}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.modulo}
                                                            </td>
                                                        </tr>
                                                    );
                                                })

                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Box>
                            :
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                <Text ligth>Não foi possível encontrar matérias cadastradas.</Text>
                            </Box>
                    )}
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => setShowBox({ ...showBox, frequency: !showBox?.frequency })}
                    >
                        <Text bold>Frequência/Presença:</Text>
                        <Box
                            sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showBox?.frequency ? 'rotate(0)' : 'rotate(-90deg)',
                                transition: '.3s',
                                width: 17,
                                height: 17
                            }}
                        />
                    </Box>
                    {showBox?.frequency &&
                        <>
                            {frequencyData?.length > 0 ?
                                <Box sx={{ display: 'flex' }}>

                                    <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', }}>
                                        <table style={{ borderCollapse: 'collapse', }}>
                                            <thead>
                                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Matéria/Disciplina</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Presenças</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Ausências</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Freqência</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Qnt Aulas</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ flex: 1 }}>
                                                {
                                                    frequencyData?.map((item, index) => {
                                                        const qntClass = (item?.quantidade_de_presencas + item?.quantidade_de_ausencias)
                                                        return (
                                                            <tr key={`${item}-${index}`}>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.nome_disciplina}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.quantidade_de_presencas}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.quantidade_de_ausencias}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.frequencia_percentual_do_aluno}%
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {qntClass}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })

                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </Box>
                                :
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                    <Text ligth>Não foi encontrado frequências lançadas.</Text>
                                </Box>
                            }
                        </>
                    }
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => setShowBox({ ...showBox, grades: !showBox?.grades })}
                    >
                        <Text bold>Notas:</Text>
                        <Box
                            sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showBox?.grades ? 'rotate(0)' : 'rotate(-90deg)',
                                transition: '.3s',
                                width: 17,
                                height: 17
                            }}
                        />
                    </Box>
                    {showBox?.grades && (
                        gradesData?.length > 0 ?
                            <Box sx={{ display: 'flex', flex: 1, gap: 3, marginTop: '10px', }}>

                                <div style={{ borderRadius: '8px', overflow: 'hidden', }}>
                                    <table style={{ borderCollapse: 'collapse', }}>
                                        <thead>
                                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Matéria/Disciplina</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Realizou a avaliação?</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Avaliação Semestral</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Substitutiva</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Exame</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nota Final</th>
                                                <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Resultado</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>

                                            </tr>
                                        </thead>
                                        <tbody style={{ flex: 1 }}>
                                            {
                                                gradesData?.map((item, index) => {
                                                    const avaliationStatus = item?.avaliacao_status === 1 ? 'Sim' : 'Não'
                                                    const statusGrade = getStatusGrade(item)
                                                    const formattedGrade = (grade) => grade ? parseFloat(grade).toFixed(1) : '-'
                                                    const colorStatus = (statusGrade === 'Aprovado' && 'green') || (statusGrade === 'Reprovado' && 'red') || (statusGrade === 'Pendente' && 'gray');

                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nome_disciplina}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {avaliationStatus}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {formattedGrade(item?.nt_avaliacao_sem)}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {formattedGrade(item?.nt_substitutiva)}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {formattedGrade(item?.nt_exame)}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {formattedGrade(item?.nt_final)}
                                                            </td>

                                                            <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        height: 30,
                                                                        backgroundColor: colorPalette.primary,
                                                                        width: 100,
                                                                        alignItems: 'center',
                                                                        borderRadius: 2,
                                                                        justifyContent: 'start',

                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', backgroundColor: colorStatus, padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                                    <Text small bold style={{ textAlign: 'center', flex: 1 }}>{statusGrade}</Text>
                                                                </Box>
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.obs_nt || '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })

                                            }
                                        </tbody>
                                    </table>
                                </div>
                                <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'center', width: '130px', borderRadius: 2, padding: '4px 4px' }}>
                                        <Box sx={{
                                            backgroundColor: (statusGradeFinally === 'Pendente' && 'gray') ||
                                                (statusGradeFinally === 'Reprovado' && 'red') || (statusGradeFinally === 'Aprovado' && 'green')
                                            , borderRadius: 2, width: '100%', height: 25, transition: 'background-color 1s', alignItems: 'center', justifyContent: 'center', display: 'flex'
                                        }}>
                                            <Text xsmall bold style={{ color: "#fff", }}>{statusGradeFinally}</Text>
                                        </Box>
                                        <Text bold small>Status geral</Text>
                                    </Box>
                                    {(statusGradeFinally === 'Aprovado' && calculationEndEnrollment()) && <Button text="rematrícular" />}
                                </Box>
                            </Box>
                            :
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                <Text ligth>Não foi encontrado notas lançadas.</Text>
                            </Box>
                    )}
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => setShowBox({ ...showBox, additionalActivities: !showBox?.additionalActivities })}
                    >
                        <Text bold>Atividades Complementares:</Text>
                        <Box
                            sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showBox?.additionalActivities ? 'rotate(0)' : 'rotate(-90deg)',
                                transition: '.3s',
                                width: 17,
                                height: 17
                            }}
                        />
                    </Box>
                    {showBox?.additionalActivities && (

                        <>
                            {loadingActivities &&
                                <ContentContainer>
                                    <CircularProgress />
                                    <Text bold>Buscando atividades...</Text>
                                </ContentContainer>
                            }
                            {activityList?.length > 0 ?
                                <Box sx={{ display: 'flex', gap: 3, marginTop: '10px', flexDirection: 'column' }}>
                                    <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                        <table style={{ borderCollapse: 'collapse', }}>
                                            <thead>
                                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Atividade</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Título</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Qnt Horas</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Envio</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Módulo</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Arquivos</th>
                                                    <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Situação</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Comentários</th>
                                                    <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Ações</th>

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    activityList?.map((item, index) => {
                                                        const avaliationStatus = item?.aprovado === 1
                                                        const status = item?.aprovado === null && 'Aguardando Aprovação'
                                                            || parseInt(item?.aprovado) === 1 && 'Aprovado' || parseInt(item?.aprovado) === 0 && 'Reprovado'

                                                        return (
                                                            <tr key={`${item}-${index}`}>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.atividade || item?.tipo_atv || '-'}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.titulo || '-'}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.carga_hr || '-'}h
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {formatTimeStamp(item?.dt_criacao, true) || '-'}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.modulo_semestre || '-'}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.arquivos?.length > 0 ? <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                        <Button small text="abrir" style={{ padding: '6px 5px', borderRadius: 2, width: 80 }}
                                                                            onClick={() => setShowFiles({ active: true, item: item?.arquivos })} />
                                                                    </Box>
                                                                        :
                                                                        "-"}
                                                                </td>

                                                                <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    <Box
                                                                        sx={{
                                                                            display: 'flex',
                                                                            height: 30,
                                                                            backgroundColor: colorPalette.primary,
                                                                            width: 100,
                                                                            alignItems: 'center',
                                                                            borderRadius: 2,
                                                                            justifyContent: 'start',

                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', backgroundColor: statusColor(status), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                                        <Text small bold style={{ textAlign: 'center', flex: 1 }}>{status}</Text>
                                                                    </Box>
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {item?.comentario ? <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                        <Button small text="vizualizar" style={{ padding: '6px 5px', borderRadius: 2, width: 120 }}
                                                                            onClick={() => setShowComentaryReprovved({ active: true, item: item, commentary: '', onlyRead: true })} />
                                                                    </Box>
                                                                        : '-'}
                                                                </td>
                                                                <td style={{ fontSize: '13px', padding: '8px 10px', border: '1px solid lightgray' }}>
                                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                        <Box sx={{
                                                                            display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                                            border: `1px solid green`,
                                                                            transition: '.3s',
                                                                            backgroundColor: item?.aprovado === 1 ? 'green' : 'trasnparent', borderRadius: 2,
                                                                            "&:hover": {
                                                                                opacity: 0.8,
                                                                                cursor: 'pointer',
                                                                                transform: 'scale(1.03, 1.03)'
                                                                            },
                                                                        }} onClick={() => {
                                                                            if (item?.aprovado !== 1) {
                                                                                handleUpdateAprovvedActivity({
                                                                                    activityId: item?.id_ativ_complementar,
                                                                                    aprovved: 1,
                                                                                    commentary: null
                                                                                })
                                                                            }
                                                                        }}>
                                                                            {item?.aprovado !== 1 && <CheckCircleIcon style={{ color: 'green', fontSize: 13 }} />}
                                                                            <Text bold style={{ color: item?.aprovado === 1 ? '#fff' : 'green' }}>{
                                                                                item?.aprovado === 1 ? "Aprovado" : "Aprovar"
                                                                            }</Text>
                                                                        </Box>
                                                                        <Box sx={{
                                                                            display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                                            border: `1px solid red`,
                                                                            backgroundColor: item?.aprovado === 0 ? 'red' : 'trasnparent', borderRadius: 2,
                                                                            transition: '.3s',
                                                                            "&:hover": {
                                                                                opacity: 0.8,
                                                                                cursor: 'pointer',
                                                                                transform: 'scale(1.03, 1.03)'
                                                                            },
                                                                        }} onClick={() => {
                                                                            if (parseInt(item?.aprovado) !== 0) {
                                                                                setShowComentaryReprovved({ active: true, item: item, commentary: '', onlyRead: false })
                                                                            }
                                                                        }}>
                                                                            {item?.aprovado !== 0 && <CancelIcon style={{ color: 'red', fontSize: 13 }} />}
                                                                            <Text bold style={{ color: item?.aprovado === 0 ? '#fff' : 'red' }}>{
                                                                                item?.aprovado === 0 ? "Reprovado" : "Reprovar"
                                                                            }</Text>
                                                                        </Box>
                                                                    </Box>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })

                                                }
                                            </tbody>
                                        </table>
                                    </div>

                                    <Box sx={{
                                        display: 'flex', width: '100%', padding: '10px 30px', gap: 2, backgroundColor: colorPalette?.secondary,
                                        justifyContent: 'space-between'
                                    }}>

                                        <Box sx={{
                                            display: 'flex', gap: .5, flexDirection: 'column', alignItems: 'center', borderBottom: `1px solid ${colorPalette?.buttonColor}`,
                                            justifyContent: 'center'
                                        }}>
                                            <Text light large>Total de Horas aprovadas:</Text>
                                            <Text bold large>{totalHoursApproved} Horas</Text>
                                        </Box>
                                    </Box>
                                </Box>
                                :
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                    <Text ligth>O aluno não possui atividades complementares.</Text>
                                </Box>
                            }
                        </>
                    )
                    }
                </Box>

                <Divider />

            </ContentContainer>

            <Backdrop open={showFiles?.active}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 3, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                        <Text bold title>Arquivos Anexados</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 15,
                            height: 15,
                            aspectRatio: '1:1',
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 9999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowFiles({ active: false, item: [] })} />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row', marginTop: 3, maxWidth: 500, flexWrap: 'wrap' }}>
                        {showFiles?.item?.map((item, index) => {
                            const nameFile = item?.name_file || item?.name;
                            const typePdf = item?.name_file?.includes('pdf') || null;
                            const fileUrl = item?.location || item?.preview || '';
                            return (
                                <Link key={index} href={fileUrl} target="_blank">
                                    <Box sx={{ display: 'flex', gap: 1, backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} >
                                        <Box sx={{ display: 'flex', gap: 1, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                            <Text small>{decodeURI(nameFile)}</Text>
                                        </Box>
                                        <Box
                                            sx={{
                                                backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : fileUrl}')`,
                                                backgroundSize: 'cover',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center center',
                                                width: { xs: 200, sm: 350, md: 350, lg: 180, xl: 180 },
                                                aspectRatio: '1/1',
                                            }} />
                                    </Box>
                                </Link>
                            )
                        })}
                    </Box>
                </ContentContainer>
            </Backdrop>



            <Backdrop open={showComentaryReprovved?.active}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 3, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                        <Text bold large>Motivo da Reprovação</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 15,
                            height: 15,
                            aspectRatio: '1:1',
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 9999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowComentaryReprovved({ active: false, item: [], commentary: '', onlyRead: false })} />
                    </Box>
                    <Divider />

                    {showComentaryReprovved?.onlyRead &&
                        <Box sx={{
                            display: 'flex', gap: 1.5, alignItems: 'center',
                            padding: '5px 8px',
                            border: `1px solid red`,
                            backgroundColor: 'trasnparent',
                            borderRadius: 2
                        }}>
                            <CancelIcon style={{ color: 'red', fontSize: 13 }} />
                            <Text bold style={{ color: 'red' }}>Reprovado</Text>
                        </Box>
                    }
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', marginTop: 3, maxWidth: 500 }}>
                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                            <Text bold>Atividade:</Text>
                            <Text light>{showComentaryReprovved?.item?.atividade}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                            <Text bold>Título:</Text>
                            <Text light>{showComentaryReprovved?.item?.titulo}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                            <Text bold>Horas:</Text>
                            <Text light>{showComentaryReprovved?.item?.carga_hr}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                            <Text bold>Data do envio:</Text>
                            <Text light>{formatTimeStamp(showComentaryReprovved?.item?.dt_criacao, true)}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Motivo/Comentário:</Text>
                            {showComentaryReprovved?.onlyRead ?
                                <Text light>{showComentaryReprovved?.item?.comentario}</Text>
                                :
                                <TextInput
                                    placeholder='Escreva o motivo da reprovação'
                                    name='comentario'
                                    onChange={(e) => setShowComentaryReprovved({ ...showComentaryReprovved, commentary: e.target.value })}
                                    value={showComentaryReprovved?.commentary || ''}
                                    multiline
                                    maxRows={8}
                                    rows={4}
                                    sx={{}} />
                            }
                        </Box>
                    </Box>
                    {!showComentaryReprovved?.onlyRead &&
                        <>
                            <Divider />
                            <Box sx={{ display: 'flex', width: '100%', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Button small text="Enviar" onClick={() => {
                                    if (showComentaryReprovved?.commentary === '') {
                                        alert.info('Preencha o campo de comentário/motivo antes de reprovar.')
                                    } else {
                                        handleUpdateAprovvedActivity({ activityId: showComentaryReprovved?.item?.id_ativ_complementar, aprovved: 0, commentary: showComentaryReprovved?.commentary })
                                    }
                                }} />
                                <Button secondary small text="Cancelar" onClick={() => setShowComentaryReprovved({ active: false, item: [], commentary: '' })} />
                            </Box>
                        </>
                    }
                </ContentContainer>
            </Backdrop>
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
    },
    disciplinesText: {

        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        },
    }
}