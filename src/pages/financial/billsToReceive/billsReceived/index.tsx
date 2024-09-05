import React, { useEffect, useState } from "react";
import { Box, ButtonIcon, Divider, Text } from "../../../../atoms";
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { CircularProgress } from "@mui/material";
import HeaderFilters from "./Compontes/Header/HeaderFilters";
import TableReceiveds from "./Compontes/Tables/TableReceiveds";
import { checkUserPermissions } from "../../../../validators/checkPermissionUser";
import { useRouter } from "next/router";

export interface DataFilters {
    label: string | null
    value: number | string | null
}

export interface FiltersField {
    tipo_data: string | null
    data: string | null
    startDate: string | null
    endDate: string | null
    search: string | null
    account: string | null
    costCenter: string | null
}

export interface Account {
    nome_conta: string | null
    id_conta: string | null
    ativo: number
}

export interface CostCenter {
    nome_cc: string | null
    id_centro_custo: string | null
    ativo: number
}

export interface Receiveds {
    id_recebiveis: string | null,
    descricao: string | null
    centro_custo_id: string | null
    dt_pagamento: string | null
    dt_baixa: string | null
    valor: number | string | null
    status: string | null
    conta: string | null
    conta_id: string | number | null
}

export interface FetcherData {
    page?: number
    limit?: number
}

export interface ReceivedDetails {
    total: number,
    totalPages: number,
    currentPage: number
}

export default function Receiveds() {
    const [receivedList, setReceived] = useState<Receiveds[]>([])
    const [receivedDetails, setReceivedDetails] = useState<ReceivedDetails>({
        total: 0,
        totalPages: 0,
        currentPage: 1
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [accountList, setAccountList] = useState<DataFilters[]>([])
    const [costCenterList, setCostCenterList] = useState<DataFilters[]>([])
    const [filtersField, setFiltersField] = useState<FiltersField>({
        tipo_data: '',
        data: '',
        startDate: '',
        endDate: '',
        search: '',
        account: '',
        costCenter: '',
    })
    const [receivedSelected, setReceivedSelected] = useState<string | null>(null);
    const [receivedSelectedExclude, setReceivedSelectedExclude] = useState<string | null>(null);
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(0);
    const [isPermissionEdit, setIsPermissionEdit] = useState<boolean>(false)
    const router = useRouter()
    const { userPermissions, menuItemsList } = useAppContext()

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const { colorPalette, alert, setLoading, user } = useAppContext()

    const fetchReportData: ({ page, limit }: FetcherData) => Promise<void> = async ({ page = 0, limit = 20 }: FetcherData) => {

        setLoadingData(true)
        try {
            const response = await api.get('/receiveds/filters', {
                params: {
                    date: {
                        startDate: filtersField.startDate,
                        endDate: filtersField.endDate
                    },
                    search: filtersField.search,
                    page: page || 0, // exemplo
                    limit: limit || 20,    // exemplo
                    dateType: filtersField.tipo_data,
                    account: filtersField.account,
                    costCenter: filtersField.costCenter
                }
            });

            const { data, total, totalPages, currentPage } = response.data
            if (data.length > 0) {
                console.log(data)
                setReceived(data.map((item: Receiveds) => {
                    const value = typeof item.valor === 'string' ? formatterLiquidValue(parseFloat(item.valor)) : formatterLiquidValue(item.valor)
                    return {
                        ...item,
                        valor: value
                    }
                }))

                setReceivedDetails({ total, totalPages, currentPage })
            } else {
                setReceived(data)
                setReceivedDetails({ total, totalPages, currentPage })
            }

        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
        } finally {
            setLoadingData(false)
        }
    };

    const formatterLiquidValue = (value: number | null) => {

        if (value === null) return '';

        // Converte o valor para número com precisão suficiente
        const numberValue = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(numberValue)) return '';

        // Converte o valor para string com 2 casas decimais
        const valueString = numberValue.toFixed(2);

        // Separa a parte inteira e a parte decimal
        const [integerPart, decimalPart] = valueString.split('.');

        // Adiciona o separador de milhares
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Formata o valor com a parte decimal
        const formattedValue = `${formattedIntegerPart},${decimalPart}`;

        return formattedValue;
    }


    const fetchFilters = async () => {
        const [costCenterResponse, accountsResponse] = await Promise.all([
            api.get<CostCenter[]>(`/costCenters`),
            api.get<Account[]>(`/accounts`),
        ])

        const costCenterData = costCenterResponse.data
        const groupCostCenter = costCenterData?.filter(item => item.ativo === 1)?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));

        setCostCenterList(groupCostCenter)

        const accountsData = accountsResponse.data
        const groupAccounts = accountsData?.filter(item => item.ativo === 1)?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupAccounts)
    }

    useEffect(() => {
        fetchPermissions()
        fetchFilters()
    }, [])

    const calculationTotal = (data: Receiveds[]): number => {
        const total = data
            .map(item => {
                if (typeof item.valor === 'number') {
                    return item.valor
                } else if (typeof item.valor === 'string') {
                    const numericValue = parseFloat(item.valor.replace(/\./g, '').replace(',', '.'));
                    return isNaN(numericValue) ? 0 : numericValue;
                }
                return 0
            })
            .reduce((acc, curr) => acc + curr, 0);
        return total;
    }

    const handleUpdateReceived = async () => {
        if (receivedSelected || receivedSelectedExclude) {
            try {
                setLoading(true)
                let statusOk = false

                const isToUpdate = receivedSelected && receivedSelected.split(',').map(id => parseInt(id.trim(), 10));
                const receivedsSelected = isToUpdate && receivedList?.filter(item => item.id_recebiveis && isToUpdate.includes(parseInt(item.id_recebiveis)))
                const isToCancel = receivedSelectedExclude && receivedSelectedExclude.split(',').map(id => parseInt(id.trim(), 10));
                if (isToCancel && isToCancel?.length > 0) {
                    for (let idDelte of isToCancel) {
                        const response = await api.delete(`/received/delete/${idDelte}`)
                        const { success } = response?.data
                        if (success) {
                            statusOk = true
                        }
                    }
                }

                if (receivedsSelected && receivedsSelected.length > 0) {
                    for (let received of receivedsSelected) {
                        const response = await api.patch(`/received/update-process`, { received, userRespId: user.id })
                        const { success } = response?.data
                        if (success) {
                            statusOk = true
                        }
                    }
                }

                if (statusOk) {
                    alert.success('Todas os recebimentos foram atualizados.');
                    setReceivedSelected(null);
                    setReceivedSelectedExclude(null)
                    fetchReportData({ page, limit })
                    return
                } else {
                    alert.error('Tivemos um problema ao atualizar recebimentos.');
                }
            } catch (error) {
                alert.error('Tivemos um problema no servidor.');
                console.log(error)
                return error

            } finally {
                setLoading(false)
            }
            setLoading(false)
        } else {
            alert.info('Selecione os recebimentos que desejam atualizar.')
        }
    }

    return (
        <>
            <SectionHeader title="Lançamento de Recebíveis" />
            <Box sx={{ ...styles.sectionContainer, backgroundColor: colorPalette.secondary, }}>
                <HeaderFilters
                    filtersField={filtersField}
                    setFiltersField={setFiltersField}
                    fetchReportData={fetchReportData}
                    setReceived={setReceived}
                    costCenterList={costCenterList}
                    accountList={accountList}
                    isPermissionEdit={isPermissionEdit}
                />
                <Divider distance={0} />
                {loadingData &&
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress />
                    </Box>
                }
                {receivedList.length > 0 ?
                    <Box sx={{ opacity: loadingData ? .6 : 1 }}>
                        <TableReceiveds
                            data={receivedList}
                            receivedSelected={receivedSelected}
                            receivedSelectedExclude={receivedSelectedExclude}
                            setReceivedSelected={setReceivedSelected}
                            setReceivedSelectedExclude={setReceivedSelectedExclude}
                            setData={setReceived}
                            setLimit={setLimit}
                            limit={limit}
                            page={page}
                            setPage={setPage}
                            fetchReportData={fetchReportData}
                            receivedDetails={receivedDetails}
                            accountList={accountList}
                            costCentersList={costCenterList}
                        />

                        <Box sx={styles.boxValueTotally}>
                            <ButtonIcon text="Processar" icon={'/icons/process.png'} color="#fff" onClick={() => handleUpdateReceived()} />
                            <Box>
                                <Text title light>Total: </Text>
                                <Text title bold>{formatReal(calculationTotal(receivedList))}</Text>
                            </Box>
                        </Box>
                    </Box>
                    :
                    <Box sx={{ ...styles.emptyData, opacity: loadingData ? .6 : 1, }}>
                        <Text bold small light>Nenhum Dados.</Text>
                        <Text large light>Pesquise ultilizando os filtros acima.</Text>
                        <Box sx={styles.noResultsImage} />
                    </Box>}
            </Box>
        </>
    )
}


