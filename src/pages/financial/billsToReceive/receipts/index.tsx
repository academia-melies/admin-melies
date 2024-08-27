import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Divider, Text } from "../../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { CircularProgress } from "@mui/material";
import HeaderFilters from "./Components/Header/HeaderFilters";
import TableInstallments from "./Tables/TableInstallments";

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
    const [filterAbaData, setFilterAbaData] = useState<string>('relatorio_geral')
    const [accountList, setAccountList] = useState<DataFilters[]>([])
    const [typesList, setTypesList] = useState<DataFilters[]>([])
    const [costCenterList, setCostCenterList] = useState<DataFilters[]>([])
    const [coursesList, setUsersList] = useState<DataFilters[]>([])
    const [filtersField, setFiltersField] = useState<FiltersField>({
        forma_pagamento: '',
        tipo_data: '',
        data: '',
        startDate: '',
        endDate: ''
    })
    const [installmentsSelected, setInstallmentsSelected] = useState<string | null>(null);
    const [allSelected, setAllSelected] = useState(null);
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(0);

    const { colorPalette, alert } = useAppContext()

    const fetchReportData: ({ page, limit }: FetcherData) => Promise<void> = async ({ page = 0, limit = 20 }: FetcherData) => {
        if (filtersField.startDate && filtersField.endDate) {
            setLoadingData(true)
            try {
                const response = await api.get('/student/installments/filters', {
                    params: {
                        date: {
                            startDate: filtersField.startDate,
                            endDate: filtersField.endDate
                        },
                        paymentForm: filtersField.forma_pagamento,
                        page: page || 0, // exemplo
                        limit: limit || 20,    // exemplo
                        dateType: filtersField.tipo_data
                    }
                });

                console.log(response)
                const { data, total, totalPages, currentPage } = response.data
                if (data.length > 0) {


                    const groupIds = data.map((ids: Installments) => ids?.id_parcela_matr).join(',');
                    setAllSelected(groupIds)
                    setInstallments(data.map((item: Installments) => {
                        const valorDesp = typeof item.valor_liquido === 'string' ? parseFloat(item.valor_liquido) : item.valor_liquido
                        return {
                            ...item,
                            valor_liquido: valorDesp ? item.valor_liquido : valorDesp
                        }
                    }))

                    setInstallmentsDetails({total, totalPages, currentPage})
                }

            } catch (error) {
                console.error('Erro ao buscar dados do relatório:', error);
            } finally {
                setLoadingData(false)
            }
        } else {
            alert.info('Antes de avançar, preencha as datas.')
        }
    };

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
                        <Box sx={styles.headerFilterTwo}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ ...styles.filterField, borderBottom: filterAbaData === 'relatorio_geral' && `1px solid ${colorPalette.buttonColor}` }}
                                    onClick={() => setFilterAbaData('relatorio_geral')}>
                                    <Text bold={filterAbaData === 'relatorio_geral'}>Relatório Geral</Text>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Text bold>Exportar relatório: </Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 20,
                                    height: 20,
                                    backgroundImage: `url('/icons/sheet.png')`,
                                    transition: '.3s',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => exportToExcel(installmentsList)} />
                            </Box>
                        </Box>
                        {filterAbaData === 'relatorio_geral' &&
                            <TableInstallments
                                data={installmentsList}
                                installmentsSelected={installmentsSelected}
                                allSelected={allSelected}
                                setInstallmentsSelected={setInstallmentsSelected}
                                setData={setInstallments}
                                setLimit={setLimit}
                                limit={limit}
                                page={page}
                                setPage={setPage}
                                fetchReportData={fetchReportData}
                                installmentsDetails={installmentsDetails}
                            />
                        }
                        <Box sx={styles.boxValueTotally}>
                            <Text title light>Total Pendente: </Text>
                            <Text title bold>{formatReal(calculationTotal(installmentsList))}</Text>
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
        justifyContent: 'center',
        gap: 2,
        minHeight: 50,
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