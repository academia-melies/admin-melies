import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../../organisms"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { api } from "../../../../api/api"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { icons } from "../../../../organisms/layout/Colors"

export default function RequerimentEnrollment(props) {
    const { setLoading, alert, colorPalette, user, theme, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { userId = false, classId = false, moduleEnrollment = false, courseId = false } = router.query;
    const [disciplines, setDisciplines] = useState([])
    const [userData, setUserData] = useState({})
    const [dispensedDp, setDispensedDp] = useState(0)
    const [classData, setClassData] = useState({})
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showSoftwares, setShowSoftwares] = useState({ active: false, disciplineId: null, items: [] })
    const [disciplinesSelected, setDisciplinesSelected] = useState()
    const [courseData, setCourseData] = useState({})

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
            const response = await api.get(`/class/${classId}`)
            const { data } = response
            setClassData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getUserData = async () => {
        try {
            const user = await api.get(`/user/${userId}`)
            const { response } = user?.data
            setUserData(response)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleCourseData = async () => {
        try {
            const response = await api.get(`/course/${courseId}`)
            setCourseData(response?.data)
        } catch (error) {
            return error
        }
    }


    useEffect(() => {
        handleItems();
    }, [])

    async function listDisciplines() {
        setLoading(true)
        try {
            const response = await api.get(`/class/disciplines/${classId}/${moduleEnrollment}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina.toString(),
                descricao_dp: disciplines?.descricao,
                softwares: disciplines?.softwares
            }));

            const disciplinesSelect = groupDisciplines.map(discipline => discipline.value);
            const flattenedDisciplinesSelected = disciplinesSelect.join(', ');
            setDisciplinesSelected(flattenedDisciplinesSelected)
            setDisciplines(groupDisciplines);

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        fetchPermissions()
    }, [])

    const handleItems = async () => {
        setLoading(true)
        try {
            await listDisciplines()
            await getClass()
            await getUserData()
            await handleCourseData()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Dados')
        } finally {
            setLoading(false)
        }
    }


    const handleToggleSelection = (value) => {
        const updatedSelectedDisciplines = [...disciplinesSelected];
        const selectedIndex = updatedSelectedDisciplines.indexOf(value);
        if (selectedIndex === -1) {
            updatedSelectedDisciplines.push(value);
        } else {
            updatedSelectedDisciplines.splice(selectedIndex, 1);
        }
        setDisciplinesSelected(updatedSelectedDisciplines);
    };


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const currentDate = new Date();
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };

    const formattedDate = new Intl.DateTimeFormat("pt-BR", options).format(currentDate);


    return (
        <>
            {(!userId || !classId || !moduleEnrollment) ?
                <Box>
                    <Text light>
                        Não Foi possivel encontrar o aluno e Turma desejada. Refaça a pesquisa novamente.
                    </Text>
                </Box> :
                <>

                    <SectionHeader
                        title={`Tela de Requerimento`}
                    />

                    <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                        <Text bold large>
                            Requerimento de Matrícula
                        </Text>
                        <Box sx={styles.paragraph}>
                            <Text> Eu,</Text>
                            <Text style={styles.textData}>{userData?.nome},</Text>
                            <Text> portador do RG nº </Text>
                            <Text style={styles.textData}>{userData?.rg}</Text>
                            <Text> e CPF nº </Text>
                            <Text style={styles.textData}>{userData?.cpf},</Text>
                            <Text> por meio deste, venho requerer matrícula no Curso </Text>
                            <Text style={styles.textData}>{courseData?.nome_curso || '______'},</Text>
                            <Text> modalidade {courseData?.modalidade_curso || '______'}.</Text>
                        </Box>

                        <Text> Declaro tambem estar totalmente de acordo com as condições gerais de matrícula constantes do Contrato de
                            Prestação de Serviços Educacionais e, para formalizar este ato, entrego os documentos exigidos conforme Edital.
                        </Text>
                        <Text> Caso deixe de apresentar algum documento, estou ciente que devo faze-lo até 30 (trinta) dias do inicio do semestre letivo,
                            pois a não entrega deste(s) documentos acarretará na suspensão do deferimento de matrícula e de todos os atos acadêmicos por razão administrativa
                            ou pedagógica.
                        </Text>
                        <Text> Nestes termos, peço deferimento. </Text>
                        <Text bold>São Paulo, {formattedDate}</Text>
                    </ContentContainer>

                    <RadioItem
                        disabled={!isPermissionEdit && true}
                        valueRadio={dispensedDp}
                        group={[
                            {
                                label: 'Sim', value: 1
                            },
                            {
                                label: 'Não', value: 0
                            }]}
                        title="Vai dispensar disciplina?"
                        horizontal={true}
                        onSelect={(value) => setDispensedDp(parseInt(value))} />

                    {dispensedDp === 1 &&
                        <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                            <ContentContainer fullWidth gap={4}>
                                <Box sx={{ display: 'flex', gap: 5, }}>
                                    <Text bold title>Disciplinas</Text>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                        <Text light>Cursar</Text>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <CancelIcon style={{ color: 'red', fontSize: 20 }} />
                                        <Text light>Dispensada</Text>
                                    </Box>
                                </Box>
                                <Text style={{ color: 'red' }}>Selecione as disciplinas que serão cursadas. Disciplinas que não forem selecionadas, serão consideradas para análise de dispensa.</Text>
                                <Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                        {disciplines.map((item, index) => {
                                            const selected = disciplinesSelected?.includes(item?.value)
                                            return (
                                                <Box key={index} sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: 16,
                                                                cursor: 'pointer',
                                                                transition: '.5s',
                                                                border: !selected ? `1px solid ${colorPalette.textColor}` : '',
                                                                '&:hover': {
                                                                    opacity: selected ? 0.8 : 0.6,
                                                                    boxShadow: selected ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                }
                                                            }}
                                                            onClick={() => handleToggleSelection(item.value)}
                                                        >
                                                            {selected ? (
                                                                <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                            ) : (
                                                                <CancelIcon style={{ color: 'red', fontSize: 20 }} />
                                                            )}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                            <Text bold>{item?.label}</Text>
                                                            <Text light small>{item?.descricao_dp}</Text>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ position: 'relative', }}>
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', gap: 1, "&:hover": {
                                                                opacity: 0.8,
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                            onClick={() => setShowSoftwares({ active: true, disciplineId: item?.value, items: item?.softwares })}>
                                                            <Text>Lista de Softwares</Text>
                                                            <Box sx={{
                                                                ...styles.menuIcon,
                                                                padding: '8px',
                                                                margin: '0px 5px',
                                                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                                                transform: (showSoftwares?.disciplineId === item?.value && showSoftwares?.active === true) ? 'rotate(180deg)' : '',
                                                                transition: '.3s',
                                                                width: 14, height: 14,
                                                                aspectRatio: '1/1',
                                                                "&:hover": {
                                                                    opacity: 0.8,
                                                                    cursor: 'pointer',
                                                                    backgroundColor: colorPalette.primary
                                                                }
                                                            }} />

                                                        </Box>
                                                        {(showSoftwares?.disciplineId === item?.value && showSoftwares?.active === true) &&
                                                            <Box sx={{
                                                                display: 'flex', gap: 1, backgroundColor: colorPalette.secondary, position: 'absolute', zIndex: 999,
                                                                zIndex: 99, padding: '10px 30px', top: 20, border: '1px solid lightgray', flexDirection: 'column'
                                                            }}>
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                                                    <Text bold>Lista de Softwares</Text>
                                                                    <Box sx={{
                                                                        ...styles.menuIcon,
                                                                        backgroundImage: `url(${icons.gray_close})`,
                                                                        transition: '.3s',
                                                                        width: 12, height: 12, aspectRatio: '1/1',
                                                                        borderRadius: 12,
                                                                        padding: '2px',
                                                                        "&:hover": {
                                                                            opacity: 0.8,
                                                                            cursor: 'pointer',
                                                                            backgroundColor: colorPalette.secondary
                                                                        }
                                                                    }} onClick={() => setShowSoftwares({ active: false, disciplineId: null, items: [] })} />
                                                                </Box>
                                                                {showSoftwares?.items?.length > 0 ?
                                                                    showSoftwares?.items?.map((soft, index) => {
                                                                        return (
                                                                            <Box key={index}>
                                                                                {soft?.map((list, index) => {
                                                                                    return (
                                                                                        <Box key={index} sx={{ display: 'flex', gap: .5, flexDirection: 'row' }}>
                                                                                            <Text>{list?.nome_software}</Text>
                                                                                            <Text>-</Text>
                                                                                            <Text>{list?.software_fornecedor}</Text>
                                                                                        </Box>
                                                                                    )
                                                                                })}
                                                                            </Box>
                                                                        )
                                                                    }) :
                                                                    <Text>A disciplina náo possuí softwares oferecidos</Text>
                                                                }
                                                            </Box>}
                                                    </Box>
                                                    <Divider distance={0} />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </ContentContainer>
                        </ContentContainer>
                    }
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button text="Enviar requerimento" />
                    </Box>
                </>
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
    textData: {
        color: 'red'
    },
    paragraph: {
        display: 'flex',
        gap: .5,
        alignItems: 'center'
    }
}