const styles = {
    sectionContainer: {
        display: 'flex',
        gap: 2,
        borderRadius: 2,
        flexDirection: 'column',
        border: `1px solid lightgray`
    },
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 15,
        height: 15,
    },
    iconFilter: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ascpectRatio: '1/1',
        width: 16,
        height: 16,
        backgroundImage: `url(/icons/filter.png)`,
    },
    filterButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 15px',
        borderRadius: 2,
        border: '1px solid lightgray',
        transition: '.3s',
        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        }
    },
    containerFiltered: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 15px',
        borderRadius: 2,
        border: '1px solid lightgray',
    },
    containerFilter: {
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
        padding: '12px 20px',
        border: `1px solid lightgray`,
        position: 'absolute', top: 45, left: 0,
        zIndex: 9999
    },
    filterField: {
        display: 'flex',
        gap: 2,
        padding: '8px 5px',
        '&:hover': {
            opacity: .8,
            cursor: 'pointer'
        }
    },
    boxValueTotally: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        gap: 3,
        minHeight: 60,
        padding: '15px 20px',
        alignItems: 'center'
    },
    headerFilterTwo: {
        display: 'flex',
        gap: 2,
        borderBottom: `1px solid #ccc`,
        width: '100%',
        margin: '15px 0px',
        padding: '0px 15px',
        justifyContent: 'space-between'
    },
    emptyData: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noResultsImage: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 350, height: 250,
        backgroundImage: `url('/background/no_results.png')`,
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        heigth: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
}