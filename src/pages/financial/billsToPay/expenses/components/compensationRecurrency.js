import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../../../atoms"
import { SectionHeader } from "../../../../../organisms"
import { useAppContext } from "../../../../../context/AppContext"
import { SelectList } from "../../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../../helpers"
import { checkUserPermissions } from "../../../../../validators/checkPermissionUser"


 const CompensationRecurrencyDetails = ({
    compensationRecurrency, setCompensationRecurrency
}) => {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, padronizado } = router.query;
    const newBill = id === 'new';
    const [accountTypesList, setAccountTypesList] = useState([])
    const [usersList, setUsers] = useState([])
    const [costCenterList, setCostCenterList] = useState([])
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


    const formatValue = (value) => {
        const rawValue = String(value);
        let intValue = rawValue.split('.')[0] || '0'; // Parte inteira
        const decimalValue = rawValue.split('.')[1]?.padEnd(2, '0') || '00'; // Parte decimal
        const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
        return formattedValue;
    }


    useEffect(() => {
        fetchPermissions()
        listUsers()
        listCostCenter()
        listAccountTypes()
    }, [])

    async function listUsers() {
        const response = await api.get(`/users/employee`)
        const { data } = response
        const groupEmployee = data?.filter(item => item.ativo === 1)?.sort((a, b) => a.nome.localeCompare(b.nome))?.map(employee => ({
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


    const handleChange = async (event) => {

        if (event.target.name === 'valor_bruto' || event.target.name === 'valor_liquido') {
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

            setCompensationRecurrency((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setCompensationRecurrency((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!compensationRecurrency.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }


    const handleCreate = async () => {

        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/expense/personal/create/${usuario_id}`, { compensationRecurrency });
                if (response?.status === 201) {
                    alert.success('Pagamento cadastrado.');
                    router.push(`/financial/billsToPay/payroll/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o Pagamento.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/expense/personal/${id}`)
            if (response?.status == 200) {
                alert.success('Pagamento excluído com sucesso.');
                router.push(`/financial/billsToPay/payroll/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Pagamento.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/expense/personal/update/${id}`, { compensationRecurrency, userId: usuario_id })
                if (response?.status === 200) {
                    alert.success('Pagamento atualizado com sucesso.');
                    return
                }
                alert.error('Tivemos um problema ao atualizar Pagamento.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Pagamento.');
            } finally {
                setLoading(false)
            }
        }
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                title={`Novo Pagamento Recorrente`}
                saveButton={isPermissionEdit}
                saveButtonAction={newBill ? handleCreate : handleEdit}
                deleteButton={!newBill && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={styles.inputSection}>
                    <SelectList onFilter filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={usersList} valueSelection={compensationRecurrency?.usuario_id} onSelect={(value) => setCompensationRecurrency({ ...compensationRecurrency, usuario_id: value })}
                        title="Funcionário(a)" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput disabled={!isPermissionEdit && true}
                        name='dia_pagamento'
                        onChange={handleChange}
                        value={(compensationRecurrency?.dia_pagamento) || ''}
                        type="number"
                        label='Dia de Pagamento'
                        sx={{ flex: 1, }}
                    />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='0.00'
                        name='valor_bruto'
                        type="coin"
                        onChange={handleChange}
                        value={(compensationRecurrency?.valor_bruto) || ''}
                        label='Salário Bruto' sx={{ flex: 1, }}
                    />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='0.00'
                        name='valor_liquido'
                        type="coin"
                        onChange={handleChange}
                        value={(compensationRecurrency?.valor_liquido) || ''}
                        label='Salário Líquido' sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start' }}>
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList} valueSelection={compensationRecurrency?.tipo} onSelect={(value) => setCompensationRecurrency({ ...compensationRecurrency, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={compensationRecurrency?.centro_custo} onSelect={(value) => setCompensationRecurrency({ ...compensationRecurrency, centro_custo: value })}
                        title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>

                <Box sx={{
                    display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, marginLeft: 1,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado por:</Text>
                        <Text>{usersList?.filter(item => item.value === compensationRecurrency?.usuario_resp)?.map(item => item.label)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado em:</Text>
                        <Text>{formatTimeStamp(compensationRecurrency?.dt_criacao, true)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Ultima atualização:</Text>
                        <Text>{formatTimeStamp(compensationRecurrency?.dt_atualizacao, true)}</Text>
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

export default CompensationRecurrencyDetails