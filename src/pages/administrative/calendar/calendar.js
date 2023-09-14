import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms";
import { SectionHeader, SelectList, Holidays } from "../../../organisms";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // Estilo para o recurso de arrastar e soltar (se estiver usando)
import "react-big-calendar/lib/addons/dragAndDrop"; // Recurso de arrastar e soltar (se estiver usando)
import { useAppContext } from "../../../context/AppContext";
import { Backdrop } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors";
import { api } from "../../../api/api";


moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const listEvents = [
    {
        id: '01',
        title: "Feriádo",
        description: "Escola fechada para todos, não tem aula nem funciona o adm",
        location: "",
        color: "#FF0000",
    },
    {
        id: '02',
        title: "Emenda de feriádo",
        description: "Não tem aula, adm funciona normalmente",
        location: "",
        color: "#FF8C00",
    },
    {
        id: '03',
        title: "Férias/recesso de professores e alunos",
        description: "Em Julho adm funciona das 9h ás 18h",
        location: "",
        color: "#FFD700",
    },
    {
        id: '04',
        title: "Inicio das aulas do semestre",
        description: "",
        location: "",
        color: "#008000",
    },
    {
        id: '05',
        title: "Evento",
        description: "",
        location: "",
        color: "#FFC0CB",
    },
    {
        id: '06',
        title: "Avalicação",
        description: "",
        location: "",
        color: "#87CEFA",
    },
    {
        id: '07',
        title: "Semana de substitutiva",
        description: "",
        location: "",
        color: "#86b8f5",
    },
    {
        id: '08',
        title: "Semana de exame",
        description: "",
        location: "",
        color: "#5b969b",
    },
    {
        id: '09',
        title: "Divulgação de resultados final",
        description: "",
        location: "",
        color: "#1e5a8c",
    },
]

