import { useRouter } from "next/router";
import { Box, Button, ContentContainer, PhoneInputField, Text, TextInput } from "../../../../atoms";
import { api } from "../../../../api/api";
import { useRef, useEffect, useState } from "react";
import { CheckBoxComponent, SectionHeader, SelectList } from "../../../../organisms";
import { useMediaQuery, useTheme } from "@mui/material";
import { useAppContext } from "../../../../context/AppContext";
import { useReactToPrint } from "react-to-print";
import { calculationAge, findCEP, formatCEP, formatCPF, formatDate, formatRg } from "../../../../helpers";
import { ContractStudentComponent } from "../../../../organisms/contractStudent/contractStudent";
import { Forbidden } from "../../../../forbiddenPage/forbiddenPage";

export default function InterestEnroll() {
    const router = useRouter();
    const { setLoading, user, alert } = useAppContext()
    const userId = user?.id;
    const { id, interest } = router.query;
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [interestData, setInterestData] = useState({})
    const [responsiblePayerData, setResponsiblePayerData] = useState({
        nome_resp: '',
        usuario_id: id,
        end_resp: null,
        numero_resp: null,
        cep_resp: null,
        compl_resp: '',
        bairro_resp: '',
        cidade_resp: '',
        estado_resp: '',
        pais_resp: '',
        email_resp: '',
        telefone_resp: '',
        cpf_resp: '',
        rg_resp: '',
    })
    const [disciplines, setDisciplines] = useState([])
    const [userData, setUserData] = useState({})
    const [disciplinesSelected, setDisciplinesSelected] = useState()
    const [indiceTela, setIndiceTela] = useState(0);
    const [routeScreen, setRouteScreen] = useState('interesse >')
    const [quantityDisciplinesSelected, setQuantityDisciplinesSelected] = useState(0)
    const [quantityDisciplinesModule, setQuantityDisciplinesModule] = useState(0)
    const [valuesCourse, setValuesCourse] = useState({})
    const [courseData, setCourseData] = useState({})
    const [classData, setClassData] = useState({})
    const [valuesContract, setValuesContract] = useState([])
    const [paymentForm, setPaymentForm] = useState({})
    const [emailDigitalSignature, setEmailDigitalSignature] = useState({})
    const [updatedScreen, setUpdatedScreen] = useState(false)
    const [userIsOfLegalAge, setUserIsOfLegalAge] = useState(true)
    const [paying, setPaying] = useState({
        aluno: true,
        responsible: false
    })

    const pushRouteScreen = (indice, route) => {
        setIndiceTela(indice)
        setRouteScreen(route);
        setUpdatedScreen(!updatedScreen)
    }

    const handleUserData = async () => {
        setLoading(true)
        try {
            const userDetails = await api.get(`/user/${id}`)
            const { response } = userDetails.data
            setUserData(response)

            const isOfLegalAge = await calculationAge(response?.nascimento)
            setUserIsOfLegalAge(isOfLegalAge)
            if (!isOfLegalAge) {
                alert.info('Aluno menor de idade. Por favor, cadastrar responsável pagante para prosseguir com a matrícula.')
            }
            return response
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleInterest = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/user/interest/${interest}`)
            const { data } = response
            setInterestData(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleResponsible = async () => {
        try {
            const response = await api.get(`/responsible/${id}`)
            const { data } = response
            setResponsiblePayerData(data)
            if (data) {
                setPaying({
                    aluno: false,
                    responsible: true
                })
            }
            return data
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

            const disciplinesSelect = groupDisciplines.map(discipline => discipline.value);
            const flattenedDisciplinesSelected = disciplinesSelect.join(', ');
            setQuantityDisciplinesModule(groupDisciplines?.length)
            setDisciplinesSelected(flattenedDisciplinesSelected)
            setDisciplines(groupDisciplines);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleValuesCourse = async (courseId) => {
        setLoading(true)
        try {
            const response = await api.get(`/coursePrices/course/historic/${courseId}`)
            const { data } = response
            setValuesCourse(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleCourseData = async (id) => {
        try {
            const response = await api.get(`/course/${id}`)
            setCourseData(response?.data)
        } catch (error) {
            return error
        }
    }

    const handleClassData = async (id) => {
        try {
            const response = await api.get(`/class/${id}`)
            setClassData(response?.data)
        } catch (error) {
            return error
        }
    }

    useEffect(() => {
        handleItems()
    }, [])

    const handleItems = async () => {
        try {
            await handleUserData()
            const interests = await handleInterest()
            if (interests) {
                await handleSelectModule(interests?.turma_id)
                await handleValuesCourse(interests?.curso_id)
                await handleCourseData(interests?.curso_id)
                await handleClassData(interests?.turma_id)
                await handleResponsible()
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        let disciplineParts = disciplinesSelected?.split(',')
        let disciplinesLength = disciplineParts?.length
        setQuantityDisciplinesSelected(disciplinesLength)
    }, [disciplinesSelected])


    const handleCreateResponsible = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/responsible/create`, { responsiblePayerData: { ...responsiblePayerData, usuario_id: id }, userId })
            const { data } = response
            if (data) {
                handleResponsible()
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateResponsible = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/responsible/update/${responsiblePayerData?.id_resp_pag}`, { responsiblePayerData })
            const { data } = response
            if (data) {
                handleResponsible()
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const telas = [
        (
            <>
                <EnrollStudentDetails
                    setDisciplinesSelected={setDisciplinesSelected}
                    disciplinesSelected={disciplinesSelected}
                    disciplines={disciplines}
                    userData={userData}
                    interestData={interestData}
                    setLoading={setLoading}
                />
                <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Button text="Continuar" onClick={() => pushRouteScreen(1, 'interesse > Forma de pagamento')} style={{ width: 120 }} />
                </Box>
            </>
        ),
        (
            <>
                <Payment
                    quantityDisciplinesSelected={quantityDisciplinesSelected}
                    quantityDisciplinesModule={quantityDisciplinesModule}
                    valuesCourse={valuesCourse}
                    setValuesContract={setValuesContract}
                    setPaymentForm={setPaymentForm}
                    valuesContract={valuesContract}
                    paymentForm={paymentForm}
                    updatedScreen={updatedScreen}
                    responsiblePayerData={responsiblePayerData}
                    setResponsiblePayerData={setResponsiblePayerData}
                    handleAddResponsible={handleCreateResponsible}
                    handleUpdateResponsible={handleUpdateResponsible}
                    paying={paying}
                    setPaying={setPaying}
                    userData={userData}
                    userIsOfLegalAge={userIsOfLegalAge}
                />
                <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Button secondary text="Voltar" onClick={() => pushRouteScreen(0, 'interesse >')} style={{ width: 120 }} />
                    <Button text="Continuar" onClick={() => pushRouteScreen(2, 'interesse > Forma de pagamento > Contrato')} style={{ width: 120 }} />
                </Box>
            </>
        ),
        (
            <>
                <ContractStudent
                    paymentForm={paymentForm}
                    valuesContract={valuesContract}
                    courseData={courseData}
                    classData={classData}
                    userId={id}
                    responsiblePayerData={responsiblePayerData}
                    emailDigitalSignature={emailDigitalSignature}
                    setEmailDigitalSignature={setEmailDigitalSignature}
                />
                <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Button secondary text="Voltar" onClick={() => pushRouteScreen(1, 'interesse > Forma de pagamento')} style={{ width: 120 }} />
                </Box>
            </>
        )
    ];


    return (
        <> {interest ?
            <>
                <SectionHeader
                    perfil={routeScreen || 'Matricula'}
                    title={userData?.nome}
                />

                {telas[indiceTela]}
            </>
            :
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Text bold title> Você precisa adicionar um interesse antes para prosseguir com a Matícula</Text>
            </Box>
        }

        </>
    )
}

export const EnrollStudentDetails = (props) => {

    const {
        disciplinesSelected,
        disciplines,
        setDisciplinesSelected,
        interestData,
    } = props

    return (
        <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
            <ContentContainer fullWidth gap={4}>
                <Text bold title>Interesse</Text>
                <Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Curso:</Text>
                            <Text>{interestData?.nome_curso}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Turma:</Text>
                            <Text>{interestData?.nome_turma}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Periodo:</Text>
                            <Text>{interestData?.periodo_interesse}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Observação: </Text>
                            <Text>{interestData?.observacao_int}</Text>
                        </Box>
                    </Box>
                </Box>
            </ContentContainer>

            <ContentContainer fullWidth gap={4}>
                <Text bold title>Disciplinas</Text>
                <CheckBoxComponent
                    padding={false}
                    valueChecked={disciplinesSelected}
                    boxGroup={disciplines}
                    title="Selecione as disciplinas*"
                    horizontal={false}
                    onSelect={(value) => setDisciplinesSelected(value)}
                    sx={{ flex: 1, }}
                />
            </ContentContainer>
        </ContentContainer>
    )
}

export const Payment = (props) => {
    const {
        quantityDisciplinesSelected,
        quantityDisciplinesModule,
        valuesCourse,
        setValuesContract,
        setPaymentForm,
        responsiblePayerData,
        updatedScreen,
        setResponsiblePayerData,
        handleAddResponsible,
        handleUpdateResponsible,
        paying,
        setPaying,
        userData,
        userIsOfLegalAge
    } = props

    const [totalValueFinnaly, setTotalValueFinnaly] = useState()
    const [disciplineDispensedPorcent, setDisciplineDispensedPorcent] = useState()
    const [valueParcel, setValueParcel] = useState()
    const [groupDaysForPay, setGroupDaysForPay] = useState()
    const [totalParcel, setTotalParcel] = useState()
    const [dispensedDisciplines, setDispensedDisciplines] = useState()
    const [discountDispensed, setDiscountDispensed] = useState()
    const [numberOfInstallments, setNumberOfInstallments] = useState(6)
    const [dayForPayment, setDayForPayment] = useState(1)
    const initialTypePaymentsSelected = Array.from({ length: numberOfInstallments }, () => ({ tipo: '', valor_parcela: '', n_parcela: null, data_pagamento: '' }));
    const [typePaymentsSelected, setTypePaymentsSelected] = useState(initialTypePaymentsSelected);
    const [globalTypePaymentsSelected, setGlobalTypePaymentsSelected] = useState('');
    const [aditionalDiscount, setAditionalDiscount] = useState({ desconto_adicional: '' })
    const { colorPalette, alert } = useAppContext()

    useEffect(() => {

        const disciplinesDispensed = quantityDisciplinesModule - quantityDisciplinesSelected;
        const porcentDisciplineDispensed = `${((disciplinesDispensed / quantityDisciplinesModule) * 100).toFixed(2)}%`;

        const valueModuleCourse = (valuesCourse?.valor_total_curso).toFixed(2);
        const costDiscipline = (valueModuleCourse / quantityDisciplinesModule).toFixed(2);
        const calculationDiscount = (costDiscipline * disciplinesDispensed).toFixed(2)
        const valueFinally = (valueModuleCourse - calculationDiscount).toFixed(2)

        setTotalValueFinnaly(valueFinally)
        setDisciplineDispensedPorcent(porcentDisciplineDispensed)
        setDispensedDisciplines(disciplinesDispensed)
        setDiscountDispensed(calculationDiscount)

        setValuesContract({
            valorSemestre: valuesCourse?.valor_total_curso,
            qntDispensadas: disciplinesDispensed,
            descontoDispensadas: calculationDiscount,
            descontoPorcentagemDisp: porcentDisciplineDispensed,
            descontoAdicional: aditionalDiscount?.desconto_adicional,
            valorFinal: valueFinally
        })
    }, [])

    useEffect(() => {
        const parcelValue = (totalValueFinnaly / numberOfInstallments).toFixed(2)
        const totalParcelCourse = valuesCourse?.total_parcelas || 6;
        const updatedNumberParcel = Array.from({ length: totalParcelCourse }, (_, index) => ({
            label: index + 1,
            value: index + 1
        }))

        const updatedDayForPayment = Array.from({ length: 28 }, (_, index) => ({
            label: index + 1,
            value: index + 1
        }))

        setGroupDaysForPay(updatedDayForPayment)
        setValueParcel(parcelValue)
        setTotalParcel(updatedNumberParcel)

    }, [numberOfInstallments, totalValueFinnaly])



    const handleAllSelectTypePayment = (value) => {
        setGlobalTypePaymentsSelected(value);

        setTypePaymentsSelected((prevTypePaymentsSelected) =>
            prevTypePaymentsSelected.map((_, index) => {
                const paymentDate = new Date();
                paymentDate.setDate(paymentDate.getDate() + index * 30); // Incrementing date by 30 days interval
                const formattedPaymentDate = paymentDate.toLocaleDateString('pt-BR'); // You can adjust the locale if needed

                return {
                    tipo: value,
                    valor_parcela: valueParcel,
                    data_pagamento: formattedPaymentDate,
                    n_parcela: index + 1,
                };
            })
        );
    };

    const handleTypePayment = (index, value, installmentNumber, formattedPaymentDate) => {
        setTypePaymentsSelected((prevTypePaymentsSelected) => {
            const updatedTypePaymentsSelected = [...prevTypePaymentsSelected];
            updatedTypePaymentsSelected[index] = {
                tipo: value,
                valor_parcela: valueParcel,
                data_pagamento: formattedPaymentDate,
                n_parcela: installmentNumber
            };
            return updatedTypePaymentsSelected;
        });
    };


    const handleChange = (event) => {

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

        setAditionalDiscount((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));

        return;
    }

    const handleChangeResponsibleData = (event) => {

        if (event.target.name == 'cpf_resp') {
            let str = event.target.value;
            event.target.value = formatCPF(str)
        }

        if (event.target.name == 'rg_resp') {
            let str = event.target.value;
            event.target.value = formatRg(str)
        }

        if (event.target.name == 'cep_resp') {
            let str = event.target.value;
            event.target.value = formatCEP(str)
        }

        setResponsiblePayerData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));

    }

    const handleCalculationDiscount = (action) => {
        const discount = parseFloat(aditionalDiscount?.desconto_adicional);
        const totalValue = parseFloat(totalValueFinnaly);

        if (isNaN(discount) || isNaN(totalValue)) {
            alert.error("Desconto ou valor total inválido.");
        }

        if (action === 'remover') {
            const updatedTotal = (totalValue + discount).toFixed(2);
            setTotalValueFinnaly(updatedTotal);
            setAditionalDiscount({ desconto_adicional: 0 })
        } else if (action === 'adicionar') {
            const updatedTotal = (totalValue - discount).toFixed(2);
            setTotalValueFinnaly(updatedTotal);
        }


    };

    const handleBlurCEP = async (event) => {
        try {
            const { value } = event.target;
            const data = await findCEP(value);

            setResponsiblePayerData((prevValues) => ({
                ...prevValues,
                end_resp: data.logradouro,
                cidade_resp: data.localidade,
                estado_resp: data.uf,
                bairro_resp: data.bairro,
            }))
        } catch (error) {
            return error
        }
    };


    useEffect(() => {
        setValuesContract({
            valorSemestre: valuesCourse?.valor_total_curso,
            qntDispensadas: dispensedDisciplines,
            descontoDispensadas: discountDispensed,
            descontoPorcentagemDisp: disciplineDispensedPorcent,
            descontoAdicional: aditionalDiscount?.desconto_adicional,
            valorFinal: totalValueFinnaly
        });

        setPaymentForm(typePaymentsSelected);
    }, [updatedScreen, typePaymentsSelected, totalValueFinnaly, dispensedDisciplines, discountDispensed, disciplineDispensedPorcent, aditionalDiscount, valuesCourse, setValuesContract, setPaymentForm]);



    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const listPaymentType = [
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Cartão', value: 'Cartão' },
        { label: 'pix', value: 'pix' },
    ]


    return (
        <>
            <ContentContainer style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                    <ContentContainer fullWidth gap={4} >
                        <Text bold title>Resumo da contratação</Text>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Total:</Text>
                                <Text>{formatter.format(valuesCourse?.valor_total_curso)}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Disciplinas dispensadas:</Text>
                                <Text>{dispensedDisciplines}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Disciplinas dispensadas - Desconto (R$):</Text>
                                <Text>{formatter.format(discountDispensed)}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Disciplinas dispensadas - Desconto (%):</Text>
                                <Text>{disciplineDispensedPorcent}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextInput
                                    placeholder='0.00'
                                    name='desconto_adicional'
                                    type="coin"
                                    onChange={handleChange}
                                    value={(aditionalDiscount?.desconto_adicional) || ''}
                                    label='Desconto adicional' sx={{ flex: 1, }}
                                />
                                <Button small text="adicionar" onClick={() => handleCalculationDiscount('adicionar')} style={{ width: '90px', height: '30px' }} />
                                <Button secondary small text="remover" onClick={() => handleCalculationDiscount('remover')} style={{ width: '90px', height: '30px' }} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Valor Total com desconto:</Text>
                                <Text>{formatter.format(totalValueFinnaly)}</Text>
                            </Box>
                            <SelectList fullWidth data={groupDaysForPay} valueSelection={dayForPayment || ''} onSelect={(value) => setDayForPayment(value)}
                                title="Selecione o dia do vencimento *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>
                    </ContentContainer>

                    <ContentContainer fullWidth gap={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text bold title>Dados do pagante</Text>
                            <Box sx={{ display: 'flex' }}>
                                <Button small secondary={paying?.aluno ? false : true} text="aluno" onClick={() => setPaying({
                                    aluno: true,
                                    responsible: false
                                })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                                <Button secondary={paying?.responsible ? false : true} small text="responsável" onClick={() => setPaying({
                                    aluno: false,
                                    responsible: true
                                })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                            </Box>
                        </Box>
                        {paying?.responsible ?
                            <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>

                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Nome' id="field-1" name='nome_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.nome_resp || ''} label='Nome *' sx={{ flex: 1, }} />
                                    <PhoneInputField
                                        label='Telefone *'
                                        name='telefone_resp'
                                        onChange={(phone) => setResponsiblePayerData({ ...responsiblePayerData, telefone_resp: phone })}
                                        value={responsiblePayerData?.telefone_resp}
                                        sx={{ flex: 1, }}
                                    />
                                </Box>
                                <TextInput placeholder='E-mail' name='email_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.email_resp || ''} label='E-mail *' sx={{ flex: 1, }} />
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='CPF' name='cpf_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cpf_resp || ''} label='CPF *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='RG' name='rg_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.rg_resp || ''} label='RG *' sx={{ flex: 1, }} />
                                </Box>
                                <TextInput placeholder='CEP' name='cep_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cep_resp || ''} onBlur={handleBlurCEP} label='CEP *' sx={{ flex: 1, }} />

                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Endereço' name='end_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.end_resp || ''} label='Endereço *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Nº' name='numero_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.numero_resp || ''} label='Nº *' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Cidade' name='cidade_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cidade_resp || ''} label='Cidade *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Estado' name='estado_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.estado_resp || ''} label='Estado *' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Bairro' name='bairro_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.bairro_resp || ''} label='Bairro *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Complemento' name='compl_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.compl_resp || ''} label='Complemento' sx={{ flex: 1, }} />
                                </Box>
                            </Box>
                            :
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-start', alignItems: 'start', flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>Nome:</Text>
                                    <Text>{userData?.nome}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>E-mail:</Text>
                                    <Text>{userData?.email}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>Telefone:</Text>
                                    <Text>{userData?.telefone}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>CPF: </Text>
                                    <Text>{userData?.cpf}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>RG: </Text>
                                    <Text>{userData?.rg}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>CEP: </Text>
                                    <Text>{userData?.cep}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>Maior de 18 anos: </Text>
                                    <Text>{userIsOfLegalAge ? 'Sim' : 'Não'}</Text>
                                </Box>

                            </Box>
                        }
                        {paying?.responsible &&
                            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', gap: 2 }}>
                                {!responsiblePayerData ?
                                    <Button small text="adicionar" onClick={() => handleAddResponsible()} style={{ width: '90px', height: '30px' }} />
                                    :
                                    <Button secondary small text="atualizar" onClick={() => handleUpdateResponsible()} style={{ width: '90px', height: '30px' }} />
                                }
                            </Box>}

                    </ContentContainer>

                </ContentContainer>

                <ContentContainer fullWidth gap={4}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Text bold title>Forma de pagamento</Text>
                        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                            <SelectList fullWidth data={totalParcel} valueSelection={numberOfInstallments || ''} onSelect={(value) => setNumberOfInstallments(value)}
                                title="Selecione o numero de parcelas *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <SelectList fullWidth data={listPaymentType} valueSelection={globalTypePaymentsSelected || ''} onSelect={(value) => handleAllSelectTypePayment(value)}
                                filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                title="Selecione a forma de pagamento *"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                clean={false}
                            />
                        </Box>
                        <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}` }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                        <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nº Parcela</th>
                                        <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Forma</th>
                                        <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Valor da Parcela</th>
                                        <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Pagamento</th>
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1 }}>
                                    {Array.from({ length: numberOfInstallments }, (_, index) => {
                                        const installmentNumber = index + 1;
                                        const paymentDate = new Date();
                                        const currentDay = paymentDate.getDate();
                                        const selectedDay = dayForPayment;

                                        paymentDate.setDate(selectedDay);
                                        paymentDate.setMonth(paymentDate.getMonth() + (index + 1)); // Incrementing date by 30 days interval
                                        const formattedPaymentDate = paymentDate.toLocaleDateString('pt-BR'); // You can adjust the locale if needed

                                        return (
                                            <tr key={installmentNumber}>
                                                <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                    {installmentNumber}</td>
                                                <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, border: '1px solid lightgray' }}>
                                                    <SelectList fullWidth data={listPaymentType} valueSelection={typePaymentsSelected[index]?.tipo || ''} onSelect={(value) => handleTypePayment(index, value, installmentNumber, formattedPaymentDate)}
                                                        filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                        clean={false}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                    {formatter.format(valueParcel)}</td>
                                                <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                    {formattedPaymentDate}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Box>
                </ContentContainer>

            </ContentContainer>
        </>
    )

}


