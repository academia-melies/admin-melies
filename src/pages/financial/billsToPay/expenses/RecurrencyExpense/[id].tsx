import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../../../../../atoms";
import { icons } from "../../../../../organisms/layout/Colors";
import { api } from "../../../../../api/api";
import { useAppContext } from "../../../../../context/AppContext";
import { SelectList } from "../../../../../organisms";
import { TextInput } from "../../../../../atoms";
import { formatTimeStamp } from "../../../../../helpers";
import { DataFilters } from "..";
import { CircularProgress } from "@mui/material";
import { EditRecurrency } from "./RecurrencyExpenses";

interface RecurrencyExpenseProps {
    setShow: Dispatch<SetStateAction<boolean>>
    fetchData: () => void
    show: boolean
    id?: string | null
    setEditRecurrency: Dispatch<SetStateAction<EditRecurrency>>
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
    descricao: string | null
    recorrencia: string | null
    dia_vencimento: string | null
    valor: string | null
    tipo: string | null
    centro_custo: string | null
    usuario_resp: string | null
    dt_criacao: string | null
    dt_atualizacao: string | null
}

const RecurrencyExpenseDetails = ({ setShow, show, fetchData, id, setEditRecurrency }: RecurrencyExpenseProps) => {
    const [recurrencyExpense, setRecurrencyExpense] = useState<ExpenseDataProps>({
        recorrencia: '',
        descricao: '',
        dia_vencimento: '',
        valor: '',
        tipo: '',
        centro_custo: '',
        usuario_resp: '',
        dt_criacao: '',
        dt_atualizacao: ''
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const { user, alert, colorPalette } = useAppContext()
    const [accountTypesList, setAccountTypesList] = useState<DataFilters[]>([])
    const [accountList, setAccountList] = useState<DataFilters[]>([])
    const [costCenterList, setCostCenterList] = useState<DataFilters[]>([])
    const newBill = id ? false : true;

    console.log(id)
    console.log(newBill)

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

    const getRecurrencyExpense = async () => {
        setLoadingData(true);
        try {
            const response = await api.get(`/expense/recurrency/${id}`);
            const { data } = response;

            if (data) {
                const value =
                    typeof data.valor === "string"
                        ? formatterLiquidValue(parseFloat(data.valor))
                        : formatterLiquidValue(data.valor);
                setRecurrencyExpense({ ...data, valor: value })
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoadingData(false);
        }
    }

    const formatterLiquidValue = (value: number | null) => {
        if (value === null) return "";
        // Converte o valor para número com precisão suficiente
        const numberValue = typeof value === "string" ? parseFloat(value) : value;

        if (isNaN(numberValue)) return "";

        // Converte o valor para string com 2 casas decimais
        const valueString = numberValue.toFixed(2);

        // Separa a parte inteira e a parte decimal
        const [integerPart, decimalPart] = valueString.split(".");

        // Adiciona o separador de milhares
        const formattedIntegerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            "."
        );

        // Formata o valor com a parte decimal
        const formattedValue = `${formattedIntegerPart},${decimalPart}`;

        return formattedValue;
    };

    useEffect(() => {
        fetchFilters()
        if (!newBill) {
            getRecurrencyExpense()
        }
    }, [show])

    const handleCreate = async () => {
        try {
            setLoadingData(true)
            const response = await api.post(`/expense/recurrency/create/${user?.id}`, { recurrencyExpense });

            const { success } = response.data

            if (success) {
                alert.success('Recorrência cadastrada.');
                setShow(false)
                setEditRecurrency({ active: false, data: null })
                setRecurrencyExpense({
                    recorrencia: '',
                    descricao: '',
                    dia_vencimento: '',
                    valor: '',
                    tipo: '',
                    centro_custo: '',
                    usuario_resp: '',
                    dt_criacao: '',
                    dt_atualizacao: ''
                })
                await fetchData()
            } else {
                alert.error('Erro ao cadastrar despesa recorrente.');
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    const handleEdit = async () => {
        setLoadingData(true)
        try {
            const response = await api.patch(`/expense/recurrency/update/${id}`, { recurrencyExpense })
            if (response?.status === 200) {
                alert.success('Recorrência atualizada com sucesso.');
                setShow(false)
                setEditRecurrency({ active: false, data: null })
                setRecurrencyExpense({
                    recorrencia: '',
                    descricao: '',
                    dia_vencimento: '',
                    valor: '',
                    tipo: '',
                    centro_custo: '',
                    usuario_resp: '',
                    dt_criacao: '',
                    dt_atualizacao: ''
                })
                await fetchData()
                return
            }
            alert.error('Tivemos um problema ao atualizar Recorrência.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Recorrência.');
        } finally {
            setLoadingData(false)
        }
    }

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {

        if (event.target.name === 'valor') {
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


    const groupRecorrency = [
        { label: 'Semanal', value: 7 },
        { label: 'Mensal', value: 31 },
        { label: 'Anual', value: 365 }
    ]

    return (
        <ContentContainer sx={{ zIndex: 9999 }}>
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center',
            }}>
                <Text bold large>Nova Despesa Recorrente</Text>
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
                    setEditRecurrency({ active: false, data: null })
                    setRecurrencyExpense({
                        recorrencia: '',
                        descricao: '',
                        dia_vencimento: '',
                        valor: '',
                        tipo: '',
                        centro_custo: '',
                        usuario_resp: '',
                        dt_criacao: '',
                        dt_atualizacao: ''
                    })
                }} />
            </Box>
            <Divider distance={0} />

            {loadingData && (
                <Box sx={styles.loadingContainer}>
                    <CircularProgress />
                </Box>
            )}

            {<Box sx={{ opacity: loadingData ? 0.6 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={styles.inputSection}>
                    <TextInput
                        placeholder='Descrição'
                        name='descricao'
                        onChange={handleChange}
                        value={recurrencyExpense?.descricao || ''}
                        label='Descrição:'
                        sx={{ flex: 1 }}
                    />
                    <TextInput
                        name='dia_vencimento'
                        onChange={handleChange}
                        value={(recurrencyExpense?.dia_vencimento) || ''}
                        type="number"
                        label='Dia do Vencimento'
                        sx={{ flex: 1, }}
                    />
                    <TextInput
                        placeholder='0.00'
                        name='valor'
                        type="coin"
                        onChange={handleChange}
                        value={(recurrencyExpense?.valor) || ''}
                        label='Valor Total' sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start' }}>
                    <SelectList fullWidth data={groupRecorrency} valueSelection={recurrencyExpense?.recorrencia} onSelect={(value: string) => setRecurrencyExpense({ ...recurrencyExpense, recorrencia: value })}
                        title="Recorrência: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={accountTypesList} valueSelection={recurrencyExpense?.tipo} onSelect={(value: string) => setRecurrencyExpense({ ...recurrencyExpense, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={costCenterList} valueSelection={recurrencyExpense?.centro_custo} onSelect={(value: string) => setRecurrencyExpense({ ...recurrencyExpense, centro_custo: value })}
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
                        <Text>{accountList?.filter(item => item.value === recurrencyExpense?.usuario_resp)?.map(item => item.label)}</Text>
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
            </Box>}

            <Divider />
            <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button text="Salvar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        if (newBill) {
                            handleCreate()
                        } else {
                            handleEdit()
                        }
                    }} />

                <Button cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        setShow(false)
                        setEditRecurrency({ active: false, data: null })
                        setRecurrencyExpense({
                            recorrencia: '',
                            descricao: '',
                            dia_vencimento: '',
                            valor: '',
                            tipo: '',
                            centro_custo: '',
                            usuario_resp: '',
                            dt_criacao: '',
                            dt_atualizacao: ''
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

export default RecurrencyExpenseDetails