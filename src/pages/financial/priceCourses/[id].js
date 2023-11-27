import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { icons } from "../../../organisms/layout/Colors"
import { formatTimeStamp, formatValueReal } from "../../../helpers"
import { holidaysArray } from "../../../organisms/holidays/holidays"

export default function EditPricesCourse(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, theme } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newPrice = id === 'new';
    const [pricesCourseData, setPricesCourseData] = useState({
        n_parcelas: '6',
        valor_total_curso: null,
        valor_parcelado_curso: null,
        valor_avista_curso: null,
        ativo: 1
    })
    const [courses, setCourses] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [showHistoric, setShowHistoric] = useState(false)
    const [historicId, setHistoricId] = useState()
    const [arrayHistoricValuesCourse, setArrayHistoricValuesCourse] = useState([])
    const [classesList, setClassesList] = useState([])
    const [groupClasses, setGroupClasses] = useState([])
    const [historicEdit, setHistoricEdit] = useState({})
    const [readjustmentValue, setReadjustmentValue] = useState({})
    const [showClassesSelect, setShowClassesSelect] = useState(false)
    const [ajustmentAplicate, setAjustmentAplicate] = useState(false)
    const [ajustmentAplicateClass, setAjustmentAplicateClass] = useState(false)
    const [beforeValueCourse, setBeforeValueCourse] = useState()
    const [showClassTable, setShowClassTable] = useState({});
    const [classSelected, setClassSelected] = useState()
    const [showValueAdjustment, setShowValueAdjustment] = useState(false)
    const [showValueAdjustmentClass, setShowValueAdjustmentClass] = useState({});
    const [menuSelected, setMenuSelected] = useState('Curso')
    const [showHistoricClassId, setShowHistoricClassId] = useState()
    const [arrayHistoricValuesClass, setArrayHistoricValuesClass] = useState([])



    const toggleClassTable = (index) => {
        setShowClassTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const toggleClassAdjustment = (index) => {
        setShowValueAdjustmentClass(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const getPricesCourse = async () => {
        try {
            const response = await api.get(`/coursePrices/${id}`)
            const { data } = response

            let valueTotalCourse = Number(data?.valor_total_curso).toFixed(2);
            let valueParcelsCourse = Number(data?.valor_parcelado_curso).toFixed(2);
            let valueAvistaCourse = Number(data?.valor_avista_curso).toFixed(2);

            setPricesCourseData({
                ...data,
                valor_total_curso: formatValueReal(valueTotalCourse),
                valor_parcelado_curso: formatValueReal(valueParcelsCourse),
                valor_avista_curso: formatValueReal(valueAvistaCourse),
            })
            setBeforeValueCourse(data?.valor_total_curso.toFixed(2))
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getPricesClass = async () => {
        try {
            const response = await api.get(`/classesPrices/list/${id}`)
            const { data } = response

            console.log(data)

            if (data?.length > 0) {
                let formatValue = (value) => {
                    value = parseFloat(value).toFixed(2);
                    value = formatValueReal(value)
                    return value
                }

                const dataClassValues = data?.map(cls => (
                    {
                        ...cls,
                        valor_total: formatValue(cls?.valor_total),
                        valor_parcelado: formatValue(cls?.valor_parcelado),
                        valor_avista: formatValue(cls?.valor_avista),
                    }
                ))


                setClassesList(dataClassValues)
                return dataClassValues
            }

        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getClasses = async (courseId) => {
        try {
            const response = await api.get(`/coursePrices/classes/${courseId}`);
            const { data } = response;

            if (data) {

                const existingClasses = await getPricesClass();

                const dataClassValues = data?.map(cls => (
                    {
                        ...cls,
                        valor_curso_id: id,
                        curso_id: courseId,
                        n_parcelas: cls?.n_parcelas,
                        valor_total: cls?.valor_total,
                        valor_parcelado: cls?.valor_parcelado,
                        valor_avista: cls?.valor_avista,
                        ativo: 1,
                    }
                ));

                const groupClass = data.map(c => ({
                    label: c?.nome_turma,
                    value: c?.id_turma.toString()
                }));

                setGroupClasses(groupClass);

                if (existingClasses) {
                    const newClasses = dataClassValues.filter(cls => !existingClasses.some(existingCls => existingCls.id_turma === cls.id_turma));
                    setClassesList([...existingClasses, ...newClasses]);
                } else {
                    setClassesList(dataClassValues)
                }
            }
        } catch (error) {
            console.log(error);
            return error;
        }
    };


    const getHistoric = async () => {
        try {
            const response = await api.get(`/coursePrices/historic/${id}`)
            const { data } = response

            if (data) {
                const formattedValue = data.map(item => ({
                    ...item,
                    valor_total_curso: formatter.format(item.valor_total_curso),
                    valor_parcelado_curso: formatter.format(item.valor_parcelado_curso),
                    valor_avista_curso: formatter.format(item.valor_avista_curso),
                }));
                setArrayHistoricValuesCourse(formattedValue)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleHistoricValueClass = async (id) => {
        try {
            const response = await api.get(`'/classesPrices/historic/${id}`)
            const { data } = response

            if (data) {
                const formattedValue = data.map(item => ({
                    ...item,
                    valor_total: formatter.format(item.valor_total),
                    valor_parcelado: formatter.format(item.valor_parcelado),
                    valor_avista: formatter.format(item.valor_avista),
                }));
                setArrayHistoricValuesClass(formattedValue)
            }
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

    useEffect(() => {
        if (showHistoricClassId) {
            handleHistoricValueClass()
        }
    }, [showHistoricClassId])

    useEffect(() => {
        if (ajustmentAplicate) {
            handleEditPrices()
        }
    }, [ajustmentAplicate])

    // useEffect(() => {
    //     if (ajustmentAplicateClass) {
    //         handleEditPricesClass()
    //     }
    // }, [ajustmentAplicateClass])

    async function calculationValues({ porcent, remove, ajustmentAplicated }) {
        setLoading(true)
        try {
            let valueTotal = pricesCourseData?.valor_total_curso;
            let formattValue = valueTotal.replace(/\./g, '').replace(',', '.');
            valueTotal = parseFloat(formattValue)
            let alertMsg = ''
            if (remove) {
                valueTotal = beforeValueCourse;
                alertMsg = 'Reajuste removido.'
            }
            if (porcent) {
                alertMsg = 'Reajuste aplicado.'
                const discountPercentage = parseFloat(porcent);
                if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                    alert.error("Porcentagem de desconto inválida.");
                    return;
                }
                const discountValue = (valueTotal * (discountPercentage / 100)).toFixed(2);
                const updatedTotal = (parseFloat((valueTotal)) + parseFloat(discountValue)).toFixed(2);
                valueTotal = updatedTotal;

            }
            const valueParcels = (valueTotal / pricesCourseData?.n_parcelas).toFixed(2);
            const valueDiscount = (valueTotal - (valueTotal * 0.05)).toFixed(2)
            const formattedParcels = formatValueReal(valueParcels);
            const formattedDiscount = formatValueReal(valueDiscount);
            setPricesCourseData((prevValues) => ({
                ...prevValues,
                valor_total_curso: formatValueReal(valueTotal),
                valor_parcelado_curso: formattedParcels,
                valor_avista_curso: formattedDiscount
            }));
            if (alertMsg) alert.success(alertMsg)
            if (ajustmentAplicated) { setAjustmentAplicate(true) }
            return true
        } catch (error) {
            alert.error('Ocorreu um erro ao calcular os valores.')
            return error
        } finally {
            setLoading(false)
        }
    }

    async function calculationValuesClass({ porcent, remove, ajustmentAplicated, classId, index }) {
        setLoading(true)
        try {

            let [valueTotal] = classesList?.filter(item => item.id_turma === classId)?.map(item => item.valor_total);
            let [numberParcels] = classesList?.filter(item => item.id_turma === classId)?.map(item => item.n_parcelas);
            let formattValue = valueTotal.replace(/\./g, '').replace(',', '.');
            valueTotal = parseFloat(formattValue)
            let alertMsg = ''
            if (remove) {
                valueTotal = beforeValueCourse;
                alertMsg = 'Reajuste removido.'
            }
            if (porcent) {
                alertMsg = 'Reajuste aplicado.'
                const discountPercentage = parseFloat(porcent);
                if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                    alert.error("Porcentagem de desconto inválida.");
                    return;
                }
                const discountValue = (valueTotal * (discountPercentage / 100)).toFixed(2);
                const updatedTotal = (parseFloat((valueTotal)) + parseFloat(discountValue)).toFixed(2);
                valueTotal = updatedTotal;

            }
            const valueParcels = (valueTotal / numberParcels).toFixed(2);
            const valueDiscount = (valueTotal - (valueTotal * 0.05)).toFixed(2)
            const formattedParcels = formatValueReal(valueParcels);
            const formattedDiscount = formatValueReal(valueDiscount);
            let now = new Date()
            const nextDate = await calculateNextDate(now)

            setClassesList((prevValues) => {
                return prevValues?.map(classValue => {
                    if (classValue?.id_turma === classId) {
                        return {
                            ...classValue,
                            valor_total: formatValueReal(valueTotal),
                            valor_parcelado: formattedParcels,
                            valor_avista: formattedDiscount,
                            dt_prox_renovacao: nextDate
                        };
                    }
                    return classValue;
                })
            })

            if (alertMsg) alert.success(alertMsg)
            if (ajustmentAplicated) {
                setAjustmentAplicateClass(true)
                toggleClassAdjustment(index)
            }
            return true
        } catch (error) {
            alert.error('Ocorreu um erro ao calcular os valores.')
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const response = await getPricesCourse()
            if (response) {
                await getHistoric()
                await getClasses(response?.curso_id)
            }
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
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
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

    const handleChangeHistoric = (event) => {
        setHistoricEdit((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    }

    const handleChangeReadjustment = (event) => {

        if (event.target.name === 'reajuste') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                event.target.value = formattedValue;
            }

            setReadjustmentValue((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }
    }

    const handleChangeClasses = (classId, field, value) => {

        if (field === 'valor_total' || field === 'valor_parcelado' || field === 'valor_avista') {
            const rawValue = value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                value = formattedValue;

            }
        }

        setClassesList((prevValues) => {
            return prevValues?.map(classValue => {
                if (classValue?.id_turma === classId) {
                    return {
                        ...classValue,
                        [field]: value
                    };
                }
                return classValue;
            })
        })
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
        let readjustment = readjustmentValue?.reajuste;
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/coursePrices/create`, { pricesCourseData, userId, readjustment });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Valores cadastrados com sucesso.');
                    router.push(`/financial/priceCourses/list`)
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
            const response = await api.delete(`/coursePrices/delete/${id}`);
            if (response?.status == 200) {
                alert.success('Valores excluídos.');
                router.push(`/financial/priceCourses/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir os Valores.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditPrices = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            let readjustment = readjustmentValue?.reajuste;
            try {
                const response = await api.patch(`/coursePrices/update/${id}`, { pricesCourseData, userId, readjustment })
                if (response?.status === 201) {
                    alert.success('Valores atualizados com sucesso.');
                    setShowValueAdjustment(false)
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar os Valores.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar os Valores.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleEditPricesClass = async (classValueId) => {
        if (checkRequiredFields()) {
            setLoading(true)

            try {
                let [classData] = classesList?.filter(item => item?.id_valor_turma === classValueId)
                const response = await api.patch(`/classPrices/update/${classValueId}`, { classData, userId })
                if (response?.status === 200) {
                    alert.success('Valores da turma atualizados com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar os Valores da turma.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar os Valores da turma.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleCreatePricesClass = async (classId) => {
        let [classData] = classesList?.filter(item => item?.id_turma === classId)
        setLoading(true)
        try {
            const response = await api.post(`/classPrices/create`, { classData, userId });
            const { data } = response
            if (response?.status === 201) {
                alert.success('Valores cadastrados com sucesso.');
                await handleItems()
            }
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao cadastrar valor.');
        } finally {
            setLoading(false)
        }
    }


    const handleDeleteHistoric = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/coursePrices/historic/delete/${historicId}`);
            if (response?.status === 200) {
                alert.success('Historico excluído.');
                handleItems()
                setShowValueAdjustment(false)
                setHistoricId()
                return
            }
            alert.error('Tivemos um problema ao excluir a Historico.');
        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Historico.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleGetHistoricId = async (value) => {
        setLoading(true)
        setHistoricId(value)
        try {
            const response = await api.get(`/coursePrices/historicId/${value}`)
            const { data } = response
            if (data) {
                setHistoricEdit(data)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateHistoricId = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/coursePrices/historic/update`, { historicEdit })
            if (response?.status === 200) {
                alert.success('Historico atualizado.')
                setHistoricId()
                return
            }
            alert.error('Ocorreu um erro ao atualizar o histórico.')
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const calculateNextDate = (dt_vencimento) => {

        const paymentDate = new Date(dt_vencimento);
        paymentDate.setFullYear(paymentDate.getFullYear() + 1);


        const lastDayOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();

        if (paymentDate.getDay() === 6) {
            if (paymentDate.getDate() + 2 > lastDayOfMonth) {
                paymentDate.setDate(paymentDate.getDate() - 1);
            } else {
                paymentDate.setDate(paymentDate.getDate() + 2);
            }
        }

        if (paymentDate.getDay() === 0) {
            if (paymentDate.getDate() + 1 > lastDayOfMonth) {
                paymentDate.setDate(paymentDate.getDate() - 2);
            } else {
                paymentDate.setDate(paymentDate.getDate() + 1);
            }
        }

        while (holidaysArray.some(holiday => holiday.getDate() === paymentDate.getDate() && holiday.getMonth() === paymentDate.getMonth())) {
            paymentDate.setDate(paymentDate.getDate() + 1); // Adicionar 1 dia
        }

        const year = paymentDate.getFullYear();
        const month = String(paymentDate.getMonth() + 1).padStart(2, '0');
        const day = String(paymentDate.getDate()).padStart(2, '0');
        const formattedPaymentDate = `${year}-${month}-${day}`;

        return formattedPaymentDate;

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


    const column = [
        { key: 'id_hist_val_curso', label: 'ID' },
        { key: 'reajuste', label: 'Reajuste %' },
        { key: 'valor_total_curso', label: 'Valor Final' },
        { key: 'valor_avista_curso', label: 'á vista (desconto 5%)' },
        { key: 'n_parcelas', label: 'Parcelas' },
        { key: 'valor_parcelado_curso', label: 'Valor parcelado' },
        { key: 'dt_reajuste', label: 'Data do reajuste', date: true },
        { key: 'observacao_his_pr_cur', label: 'Observações' },
    ];

    const menusFilters = [
        { id: '01', text: 'Curso', value: 'Curso', key: 'course' },
        { id: '02', text: 'Turma', value: 'Turma', key: 'class' },
    ]


    return (
        <>
            <SectionHeader
                perfil={getPerfil}
                title={(courses.filter(item => item.value === pricesCourseData?.curso_id).map(item => item.label)) || `Nova Taxa`}
                saveButton={menuSelected === 'Curso' ? true : false}
                saveButtonAction={newPrice ? handleCreatePrices : handleEditPrices}
                deleteButton={!newPrice && menuSelected === 'Curso'}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeletePrices })}
            />
            <Box sx={{ display: 'flex', alignItems: 'end' }}>
                <Text light style={{ marginRight: 10 }}>vizualizar por:</Text>
                {menusFilters?.map((item, index) => {
                    const menu = item?.value === menuSelected;
                    return (
                        <Box key={index} sx={{
                            display: 'flex',
                            padding: '5px 28px',
                            backgroundColor: menu ? colorPalette.buttonColor : colorPalette.primary,
                            borderTop: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                            borderRight: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                            borderLeft: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                            "&:hover": {
                                opacity: !menu && 0.8,
                                cursor: 'pointer'
                            },
                            borderRadius: '5px 5px 0px 0px',
                            boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                        }} onClick={() => {
                            setMenuSelected(item?.value)
                        }}>
                            <Text large style={{ color: menu ? '#fff' : colorPalette.textColor }}>{item?.text}</Text>
                        </Box>
                    )
                })}
            </Box>
            {menuSelected === 'Curso' ? (
                <>

                    <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                        <Box>
                            <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Valores do Curso</Text>
                        </Box>
                        <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
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
                            <TextInput placeholder='Parcelas' name='n_parcelas' onChange={handleChange} value={pricesCourseData?.n_parcelas || ''} label='Parcelas' sx={{ flex: 1, }} type="number" />
                            <Button small text="calcular" onClick={() => calculationValues({ porcent: false, remove: false })} style={{ width: 80, height: 30 }} />
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

                        {
                            !newPrice &&
                            <>
                                {!showValueAdjustment && <Button secondary small text="reajuste" onClick={() => { setShowValueAdjustment(true) }} style={{ width: 80, height: 30 }} />}

                                {showValueAdjustment &&
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                                        <ContentContainer gap={3} style={{ maxWidth: 400 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 99999 }}>
                                                <Text bold large>Novo reajuste de valor</Text>
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    backgroundImage: `url(${icons.gray_close})`,
                                                    transition: '.3s',
                                                    zIndex: 999999999,
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    }
                                                }} onClick={() => setShowValueAdjustment(false)} />
                                            </Box>

                                            <Box sx={{ ...styles.inputSection, alignItems: 'center', justifyContent: 'start' }}>
                                                <TextInput
                                                    placeholder='0.00'
                                                    name='reajuste'
                                                    onChange={handleChangeReadjustment}
                                                    value={(readjustmentValue?.reajuste) || ''}
                                                    label='% Descondo'
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Button text='aplicar' small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={() => calculationValues({ porcent: readjustmentValue?.reajuste, ajustmentAplicated: true })} />
                                            </Box>

                                        </ContentContainer>
                                    </Box>
                                }
                            </>
                        }

                        <RadioItem valueRadio={pricesCourseData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setPricesCourseData({ ...pricesCourseData, ativo: parseInt(value) })} />
                    </ContentContainer>

                    <ContentContainer style={{ ...styles.containerRegister, padding: showHistoric ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, padding: showHistoric ? '0px 0px 20px 0px' : '0px', "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowHistoric(!showHistoric)}>
                            <Text title bold >Histórico de Valores do Curso</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showHistoric ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                            }} />
                        </Box>
                        {showHistoric &&
                            <>
                                {arrayHistoricValuesCourse.length > 0 ?
                                    <Table_V1 data={arrayHistoricValuesCourse} columns={column} columnId={'id_hist_val_curso'} columnActive={false} center routerPush={false}
                                        onSelect={(value) => handleGetHistoricId(value)} />
                                    :
                                    <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                                        <Text bold>Não encontramos histórico de valores</Text>
                                    </Box>
                                }
                            </>
                        }
                    </ContentContainer>
                    <Backdrop open={historicId} sx={{ zIndex: 9999 }}>
                        <ContentContainer style={{ marginLeft: { xs: '0px', sm: '214px', md: '180px', lg: '214px' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999 }}>
                                <Text bold large>Editar Reajuste</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => {
                                    setHistoricId()
                                    setHistoricEdit({})
                                }} />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, marginTop: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'center' }}>
                                    <Text bold>Reajuste %:</Text>
                                    <Text>{historicEdit?.reajuste || '-'}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'center' }}>
                                    <Text bold>Valor Final:</Text>
                                    <Text>{formatter.format(historicEdit?.valor_total_curso || 0)}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'center' }}>
                                    <Text bold>á vista (desconto 5%):</Text>
                                    <Text>{formatter.format(historicEdit?.valor_avista_curso || 0)}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'center' }}>
                                    <Text bold>Parcelas:</Text>
                                    <Text>{historicEdit?.n_parcelas || '-'}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'center' }}>
                                    <Text bold>Valor parcelado:</Text>
                                    <Text>{formatter.format(historicEdit?.valor_parcelado_curso || 0)}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'center' }}>
                                    <Text bold>Data do reajuste:</Text>
                                    <Text>{formatTimeStamp(historicEdit?.dt_reajuste)}</Text>
                                </Box>
                                <TextInput
                                    placeholder='Observação'
                                    name='observacao_his_pr_cur'
                                    onChange={handleChangeHistoric} value={historicEdit?.observacao_his_pr_cur || ''}
                                    label='Observação' sx={{ flex: 1, }}
                                    multiline
                                    maxRows={8}
                                    rows={4}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                                <Button text='salvar' small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={() => handleUpdateHistoricId()} />
                                <Button text='excluir' secondary={true} small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteHistoric })} />
                            </Box>
                        </ContentContainer>
                    </Backdrop>
                </>
            ) : (
                <>
                    {classesList?.length > 0 ? (



                        classesList?.map((item, index) => {
                            return (
                                <ContentContainer key={index} style={{ ...styles.containerRegister, padding: '25px' }}>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', gap: 1, padding: showClassTable[index] ? '0px 0px 20px 0px' : '0px', "&:hover": {
                                            opacity: 0.8,
                                            cursor: 'pointer'
                                        },
                                        justifyContent: 'space-between'
                                    }} onClick={() => toggleClassTable(index)}>
                                        <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                                            <Text large bold >{item?.nome_turma} - {item?.periodo}</Text>
                                            {!item?.id_valor_turma &&
                                                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: 25, width: 45, backgroundColor: colorPalette.buttonColor, borderRadius: 8 }}>
                                                    <Text small bold style={{ color: '#fff', textAlign: 'center' }}>novo</Text>
                                                </Box>}
                                        </Box>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                            transform: showClassTable[index] ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            transition: '.3s',
                                        }} />
                                    </Box>
                                    {showClassTable[index] &&
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                                            <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                                <SelectList fullWidth data={courses} valueSelection={item?.curso_id} onSelect={(value) => handleChangeClasses(item?.id_turma, 'curso_id', parseInt(value))}
                                                    title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                />
                                                <TextInput
                                                    placeholder='0.00'
                                                    name='valor_total'
                                                    type="coin"
                                                    onChange={(e) => handleChangeClasses(item?.id_turma, e.target.name, e.target.value)}
                                                    value={(item?.valor_total) || ''}
                                                    label='Valor Total' sx={{ flex: 1, }}
                                                />
                                                <TextInput placeholder='Parcelas' name='n_parcelas' onChange={(e) => handleChangeClasses(item?.id_turma, e.target.name, e.target.value)} value={item?.n_parcelas || ''} label='Parcelas' sx={{ flex: 1, }} type="number" />
                                                <Button small text="calcular" onClick={() => calculationValuesClass({ porcent: false, remove: false, classId: item?.id_turma })} style={{ width: 80, height: 30 }} />
                                            </Box>
                                            <Box sx={styles.inputSection}>
                                                <TextInput
                                                    placeholder='0.00'
                                                    name='valor_parcelado'
                                                    type="coin"
                                                    onChange={(e) => handleChangeClasses(item?.id_turma, e.target.name, e.target.value)}
                                                    value={(item?.valor_parcelado) || ''}
                                                    label='Valor das parcelas' sx={{ flex: 1, }}
                                                />
                                                <TextInput
                                                    placeholder='0.00'
                                                    name='valor_avista'
                                                    type="coin"
                                                    onChange={(e) => handleChangeClasses(item?.id_turma, e.target.name, e.target.value)}
                                                    value={(item?.valor_avista) || ''}
                                                    label='Valor á vista' sx={{ flex: 1, }}
                                                />
                                            </Box>
                                            {item?.dt_prox_renovacao && <TextInput
                                                name='dt_prox_renovacao'
                                                onChange={(e) => handleChangeClasses(item?.id_turma, e.target.name, e.target.value)}
                                                value={(item?.dt_prox_renovacao)?.split('T')[0] || ''}
                                                type="date"
                                                label='Proxima renovação'
                                                sx={{ width: 250 }}
                                            />}

                                            {!newPrice && <> {!showValueAdjustmentClass[index] &&
                                                <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                    <Button secondary small text="reajuste" onClick={() => { toggleClassAdjustment(index) }} style={{ width: 80, height: 30 }} />
                                                    <Button text='Histórico' small style={{ width: 80, height: 30 }} onClick={() => setShowHistoricClassId(item?.id_valor_turma)} />
                                                </Box>
                                            }

                                                <Backdrop open={showHistoricClassId === item?.id_valor_turma} sx={{ zIndex: 9999 }}>
                                                    <ContentContainer style={{ marginLeft: { xs: '0px', sm: '214px', md: '180px', lg: '214px' } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999 }}>
                                                            <Text bold large>Histórico de Reajustes</Text>
                                                            <Box sx={{
                                                                ...styles.menuIcon,
                                                                backgroundImage: `url(${icons.gray_close})`,
                                                                transition: '.3s',
                                                                zIndex: 999999999,
                                                                "&:hover": {
                                                                    opacity: 0.8,
                                                                    cursor: 'pointer'
                                                                }
                                                            }} onClick={() => {
                                                                setShowHistoricClassId('')
                                                            }} />
                                                        </Box>
                                                        {arrayHistoricValuesClass?.length > 0 ?
                                                            <Table_V1 data={arrayHistoricValuesClass} columns={column} columnId={'id_hist_valor_turma'} columnActive={false} center routerPush={false}
                                                                onSelect={(value) => handleGetHistoricId(value)} />
                                                            :
                                                            <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '30px 0px 0px 0px' }}>
                                                                <Text light>Não encontramos histórico de valores</Text>
                                                            </Box>
                                                        }
                                                    </ContentContainer>
                                                </Backdrop>
                                                {showValueAdjustmentClass[index] &&
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                                                        <ContentContainer gap={3} style={{ maxWidth: 400 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 99999 }}>
                                                                <Text bold large>Novo reajuste de valor</Text>
                                                                <Box sx={{
                                                                    ...styles.menuIcon,
                                                                    backgroundImage: `url(${icons.gray_close})`,
                                                                    transition: '.3s',
                                                                    zIndex: 999999999,
                                                                    "&:hover": {
                                                                        opacity: 0.8,
                                                                        cursor: 'pointer'
                                                                    }
                                                                }} onClick={() => toggleClassAdjustment(index)} />
                                                            </Box>

                                                            <Box sx={{ ...styles.inputSection, alignItems: 'center', justifyContent: 'start' }}>
                                                                <TextInput
                                                                    placeholder='0.00'
                                                                    name='reajuste'
                                                                    onChange={(e) => handleChangeClasses(item?.id_turma, e.target.name, e.target.value)}
                                                                    value={(item?.reajuste) || ''}
                                                                    label='% Descondo'
                                                                />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Button text='aplicar' small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={() => calculationValuesClass({ porcent: item?.reajuste, ajustmentAplicated: true, classId: item?.id_turma, index: index })} />
                                                            </Box>

                                                        </ContentContainer>
                                                    </Box>
                                                }
                                            </>
                                            }

                                            <RadioItem valueRadio={item?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setPricesCourseData({ ...pricesCourseData, ativo: parseInt(value) })} />

                                        </Box>
                                    }

                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center', justifyContent: showClassTable[index] ? 'flex-end' : 'flex-start', flex: 1 }}>
                                        <Button secondary text='Salvar' small={showClassTable[index] ? false : true} style={{
                                            width: showClassTable[index] ? '130px' : '80px',
                                            height: showClassTable[index] ? '40px' : '30px',
                                            borderRadius: '6px'
                                        }} onClick={() => item?.id_valor_turma ? handleEditPricesClass(item?.id_valor_turma) : handleCreatePricesClass(item?.id_turma)} />
                                    </Box>
                                </ContentContainer>
                            )

                        })
                    ) : (
                        <Text light>Não existem turmas vínculadas a esse curso.</Text>
                    )}
                </>
            )}
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