export default function CalendarComponent(props) {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [semester, setSemester] = useState()
    const [semesterSelect, setSemesterSelect] = useState()
    const [year, setYear] = useState(2023)
    const [yearSelect, setYearSelect] = useState(2023)
    const [defaultRangeDate, setDefaultRangeDate] = useState([])
    const [defaultEvents, setDefaultEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        location: "",
        color: "#007BFF",
    });
    const { setLoading, alert, colorPalette, matches, user } = useAppContext()
    let date = new Date(year, 6, 1);
    const filter = (item) => {
        return semester === '1º Semestre' ? (item && item.start < date) : (item && item.start >= date);
    };

    useEffect(() => {
        handleItems()
    }, [])

    const handleItems = async () => {
        setLoading(true);
        const dataAtual = new Date();
        const anoAtual = dataAtual.getFullYear();
        setYear(anoAtual)
        setSemester('2º Semestre')
        setSemesterSelect('2º Semestre')
        await handleEvents()
        setLoading(false);
    }

    const defaultYear = [
        {
            start: new Date(year, 0, 1), // January 2023
            end: new Date(year, 0, 31),
        },
        {
            start: new Date(year, 1, 1), // February 2023
            end: new Date(year, 1, 31),
        },
        {
            start: new Date(year, 2, 1), // March 2023
            end: new Date(year, 2, 30),
        },
        {
            start: new Date(year, 3, 1), // April 2023
            end: new Date(year, 3, 31),
        },
        {
            start: new Date(year, 4, 1), // Main 2023
            end: new Date(year, 4, 30),
        },
        {
            start: new Date(year, 5, 1), // Jun 2023
            end: new Date(year, 5, 31),
        },
        {
            start: new Date(year, 6, 1), // July 2023
            end: new Date(year, 6, 31),
        },
        {
            start: new Date(year, 7, 1), // August 2023
            end: new Date(year, 7, 31),
        },
        {
            start: new Date(year, 8, 1), // September 2023
            end: new Date(year, 8, 30),
        },
        {
            start: new Date(year, 9, 1), // October 2023
            end: new Date(year, 9, 31),
        },
        {
            start: new Date(year, 10, 1), // November 2023
            end: new Date(year, 10, 30),
        },
        {
            start: new Date(year, 11, 1), // December 2023
            end: new Date(year, 11, 31),
        },
    ];

    const handleEvents = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/events`)
            const { data } = response
            if (data) {
                const eventsMap = data?.map((event) => ({
                    id_evento_calendario: event.id_evento_calendario,
                    start: event.inicio, // Adicione o início e o fim do evento como propriedades start e end
                    end: event.fim,
                    title: event.titulo,
                    description: event.descricao,
                    location: event.local,
                    color: event.color,
                    allDay: false, // Ajuste isso com base no seu caso de uso
                }));
                setEvents([...eventsMap, ...Holidays]);
                return
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    function handleFilter() {
        setLoading(true);
        setYear(yearSelect);
        setSemester(semesterSelect);
        setLoading(false);
    }

    useEffect(() => {
        setDefaultRangeDate(defaultYear);
        const filtered = defaultYear.filter(filter)
        setFilteredEvents(filtered);
        listEventsDefault();
    }, [semester, year]);

    const messages = {
        today: "Hoje",
        previous: "Anterior",
        next: "Próximo",
        month: "Mês",
        week: "Semana",
        day: "Dia",
        agenda: "Agenda",
        date: "Data",
        time: "Hora",
        event: "Evento",
    };

    const handleCreateEvent = async (event) => {
        setLoading(true)
        try {
            const response = await api.post(`/event/create/${user?.id}`, { events: event })
            if (response.status === 201) {
                alert.success('Evento criado!')
                handleItems()
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    };

    async function listEventsDefault() {
        try {
            const groupEvents = listEvents.map(event => ({
                label: event.title,
                value: event?.id
            }));

            setDefaultEvents(groupEvents);
        } catch (error) {
        }
    }

    const eventStyleGetter = (event, start, end, isSelected) => {
        const style = {
            backgroundColor: event.color,
            borderRadius: "5px",
            display: "block",
            padding: "10px",
            opacity: !isSelected && 0.6,
            fontSize: '12px'
        };
        return {
            style,
        };
    };


    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setShowEventForm(true);
        setEventData(event);
    };

    const handleDeleteEvent = async () => {
        try {
            setLoading(true)
            const response = await api.delete(`/event/delete/${eventData.id_evento_calendario}`)
            const { status } = response
            if (status === 200) {
                alert.success('Evento deletado.')
                handleItems()
                return
            }
            alert.error('Ocorreu um erro ao deletar o evento')
        } catch (error) {
            return error
        } finally {
            setLoading(false)
            setSelectedEvent(null);
            setShowEventForm(false);
        }
    }

    const handleEditEvent = async (event) => {

        try {
            setLoading(true)
            const response = await api.patch(`/event/update`, { events: event })
            const { status } = response
            if (status === 201) {
                alert.success('Evento atualizado.')
                handleItems()
                return
            }
            alert.error('Ocorreu um erro ao atualizar o evento')
        } catch (error) {
            return error
        } finally {
            setLoading(false)
            setSelectedEvent(null);
            setShowEventForm(false);
        }
    };

    const handleEventFormChange = (event) => {
        const { name, value } = event.target;
        setEventData((prevData) => ({
            ...prevData,
            [name]: name === "color" ? value : value,
        }));
    };


    const handleEventToSelect = (value) => {

        const data = listEvents.find((item) => item.title === value)
        setEventData((prevData) => ({
            ...prevData,
            title: data?.title,
            description: data?.description,
            location: data?.location,
            color: data?.color,
        }));
    }

    const handleEventFormSubmit = (event) => {
        event.preventDefault();

        if (selectedEvent) {
            handleEditEvent(eventData);
        } else {
            handleCreateEvent(eventData);
        }

        // Limpar o formulário após adicionar ou editar o evento
        setEventData({
            title: "",
            description: "",
            location: "",
            color: "#007BFF",
        });

        // Fechar o formulário
        setShowEventForm(false);
    };


    const groupMonths = [
        { label: '1º Semestre', value: '1º Semestre' },
        { label: '2º Semestre', value: '2º Semestre' },
    ]

    return (
        <>
            <SectionHeader title={`Calendario Geral`} />
            <ContentContainer>
                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <SelectList clean={false} data={groupMonths} valueSelection={semesterSelect} onSelect={(value) => setSemesterSelect(value)}
                            title="Vizualizar por:" filterOpition="value" sx={{ color: colorPalette.textColor, maxWidth: 280 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <TextInput
                            name="year"
                            value={yearSelect || ''}
                            label='Ano:'
                            onChange={(event) => setYearSelect(event.target.value)}
                            sx={{ flex: 1 }}
                            type="number"
                        />
                    </Box>
                    <Button small text='filtrar' style={{ height: 30, width: 80 }} onClick={() => handleFilter()} />
                </Box>
            </ContentContainer>

            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 5, }}>
                {filteredEvents?.filter(filter).map((month, index) => (
                    <Box key={`${month}-${index}`} sx={{
                        marginBottom: 2,
                        minHeight: 400,
                        maxWidth: '30%',
                        minWidth: '30%'
                    }}>
                        <Text bold title sx={{ textAlign: 'center' }}>{moment(month?.start).format('MMMM YYYY')} </Text>
                        <Calendar
                            localizer={localizer}
                            defaultDate={month?.start}
                            culture="pt-br"
                            events={events} // Use o conjunto de eventos padrão para todos os calendários
                            startAccessor="start" // Use "start" como acessor para o início do evento
                            endAccessor="end" // Use "end" como acessor para o fim do evento
                            selectable
                            onSelectSlot={(slotInfo) => {
                                setEventData({
                                    ...eventData,
                                    start: slotInfo.start,
                                    end: slotInfo.end,
                                });
                                setSelectedEvent(null);
                                setShowEventForm(true);
                            }}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            messages={messages}
                            style={{
                                fontFamily: 'MetropolisBold',
                                color: colorPalette.textColor,
                                backgroundColor: colorPalette.secondary,
                                borderRadius: '12px',
                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                border: `.5px solid lightgray`,
                                padding: 10
                            }}
                        // components={{
                        //     dateCellWrapper: ({ children }) => (
                        //         <div className="custom-button">
                        //             {children.props.value}
                        //         </div>
                        //     ),
                        // }}
                        />
                    </Box>
                ))}
            </Box>
            <Box sx={{ marginTop: 5 }}>
                <Text bold sx={{ marginBottom: 3 }}>Legenda</Text>
                {listEvents.map((item, index) => (
                    <Box key={`${item}-${index}`} sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: '10px' }}>
                        <Box sx={{ width: 10, height: 10, aspectRatio: '1/1', backgroundColor: item.color }} />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Text small>{item.title}</Text>
                            {item.description && <Text small>({item?.description})</Text>}
                        </Box>

                    </Box>
                ))}
            </Box>
            {
                showEventForm && (
                    <Backdrop open={showEventForm} sx={{ zIndex: 999 }}>
                        <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, marginLeft: { md: '180px', lg: '280px' }, maxHeight: { md: '180px', lg: '1280px' }, overflowY: matches && 'auto', width: 400 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                <Text bold large>{selectedEvent ? eventData?.title : "Adicionar evento"}</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => {
                                    setShowEventForm(false)
                                    setEventData({
                                        title: "",
                                        description: "",
                                        location: "",
                                        color: "#007BFF",
                                    });
                                }} />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <SelectList
                                    fullWidth
                                    data={defaultEvents}
                                    valueSelection={eventData?.title}
                                    onSelect={(value) => handleEventToSelect(value)}
                                    title="Evento"
                                    filterOpition="label"
                                    sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                                {/* <TextInput
                                    name="title"
                                    value={eventData.title || ''}
                                    label='Nome do evento'
                                    onChange={handleEventFormChange}
                                    sx={{ flex: 1 }}
                                /> */}
                                <TextInput
                                    name="description"
                                    value={eventData.description || ''}
                                    label='Descrição do evento'
                                    onChange={handleEventFormChange}
                                    sx={{ flex: 1 }}
                                    multiline
                                    maxRows={8}
                                    rows={4}
                                />
                                <TextInput
                                    name="location"
                                    value={eventData.location || ''}
                                    label='Localização do evento'
                                    onChange={handleEventFormChange}
                                    sx={{ flex: 1 }}
                                />
                                <TextInput
                                    type="color"
                                    name="color"
                                    value={eventData.color}
                                    onChange={handleEventFormChange}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                    <Button
                                        small
                                        type="submit"
                                        text={selectedEvent ? "Atualizar" : "Adicionar"}
                                        style={{ padding: '5px 6px 5px 6px', width: 100 }}
                                        onClick={(event) => handleEventFormSubmit(event)}
                                    />
                                    {selectedEvent &&
                                        <Button
                                            secondary
                                            small
                                            text='Deletar'
                                            style={{ padding: '5px 6px 5px 6px', width: 100 }}
                                            onClick={(event) => {
                                                handleDeleteEvent(event)
                                                setShowEventForm(false)
                                                setEventData({
                                                    title: "",
                                                    description: "",
                                                    location: "",
                                                    color: "#007BFF",
                                                });
                                            }}
                                        />}
                                </Box>
                            </Box>
                        </ContentContainer>
                    </Backdrop>
                )
            }
            <style>{`
        .rbc-btn-group > button {
            color: white; /* Defina a cor do texto dos botões do calendário para pink */
            background-color: ${colorPalette.buttonColor}
          }
          .rbc-btn-group > button:focus {
            background-color: ${colorPalette.buttonColor + '66'}; /* Defina a cor de fundo do botão quando estiver com foco (ativo) */
            outline: none; /* Remova a borda de foco padrão */
          }

          .rbc-toolbar {
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: ${colorPalette.textColor};
            background-color: ${colorPalette.primary};
            font-size: 18px;
            display: none;

          }

          /* Estilos para os dias da semana */
          .rbc-header {
            background-color: ${colorPalette.primary};
            color: ${colorPalette.textColor};
            font-size: 14px;
            padding: 5px;
          }
      `}</style>
        </ >
    );
}

const styles = {
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
}
