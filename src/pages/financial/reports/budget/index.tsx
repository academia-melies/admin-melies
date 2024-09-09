import React, { useEffect, useState } from "react";
import { Box, Divider, Text } from "../../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { CircularProgress } from "@mui/material";
import HeaderFilters from "./Components/Header/HeaderFilters";
import TableReport from "./Components/Tables/TableReport";
import { Account, CostCenter, DataFilters, TypesAccount } from "../expenses";

export interface FiltersField {
    year: number | string | null
}

export interface TableData {
    id: number;
    categoria: string | null
    previsto_jan: number
    real_jan: number
    previsto_fev: number
    real_fev: number
    subCategoria: string | null
    previsto_mar: number
    real_mar: number
    previsto_abr: number
    real_abr: number
    previsto_mai: number
    real_mai: number
    previsto_jun: number
    real_jun: number
    previsto_jul: number
    real_jul: number
    previsto_ago: number
    real_ago: number
    previsto_set: number
    real_set: number
    previsto_out: number
    real_out: number
    previsto_nov: number
    real_nov: number
    previsto_dez: number
    real_dez: number
    centro_custos?: TableData[]
}


export default function BudgetDre() {
    const [reportData, setReportData] = useState<TableData[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [filterAbaData, setFilterAbaData] = useState<string>('relatorio_geral')
    const [filtersField, setFiltersField] = useState<FiltersField>({
        year: '2024'
    })


    const { colorPalette, alert } = useAppContext()

    const fetchReportData: () => Promise<void> = async () => {
        setLoadingData(true)
        try {
            const response = await api.get('/report/financial/budget/dre', {
                params: {
                    year: filtersField.year,
                    page: 1,
                    limit: 100,
                }
            });

            console.log(response)

            setReportData(response.data);
        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
        } finally {
            setLoadingData(false)
        }
    };

    const exportToExcel = async (budget: TableData[]): Promise<void> => {
        // Cria uma nova planilha de trabalho
        const workbook = XLSX.utils.book_new();

        // Converte os dados para o formato de planilha
        const budgetSheet = XLSX.utils.json_to_sheet(budget);

        // Adiciona as planilhas ao livro
        XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Relatório - DRE');

        // Gera o arquivo Excel
        XLSX.writeFile(workbook, 'report.xlsx');

        alert.info('Relatórios exportados.')
    };

    return (
        <>
            <SectionHeader title="Relatório DRE - Budget" />
            <Box sx={{ ...styles.sectionContainer, backgroundColor: colorPalette.secondary, }}>
                <HeaderFilters
                    filtersField={filtersField}
                    setFiltersField={setFiltersField}
                    fetchReportData={fetchReportData}
                    setReportData={setReportData}
                />
                <Divider distance={0} />
                {loadingData &&
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress />
                    </Box>}
                {reportData.length > 0 ?
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
                                }} onClick={() => exportToExcel(reportData)} />
                            </Box>
                        </Box>
                        {filterAbaData === 'relatorio_geral' && <TableReport data={reportData} />}
                        <Box sx={styles.boxValueTotally}>
                            <Text title light>Total: </Text>
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