import { useRouter } from "next/router";
import { Box, Button, ContentContainer, Text } from "../../../../atoms";
import { api } from "../../../../api/api";
import { useEffect, useState } from "react";
import { CheckBoxComponent, SectionHeader } from "../../../../organisms";
import { useMediaQuery, useTheme } from "@mui/material";
import { useAppContext } from "../../../../context/AppContext";

export default function interestEnroll() {
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


    const pushRouteScreen = (indice, route) => {
        setIndiceTela(indice)
        setRouteScreen(route);
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
                />
                <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Button secondary text="Voltar" onClick={() => pushRouteScreen(0, 'interesse >')} style={{ width: 120 }} />
                    <Button text="Continuar" onClick={() => pushRouteScreen(2, 'interesse > Forma de pagamento > Contrato')} style={{ width: 120 }} />
                </Box>
            </>
        ),
        (
            <>
                <ContractStudent />
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
    } = props

    const disciplinesDispensed = quantityDisciplinesModule - quantityDisciplinesSelected;
    const porcentDisciplineDispensed = `${((disciplinesDispensed / quantityDisciplinesModule) * 100).toFixed(2)}%`;

    const valueModuleCourse = (valuesCourse?.valor_total_curso).toFixed(2);
    const costDiscipline = (valueModuleCourse / quantityDisciplinesModule).toFixed(2);
    const calculationDiscount = (costDiscipline * disciplinesDispensed).toFixed(2)
    const valueFinally = (valueModuleCourse - calculationDiscount).toFixed(2)

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });



    return (
        <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
            <ContentContainer fullWidth gap={4}>
                <Text bold title>Forma de pagamento</Text>
                <Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Total:</Text>
                            <Text>{formatter.format(valueModuleCourse)}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>R$ Desconto:</Text>
                            <Text>{formatter.format(calculationDiscount)}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>% Desconto:</Text>
                            <Text>{porcentDisciplineDispensed}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Disciplinas dispensadas:</Text>
                            <Text>{disciplinesDispensed}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                            <Text bold>Valor Total com desconto:</Text>
                            <Text>{formatter.format(valueFinally)}</Text>
                        </Box>
                    </Box>
                </Box>
            </ContentContainer>

        </ContentContainer>
    )

}


export const ContractStudent = (props) => {
    const {

    } = props

    return (
        <ContentContainer fullWidth>
            <Text bold title>Finalizar contrato</Text>
        </ContentContainer>
    )

}