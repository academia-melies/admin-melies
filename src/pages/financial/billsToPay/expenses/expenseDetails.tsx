import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../../../../atoms";
import { icons } from "../../../../organisms/layout/Colors";
import { api } from "../../../../api/api";
import { useAppContext } from "../../../../context/AppContext";
import { SelectList } from "../../../../organisms";
import { TextInput } from "../../../../atoms";
import { DataFilters, FetcherData } from "../expenses";
import { CircularProgress } from "@mui/material";

interface expenseDataProps {
    setShow: Dispatch<SetStateAction<boolean>>
    fetchData: ({ page, limit }: FetcherData) => Promise<void>
}


export interface TypesAccount {
    nome_tipo: string | null;
    id_tipo: string | null;
    ativo: number;
}

export interface CostCenter {
    nome_cc: string;
    id_centro_custo: string;
    ativo: number;
}

export interface Account {
    nome_conta: string
    id_conta: string;
    ativo: number
}

export interface ExpenseDataProps {
    recorrencia: string | null
    descricao: string | null
    valor_desp: string | number | null
    dt_vencimento: string | null
    n_lancamento: number | null
    dia_pagamento: number | null
    observacao: string | null
    tipo: string | null
    centro_custo: string | null
    n_nfe: string | null
    dt_nfe: string | null
}

