import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader, Table_V1 } from "../../../../../organisms"
import { useAppContext } from "../../../../../context/AppContext"
import { SelectList } from "../../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../../helpers"
import { icons } from "../../../../../organisms/layout/Colors"
import { checkUserPermissions } from "../../../../../validators/checkPermissionUser"

export default function EditRecurrencyExpenses(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id } = router.query;
    const newBill = id === 'new';
    const [recurrencyExpense, setRecurrencyExpense] = useState({})
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


    const getRecurrencyExpense = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/expense/recurrency/${id}`);
            const { data } = response;

            if (data) {
                let valueData = data?.valor;

                if (valueData !== undefined) {
                    valueData = Number(data?.valor).toFixed(2);
                    setRecurrencyExpense({
                        ...data,
                        valor: formatValue(valueData)
                    });
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
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
        listCostCenter()
        listAccounts()
        listAccountTypes()
    }, [])

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
            await getRecurrencyExpense()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Despesa')
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

            setRecurrencyExpense((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setRecurrencyExpense((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!recurrencyExpense.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }


    const handleCreate = async () => {

        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/expense/recurrency/create/${usuario_id}`, { recurrencyExpense });
                const { success } = response?.data
                if (success) {
                    alert.success('Recorrência cadastrada.');
                    router.push(`/financial/billsToPay/expenses/list`)
                } else {
                    alert.error('Ocorreu um erro ao criar Recorrência.')
                    router.push(`/financial/billsToPay/expenses/list`)
                }
            } catch (error) {
                console.log(error)
                alert.error('Tivemos um problema ao cadastrar a Recorrência.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/expense/recurrency/delete/${id}`)
            if (response?.status == 200) {
                alert.success('Recorrência excluída com sucesso.');
                router.push(`/financial/billsToPay/expenses/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Recorrência.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/expense/recurrency/update/${id}`, { recurrencyExpense })
                if (response?.status === 200) {
                    alert.success('Recorrência atualizada com sucesso.');
                    await handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Recorrência.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Recorrência.');
            } finally {
                setLoading(false)
            }
        }
    }

    const groupRecorrency = [
        { label: 'Semanal', value: 7 },
        // { label: 'Quinzenal', value: 15 },
        { label: 'Mensal', value: 31 },
        // { label: 'Trismestral', value: 90 },
        // { label: 'Semestral', value: 182 },
        { label: 'Anual', value: 365 }
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


    // const columnExpense = [
    //     { key: 'id_historico_desp', label: 'ID' },
    //     { key: 'vl_reajuste_desp', label: 'R$ Reajuste', price: true },
    //     { key: 'dt_reajuste', label: 'Data do reajuste', date: true },
    //     { key: 'obs_reajuste_desp', label: 'Observações' },
    // ];


    return (
        <>
            <SectionHeader
                title={recurrencyExpense?.descricao || `Nova Despesa Recorrente`}
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
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição' name='descricao' onChange={handleChange} value={recurrencyExpense?.descricao || ''} label='Descrição:' sx={{ flex: 1 }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Dia do Vencimento' name='dia_vencimento' onChange={handleChange} value={recurrencyExpense?.dia_vencimento || ''} type="number" label='Dia do Vencimento:' sx={{ width: 150, }} />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='0.00'
                        name='valor'
                        type="coin"
                        onChange={handleChange}
                        value={(recurrencyExpense?.valor) || ''}
                        label='Valor Total'
                    // onBlur={() => calculationValues(pricesCourseData)}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={groupRecorrency} valueSelection={recurrencyExpense?.recorrencia} onSelect={(value) => setRecurrencyExpense({ ...recurrencyExpense, recorrencia: value })}
                        title="Recorrência: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList} valueSelection={recurrencyExpense?.tipo} onSelect={(value) => setRecurrencyExpense({ ...recurrencyExpense, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={recurrencyExpense?.centro_custo} onSelect={(value) => setRecurrencyExpense({ ...recurrencyExpense, centro_custo: value })}
                        title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <TextInput disabled={!isPermissionEdit && true} placeholder='Observação' name='observacao' onChange={handleChange} value={recurrencyExpense?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={4} />

                <Box sx={{
                    display: 'flex', gap: 4, alignItems: 'center', marginTop: 2, marginLeft: 1,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado por:</Text>
                        <Text>{recurrencyExpense?.responsavel || '-'}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado em:</Text>
                        <Text>{formatTimeStamp(recurrencyExpense?.dt_criacao, true)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Ultima atualização:</Text>
                        <Text>{formatTimeStamp(recurrencyExpense?.dt_atualizacao, true)}</Text>
                    </Box>
                </Box>
            </ContentContainer>

            {/* <ContentContainer style={{ ...styles.containerRegister, padding: showHistoric ? '40px' : '25px' }}>
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
            </ContentContainer> */}

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