import { useEffect, useState } from "react";
import { Box, ContentContainer, Text, TextInput } from "../../../atoms";
import { SectionHeader, Table_V1 } from "../../../organisms";
import { useAppContext } from "../../../context/AppContext";
import { useRouter } from "next/router";
import { Colors, icons } from "../../../organisms/layout/Colors";
import { api } from "../../../api/api";


export default function ClassSheduleList(props) {

    const [dateClass, setDateClass] = useState([]);
    const [showTableClass, setShowTableClass] = useState(false);
    const { setLoading, colorPalette } = useAppContext()
    const [showClassSchedulesTable, setShowClassSchedulesTable] = useState({});
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]

    // const aulasPorDia = [
    //     {
    //         id: '01',
    //         diaSemana: 'seg',
    //         disciplina: 'Animação 2D',
    //         primeiroPeriodoProfessor: 'Carlos Avelino dos Santos Reis',
    //         // segundoPeriodoProfessor: 'Maria',
    //         recorrencia: 7
    //     },
    //     {
    //         id: '02',
    //         diaSemana: 'ter',
    //         disciplina: 'ACE: Primeiros Passos do Dinossauro',
    //         primeiroPeriodoProfessor: 'Letícia Apolinário',
    //         // segundoPeriodoProfessor: 'Pedro',
    //         recorrencia: 15
    //     },
    //     {
    //         id: '03',
    //         diaSemana: 'qua',
    //         disciplina: 'Pintura Digital',
    //         primeiroPeriodoProfessor: 'Lika Yazawa Maekawa',
    //         // segundoPeriodoProfessor: 'Sandra',
    //         recorrencia: 7
    //     },
    //     {
    //         id: '04',
    //         diaSemana: 'qui',
    //         disciplina: 'Introdução à Linguagem Audiovisual',
    //         primeiroPeriodoProfessor: 'Diego Melem Gozze',
    //         // segundoPeriodoProfessor: 'Mariana',
    //         recorrencia: 7
    //     },
    //     // {
    //     //     id: '05',
    //     //     diaSemana: 'sex',
    //     //     disciplina: 'geografia',
    //     //     primeiroPeriodoProfessor: 'Lucas',
    //     //     segundoPeriodoProfessor: 'Carla',
    //     //     recorrencia: 7
    //     // },
    //     {
    //         id: '06',
    //         diaSemana: 'sáb',
    //         disciplina: 'Desenho',
    //         primeiroPeriodoProfessor: 'William Mur',
    //         // segundoPeriodoProfessor: 'Julia',
    //         recorrencia: 7
    //     },
    // ];

    // Função para obter as datas das aulas entre o período especificado

    // function getDatasAulas(dataInicio, dataFim) {
    //     const datasAulas = [];
    //     let dataAtual = new Date(dataInicio);

    //     while (dataAtual <= dataFim) {
    //         datasAulas.push(new Date(dataAtual));
    //         dataAtual.setDate(dataAtual.getDate() + 1);
    //     }
    //     return datasAulas;
    // }

    // useEffect(() => {
    //     gerarCronograma()
    // }, [rangeDate])

    // const handleRecorrencia = (value) => {
    //     let recorrenciaString = value <= 7 ? 'Semanal' : 'Quinzenal'
    //     return recorrenciaString
    // }

    // function gerarCronograma() {
    //     const datasAulas = getDatasAulas(rangeDate.dataInicio, rangeDate.dataFim);
    //     const aulasPorDiaSemana = [];
    //     // const aulasPorDiaSemana = {};
    //     const currentProfessors = {};

    //     aulasPorDia.forEach(aula => {
    //         currentProfessors[aula.disciplina] = aula.primeiroPeriodoProfessor;
    //     });

    //     for (const dataAula of datasAulas) {
    //         const diaSemana = dataAula.toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase().split('.')[0];
    //         const dataFormatada = dataAula.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    //         const aulaDoDia = aulasPorDia.find(aula => aula.diaSemana === diaSemana);
    //         if (aulaDoDia) {
    //             const professor = currentProfessors[aulaDoDia.disciplina];
    //             const disciplina = aulaDoDia.disciplina;

    //             if (professor === aulaDoDia.primeiroPeriodoProfessor) {
    //                 currentProfessors[disciplina] = aulaDoDia?.segundoPeriodoProfessor || aulaDoDia.primeiroPeriodoProfessor;
    //             } else {
    //                 currentProfessors[disciplina] = aulaDoDia.primeiroPeriodoProfessor;
    //             }

    //             const aula = {
    //                 dia: dataAula.toLocaleDateString('pt-BR', { weekday: 'long' }),
    //                 data: dataFormatada,
    //                 disciplina,
    //                 professor,
    //                 recorrencia: handleRecorrencia(aulaDoDia.recorrencia)
    //             };

    //             // if (!aulasPorDiaSemana[diaSemana]) {
    //             //     aulasPorDiaSemana[diaSemana] = [];
    //             // }

    //             // aulasPorDiaSemana[diaSemana].push(aula);
    //             aulasPorDiaSemana.push(aula);


    //             // if (aulaDoDia.recorrencia) {

    //             //     let dataRecorrencia = new Date(dataAula);
    //             //     let recorrenciaCount = 1;

    //             //     while (true) {
    //             //         dataRecorrencia.setDate(dataRecorrencia.getDate() + aulaDoDia.recorrencia); // Recorrencia: 7 dias
    //             //         if (dataRecorrencia > rangeDate.dataFim) {
    //             //             break;
    //             //         }
    //             //         const dataFormatadaRecorrencia = dataRecorrencia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    //             //         const aulaRecorrente = {
    //             //             dia: dataRecorrencia.toLocaleDateString('pt-BR', { weekday: 'long' }),
    //             //             data: dataFormatadaRecorrencia,
    //             //             disciplina,
    //             //             professor,
    //             //             recorrencia: handleRecorrencia(aulaDoDia.recorrencia)
    //             //         };
    //             //         aulasPorDiaSemana[diaSemana].push(aulaRecorrente);
    //             //         recorrenciaCount++;
    //             //     }
    //             // }
    //         }

    //         // const diasDaSemanaOrdenados = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    //         // const aulasOrdenadas = {};
    //         // diasDaSemanaOrdenados.forEach((diaSemana) => {
    //         //     if (aulasPorDiaSemana[diaSemana]) {
    //         //         aulasOrdenadas[diaSemana] = aulasPorDiaSemana[diaSemana];
    //         //     }
    //         // });

    //         setDateClass(aulasPorDiaSemana);
    //     }
    // }

    // const handleChange = (event) => {
    //     setRangeDate((prevValues) => ({
    //         ...prevValues,
    //         [event.target.name]: new Date(event.target.value), // Converta a data para um objeto Date
    //     }));
    // };

    const toggleClassTable = (index) => {
        setShowClassSchedulesTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleScheduleClass = async (req, res) => {
        setLoading(true)
        try {
            const response = await api.get(`/classSchedules`)
            const { data } = response
            setDateClass(data)
        } catch (error) {
            console.log(error)
            return
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleScheduleClass()
    }, [])

    const column = [
        { key: 'professor', label: 'Professor(a)' },
        { key: 'disciplina', label: 'Matéria' },
        { key: 'optativa', label: 'Matéria Optativa' },
        { key: 'dia_semana', avatar: true, label: 'Dia' },
        { key: 'dt_aula', label: 'Data', date: true },
        { key: 'observacao_dia', label: 'Observação' },

    ];



    return (
        <>
            <SectionHeader
                title="Cronograma de aulas"
                newButton
                newButtonAction={() => router.push(`/administrative/${pathname}/new`)}
            />
            {dateClass ? (
                dateClass.map((item, index) => {
                    const classScheduleData = item.aulas;
                    const name = item.nome_cronograma;
                    return (
                        <ContentContainer key={`${item}-${index}`}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }}
                                onClick={() => toggleClassTable(index)}
                            >
                                <Text bold>{name}</Text>
                                <Box
                                    sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url(${icons.gray_arrow_down})`,
                                        transform: showClassSchedulesTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                        transition: '.3s',
                                        width: 17,
                                        height: 17
                                    }}
                                />
                            </Box>
                            {showClassSchedulesTable[index] && (
                                <Box sx={{ ...styles.tableContainer, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '500px', overflow: 'auto', borderRadius: '12px' }}>
                                    <Table_V1
                                        data={classScheduleData}
                                        columns={column}
                                        columnId={'id_aula'}
                                        columnActive={false}
                                        tolltip={true}
                                        sx={{ flex: 1 }} />
                                </Box>
                            )}
                        </ContentContainer>
                    );
                })
            ) : (
                <Text>Não encontrei Cronogramas vinculadas a grade</Text>
            )}
        </>
    )
}

const styles = {
    containerData: {
        display: 'flex',
        gap: 1,
        alignItems: 'center'
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    tableContainer: {
        overflowStyle: 'marquee,panner',
        maxHeight: '50%',
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray lightgray',
        '&::-webkit-scrollbar': {
            width: '5px',

        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'gray',
            borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'gray',

        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: Colors.primary,

        },
    }
}