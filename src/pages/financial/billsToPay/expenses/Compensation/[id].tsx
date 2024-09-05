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

interface CompensationProps {
    setShow: Dispatch<SetStateAction<boolean>>
    fetchData: () => void
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

export interface Users {
    nome: string
    perfil: string | null;
    id: string;
    area: string | null;
    ativo: number
}

export interface CompensationDataProps {
    usuario_id: string | null
    dia_pagamento: string | null
    valor_bruto: string | null
    valor_liquido: string | null
    tipo: string | null
    centro_custo: string | null
    usuario_resp: string | null
    dt_criacao: string | null
    dt_atualizacao: string | null
}

const Compensation = ({ setShow, fetchData }: CompensationProps) => {
    const [compensationData, setCompensationData] = useState<CompensationDataProps>({
        usuario_id: '',
        dia_pagamento: '',
        valor_bruto: '',
        valor_liquido: '',
        tipo: '',
        centro_custo: '',
        usuario_resp: '',
        dt_criacao: '',
        dt_atualizacao: ''
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const { user, alert, colorPalette } = useAppContext()
    const [accountTypesList, setAccountTypesList] = useState<DataFilters[]>([])
    const [usersList, setUsers] = useState<DataFilters[]>([])
    const [costCenterList, setCostCenterList] = useState<DataFilters[]>([])


    const fetchFilters = async () => {
        const [costCenterResponse, typesResponse, usersReponse] =
            await Promise.all([
                api.get<CostCenter[]>(`/costCenters`),
                api.get<TypesAccount[]>(`/account/types`),
                api.get<Users[]>(`/users/employee`),
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

        const usersData = usersReponse.data
        const groupEmployee = usersData?.filter(item => item.ativo === 1)?.sort((a, b) => a.nome.localeCompare(b.nome))?.map(employee => ({
            label: employee.nome,
            value: employee?.id
        }));

        setUsers(groupEmployee)
    };

    useEffect(() => {
        fetchFilters()
    }, [])

    const handleCreateRecurrencyCompensation = async () => {
        try {
            setLoadingData(true)
            const response = await api.post(`/expense/compensation/recurrency/create`,
                { compensationData, userResp: user?.id })

            const { success } = response.data

            if (success) {
                alert.success('Salário recorrente cadastrado.');
                setShow(false)
                setCompensationData({
                    usuario_id: '',
                    dia_pagamento: '',
                    valor_bruto: '',
                    valor_liquido: '',
                    tipo: '',
                    centro_custo: '',
                    usuario_resp: '',
                    dt_criacao: '',
                    dt_atualizacao: ''
                })
                await fetchData()
            } else {
                alert.error('Erro ao cadastrar salário recorrente.');
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {

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

            setCompensationData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setCompensationData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    return (
        <ContentContainer sx={{ zIndex: 9999 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                <Text bold large>Novo Salário Recorrente</Text>
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
                    setCompensationData({
                        usuario_id: '',
                        dia_pagamento: '',
                        valor_bruto: '',
                        valor_liquido: '',
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

            {<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={styles.inputSection}>
                    <SelectList onFilter filterValue="label" fullWidth data={usersList} valueSelection={compensationData?.usuario_id} onSelect={(value: string) => setCompensationData({ ...compensationData, usuario_id: value })}
                        title="Funcionário(a)" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput
                        name='dia_pagamento'
                        onChange={handleChange}
                        value={(compensationData?.dia_pagamento) || ''}
                        type="number"
                        label='Dia de Pagamento'
                        sx={{ flex: 1, }}
                    />
                    <TextInput
                        placeholder='0.00'
                        name='valor_bruto'
                        type="coin"
                        onChange={handleChange}
                        value={(compensationData?.valor_bruto) || ''}
                        label='Salário Bruto' sx={{ flex: 1, }}
                    />
                    <TextInput
                        placeholder='0.00'
                        name='valor_liquido'
                        type="coin"
                        onChange={handleChange}
                        value={(compensationData?.valor_liquido) || ''}
                        label='Salário Líquido' sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start' }}>
                    <SelectList fullWidth data={accountTypesList} valueSelection={compensationData?.tipo} onSelect={(value: string) => setCompensationData({ ...compensationData, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={costCenterList} valueSelection={compensationData?.centro_custo} onSelect={(value: string) => setCompensationData({ ...compensationData, centro_custo: value })}
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
                        <Text>{usersList?.filter(item => item.value === compensationData?.usuario_resp)?.map(item => item.label)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Criado em:</Text>
                        <Text>{formatTimeStamp(compensationData?.dt_criacao, true)}</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Text bold>Ultima atualização:</Text>
                        <Text>{formatTimeStamp(compensationData?.dt_atualizacao, true)}</Text>
                    </Box>
                </Box>
            </Box>}

            <Divider />
            <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button text="Salvar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => handleCreateRecurrencyCompensation()} />

                <Button cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        setShow(false)
                        setCompensationData({
                            usuario_id: '',
                            dia_pagamento: '',
                            valor_bruto: '',
                            valor_liquido: '',
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
    },
}

export default Compensation