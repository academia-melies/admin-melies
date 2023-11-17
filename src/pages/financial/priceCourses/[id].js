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

export default function EditPricesCourse(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog } = useAppContext()
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
    const [beforeValueCourse, setBeforeValueCourse] = useState()
    const [showClassTable, setShowClassTable] = useState({});
    const [classSelected, setClassSelected] = useState()
    const [showValueAdjustment, setShowValueAdjustment] = useState(false)
    

    const toggleClassTable = (index) => {
        setShowClassTable(prevState => ({
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


    const getClasses = async (courseId) => {
        try {
            const response = await api.get(`/coursePrices/classes/${courseId}`)
            const { data } = response
            if (data) {
                setClassesList(data)
                const groupClass = data.map(c => ({
                    label: c?.nome_turma,
                    value: c?.id_turma.toString()
                }));

                setGroupClasses(groupClass);
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

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
        if (ajustmentAplicate) {
            handleEditPrices()
        }
    }, [ajustmentAplicate])

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


    return (
        <>
            <SectionHeader
                perfil={getPerfil}
                title={(courses.filter(item => item.value === pricesCourseData?.curso_id).map(item => item.label)) || `Nova Taxa`}
                saveButton
                saveButtonAction={newPrice ? handleCreatePrices : handleEditPrices}
                deleteButton={!newPrice}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeletePrices })}
            />

            {/* usuario */}
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

                <Button small text="selecionar turmas" onClick={() => { setShowClassesSelect(true) }} style={{ width: 140, height: 30 }} />

                <Backdrop open={showClassesSelect} sx={{ zIndex: 99999, }}>

                    <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '0px' }, overflowY: 'auto', marginLeft: { md: '180px', lg: '280px' } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                            <Text bold large>Turmas</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_close})`,
                                transition: '.3s',
                                zIndex: 999999999,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => setShowClassesSelect(false)}/>
                        </Box>
                        <ContentContainer style={{ boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                <Text bold>Aplicar ás turmas:</Text>
                                <CheckBoxComponent
                                    boxGroup={groupClasses}
                                    valueChecked={classSelected || ''}
                                    horizontal={false}
                                    onSelect={(value) => {
                                        setClassSelected(value)
                                    }}
                                    sx={{ width: 1 }} />
                            </Box>
                        </ContentContainer>
                        <Box style={{ display: 'flex' }}>
                            <Button small
                                style={{ width: '50%', marginRight: 1, height: 30 }}
                                text='Salvar'
                                onClick={() => {
                                    setShowClassesSelect(false)
                                    alert.info('Turmas salvas.')
                                }}
                            />
                            <Button secondary small
                                style={{ width: '50%', height: 30 }}
                                text='Cancelar'
                                onClick={() => {
                                    setClassSelected('')
                                    setShowClassesSelect(false)
                                }}
                            />
                        </Box>
                    </ContentContainer>
                </Backdrop>

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
                                        {/* <Button text='remover' secondary={true} small={true} style={{ width: '80px', padding: '5px 0px' }} onClick={async () => {
                                            await calculationValues({ porcent: false, remove: true })
                                            setReadjustmentValue({ reajuste: '' })
                                            setShowValueAdjustment(false)
                                        }} /> */}
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

            <Text title bold style={{ padding: '20px 0px 0px 10px' }}>Valores por turma:</Text>

            {classesList.map((item, index) => {
                return (
                    <ContentContainer key={index} style={{ ...styles.containerRegister, padding: showClassTable[index] ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, padding: showClassTable[index] ? '0px 0px 20px 0px' : '0px', "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => toggleClassTable(index)}>
                            <Text large bold >{item?.nome_turma} - {item?.periodo}</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showClassTable[index] ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                            }} />
                        </Box>
                    </ContentContainer>
                )

            })}

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