export const ContractStudent = (props) => {
    const {
        paymentForm,
        valuesContract,
        courseData,
        classData,
        userId,
        responsiblePayerData,
        emailDigitalSignature,
        setEmailDigitalSignature
    } = props



    const { colorPalette, setLoading, alert } = useAppContext()
    const [paymentData, setPaymentData] = useState([])
    const [userData, setUserData] = useState({})
    const contractService = useRef()

    const handleUserData = async () => {
        setLoading(true)
        try {
            const user = await api.get(`/user/${userId}`)
            const { response } = user.data
            setUserData(response)
            setEmailDigitalSignature({ ...emailDigitalSignature, email_1: response?.email })
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleUserData()
    }, [])

    const handleGeneratePdf = useReactToPrint({
        content: () => contractService.current,
        documentTitle: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS',
        onAfterPrint: () => alert.info('Tabela exportada em PDF.')
    })

    useEffect(() => {
        const updatedPaymentForm = paymentForm.map((payment) => ({
            ...payment,
            valor_parcela: parseFloat(payment?.valor_parcela).toFixed(2)
        }));

        setPaymentData(updatedPaymentForm)
    }, [])

    const className = classData?.nome_turma;
    const startDateClass = formatDate(classData?.inicio);
    const courseSigle = courseData?.sigla;
    const courseName = courseData?.nome_curso;
    const modalityCourse = courseData?.modalidade_curso;

    let query = `Curso: `;
    if (className) query += `${className}-1SEM - `;
    if (courseSigle) query += `${courseSigle}`;
    if (courseName) query += `${courseName} `;
    if (modalityCourse) query += `${modalityCourse} `;
    if (startDateClass) query += `- ${startDateClass}`;
    // const titleEnroll = `Curso: ${className}-1SEM - ${courseSigle} ${courseName} ${modalityCourse} - ${startDateClass}`

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const handleChange = (event) => {

        setEmailDigitalSignature((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));

        return;
    }

    return (
        <>
            <ContentContainer>
                <Text bold title>Pré vizualização do Contrato</Text>
            </ContentContainer>

            <ContractStudentComponent
                onClick={handleGeneratePdf}
                userData={userData}
                responsiblePayerData={responsiblePayerData}>

                <ContentContainer style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    boxShadow: 'none',
                    alignItems: 'center',
                    marginTop: 25
                }}>
                    <Text bold>{query || 'Dados de pagamento'}</Text>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '8px',
                        alignItems: 'start',
                        width: '70%',
                    }}>

                        <Box sx={{ ...styles.containerValues, borderRadius: '8px 8px 0px 0px' }}>
                            <Text small style={styles.textDataPayments} bold>Nome completo:</Text>
                            <Text small style={styles.textDataPayments}>{userData?.nome}</Text>
                        </Box>

                        <Box sx={styles.containerValues}>
                            <Text small style={styles.textDataPayments} bold>Resp. pagante:</Text>
                            <Text small style={styles.textDataPayments}>{responsiblePayerData?.nome_resp || userData?.nome}</Text>
                        </Box>
                        <Box sx={styles.containerValues}>
                            <Text small style={styles.textDataPayments} bold>Valor total do semestre:</Text>
                            <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.valorSemestre)}</Text>
                        </Box>
                        <Box sx={styles.containerValues}>
                            <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas:</Text>
                            <Text small style={styles.textDataPayments}>{valuesContract.qntDispensadas}</Text>
                        </Box>
                        {valuesContract.descontoDispensadas > 0 &&
                            <Box sx={styles.containerValues}>
                                <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (R$):</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.descontoDispensadas)}</Text>
                            </Box>
                        }
                        {valuesContract.descontoPorcentagemDisp != '0.00%' &&
                            <Box sx={styles.containerValues}>
                                <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (%):</Text>
                                <Text small style={styles.textDataPayments}>{valuesContract.descontoPorcentagemDisp}</Text>
                            </Box>
                        }
                        {valuesContract.descontoAdicional &&
                            <Box sx={styles.containerValues}>
                                <Text small style={styles.textDataPayments} bold>DESCONTO (adicional):</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.descontoAdicional)}</Text>
                            </Box>
                        }
                         {valuesContract.descontoAdicional && valuesContract.descontoDispensadas > 0 &&
                            <Box sx={styles.containerValues}>
                                <Text small style={styles.textDataPayments} bold>DESCONTO TOTAL:</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(parseFloat(valuesContract?.descontoAdicional) + parseFloat(valuesContract?.descontoDispensadas))}</Text>
                            </Box>
                        }
                        {valuesContract.valorFinal &&
                            <Box sx={{ ...styles.containerValues, borderRadius: '0px 0px 8px 8px' }}>
                                <Text small style={styles.textDataPayments} bold>VALOR A PAGAR:</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.valorFinal)}</Text>
                            </Box>
                        }
                    </Box>
                </ContentContainer>


                <ContentContainer style={{ display: 'flex', flexDirection: 'column', gap: 3, boxShadow: 'none', alignItems: 'center', marginBottom: 25 }}>
                    <Text bold>Forma de pagamento escolhida:</Text>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '80%' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nº Parcela</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Forma</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Valor da Parcela</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Pagamento</th>
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1 }}>
                                {paymentData?.map((pay, index) => {
                                    return (
                                        <tr key={`${pay}-${index}`}>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {pay?.n_parcela}</td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {pay?.tipo}
                                            </td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {formatter.format(pay?.valor_parcela)}</td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {pay?.data_pagamento}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ContentContainer>

            </ContractStudentComponent>

            <ContentContainer gap={2}>
                <Text bold>Assinatura Digital:</Text>
                <Box sx={{ ...styles.inputSection, marginTop: 2 }}>
                    <TextInput placeholder='E-mail 1º' name='email_1' onChange={handleChange} value={emailDigitalSignature?.email_1 || ''} label='E-mail 1º *' sx={{ flex: 1, }} />
                    <TextInput placeholder='E-mail 2º' name='email_2' onChange={handleChange} value={emailDigitalSignature?.email_2 || ''} label='E-mail 2º' sx={{ flex: 1, }} />
                </Box>

                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
                    <Button small text="enviar" onClick={() => alert.success('Contrato enviado por e-mail para assinatura digital.')} style={{ width: '90px', height: '30px' }} />
                </Box>
            </ContentContainer>
        </>
    )

}

export const styles = {
    containerValues: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        border: '1px solid lightgray',
        padding: '8px 15px',
        width: '100%',
        gap: 2
    },
    textDataPayments: {
        // flex: 1
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
}