import { useRouter } from "next/router";
import { Box, Button, ContentContainer, Text, TextInput } from "../../../../atoms";
import { api } from "../../../../api/api";
import { useRef, useEffect, useState } from "react";
import { CheckBoxComponent, SectionHeader, SelectList } from "../../../../organisms";
import { useMediaQuery, useTheme } from "@mui/material";
import { useAppContext } from "../../../../context/AppContext";
import { useReactToPrint } from "react-to-print";
import { formatDate } from "../../../../helpers";
import { ContractStudentComponent } from "../../../../organisms/contractStudent/contractStudent";

export default function InterestEnroll() {
    const router = useRouter();
    const { setLoading } = useAppContext()
    const { id, interest } = router.query;
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [interestData, setInterestData] = useState({})
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
    const [updatedScreen, setUpdatedScreen] = useState(false)


    const pushRouteScreen = (indice, route) => {
        setIndiceTela(indice)
        setRouteScreen(route);
        setUpdatedScreen(!updatedScreen)
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
                    userId={id} />
                <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Button secondary text="Voltar" onClick={() => pushRouteScreen(1, 'interesse > Forma de pagamento')} style={{ width: 120 }} />
                </Box>
            </>
        )
    ];

    const handleUserData = async () => {
        setLoading(true)
        try {
            const userDetails = await api.get(`/user/${id}`)
            const { response } = userDetails.data
            setUserData(response)
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
            const response = await api.get(`/coursePrices/course/${courseId}`)
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


    return (
        <>
            <SectionHeader
                perfil={routeScreen || 'Matricula'}
                title={userData?.nome}
            />

            {telas[indiceTela]}

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
        valuesContract,
        updatedScreen
    } = props

    const [totalValueFinnaly, setTotalValueFinnaly] = useState()
    const [disciplineDispensedPorcent, setDisciplineDispensedPorcent] = useState()
    const [valueParcel, setValueParcel] = useState()
    const [totalParcel, setTotalParcel] = useState()
    const [dispensedDisciplines, setDispensedDisciplines] = useState()
    const [discountDispensed, setDiscountDispensed] = useState()
    const [numberOfInstallments, setNumberOfInstallments] = useState(6)
    const initialTypePaymentsSelected = Array.from({ length: numberOfInstallments }, () => ({ tipo: '', valor_parcela: '', n_parcela: null, data_pagamento: '' }));
    const [typePaymentsSelected, setTypePaymentsSelected] = useState(initialTypePaymentsSelected);
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

        setValueParcel(parcelValue)
        setTotalParcel(updatedNumberParcel)

    }, [numberOfInstallments, totalValueFinnaly])


    const handleTypePayment = (index, value, installmentNumber, formattedPaymentDate) => {
        setTypePaymentsSelected((prevTypePaymentsSelected) => {
            const updatedTypePaymentsSelected = [...prevTypePaymentsSelected];
            updatedTypePaymentsSelected[index] = { tipo: value, valor_parcela: valueParcel, data_pagamento: formattedPaymentDate, n_parcela: installmentNumber };
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
                        </Box>
                    </ContentContainer>

                    <ContentContainer fullWidth gap={4}>
                        <Text bold title>Dados do pagante</Text>
                        <Box>

                        </Box>
                    </ContentContainer>

                </ContentContainer>

                <ContentContainer fullWidth gap={4}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Text bold title>Forma de pagamento</Text>
                        <SelectList fullWidth data={totalParcel} valueSelection={numberOfInstallments || ''} onSelect={(value) => setNumberOfInstallments(value)}
                            title="Selecione o numero de parcelas *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
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
                                        paymentDate.setDate(paymentDate.getDate() + index * 30); // Incrementing date by 30 days interval
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
        userId
    } = props



    const { colorPalette, setLoading} = useAppContext()
    const [paymentData, setPaymentData] = useState([])
    const [userData, setUserData] = useState({})
    const contractService = useRef()

    const handleUserData = async () => {
        setLoading(true)
        try {
            const user = await api.get(`/user/${userId}`)
            const { response } = user.data
            setUserData(response)
        } catch (error) {
            return error
        } finally{
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

    return (
        <>
            <ContentContainer>
                <Text bold title>Pré vizualização do Contrato</Text>
            </ContentContainer>

            <ContractStudentComponent
                onClick={handleGeneratePdf}
                userData={userData}>

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
                            <Text small style={styles.textDataPayments}>{userData?.nome}</Text>
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
                                <Text small style={styles.textDataPayments} bold>DESCONTO:</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.descontoAdicional)}</Text>
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
    }
}