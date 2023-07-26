import { useEffect, useState } from "react";
import { Box, ContentContainer, Text, TextInput } from "../../../atoms";
import { SectionHeader } from "../../../organisms";
import { useAppContext } from "../../../context/AppContext";


export default function ClassSheduleList(props) {

    const [dateClass, setDateClass] = useState([]);
    const { setLoading, colorPalette } = useAppContext()
    const [rangeDate, setRangeDate] = useState({
        dataInicio: new Date('2023-07-01'),
        dataFim: new Date('2024-07-01'),
    });

    const aulasPorDia = [
        {
            diaSemana: 'seg',
            disciplina: 'matematica',
            primeiroPeriodoProfessor: 'João',
            segundoPeriodoProfessor: 'Maria',
            recorrencia: 7
        },
        {
            diaSemana: 'ter',
            disciplina: 'portugues',
            primeiroPeriodoProfessor: 'Ana',
            segundoPeriodoProfessor: 'Pedro',
            recorrencia: 15
        },
        {
            diaSemana: 'qua',
            disciplina: 'ciencias',
            primeiroPeriodoProfessor: 'Carlos',
            segundoPeriodoProfessor: 'Sandra',
            recorrencia: 7
        },
        {
            diaSemana: 'qui',
            disciplina: 'historia',
            primeiroPeriodoProfessor: 'Roberto',
            segundoPeriodoProfessor: 'Mariana',
            recorrencia: 7
        },
        {
            diaSemana: 'sex',
            disciplina: 'geografia',
            primeiroPeriodoProfessor: 'Lucas',
            segundoPeriodoProfessor: 'Carla',
            recorrencia: 7
        },
        {
            diaSemana: 'sab',
            disciplina: 'educacao_fisica',
            primeiroPeriodoProfessor: 'Gustavo',
            segundoPeriodoProfessor: 'Julia',
            recorrencia: 7
        },
    ];

    // Função para obter as datas das aulas entre o período especificado
    function getDatasAulas(dataInicio, dataFim) {
        const datasAulas = [];
        let dataAtual = new Date(dataInicio);

        while (dataAtual <= dataFim) {
            datasAulas.push(new Date(dataAtual));
            dataAtual.setDate(dataAtual.getDate() + 1);
        }
        return datasAulas;
    }

    useEffect(() => {
        gerarCronograma()
    }, [rangeDate])

    const handleRecorrencia = (value) => {
        let recorrenciaString = value <= 7 ? 'Semanal' : 'Quinzenal'
        return recorrenciaString
    }

    function gerarCronograma() {
        const datasAulas = getDatasAulas(rangeDate.dataInicio, rangeDate.dataFim);
        const aulasPorDiaSemana = {};
        const currentProfessors = {};

        aulasPorDia.forEach(aula => {
            currentProfessors[aula.disciplina] = aula.primeiroPeriodoProfessor;
        });

        for (const dataAula of datasAulas) {
            const diaSemana = dataAula.toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase().split('.')[0];
            const dataFormatada = dataAula.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const aulaDoDia = aulasPorDia.find(aula => aula.diaSemana === diaSemana);
            if (aulaDoDia) {
                // const recorrenciaDia = dataFormatada.setDate(dataAula.getDate() + aulaDoDia.recorrencia); // Recorrencia: 7 dias
                const professor = currentProfessors[aulaDoDia.disciplina];
                const disciplina = aulaDoDia.disciplina;

                if (professor === aulaDoDia.primeiroPeriodoProfessor) {
                    currentProfessors[disciplina] = aulaDoDia?.segundoPeriodoProfessor || aulaDoDia.primeiroPeriodoProfessor;
                } else {
                    currentProfessors[disciplina] = aulaDoDia.primeiroPeriodoProfessor;
                }

                const aula = {
                    dia: dataAula.toLocaleDateString('pt-BR', { weekday: 'long' }),
                    data: dataFormatada,
                    disciplina,
                    professor,
                    recorrencia: handleRecorrencia(aulaDoDia.recorrencia)
                };

                if (!aulasPorDiaSemana[diaSemana]) {
                    aulasPorDiaSemana[diaSemana] = [];
                }

                aulasPorDiaSemana[diaSemana].push(aula);

                // if (aulaDoDia.recorrencia) {

                //     let dataRecorrencia = new Date(dataAula);
                //     let recorrenciaCount = 1;

                //     while (true) {
                //         dataRecorrencia.setDate(dataRecorrencia.getDate() + aulaDoDia.recorrencia); // Recorrencia: 7 dias
                //         if (dataRecorrencia > rangeDate.dataFim) {
                //             break;
                //         }
                //         const dataFormatadaRecorrencia = dataRecorrencia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                //         const aulaRecorrente = {
                //             dia: dataRecorrencia.toLocaleDateString('pt-BR', { weekday: 'long' }),
                //             data: dataFormatadaRecorrencia,
                //             disciplina,
                //             professor,
                //             recorrencia: handleRecorrencia(aulaDoDia.recorrencia)
                //         };
                //         aulasPorDiaSemana[diaSemana].push(aulaRecorrente);
                //         recorrenciaCount++;
                //     }
                // }
            }
            const diasDaSemanaOrdenados = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
            const aulasOrdenadas = {};
            diasDaSemanaOrdenados.forEach((diaSemana) => {
                if (aulasPorDiaSemana[diaSemana]) {
                    aulasOrdenadas[diaSemana] = aulasPorDiaSemana[diaSemana];
                }
            });

            setDateClass(aulasOrdenadas);
        }
    }

    const handleChange = (event) => {
        setRangeDate((prevValues) => ({
            ...prevValues,
            [event.target.name]: new Date(event.target.value), // Converta a data para um objeto Date
        }));
    };



    return (
        <>
            <SectionHeader
                title="Cronograma de aulas"
            />
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, maxWidth: '500px' }}>
                <TextInput
                    fullWidth
                    placeholder='Data de início'
                    name='dataInicio'
                    onChange={handleChange}
                    value={rangeDate.dataInicio.toISOString().split('T')[0]}
                    label='Data de início'
                    type="date"
                />
                <TextInput
                    fullWidth
                    placeholder='Fim'
                    name='dataFim'
                    onChange={handleChange}
                    value={rangeDate.dataFim.toISOString().split('T')[0]}
                    type="date"
                    label='Fim' />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.keys(dateClass).map((diaSemana) => (
                    <ContentContainer key={diaSemana}>
                        <Text fontWeight="bold" fontSize="larger">{diaSemana}</Text>
                        {dateClass[diaSemana].map((aula, index) => (
                            <ContentContainer key={`${index}-${aula}`}>
                                <Box sx={styles.containerData}>
                                    <Text bold small style={{ color: colorPalette.buttonColor }}>Data: </Text>
                                    <Text bold small>{aula.data}</Text>
                                </Box>
                                <Box sx={styles.containerData}>
                                    <Text bold small style={{ color: colorPalette.buttonColor }}>Disciplina: </Text>
                                    <Text bold small>{aula.disciplina}</Text>
                                </Box>

                                <Box sx={styles.containerData}>
                                    <Text bold small style={{ color: colorPalette.buttonColor }}>Professor: </Text>
                                    <Text bold small>{aula.professor}</Text>
                                </Box>
                                <Box sx={styles.containerData}>
                                    <Text bold small style={{ color: colorPalette.buttonColor }}>Recorrência: </Text>
                                    <Text bold small>{aula.recorrencia}</Text>
                                </Box>
                            </ContentContainer>
                        ))}
                    </ContentContainer>
                ))}
            </Box>
        </>
    )
}

const styles = {
    containerData: {
        display: 'flex',
        gap: 1,
        alignItems: 'center'
    },
    title: {

    }
}