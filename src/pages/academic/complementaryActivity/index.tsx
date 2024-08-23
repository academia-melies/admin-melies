import React, { useEffect, useState } from "react";
import { Box, Divider, Text } from "../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../context/AppContext";
import { SectionHeader } from "../../../organisms";
import { api } from "../../../api/api";
import { formatReal } from "../../../helpers";
import { CircularProgress } from "@mui/material";
import { DataFilters } from "../../financial/reports/expenses";
import HeaderFilters from "./Components/Header/HeaderFilters";
import TableReport from "./Components/Tables/TableReport";

export interface FiltersField {
    status: string | null
    tipo_data: string | null
    data: string | null
    classId: string | number | null
    course: string | number | null
    startDate: string | null
    endDate: string | null
}

export interface ActivityComplementaryArq {
    name_file: string | null,
    location: string | null
}

export interface ActivityComplementary {
    id_ativ_complementar: string | number,
    usuario_id: string | number | null
    atividade: string | null
    tipo_atv: string | null
    titulo: string | null
    carga_hr: string
    dt_criacao: string | null
    modulo_semestre: string | number | null
    arquivos?: ActivityComplementaryArq[]
    aprovado: number | null
    comentario: string | null
    aluno: string
    descricao: string | null
}

export interface InstallmentsCourse {
    valor: number | null
    nome_curso: string | null
}

export interface InstallmentsClasses {
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

export default function BillingCourses() {
    const [reportData, setReportData] = useState<ActivityComplementary[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [filterAbaData, setFilterAbaData] = useState<string>('relatorio_geral')
    const [coursesList, setCourses] = useState<DataFilters[]>([])
    const [classesList, setClasses] = useState<DataFilters[]>([])

    const [filtersField, setFiltersField] = useState<FiltersField>({
        status: 'Aguardando validação',
        tipo_data: '',
        data: '',
        startDate: '',
        endDate: '',
        classId: '',
        course: ''
    })

    const { colorPalette, alert } = useAppContext()

    const fetchReportData: () => Promise<void> = async () => {

        setLoadingData(true)
        try {
            const response = await api.get('/atividade-complementar/professor/avaliable', {
                params: {
                    date: {
                        startDate: filtersField.startDate,
                        endDate: filtersField.endDate
                    },
                    classId: filtersField.classId,
                    course: filtersField.course,
                    status: filtersField.status,
                    page: 1, // exemplo
                    limit: 100,    // exemplo
                    dateType: filtersField.tipo_data
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

    const fetchFilters = async () => {
        const [classResponse, courseResponse] = await Promise.all([
            api.get<ClassCenter[]>(`/classes`),
            api.get<CourseCenter[]>(`/courses`)
        ])

        const classData = classResponse.data
        let groupClass = classData.filter(item => item.ativo === 1)?.map(turma => ({
            label: turma.nome_turma || '',
            value: turma.id_turma
        }));

        groupClass = groupClass.sort((a, b) => a.label.localeCompare(b.label))
        setClasses(groupClass);


        const courseData = courseResponse.data
        let groupCourses = courseData?.filter(item => item.ativo === 1)?.map(course => ({
            label: `${course.nome_curso}_${course?.modalidade_curso}`,
            value: course?.id_curso
        }));
        groupCourses = groupCourses.sort((a, b) => a.label.localeCompare(b.label))
        setCourses(groupCourses);
    }

    useEffect(() => {
        fetchFilters()
    }, [])

    const calculationTotal = (data: ActivityComplementary[]): number => {
        const total = data
            .map(item => {
                if (item.carga_hr) {
                    return typeof parseInt(item.carga_hr) === 'number' ? parseInt(item.carga_hr) : 0
                } else {
                    return 0
                }
            })
            .reduce((acc, curr) => acc + curr, 0)
        return total
    }

    return (
        <>
            <SectionHeader title="Atividades Complementares" />
            <Box sx={{ ...styles.sectionContainer, backgroundColor: colorPalette.secondary, }}>
                <HeaderFilters
                    filtersField={filtersField}
                    setFiltersField={setFiltersField}
                    fetchReportData={fetchReportData}
                    setReportData={setReportData}
                    classesList={classesList}
                    coursesList={coursesList}
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
                        </Box>
                        {filterAbaData === 'relatorio_geral' && <TableReport data={reportData} setData={setReportData} />}
                        <Box sx={styles.boxValueTotally}>
                            <Text title light>Total de Horas {filtersField.status}: </Text>
                            <Text title bold>{calculationTotal(reportData)}</Text>
                        </Box>
                    </Box>
                    :
                    <Box sx={{ ...styles.emptyData, opacity: loadingData ? .6 : 1, }}>
                        <Text bold small light>Nenhum Atividade Complementar.</Text>
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