import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { formatDate, formatTimeStamp } from "../../../helpers"

export default function StudentData(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const [studentData, setStudentData] = useState({})
    const [showEnrollTable, setShowEnrollTable] = useState({})
    const [showClass, setShowClass] = useState({ turma_id: null, nome_turma: null })
    const [frequencyData, setFrequency] = useState([])
    const [gradesData, setGrades] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [enrollmentData, setEnrollment] = useState([])
    const [moduleStudent, setModuleStudent] = useState(1)
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
            const { response } = userResponse.data
            setStudentData(response)
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

            setShowClass({
                turma_id: enrollment?.turma_id,
                nome_turma: enrollment?.nome_turma
            });

            return enrollment;
        } catch (error) {
            console.log(error);
            return error;
        }
    };


    const getFrequency = async (turma_id) => {
        try {
            const response = await api.get(`/frequency/student/${id}/${turma_id}`)
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

        handleItems();

        return () => {
            // Evitar chamada desnecessária se o valor não mudou
            if (previousTurmaId !== showClass?.turma_id) {
                handleItems();
            }
        };
    }, [showClass?.turma_id]);


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
            await getFrequency(showClass?.turma_id)
            await getGrades(moduleStudent, showClass?.turma_id)
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
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

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.post(``)
                if (response?.status === 201) {
                    alert.success('Disciplina atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } finally {
                setLoading(false)
            }
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

    return (
        <>
            <SectionHeader
                perfil={'dados da faculdade'}
                title={studentData?.nome}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Acadêmico Aluno</Text>
                    <Box sx={{ display: 'flex' }}>
                        {enrollmentData?.length > 0 &&
                            enrollmentData?.map((item, index) => (
                                <Box sx={{ display: 'flex' }} key={index}>
                                    <Button small secondary={item?.turma_id === showClass?.turma_id ? false : true} text={item?.nome_turma} onClick={() => setShowClass({
                                        turma_id: item?.turma_id,
                                        nome_turma: item?.nome_turma
                                    })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                                </Box>
                            ))}
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
                            <Text>{enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id)?.map(item => item?.modulo) || '1'}º Modulo/Semestre</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'start' }}>
                            <Text bold>Inicio Matricula: </Text>
                            <Text>{formatTimeStamp(enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id)?.map(item => item?.dt_inicio_cronograma || item?.dt_inicio) || '')}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Status: </Text>
                            <Text>{enrollmentData?.filter(item => item?.turma_id === showClass?.turma_id)?.map(item => item?.status)}</Text>
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

                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, }}>
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
                        <Text bold>Frequencia/Presença:</Text>
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
                    {showBox?.frequency && (
                        frequencyData?.length > 0 ?
                            <Box sx={{ display: 'flex' }}>

                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, }}>
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

                                <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colorPalette.textColor}`, }}>
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
                                                                {item?.nt_avaliacao_sem || '-'}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nt_substitutiva || '-'}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nt_exame || '-'}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.nt_final || '-'}
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
                                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'center', width: '130px', border: `1px solid ${colorPalette.textColor}`, borderRadius: 2, padding: '4px 4px' }}>
                                        <Box sx={{
                                            backgroundColor: (statusGradeFinally === 'Pendente' && 'gray') ||
                                                (statusGradeFinally === 'Reprovado' && 'red') || (statusGradeFinally === 'Aprovado' && 'green')
                                            , borderRadius: 2, width: '100%', height: 25, transition: 'background-color 1s', alignItems: 'center', justifyContent: 'center', display: 'flex'
                                        }}>
                                            <Text xsmall bold style={{ color: "#fff", }}>{statusGradeFinally}</Text>
                                        </Box>
                                        <Text bold small>Status geral</Text>
                                    </Box>
                                    {statusGradeFinally === 'Aprovado' && <Button text="rematrícular" />}
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                            <Text ligth>O aluno não possui atividades complementares.</Text>
                        </Box>
                    )}
                </Box>

                <Divider />

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
    },
    disciplinesText: {

        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        },
    }
}