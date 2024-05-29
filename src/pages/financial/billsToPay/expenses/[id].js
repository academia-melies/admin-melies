import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader, Table_V1 } from "../../../../organisms"
import { useAppContext } from "../../../../context/AppContext"
import { createDiscipline, deleteDiscipline, editDiscipline } from "../../../../validators/api-requests"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../helpers"
import { icons } from "../../../../organisms/layout/Colors"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"

export default function EditExpenses(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id } = router.query;
    const newBill = id === 'new';
    const [billToPayData, setBillToPayData] = useState({
        status: 'Pendente'
    })
    const [newReadjustment, setNewReadjustment] = useState(0)
    const [showHistoric, setShowHistoric] = useState(false)
    const [listHistoric, setListHistoric] = useState([])
    const [usersList, setUsers] = useState([])
    const [costCenterList, setCostCenterList] = useState([])
    const [accountTypesList, setAccountTypesList] = useState([])
    const [accountList, setAccountList] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getBillToPay = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/expense/${id}`);
            const { data } = response;

            if (data) {
                let valueData = data?.valor_desp;

                if (valueData !== undefined) {
                    valueData = Number(data?.valor_desp).toFixed(2);
                    setBillToPayData({
                        ...data,
                        valor_desp: formatValue(valueData)
                    });
                }
            }
            await handleHistoric()

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleHistoric = async () => {
        try {
            const historic = await api.get(`/expense/historic/${id}`);
            if (historic?.data) {
                setListHistoric(historic?.data)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const formatValue = (value) => {
        const rawValue = String(value);
        let intValue = rawValue.split('.')[0] || '0'; // Parte inteira
        const decimalValue = rawValue.split('.')[1]?.padEnd(2, '0') || '00'; // Parte decimal
        const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
        return formattedValue;
    }


    useEffect(() => {
        (async () => {
            if (newBill) {
                return
            }
            await handleItems();
        })();
    }, [])

    useEffect(() => {
        fetchPermissions()
        listUsers()
        listCostCenter()
        listAccounts()
        listAccountTypes()
    }, [])

    async function listUsers() {
        const response = await api.get(`/users`)
        const { data } = response
        const groupEmployee = data?.map(employee => ({
            label: employee.nome,
            value: employee?.id
        }));

        setUsers(groupEmployee)
    }

    async function listCostCenter() {
        const response = await api.get(`/costCenters`)
        const { data } = response
        const groupCostCenter = data?.filter(item => newBill ? item.ativo === 1 : item)?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));

        setCostCenterList(groupCostCenter)
    }



    async function listAccountTypes() {
        const response = await api.get(`/account/types`)
        const { data } = response
        const groupCostCenter = data?.filter(item => newBill ? item.ativo === 1 : item)?.map(cc => ({
            label: cc.nome_tipo,
            value: cc?.id_tipo
        }));

        setAccountTypesList(groupCostCenter)
    }


    async function listAccounts() {
        const response = await api.get(`/accounts`)
        const { data } = response
        const groupCostCenter = data?.filter(item => newBill ? item.ativo === 1 : item)?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupCostCenter)
    }

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

        if (event.target.name === 'valor_desp' || event.target.name === 'vl_pagamento') {
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


    const handleCreate = async () => {

        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/expense/create/${usuario_id}`, { billToPayData });
                const { status } = response?.data
                if (status?.expense && status?.historic) {
                    alert.success('Despesa cadastrada.');
                    router.push(`/financial/billsToPay/expenses/list`)
                } else {
                    alert.error('Ocorreu um erro ao criar Despesa ou Registrar o hitórico.')
                    router.push(`/financial/billsToPay/expenses/list`)
                }
            } catch (error) {
                console.log(error)

                alert.error('Tivemos um problema ao cadastrar a Despesa.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/expense/delete/${id}`)
            if (response?.status == 200) {
                alert.success('Despesa excluída com sucesso.');
                router.push(`/financial/billsToPay/expenses/list`)
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
                const response = await api.patch(`/expense/update/${id}`, { billToPayData, userId: usuario_id, obs_reajuste: billToPayData?.obs_reajuste_desp })
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
        if (billToPayData?.recorrencia > 1 && billToPayData?.dt_vencimento) {
            calculateNextDate(billToPayData?.dt_vencimento)
        } else {
            setBillToPayData({ ...billToPayData, dt_prox_pagamento: '' })
        }
    }, [billToPayData?.dt_vencimento, billToPayData?.recorrencia])


    const groupStatus = [
        { label: 'Pago', value: 'Pago' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Cancelado', value: 'Cancelado' }
    ]


    const groupType = [
        { label: 'Pagamento', value: 'Pagamento' },
        { label: 'Benefícios', value: 'Benefícios' },
        { label: 'Taxas e tarífas', value: 'Taxas e tarifas' },
        { label: 'Outros', value: 'Outros' }
    ]

    const groupRecorrency = [
        { label: 'Não recorrente', value: 1 },
        { label: 'Semanal', value: 7 },
        { label: 'Quinzenal', value: 15 },
        { label: 'Mensal', value: 31 },
        { label: 'Trismestral', value: 90 },
        { label: 'Semestral', value: 182 },
        { label: 'Anual', value: 365 }
    ]

    const groupTypePayment = [
        { label: 'Salário', value: 'Salário' },
        { label: 'Bônus', value: 'Bônus' },
        { label: '13º Salário', value: '13º Salário' },
        { label: 'Férias', value: 'Férias' },
    ]


    const groupReadjustment = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
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


    const columnExpense = [
        { key: 'id_historico_desp', label: 'ID' },
        { key: 'vl_reajuste_desp', label: 'R$ Reajuste', price: true },
        { key: 'dt_reajuste', label: 'Data do reajuste', date: true },
        { key: 'obs_reajuste_desp', label: 'Observações' },
    ];


    return (
        <>
            <SectionHeader
                title={billToPayData?.descricao || `Nova Despesa`}
                perfil={'Despesa'}
                saveButton={isPermissionEdit}
                saveButtonAction={newBill ? handleCreate : handleEdit}
                deleteButton={!newBill && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })}
            />

            {/* Despesas */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Despesa</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição' name='descricao' onChange={handleChange} value={billToPayData?.descricao || ''} label='Descrição:' sx={{flex: 1}} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data do vencimento' name='dt_vencimento' onChange={handleChange} value={(billToPayData?.dt_vencimento)?.split('T')[0] || ''} type="date" label='Data do vencimento:' sx={{ width: 250, }} />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='0.00'
                        name='valor_desp'
                        type="coin"
                        onChange={handleChange}
                        value={(billToPayData?.valor_desp) || ''}
                        label='Valor Total'
                    // onBlur={() => calculationValues(pricesCourseData)}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    {newBill && <TextInput disabled={!isPermissionEdit && true} placeholder='Nº Lançamentos' name='n_lancamento' onChange={handleChange} value={billToPayData?.n_lancamento || ''} type="number" label='Nº Lançamentos:' sx={{ width: 150, }} />}
                    {newBill && <TextInput disabled={!isPermissionEdit && true} placeholder='Dia de Pagamento' name='dia_pagamento' onChange={handleChange} value={billToPayData?.dia_pagamento || ''} type="number" label='Dia de Pagamento:' sx={{ width: 150, }} />}
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={groupRecorrency} valueSelection={billToPayData?.recorrencia} onSelect={(value) => setBillToPayData({ ...billToPayData, recorrencia: value })}
                        title="Recorrência: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <TextInput disabled={!isPermissionEdit && true} placeholder='Observação' name='observacao' onChange={handleChange} value={billToPayData?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={4} />
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList} valueSelection={billToPayData?.tipo} onSelect={(value) => setBillToPayData({ ...billToPayData, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={billToPayData?.centro_custo} onSelect={(value) => setBillToPayData({ ...billToPayData, centro_custo: value })}
                        title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nº NF-e' name='n_nfe' onChange={handleChange} value={billToPayData?.n_nfe || ''} label='Nº NF-e' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true}
                        name='dt_nfe'
                        onChange={handleChange}
                        value={(billToPayData?.dt_nfe)?.split('T')[0] || ''}
                        type="date"
                        label='Data da NF-e'
                        sx={{ width: 250 }} />
                </Box>

                <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start' }}>
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={groupStatus} valueSelection={billToPayData?.status} onSelect={(value) => {
                        setBillToPayData({ ...billToPayData, status: value })
                    }}
                        title="Status do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    {billToPayData?.status === 'Pago' &&
                        <>
                            <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={billToPayData?.conta_pagamento} onSelect={(value) => setBillToPayData({ ...billToPayData, conta_pagamento: value })}
                                title="Conta do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <TextInput disabled={!isPermissionEdit && true}
                                name='dt_pagamento'
                                onChange={handleChange}
                                value={(billToPayData?.dt_pagamento)?.split('T')[0] || ''}
                                type="date"
                                label='Data de Pagamento'
                                sx={{ width: 250 }} />
                        </>
                    }
                </Box>

                {(billToPayData?.recorrencia > 1 && billToPayData?.dt_vencimento) &&
                    <TextInput disabled={!isPermissionEdit && true}
                        name='dt_prox_pagamento'
                        onChange={handleChange}
                        value={(billToPayData?.dt_prox_pagamento)?.split('T')[0] || ''}
                        type="date"
                        label='Data prevista prox pagamento'
                        sx={{ width: 250 }} />
                }

                <RadioItem disabled={!isPermissionEdit && true} valueRadio={newReadjustment} group={groupReadjustment} title="Reajuste de valor:" horizontal={true}
                    onSelect={(value) => {
                        setNewReadjustment(parseInt(value))
                    }} />


                {newReadjustment === 1 &&
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Observação de ajuste'
                        name='obs_reajuste_desp'
                        onChange={handleChange}
                        value={billToPayData?.obs_reajuste_desp || ''}
                        label='Observação de ajuste'
                        sx={{}}
                        multiline
                        rows={4} />
                }

                <Box sx={{
                    display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, marginLeft: 1,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado por:</Text>
                        <Text>{usersList?.filter(item => item.value === billToPayData?.usuario_resp)?.map(item => item.label)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado em:</Text>
                        <Text>{formatTimeStamp(billToPayData?.dt_criacao, true)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Ultima atualização:</Text>
                        <Text>{formatTimeStamp(billToPayData?.dt_atualizacao, true)}</Text>
                    </Box>
                </Box>
            </ContentContainer>
            {/* //Folha de pagamento */}

            <ContentContainer style={{ ...styles.containerRegister, padding: showHistoric ? '40px' : '25px' }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, padding: showHistoric ? '0px 0px 20px 0px' : '0px', "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    },
                    justifyContent: 'space-between'
                }} onClick={() => setShowHistoric(!showHistoric)}>
                    <Text title bold >Histórico de Valores</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transform: showHistoric ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: '.3s',
                    }} />
                </Box>
                {showHistoric &&
                    <>
                        {listHistoric ?
                            <Table_V1 isPermissionEdit={isPermissionEdit} data={listHistoric} columns={columnExpense}
                                columnId={'id_historico_desp'} columnActive={false} center routerPush={false} tolltip={false} />
                            :
                            <Box sx={{ alignItems: 'start', justifyContent: 'start', display: 'flex' }}>
                                <Text light>Não encontramos histórico de valores</Text>
                            </Box>
                        }
                    </>
                }
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