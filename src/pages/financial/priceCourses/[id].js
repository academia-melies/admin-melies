import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditPricesCourse(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newPrice = id === 'new';
    const [pricesCourseData, setPricesCourseData] = useState({
        total_parcelas: '6',
        valor_total_curso: null,
        valor_parcelado_curso: null,
        valor_avista_curso: null,
        ativo: 1
    })
    const [courses, setCourses] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getPricesCourse = async () => {
        try {
            const response = await api.get(`/coursePrices/${id}`)
            const { data } = response
            setPricesCourseData({
                ...data,
                valor_total_curso: data.valor_total_curso.toFixed(2),
                valor_parcelado_curso: data.valor_parcelado_curso.toFixed(2),
                valor_avista_curso: data.valor_avista_curso.toFixed(2),
            })
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        (async () => {
            if (newPrice) {
                return
            }
            await handleItems();

        })();
    }, [id])

    useEffect(() => {
        listCourses()
    }, [])

    function calculationValues(pricesCourseData) {
        setLoading(true)
        setTimeout(() => {
            try {
                const valueTotal = pricesCourseData?.valor_total_curso;
                const valueParcels = (valueTotal / pricesCourseData?.total_parcelas).toFixed(2);
                const valueDiscount = (valueTotal - (valueTotal * 0.05)).toFixed(2)
                const formattedParcels = formattedValueCourse(valueParcels);
                const formattedDiscount = formattedValueCourse(valueDiscount);

                setPricesCourseData((prevValues) => ({
                    ...prevValues,
                    valor_parcelado_curso: formattedParcels,
                    valor_avista_curso: formattedDiscount
                }));
            } catch (error) {
                alert.error('Ocorreu um erro ao calcular os valores.')
                return error
            } finally {
                setLoading(false)
            }
        }, 500);
    }

    const formattedValueCourse = (value) => {
        const rawValue = String(value);
        const valueParts = rawValue.split('.');

        let intValue = valueParts[0] || '0';
        const decimalValue = valueParts[1] || '00';

        const formattedValue = `${intValue}.${decimalValue.padEnd(2, '0')}`;
        return formattedValue;
    };

    const handleItems = async () => {
        setLoading(true)
        try {
            await getPricesCourse()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Taxa')
        } finally {
            setLoading(false)
        }
    }

    async function listCourses() {
        try {
            const response = await api.get(`/courses`)
            const { data } = response
            const groupCourses = data.map(course => ({
                label: course.nome_curso,
                value: course?.id_curso,
                modal: course.modalidade_curso,
                nivel: course.nivel_curso
            }));

            setCourses(groupCourses);
        } catch (error) {
            return error
        }
    }

    const handleChange = (event) => {

        if (event.target.name === 'valor_total_curso' || event.target.name === 'valor_parcelado_curso' || event.target.name === 'valor_avista_curso') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || 0; // Parte inteira
                const decimalValue = rawValue.slice(-2); // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${intValue}.${decimalValue}`;
                event.target.value = formattedValue;
            }

            setPricesCourseData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }


        setPricesCourseData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!pricesCourseData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreatePrices = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/coursePrices/create`, { pricesCourseData, userId });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Taxa cadastrada com sucesso.');
                    router.push(`/financial/priceCourses/${data?.prices}`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar taxa.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeletePrices = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/coursePrices/delete/${id}`);
            if (response?.status == 201) {
                alert.success('Taxa excluída.');
                router.push(`/financial/priceCourses/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Taxa.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditPrices = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/coursePrices/update/${id}`, { pricesCourseData })
                if (response?.status === 201) {
                    alert.success('Taxa atualizada com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Taxa.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Taxa.');
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

    const getmodal = (courses.filter(item => item.value === pricesCourseData?.curso_id).map(item => item.modal))
    const getNivel = (courses.filter(item => item.value === pricesCourseData?.curso_id).map(item => item.nivel))
    const getPerfil = pricesCourseData?.curso_id ? `${getmodal} - ${getNivel}` : ''


    return (
        <>
            <SectionHeader
                perfil={getPerfil}
                title={(courses.filter(item => item.value === pricesCourseData?.curso_id).map(item => item.label)) || `Nova Taxa`}
                saveButton
                saveButtonAction={newPrice ? handleCreatePrices : handleEditPrices}
                deleteButton={!newPrice}
                deleteButtonAction={() => handleDeletePrices()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Valores do Curso</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={courses} valueSelection={pricesCourseData?.curso_id} onSelect={(value) => setPricesCourseData({ ...pricesCourseData, curso_id: value })}
                        title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput
                        placeholder='0.00'
                        name='valor_total_curso'
                        type="coin"
                        onChange={handleChange}
                        value={(pricesCourseData?.valor_total_curso) || ''}
                        label='Valor Total' sx={{ flex: 1, }}
                    // onBlur={() => calculationValues(pricesCourseData)}
                    />
                    <TextInput placeholder='Parcelas' name='total_parcelas' onChange={handleChange} value={pricesCourseData?.total_parcelas || ''} label='Parcelas' sx={{ flex: 1, }} type="number" />
                    <Button text="calcular" onClick={() => calculationValues(pricesCourseData)} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput
                        placeholder='0.00'
                        name='valor_parcelado_curso'
                        type="coin"
                        onChange={handleChange}
                        value={(pricesCourseData?.valor_parcelado_curso) || ''}
                        label='Valor das parcelas' sx={{ flex: 1, }}
                    />
                    <TextInput
                        placeholder='0.00'
                        name='valor_avista_curso'
                        type="coin"
                        onChange={handleChange}
                        value={(pricesCourseData?.valor_avista_curso) || ''}
                        label='Valor á vista' sx={{ flex: 1, }}
                    />
                </Box>

                <RadioItem valueRadio={pricesCourseData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setPricesCourseData({ ...pricesCourseData, ativo: parseInt(value) })} />
            </ContentContainer>
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