const ExpenseDetails = ({ setShow, fetchData }: expenseDataProps) => {
    const [expenseData, setExpenseData] = useState<ExpenseDataProps>({
        recorrencia: '',
        descricao: '',
        valor_desp: '',
        dt_vencimento: '',
        n_lancamento: null,
        dia_pagamento: null,
        observacao: '',
        tipo: '',
        centro_custo: '',
        n_nfe: '',
        dt_nfe: ''
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const { user, alert, colorPalette } = useAppContext()
    const [accountTypesList, setAccountTypesList] = useState<DataFilters[]>([])
    const [accountList, setAccountList] = useState<DataFilters[]>([])
    const [costCenterList, setCostCenterList] = useState<DataFilters[]>([])

    const fetchFilters = async () => {
        const [costCenterResponse, typesResponse, accountResponse] =
            await Promise.all([
                api.get<CostCenter[]>(`/costCenters`),
                api.get<TypesAccount[]>(`/account/types`),
                api.get<Account[]>(`/accounts`),
            ]);

        const costCenterData = costCenterResponse.data;
        const groupCostCenter = costCenterData
            ?.filter((item) => item.ativo === 1)
            ?.map((cc) => ({
                label: cc.nome_cc || '',
                value: cc?.id_centro_custo || '',
            }));

        setCostCenterList(groupCostCenter);

        const typesData = typesResponse.data;
        const groupTypes = typesData
            ?.filter((item) => item.ativo === 1)
            ?.map((cc) => ({
                label: cc.nome_tipo || "",
                value: cc?.id_tipo,
            }));
        setAccountTypesList(groupTypes);

        const usersData = accountResponse.data
        const groupAccount = usersData?.filter(item => item.ativo === 1)?.sort((a, b) => a.nome_conta.localeCompare(b.nome_conta))?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupAccount)
    };

    useEffect(() => {
        fetchFilters()
    }, [])

    const handleCreate = async () => {
        try {
            setLoadingData(true)
            const response = await api.post(`/expense/create/${user?.id}`, { billToPayData: expenseData });

            const { success } = response.data

            if (success?.expense) {
                alert.success('Despesa cadastrada.');
                setShow(false)
                setExpenseData({
                    recorrencia: '',
                    descricao: '',
                    valor_desp: '',
                    dt_vencimento: '',
                    n_lancamento: null,
                    dia_pagamento: null,
                    observacao: '',
                    tipo: '',
                    centro_custo: '',
                    n_nfe: '',
                    dt_nfe: ''
                })
                await fetchData({})
            } else {
                alert.error('Erro ao cadastrar despesa.');
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {

        if (event.target.name === 'valor_desp') {
            const rawValue = event.target.value.replace(/[^\d]/g, '');

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

            setExpenseData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setExpenseData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }


    const groupRecorrency = [
        { label: 'Não recorrente', value: 1 },
        { label: 'Semanal', value: 7 },
        { label: 'Mensal', value: 31 },
        { label: 'Anual', value: 365 }
    ]

    return (
        <ContentContainer sx={{ zIndex: 9999 }}>
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center',
            }}>
                <Text bold large>Nova Despesa</Text>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url(${icons.gray_close})`,
                    transition: '.3s',
                    zIndex: 99999,
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => {
                    setShow(false)
                    setExpenseData({
                        recorrencia: '',
                        descricao: '',
                        valor_desp: '',
                        dt_vencimento: '',
                        n_lancamento: null,
                        dia_pagamento: null,
                        observacao: '',
                        tipo: '',
                        centro_custo: '',
                        n_nfe: '',
                        dt_nfe: ''
                    })
                }} />
            </Box>
            <Divider distance={0} />

            {loadingData && (
                <Box sx={styles.loadingContainer}>
                    <CircularProgress />
                </Box>
            )}

            <Box sx={{ opacity: loadingData ? 0.6 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Descrição' name='descricao' onChange={handleChange} value={expenseData?.descricao || ''} label='Descrição:' sx={{ flex: 1 }} />
                    <TextInput placeholder='Data do vencimento' name='dt_vencimento' onChange={handleChange} value={(expenseData?.dt_vencimento)?.split('T')[0] || ''} type="date" label='Data do vencimento:' sx={{ width: 250, }} />
                    <TextInput
                        placeholder='0.00'
                        name='valor_desp'
                        type="coin"
                        onChange={handleChange}
                        value={(expenseData?.valor_desp) || ''}
                        label='Valor Total'
                    // onBlur={() => calculationValues(pricesCourseData)}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nº Lançamentos' name='n_lancamento' onChange={handleChange} value={expenseData?.n_lancamento || ''} type="number" label='Nº Lançamentos:' sx={{ width: 150, }} />
                    <TextInput placeholder='Dia de Pagamento' name='dia_pagamento' onChange={handleChange} value={expenseData?.dia_pagamento || ''} type="number" label='Dia de Pagamento:' sx={{ width: 150, }} />
                    <SelectList fullWidth data={groupRecorrency} valueSelection={expenseData?.recorrencia} onSelect={(value: string) => setExpenseData({ ...expenseData, recorrencia: value })}
                        title="Recorrência: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <TextInput placeholder='Observação' name='observacao' onChange={handleChange} value={expenseData?.observacao || ''} label='Observação:' sx={{ flex: 1, }} multiline rows={4} />
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={accountTypesList} valueSelection={expenseData?.tipo} onSelect={(value: string) => setExpenseData({ ...expenseData, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={costCenterList} valueSelection={expenseData?.centro_custo} onSelect={(value: string) => setExpenseData({ ...expenseData, centro_custo: value })}
                        title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nº NF-e' name='n_nfe' onChange={handleChange} value={expenseData?.n_nfe || ''} label='Nº NF-e' sx={{ flex: 1, }} />
                    <TextInput
                        name='dt_nfe'
                        onChange={handleChange}
                        value={(expenseData?.dt_nfe)?.split('T')[0] || ''}
                        type="date"
                        label='Data da NF-e'
                        sx={{ width: 250 }} />
                </Box>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button text="Salvar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        handleCreate()
                    }} />

                <Button cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        setShow(false)
                        setExpenseData({
                            recorrencia: '',
                            descricao: '',
                            valor_desp: '',
                            dt_vencimento: '',
                            n_lancamento: null,
                            dia_pagamento: null,
                            observacao: '',
                            tipo: '',
                            centro_custo: '',
                            n_nfe: '',
                            dt_nfe: ''
                        })
                    }} />
            </Box>
        </ContentContainer>
    )
}

const styles = {
    menuIcon: {
        backgroundSize: 'contain',
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
    },
    loadingContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        heigth: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 999999
    },
}

export default ExpenseDetails