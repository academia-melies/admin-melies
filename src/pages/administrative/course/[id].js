import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createCourse, deleteCourse, editCourse} from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditCourse(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id, slug } = router.query;
    const newCourse = id === 'new';
    const [courseData, setCourseData] = useState({})
    const [showPaidIn, setShowPaidIn] = useState(false)
    const [amountPaidIn, setAmountPaidIn] = useState()
    const [installments, setInstallments] = useState()
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getCourse = async () => {
        try {
            const response = await api.get(`/course/${id}`)
            const { data } = response
            let value = formatarParaReal(data?.valor || '')
            setCourseData({ ...data, valor: value })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newCourse) {
                return
            }
            await handleItems();
        })();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getCourse()
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

    useEffect(() => {
        let replaceValue = courseData?.valor?.replace("R$", "").replace(/\./g, "");
        let dataValueReplaced = replaceValue?.replace(",", ".");
        let valueCourse = parseFloat(dataValueReplaced);

        let calcAmountPaidIn = valueCourse / installments;
        if (calcAmountPaidIn) {
            setAmountPaidIn(calcAmountPaidIn)
        }
    }, [showPaidIn, installments])

    const handleCreateCourse = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createCourse(courseData);
                const { data } = response
                console.group(data)
                if (response?.status === 201) {
                    alert.success('Curso cadastrado com sucesso.');
                    router.push(`/administrative/course/${data?.course}`)
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
        { label: '7x', value: 7 },
        { label: '8x', value: 8 },
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


    return (
        <>
            <SectionHeader
                perfil={courseData?.modalidade_curso}
                title={courseData?.nome_curso || `Novo Curso`}
                saveButton
                saveButtonAction={newCourse ? handleCreateCourse : handleEditCourse}
                deleteButton={!newCourse}
                deleteButtonAction={() => handleDeleteCourse()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Curso</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_curso' onChange={handleChange} value={courseData?.nome_curso || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='TPA ...' name='sigla' onChange={handleChange} value={courseData?.sigla || ''} label='Sigla' sx={{ flex: 1, }} />
                    {/* <TextInput placeholder='Duração' name='duracao' onChange={handleChange} value={courseData?.duracao || ''} label='Duração' sx={{ flex: 1, }} /> */}

                    <SelectList fullWidth data={groupDuration} valueSelection={courseData?.duracao} onSelect={(value) => setCourseData({ ...courseData, duracao: value })}
                        title="Duração" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <RadioItem valueRadio={courseData?.modalidade_curso} group={groupModal} title="Modalidade" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, modalidade_curso: value })} sx={{ flex: 1, }} />
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Portaria MEC/Autorização' name='pt_autorizacao' onChange={handleChange} value={courseData?.pt_autorizacao || ''} label='Portaria MEC/Autorização' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data' name='dt_autorizacao' onChange={handleChange} value={(courseData?.dt_autorizacao)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                    <TextInput placeholder='Portaria MEC/Reconhecimento' name='pt_reconhecimento' onChange={handleChange} value={courseData?.pt_reconhecimento || ''} label='Portaria MEC/Reconhecimento' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data' name='dt_reconhecimento' onChange={handleChange} value={(courseData?.dt_reconhecimento)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={{ ...styles.inputSection, alignItems: 'start' }}>
                    <Box sx={{ display: 'flex', position: 'absolute', zIndex: 999, marginRight: 12, marginTop: 1, gap: 1 }}>
                        <Button small text='parcelas' style={{ padding: '5px 12px 5px 12px' }} onClick={() => setShowPaidIn(true)} />
                    </Box>
                    <TextInput placeholder='Valor'
                        name='valor'
                        onChange={handleChange}
                        value={courseData?.valor || ''}
                        label='Valor' sx={{ flex: 1, }}
                        onBlur={handleBlurValue}
                    />

                    {<Backdrop open={showPaidIn} sx={{zIndex: 999}}>
                        <ContentContainer style={{marginLeft: { md: '180px', lg: '280px' }, zIndex: 9999}}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text bold large> Parcelas</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => setShowPaidIn(false)} />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, zIndex: 99999 }}>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, zIndex: 99999 }}>
                                    <Text bold small>Parcelado em até:</Text>
                                    <SelectList fullWidth data={groupInstallments} valueSelection={installments} onSelect={(value) => setInstallments(value)}
                                        filterOpition="value" sx={{ color: colorPalette.textColor, height: '30px', width: '95px' }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold',  }}
                                        minWidth={0}
                                    />
                                </Box>
                                <Text bold large style={{ textAlign: 'start' }}>{amountPaidIn ? formatter.format(amountPaidIn) : '0,00'}</Text>
                            </Box>
                        </ContentContainer>
                    </Backdrop>
                    }
                    <TextInput placeholder='Carga horária' name='carga_hr_curso' onChange={handleChange} value={courseData?.carga_hr_curso || ''} label='Carga horária' sx={{ flex: 1, }} />

                </Box>
                <RadioItem valueRadio={courseData?.nivel_curso} group={groupNivel} title="Nível do curso" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, nivel_curso: value })} sx={{ flex: 1, }} />
                <RadioItem valueRadio={courseData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, ativo: parseInt(value) })} />

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