import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { formatDate } from "../../../helpers"

export default function StudentData(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const [studentData, setStudentData] = useState({})
    const [showEnrollTable, setShowEnrollTable] = useState({})
    const [frequencyData, setFrequency] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [bgPhoto, setBgPhoto] = useState({})

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
        setLoading(true)
        try {
            const response = await api.get(`/photo/${id}`)
            const { data } = response
            setBgPhoto(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getEnrollment = async () => {
        try {
            const response = await api.get(`/enrollment/${id}`)
            const { data } = response
            let [enrollment] = data
            return enrollment
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getFrequency = async () => {
        try {
            const response = await api.get(`/frequency/student/${id}`)
            const { data } = response
            console.log(data)
            setFrequency(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function handleSelectModule(turma_id) {
        setLoading(true)
        try {
            const response = await api.get(`/classSchedule/disciplines/${turma_id}/1`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina.toString()
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        handleItems();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getStudent()
            await getPhoto()
            const enrollment = await getEnrollment()
            if (enrollment) {
                await handleSelectModule(enrollment?.turma_id)
            }
            await getFrequency()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
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
                // perfil={studentData?.modalidade_curso}
                title={studentData?.nome}
            // saveButton
            // saveButtonAction={handleEdit}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Acadêmico Aluno</Text>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'space-between'}}>
                    <Box sx={{display: 'flex', gap: 2.5, flexDirection: 'column', flex: 1, marginTop: 2}}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Nome: </Text>
                            <Text>{studentData?.nome}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Registro (RA): </Text>
                            <Text>{studentData?.id}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>E-mail: </Text>
                            <Text>{studentData?.email}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Status: </Text>
                            <Text>{studentData?.ativo === 1 ? 'Ativo' : 'Inativo'}</Text>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex'}}>
                        <Avatar src={bgPhoto?.location} sx={{
                            height: 'auto',
                            borderRadius: '16px',
                            width: { xs: '100%', sm: 150, md: 150, lg: 180 },
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
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            {disciplines?.map((item, index) => {
                                return (
                                    <Box key={index}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'start' }}>
                                            <Text bold>{index + 1}º </Text>
                                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>{item?.label}</Text>
                                        </Box>
                                    </Box>
                                )
                            })}

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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Artes e Design</Text>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Desenho</Text>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Arte 3D</Text>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Textura e Render 1</Text>
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
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Artes e Design</Text>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Desenho</Text>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Arte 3D</Text>
                            <Text bold sx={{ ...styles.disciplinesText, color: colorPalette.buttonColor }}>Textura e Render 1</Text>
                        </Box>
                    )}
                </Box>

                <Divider />

            </ContentContainer>
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
                <Button text={'Salvar'} style={{ width: 150, height: 40 }} onClick={() => { handleEdit() }} />
            </Box>
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