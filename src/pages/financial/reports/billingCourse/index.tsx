import React, { useState } from "react";
import { Box, Divider, Text } from "../../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { CircularProgress } from "@mui/material";
import HeaderFilters from "./Components/Header/HeaderFilters";
import TableReport from "./Components/Tables/TableReport";
import TableReportClass from "./Components/Tables/TableReportClass";
import TableReportCourse from "./Components/Tables/TableReportCourse";

export interface FiltersField {
    forma_pagamento: string | null
    status: string | null
    tipo_data: string | null
    data: string | null
    startDate: string | null
    endDate: string | null
}

export interface Installments {
    id: string | number | null,
    usuario_id: string | number | null
    resp_pagante_id: string | number | null
    vencimento: string | null
    dt_pagamento: string | null
    valor: number | null
    n_parcela: string | number | null
    forma_pagamento: string | null
    obs_pagamento: string | null
    observacao: string | null
    status: string | null
    conta: string | null
    c_custo: string | null
    nome_curso: string | null
    nome_turma: string | null
    aluno: string | null
    responsavel: string | null
}

export interface InstallmentsCourse {
    valor: number | null
    nome_curso: string | null
}

export interface InstallmentsClasses {
    valor: number | null
    nome_turma: string | null
}

export default function BillingCourses() {
    const [reportData, setReportData] = useState<Installments[]>([])
    const [reportClass, setReportClass] = useState<InstallmentsClasses[]>([])
    const [reportCourse, setReportCourse] = useState<InstallmentsCourse[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [filterAbaData, setFilterAbaData] = useState<string>('relatorio_geral')
    const [filtersField, setFiltersField] = useState<FiltersField>({
        forma_pagamento: '',
        status: '',
        tipo_data: '',
        data: '',
        startDate: '',
        endDate: ''
    })

    const { colorPalette, alert } = useAppContext()

    const fetchReportData: () => Promise<void> = async () => {
        if (filtersField.startDate && filtersField.endDate) {
            setLoadingData(true)
            try {
                const response = await api.get('/report/financial/billing/course', {
                    params: {
                        date: {
                            startDate: filtersField.startDate,
                            endDate: filtersField.endDate
                        },
                        paymentForm: filtersField.forma_pagamento,
                        status: filtersField.status,
                        page: 1, // exemplo
                        limit: 100,    // exemplo
                        dateType: filtersField.tipo_data
                    }
                });
                const { installments, forCourseData, forClassData } = response.data

                setReportData(installments);
                setReportCourse(forCourseData)
                setReportClass(forClassData)
            } catch (error) {
                console.error('Erro ao buscar dados do relatório:', error);
            } finally {
                setLoadingData(false)
            }
        } else {
            alert.info('Antes de avançar, preencha as datas.')
        }
    };

    const exportToExcel = async (installments: Installments[], forCourseData: any[], forClassData: any[]): Promise<void> => {
        // Cria uma nova planilha de trabalho
        const workbook = XLSX.utils.book_new();

        // Converte os dados para o formato de planilha
        const installmentsSheet = XLSX.utils.json_to_sheet(installments);
        const courseSheet = XLSX.utils.json_to_sheet(forCourseData);
        const classSheet = XLSX.utils.json_to_sheet(forClassData);

        // Adiciona as planilhas ao livro
        XLSX.utils.book_append_sheet(workbook, installmentsSheet, 'Installments');
        XLSX.utils.book_append_sheet(workbook, courseSheet, 'Course Data');
        XLSX.utils.book_append_sheet(workbook, classSheet, 'Class Data');

        // Gera o arquivo Excel
        XLSX.writeFile(workbook, 'report.xlsx');

        alert.info('Relatórios exportados.')
    };


    const calculationTotal = (data: Installments[]): number => {
        const total = data
            .map(item => {
                return typeof item.valor === 'number' ? item.valor : 0
            })
            .reduce((acc, curr) => acc + curr, 0)
        return total
    }

    return (
        <>
            <SectionHeader title="Relatório de Faturamento" />
            <Box sx={{ ...styles.sectionContainer, backgroundColor: colorPalette.secondary, }}>
                <HeaderFilters
                    filtersField={filtersField}
                    setFiltersField={setFiltersField}
                    fetchReportData={fetchReportData}
                    setReportData={setReportData}
                    setReportCourse={setReportCourse}
                    setReportClass={setReportClass}
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

                                <Box sx={{ ...styles.filterField, borderBottom: filterAbaData === 'relatorio_turma' && `1px solid ${colorPalette.buttonColor}` }}
                                    onClick={() => setFilterAbaData('relatorio_turma')}>
                                    <Text bold={filterAbaData === 'relatorio_turma'}>Relatório por Turma</Text>
                                </Box>

                                <Box sx={{ ...styles.filterField, borderBottom: filterAbaData === 'relatorio_curso' && `1px solid ${colorPalette.buttonColor}` }}
                                    onClick={() => setFilterAbaData('relatorio_curso')}>
                                    <Text bold={filterAbaData === 'relatorio_curso'}>Relatório por Curso</Text>
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
                                }} onClick={() => exportToExcel(reportData, reportCourse, reportClass)} />
                            </Box>
                        </Box>
                        {filterAbaData === 'relatorio_geral' && <TableReport data={reportData} />}
                        {filterAbaData === 'relatorio_turma' && <TableReportClass data={reportClass} />}
                        {filterAbaData === 'relatorio_curso' && <TableReportCourse data={reportCourse} />}
                        <Box sx={styles.boxValueTotally}>
                            <Text title light>Total {filtersField.status}: </Text>
                            <Text title bold>{formatReal(calculationTotal(reportData))}</Text>
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