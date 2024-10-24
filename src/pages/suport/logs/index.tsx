import React, { useEffect, useState } from "react";
import { Box, Divider, Text } from "../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../context/AppContext";
import { SectionHeader } from "../../../organisms";
import { api } from "../../../api/api";
import { CircularProgress } from "@mui/material";
import TableReport from "./Components/Tables/TableReport";
import HeaderFilters from "./Components/Header/HeaderFilters";

export interface FiltersField {
    startDate: string | null
    endDate: string | null
}

export interface LogsError {
    id_log_erro: number | null
    message_erro: string | null
    stack_error: string | null
    origem: string | null
    status_code: number | null
    usuario_resp: number | null
    dt_criacao: string | null
    dt_atualizacao: string | null
    responsavel: string | null
}

export interface LogsErrorCourse {
    valor: number | null
    nome_curso: string | null
}

export interface LogsErrorClasses {
    valor: number | null
    nome_turma: string | null
}

export interface CourseCenter {
    nome_curso: string | null
    modalidade_curso: string | null
    id_curso: string | null
    ativo: number
}

export interface ClassCenter {
    nome_turma: string | null
    id_turma: string | null
    ativo: number
}

export default function ErrorLogs() {
    const [reportData, setReportData] = useState<LogsError[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [filterAbaData, setFilterAbaData] = useState<string>('logs_api')
    const [filtersField, setFiltersField] = useState<FiltersField>({
        startDate: '',
        endDate: ''
    })

    const { colorPalette, alert } = useAppContext()

    const fetchReportData: () => Promise<void> = async () => {
        setLoadingData(true)
        try {
            const response = await api.get('/error-logs/filters', {
                params: {
                    date: {
                        startDate: filtersField.startDate,
                        endDate: filtersField.endDate
                    },
                    page: 1,
                    limit: 100,
                }
            });

            setReportData(response.data);

        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
        } finally {
            setLoadingData(false)
        }
    };

    return (
        <>
            <SectionHeader title="Monitoramento de Logs" />
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
                                    onClick={() => setFilterAbaData('logs_api')}>
                                    <Text bold={filterAbaData === 'logs_api'}>Logs de erros da API</Text>
                                </Box>
                            </Box>
                        </Box>
                        {filterAbaData === 'logs_api' && <TableReport data={reportData} />}
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
        width: 20,
        height: 20,
        backgroundImage: `url('/icons/sheet.png')`,
        transition: '.3s',
        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        }
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