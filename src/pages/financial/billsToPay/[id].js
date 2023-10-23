import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createDiscipline, deleteDiscipline, editDiscipline } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditBillToPay(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, bill } = router.query;
    const newBill = id === 'new';
    const [billToPayData, setBillToPayData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const menusFilters = [
        { id: '01', text: 'Despesas Fixas', value: 'Despesas Fixas' },
        { id: '02', text: 'Despesas Variáveis', value: 'Despesas Variáveis' },
        { id: '03', text: 'Folha de Pagamento', value: 'Folha de Pagamento' },
    ]

    console.log(id)


    const getBillToPay = async () => {
        try {
            const response = await api.get(`/discipline/${id}`)
            const { data } = response
            setBillToPayData(data)
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        (async () => {
            if (newBill) {
                return
            }
            await handleItems();
        })();
    }, [bill])

    // async function listDisciplines() {
    //     try {
    //         const response = await api.get(`/disciplines/active`)
    //         const { data } = response
    //         const groupDisciplines = data.map(disciplines => ({
    //             label: disciplines.nome_disciplina,
    //             value: disciplines?.id_disciplina
    //         }));

    //         setDisciplines(groupDisciplines);
    //     } catch (error) {
    //     }
    // }


    const handleItems = async () => {
        setLoading(true)
        try {
            await getBillToPay()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = async (event) => {

        if (event.target.name === 'valor_desp_f') {
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

            setBillToPayData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setBillToPayData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!billToPayData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    let typeExpense = (bill === '01' && `fixed`) || (bill === '02' && `variable`) || (bill === '03' && `personal`)

    const handleCreate = async () => {

        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/expenses/${typeExpense}/create/${usuario_id}`, { billToPayData });
                if (response?.status === 201) {
                    alert.success('Despesa cadastrada.');
                    router.push(`/financial/billsToPay/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar a Despesa.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/expenses/${typeExpense}/${id}`)
            if (response?.status == 200) {
                alert.success('Despesa excluída com sucesso.');
                router.push(`/financial/billsToPay/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Despesa.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/expenses/${typeExpense}/update/${id}`)
                if (response?.status === 200) {
                    alert.success('Despesa atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Despesa.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Despesa.');
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        if (billToPayData?.recorrencia_mensal === 'Sim' && billToPayData?.dt_vencimento) {
            calculateNextDate(billToPayData?.dt_vencimento)
        } else {
            setBillToPayData({ ...billToPayData, dt_prox_pagamento: '' })
        }
    }, [billToPayData?.dt_vencimento, billToPayData?.recorrencia_mensal])


    const groupStatus = [
        { label: 'Pago', value: 'Pago' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Cancelado', value: 'Cancelado' }
    ]


    const groupRecurrency = [
        {
            label: 'Recorrência mensal',
            value: 'Sim'
        },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const holidays = [
        new Date(2023, 0, 1),  // Ano Novo
        new Date(2023, 1, 25), // Carnaval
        new Date(2023, 1, 26), // Carnaval
        new Date(2023, 3, 7),  // Sexta-feira Santa
        new Date(2023, 3, 21), // Tiradentes
        new Date(2023, 4, 1),  // Dia do Trabalhador
        new Date(2023, 5, 15), // Corpus Christi
        new Date(2023, 8, 7),  // Independência do Brasil
        new Date(2023, 9, 12), // Nossa Senhora Aparecida
        new Date(2023, 10, 2), // Dia de Finados
        new Date(2023, 10, 15),// Proclamação da República
        new Date(2023, 11, 25)  // Natal
    ];


    const calculateNextDate = (dt_vencimento) => {

        const paymentDate = new Date(dt_vencimento);
        paymentDate.setMonth(paymentDate.getMonth() + 1);

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

        while (holidays.some(holiday => holiday.getDate() === paymentDate.getDate() && holiday.getMonth() === paymentDate.getMonth())) {
            paymentDate.setDate(paymentDate.getDate() + 1); // Adicionar 1 dia
        }

        const year = paymentDate.getFullYear();
        const month = String(paymentDate.getMonth() + 1).padStart(2, '0');
        const day = String(paymentDate.getDate()).padStart(2, '0');
        const formattedPaymentDate = `${year}-${month}-${day}`;

        setBillToPayData({ ...billToPayData, dt_prox_pagamento: formattedPaymentDate })

        return formattedPaymentDate;

    }


    return (
        <>
            <SectionHeader
                title={billToPayData?.empresa_paga || `Nova Despesa`}
                perfil={menusFilters?.filter(item => item?.id === bill).map(item => item?.value)}
                saveButton
                saveButtonAction={newBill ? handleCreate : handleEdit}
                deleteButton={!newBill}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })}
            />

            {bill === '01' &&
                <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                    <Box>
                        <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Despesa</Text>
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput placeholder='Empresa/Fornecedor' name='empresa_paga' onChange={handleChange} value={billToPayData?.empresa_paga || ''} label='Empresa/Fornecedor' sx={{ flex: 1, }} />
                        <TextInput placeholder='Data do vencimento' name='dt_vencimento' onChange={handleChange} value={(billToPayData?.dt_vencimento)?.split('T')[0] || ''} type="date" label='Data do vencimento' sx={{ flex: 1, }} />
                        <TextInput
                            placeholder='0.00'
                            name='valor_desp_f'
                            type="coin"
                            onChange={handleChange}
                            value={(billToPayData?.valor_desp_f) || ''}
                            label='Valor Total' sx={{ flex: 1, }}
                        // onBlur={() => calculationValues(pricesCourseData)}
                        />
                    </Box>
                    <TextInput placeholder='Descrição/Observação' name='descricao_desp_f' onChange={handleChange} value={billToPayData?.descricao_desp_f || ''} label='Descrição/Observação' sx={{}} multiline rows={4} />
                    <SelectList data={groupStatus} valueSelection={billToPayData?.status} onSelect={(value) => setBillToPayData({ ...billToPayData, status: value })}
                        title="Status do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor, width: 250 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <Box sx={{ padding: '0px 0px 20px 0px' }}>
                        <CheckBoxComponent
                            boxGroup={groupRecurrency}
                            valueChecked={billToPayData?.recorrencia_mensal || ''}
                            horizontal={mobile ? false : true}
                            onSelect={(value) => {
                                setBillToPayData({ ...billToPayData, recorrencia_mensal: value })
                            }}
                            sx={{ width: 1 }} />
                    </Box>
                    {billToPayData?.recorrencia_mensal === 'Sim' && billToPayData?.dt_vencimento &&
                        <TextInput
                            name='dt_prox_pagamento'
                            onChange={handleChange}
                            value={(billToPayData?.dt_prox_pagamento)?.split('T')[0] || ''}
                            type="date"
                            label='Proximo vencimento'
                            sx={{ width: 250 }} />}
                </ContentContainer>
            }

            {bill === '02' &&
                <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                    <Box>
                        <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Despesa</Text>
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput placeholder='Empresa/Fornecedor' name='empresa_paga' onChange={handleChange} value={billToPayData?.empresa_paga || ''} label='Empresa/Fornecedor' sx={{ flex: 1, }} />
                        <TextInput placeholder='Data do vencimento' name='dt_vencimento' onChange={handleChange} value={(billToPayData?.dt_vencimento)?.split('T')[0] || ''} type="date" label='Data do vencimento' sx={{ flex: 1, }} />
                        <TextInput
                            placeholder='0.00'
                            name='valor_desp_f'
                            type="coin"
                            onChange={handleChange}
                            value={(billToPayData?.valor_desp_f) || ''}
                            label='Valor Total' sx={{ flex: 1, }}
                        // onBlur={() => calculationValues(pricesCourseData)}
                        />
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput placeholder='Descrição/Observação' name='descricao_desp_f' onChange={handleChange} value={billToPayData?.descricao_desp_f || ''} label='Descrição/Observação' sx={{}} />
                        <SelectList fullWidth data={groupStatus} valueSelection={billToPayData?.status} onSelect={(value) => setBillToPayData({ ...billToPayData, status: value })}
                            title="Status do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                </ContentContainer>
            }

            {bill === '03' &&
                <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                    <Box>
                        <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do pagamento</Text>
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput placeholder='Nome' name='nome_disciplina' onChange={handleChange} value={billToPayData?.nome_disciplina || ''} label='Nome' sx={{ flex: 1, }} />
                        <TextInput placeholder='Data da Criação' name='dt_criacao' onChange={handleChange} value={(billToPayData?.dt_criacao)?.split('T')[0] || ''} type="date" label='Data da Criação' sx={{ flex: 1, }} />
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput placeholder='Carga Horária' name='carga_hr_dp' onChange={handleChange} value={billToPayData?.carga_hr_dp || ''} label='Carga Horária' sx={{}} />
                    </Box>

                </ContentContainer>
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
    }
}