import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, ButtonIcon, Divider, Text } from "../../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { CircularProgress } from "@mui/material";
import HeaderFilters from "./Components/Header/HeaderFilters";
import TableInstallments from "./Components/Tables/TableInstallments";

export interface DataFilters {
    label: string | null
    value: number | string | null
}

export interface FiltersField {
    forma_pagamento: string | null
    tipo_data: string | null
    data: string | null
    startDate: string | null
    endDate: string | null
    search: string | null
}

export interface Account {
    nome_conta: string | null
    id_conta: string | null
    ativo: number
}

export interface TypesAccount {
    nome_tipo: string | null
    id_tipo: string | null
    ativo: number
}

export interface CostCenter {
    nome_cc: string | null
    id_centro_custo: string | null
    ativo: number
}

export interface Users {
    perfil: string | null
    nome: string | null
    id: string
    area: string | null
}

export interface Installments {
    id_parcela_matr: string | null,
    usuario_id: string | number | null
    responsavel_pagante: string | number | null
    vencimento: string | null
    dt_pagamento: string | null
    dt_baixa: string | null
    valor_parcela: number | null
    n_parcela: string | number | null
    forma_pagamento: string | null
    referenceId: string | null
    valor_liquido: number | null
    status_parcela: string | null
    conta: string | null
    conta_id: string | number | null
    c_custo: string | null
    nome_curso: string | null
    nome_turma: string | null
    modulo: number | null
    aluno: string | null
    cobranca_emitida: string
}

export interface FetcherData {
    page?: number
    limit?: number
}

export interface InstallmentsDetails {
    total: number,
    totalPages: number,
    currentPage: number
}

