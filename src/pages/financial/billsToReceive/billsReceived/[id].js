import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from "../../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../../atoms"
import { SectionHeader } from "../../../../organisms"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../helpers"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"

export default function EditBillsReceived(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, bill } = router.query;
    const newReceived = id === 'new';
    const [receivedData, setReceivedData] = useState({})
    const [usersList, setUsers] = useState([])
    const [costCenterList, setCostCenterList] = useState([])
    const [accountTypesList, setAccountTypesList] = useState([])
    const [accountList, setAccountList] = useState([])
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


    const getReceiveds = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/received/${id}`);
            const { data } = response;
            if (data) {
                setReceivedData({
                    ...data,
                    valor: isNaN(data?.valor) ? data?.valor : data?.valor.toFixed(2)
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            if (newReceived) {
                return
            }
            await handleItems();
        })();
    }, [bill])

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
        const groupCostCenter = data?.filter(item => newReceived ? item.ativo === 1 : item)?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));

        setCostCenterList(groupCostCenter)
    }



    async function listAccountTypes() {
        const response = await api.get(`/account/types`)
        const { data } = response
        const groupCostCenter = data?.filter(item => newReceived ? item.ativo === 1 : item)?.map(cc => ({
            label: cc.nome_tipo,
            value: cc?.id_tipo
        }));

        setAccountTypesList(groupCostCenter)
    }


    async function listAccounts() {
        const response = await api.get(`/accounts`)
        const { data } = response
        const groupCostCenter = data?.filter(item => newReceived ? item.ativo === 1 : item)?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupCostCenter)
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            await getReceiveds()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = async (event) => {

        if (event.target.name === 'valor') {
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

            setReceivedData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setReceivedData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!received.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }


    const handleCreate = async () => {

        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/received/create/${usuario_id}`, { receivedData });
                if (response?.status === 201) {
                    alert.success('Recebimento Lançado.');
                    router.push(`/financial/billsToReceive/billsReceived`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao lançar o Recebimento.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/received/delete/${id}`)
            if (response?.status == 200) {
                alert.success('Recebido excluído com sucesso.');
                router.push(`/financial/billsToReceive/billsReceived`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o recebimento.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/received/update/${id}`, { receivedData, userId: usuario_id })
                if (response?.status === 200) {
                    alert.success('Recebimento atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Recebimento.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Recebimento.');
            } finally {
                setLoading(false)
            }
        }
    }


    const groupStatus = [
        { label: 'Pago', value: 'Pago' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Cancelado', value: 'Cancelado' }
    ]

    const groupFormPayment = [
        { label: 'Transferência Bancária', value: 'Transferência Bancária' },
        { label: 'Dinheiro', value: 'Dinheiro' },
        { label: 'Cartão de crédito', value: 'Cartão de crédito' },
        { label: 'Cheque', value: 'Cheque' },
        { label: 'Pix', value: 'Pix' },
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Outros', value: 'Outros' }
    ]


    return (
        <>
            <SectionHeader
                title={receivedData?.descricao || `Novo Recebimento`}
                perfil={'recebimento'}
                saveButton={isPermissionEdit}
                saveButtonAction={newReceived ? handleCreate : handleEdit}
                deleteButton={!newReceived && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Recebimento</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição' name='descricao' onChange={handleChange} value={receivedData?.descricao || ''} label='Descrição:' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data de Vencimento' name='dt_pagamento' onChange={handleChange} value={(receivedData?.dt_pagamento)?.split('T')[0] || ''} type="date" label='Data de Vencimento:' />
                </Box>
                <TextInput disabled={!isPermissionEdit && true} placeholder='Observação' name='observacao' onChange={handleChange} value={receivedData?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={4} />
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='0.00'
                        name='valor'
                        type="coin"
                        onChange={handleChange}
                        value={(receivedData?.valor) || ''}
                        label='Valor Total:' sx={{ flex: 1, }}
                    />
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList} valueSelection={receivedData?.tipo} onSelect={(value) => setReceivedData({ ...receivedData, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>

                <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start' }}>
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={groupStatus} valueSelection={receivedData?.status} onSelect={(value) => {
                        setReceivedData({ ...receivedData, status: value })
                    }}
                        title="Status do Recebimento:" filterOpition="value" sx={{ color: colorPalette.textColor, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    {receivedData?.status === 'Pago' &&
                        <>
                            <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={receivedData?.conta_recebimento} onSelect={(value) => setReceivedData({ ...receivedData, conta_recebimento: value })}
                                title="Conta de Recebimento:" filterOpition="value" sx={{ color: colorPalette.textColor }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                             <SelectList fullWidth disabled={!isPermissionEdit && true} data={groupFormPayment} valueSelection={receivedData?.forma_pagamento} onSelect={(value) => setReceivedData({ ...receivedData, forma_pagamento: value })}
                                title="Forma de Pagamento:" filterOpition="value" sx={{ color: colorPalette.textColor }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <TextInput disabled={!isPermissionEdit && true}
                                name='dt_baixa'
                                onChange={handleChange}
                                value={(receivedData?.dt_baixa)?.split('T')[0] || ''}
                                type="date"
                                label='Data da Baixa:'
                                sx={{ width: 250 }} />
                        </>
                    }
                </Box>

                <Box sx={{
                    display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, marginLeft: 1,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado por:</Text>
                        <Text>{usersList?.filter(item => item.value === receivedData?.usuario_resp)?.map(item => item.label)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado em:</Text>
                        <Text>{formatTimeStamp(receivedData?.dt_criacao, true)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Ultima atualização:</Text>
                        <Text>{formatTimeStamp(receivedData?.dt_atualizacao, true)}</Text>
                    </Box>
                </Box>
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