export default function Installments() {
    const [installmentsList, setInstallments] = useState<Installments[]>([])
    const [installmentsDetails, setInstallmentsDetails] = useState<InstallmentsDetails>({
        total: 0,
        totalPages: 0,
        currentPage: 1
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [accountList, setAccountList] = useState<DataFilters[]>([])
    const [typesList, setTypesList] = useState<DataFilters[]>([])
    const [costCenterList, setCostCenterList] = useState<DataFilters[]>([])
    const [coursesList, setUsersList] = useState<DataFilters[]>([])
    const [filtersField, setFiltersField] = useState<FiltersField>({
        forma_pagamento: '',
        tipo_data: '',
        data: '',
        startDate: '',
        endDate: '',
        search: ''
    })
    const [installmentsSelected, setInstallmentsSelected] = useState<string | null>(null);
    const [installmentsSelectedExclude, setInstallmentsSelectedExclude] = useState<string | null>(null);
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(0);

    const { colorPalette, alert, setLoading, user } = useAppContext()

    const fetchReportData: ({ page, limit }: FetcherData) => Promise<void> = async ({ page = 0, limit = 20 }: FetcherData) => {

        setLoadingData(true)
        try {
            const response = await api.get('/student/installments/filters', {
                params: {
                    date: {
                        startDate: filtersField.startDate,
                        endDate: filtersField.endDate
                    },
                    paymentForm: filtersField.forma_pagamento,
                    search: filtersField.search,
                    page: page || 0, // exemplo
                    limit: limit || 20,    // exemplo
                    dateType: filtersField.tipo_data
                }
            });

            const { data, total, totalPages, currentPage } = response.data
            if (data.length > 0) {
                console.log(data)
                setInstallments(data.map((item: Installments) => {
                    const value = typeof item.valor_liquido === 'string' ? parseFloat(item.valor_liquido) : item.valor_liquido
                    return {
                        ...item,
                        valor_liquido: value ? formatterLiquidValue(item.valor_liquido) : value
                    }
                }))

                setInstallmentsDetails({ total, totalPages, currentPage })
            } else {
                setInstallments(data)
                setInstallmentsDetails({ total, totalPages, currentPage })
            }

        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
        } finally {
            setLoadingData(false)
        }
    };

    const formatterLiquidValue = (value: number | null) => {

        console.log(value)
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

    const exportToExcel = async (installments: Installments[]): Promise<void> => {
        // Cria uma nova planilha de trabalho
        const workbook = XLSX.utils.book_new();

        // Converte os dados para o formato de planilha
        const installmentsSheet = XLSX.utils.json_to_sheet(installments);

        // Adiciona as planilhas ao livro
        XLSX.utils.book_append_sheet(workbook, installmentsSheet, 'Installments');
        // Gera o arquivo Excel
        XLSX.writeFile(workbook, 'report.xlsx');

        alert.info('Relatórios exportados.')
    };


    const fetchFilters = async () => {
        const [costCenterResponse, accountsResponse, typesResponse, usesResponse] = await Promise.all([
            api.get<CostCenter[]>(`/costCenters`),
            api.get<Account[]>(`/accounts`),
            api.get<TypesAccount[]>(`/account/types`),
            api.get<Users[]>(`/users`),
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

        const typesData = typesResponse.data
        const groupTypes = typesData?.filter(item => item.ativo === 1)?.map(cc => ({
            label: cc.nome_tipo || '',
            value: cc?.id_tipo
        }));
        setTypesList(groupTypes)


        const usersData = usesResponse.data
        const groupUserBy = usersData?.filter(item => item.perfil?.includes('aluno'))?.map(responsible => ({
            label: responsible.nome,
            value: responsible?.id,
            area: responsible?.area
        }));

        setUsersList(groupUserBy)
    }

    useEffect(() => {
        fetchFilters()
    }, [])

    const calculationTotal = (data: Installments[]): number => {
        const total = data
            .map(item => {
                return typeof item.valor_parcela === 'number' ? item.valor_parcela : 0
            })
            .reduce((acc, curr) => acc + curr, 0)
        return total
    }

    const handleUpdateInstallments = async () => {
        if (installmentsSelected || installmentsSelectedExclude) {
            try {
                setLoading(true)
                let statusOk = false

                const isToUpdate = installmentsSelected && installmentsSelected.split(',').map(id => parseInt(id.trim(), 10));
                const installmentSelect = isToUpdate && installmentsList?.filter(item => item.id_parcela_matr && isToUpdate.includes(parseInt(item.id_parcela_matr)))
                const isToCancel = installmentsSelectedExclude && installmentsSelectedExclude.split(',').map(id => parseInt(id.trim(), 10));
                if (isToCancel && isToCancel?.length > 0) {
                    const response = await api.post(`/student/installment/cancel`, { isToCancel })
                    const { status } = response?.data
                    if (status) {
                        statusOk = true
                    }
                }

                if (installmentSelect && installmentSelect.length > 0) {
                    for (let installment of installmentSelect) {
                        const response = await api.patch(`/student/installment/updateProcess`, { installment, userRespId: user.id })
                        const { success } = response?.data
                        if (success) {
                            statusOk = true
                        }
                    }
                }

                if (statusOk) {
                    alert.success('Todas as parcelas foram atualizadas.');
                    setInstallmentsSelected(null);
                    setInstallmentsSelectedExclude(null)
                    fetchReportData({ page, limit })
                    return
                }
                alert.error('Tivemos um problema ao atualizar parcelas.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar parcelas.');
                console.log(error)
                return error

            } finally {
                setLoading(false)
            }
            setLoading(false)
        } else {
            alert.info('Selecione as parcelas que desejam atualizar.')
        }
    }

    return (
        <>
            <SectionHeader title="Contas a Receber - Curso" />
            <Box sx={{ ...styles.sectionContainer, backgroundColor: colorPalette.secondary, }}>
                <HeaderFilters
                    filtersField={filtersField}
                    setFiltersField={setFiltersField}
                    fetchReportData={fetchReportData}
                    setInstallments={setInstallments}
                />
                <Divider distance={0} />
                {loadingData &&
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress />
                    </Box>}
                {installmentsList.length > 0 ?
                    <Box sx={{ opacity: loadingData ? .6 : 1 }}>
                        <TableInstallments
                            data={installmentsList}
                            installmentsSelected={installmentsSelected}
                            installmentsSelectedExclude={installmentsSelectedExclude}
                            setInstallmentsSelected={setInstallmentsSelected}
                            setInstallmentsSelectedExclude={setInstallmentsSelectedExclude}
                            setData={setInstallments}
                            setLimit={setLimit}
                            limit={limit}
                            page={page}
                            setPage={setPage}
                            fetchReportData={fetchReportData}
                            installmentsDetails={installmentsDetails}
                            accountList={accountList}
                        />

                        <Box sx={styles.boxValueTotally}>
                            <ButtonIcon text="Processar" icon={'/icons/process.png'} color="#fff" onClick={() => handleUpdateInstallments()} />
                            <Box>
                                <Text title light>Total Pendente: </Text>
                                <Text title bold>{formatReal(calculationTotal(installmentsList))}</Text>
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