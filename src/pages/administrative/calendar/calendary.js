import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms";
import { SectionHeader, SelectList } from "../../../organisms";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // Estilo para o recurso de arrastar e soltar (se estiver usando)
import "react-big-calendar/lib/addons/dragAndDrop"; // Recurso de arrastar e soltar (se estiver usando)
import { useAppContext } from "../../../context/AppContext";
import { Backdrop } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors";


moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const listEvents = [
    {
        title: "Feriado",
        description: "Escola fechada para todos, não tem aula nem funciona o adm",
        location: "",
        color: "red",
    },
    {
        title: "Emenda de feriado",
        description: "Não tem aula, adm funciona normalmente",
        location: "",
        color: "orange",
    },
    {
        title: "Férias/recesso de professores e alunos",
        description: "Em Julho adm funciona das 9h ás 18h",
        location: "",
        color: "yellow",
    },
    {
        title: "Inicio das aulas do semestre",
        description: "",
        location: "",
        color: "green",
    },
    {
        title: "Evento, Semana acadêmica e Game Jam",
        description: "",
        location: "",
        color: "pink",
    },
    {
        title: "Semana de aválicação",
        description: "",
        location: "",
        color: "lightblue",
    },
    {
        title: "Semana de substitutiva",
        description: "",
        location: "",
        color: "#86b8f5",
    },
    {
        title: "Semana de exame",
        description: "",
        location: "",
        color: "#5b969b",
    },
    {
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
    const [semester, setSemester] = useState('2º Semestre')
    const [year, setYear] = useState(2023)
    const [defaultRangeDate, setDefaultRangeDate] = useState([])
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        location: "",
        color: "#007BFF",
    });
    const { setLoading, alert, colorPalette, matches } = useAppContext()

    useEffect(() => {
        const dataAtual = new Date();
        const anoAtual = dataAtual.getFullYear();
        setYear(anoAtual)
    }, [])

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

    //   useEffect(() => {
    //     // Fetch events from the server or local storage and set the events state
    //     fetchEventsFromDatabase().then((data) => {
    //       setEvents(data);
    //     });
    //   }, []);

    const fetchEventsFromDatabase = async () => {
        // Fetch events from the server and return the data
        // ...
    };

    const saveEventToDatabase = async (event) => {
        // Save the event to the server
        // ...
    };

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

    const handleAddEvent = (newEvent) => {
        setEvents([...events, newEvent]);
        saveEventToDatabase(newEvent);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setShowEventForm(true);
        setEventData({
            title: event.title,
            description: event.description,
            location: event.location,
            color: event.color,
        });
    };

    const handleDeleteEvent = () => {
        setEvents(events.filter((event) => event !== selectedEvent));
        setSelectedEvent(null);
        setShowEventForm(false);
        // Delete event from the database
        // ...
    };

    const handleEditEvent = () => {
        const updatedEvent = {
            ...selectedEvent,
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            color: eventData.color,
        };
        setEvents(events.map((event) => (event === selectedEvent ? updatedEvent : event)));
        setSelectedEvent(null);
        setShowEventForm(false);
        // Update event in the database
        // ...
    };

    const handleEventFormChange = (event) => {
        const { name, value } = event.target;
        setEventData((prevData) => ({
            ...prevData,
            [name]: name === "color" ? value : value,
        }));
    };

    const handleEventFormSubmit = (event) => {
        event.preventDefault();
        if (selectedEvent) {
            handleEditEvent();
        } else {
            const newEvent = {
                start: eventData.start, // You need to set the start and end dates for the new event
                end: eventData.end,
                title: eventData.title,
                description: eventData.description,
                location: eventData.location,
                color: eventData.color,
                allDay: false, // Adjust this based on your use case
            };
            handleAddEvent(newEvent);
        }
    };

    const defaultFirstSemester = [
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
    ];

    const defaultSecondSemester = [
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

    useEffect(() => {
        const monthFilter = semester === '1º Semestre' ? defaultFirstSemester : defaultSecondSemester;
        setDefaultRangeDate(monthFilter)
    }, [semester])

    const groupMonths = [
        {
            label: '1º Semestre', value: '1º Semestre'
        },
        { label: '2º Semestre', value: '2º Semestre' },
    ]

    const defaultEvents = events.map((event) => ({
        start: event.start, // Adicione o início e o fim do evento como propriedades start e end
        end: event.end,
        title: event.title,
        description: event.description,
        location: event.location,
        color: event.color,
        allDay: false, // Ajuste isso com base no seu caso de uso
    }));


    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SectionHeader title={`Calendario Geral`} />
            <ContentContainer>
                <SelectList clean={false} fullWidth data={groupMonths} valueSelection={semester} onSelect={(value) => setSemester(value)}
                    title="Vizualizar por:" filterOpition="value" sx={{ color: colorPalette.textColor, maxWidth: 280 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
            </ContentContainer>

            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 5, }}>
                {defaultRangeDate.map((month, index) => (
                    <Box key={`${month}-${index}`} sx={{
                        marginBottom: 2,
                        minHeight: 400,
                        maxWidth: '30%',
                        minWidth: '30%'
                    }}>
                        <Text bold title sx={{ textAlign: 'center' }}>{moment(month?.start).format('MMMM YYYY')} </Text>
                        <Calendar
                            localizer={localizer}
                            defaultDate={moment(month?.start)}
                            culture="pt-br"
                            events={defaultEvents} // Use o conjunto de eventos padrão para todos os calendários
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
            <Box sx={{marginTop: 5}}>
                <Text bold sx={{marginBottom: 3}}>Legenda</Text>
                {listEvents.map((item, index) => (
                    <Box key={`${item}-${index}`} sx={{display: 'flex', gap: 2, alignItems: 'center', marginBottom: '10px' }}>
                        <Box sx={{width: 10, height: 10, aspectRatio: '1/1', backgroundColor: item.color}}/>
                        <Box sx={{display: 'flex', gap: 0.5}}>
                            <Text>{item.title}</Text>
                            {item.description && <Text>({item?.description})</Text>}
                        </Box>

                    </Box>
                ))}
            </Box>
            {
                showEventForm && (
                    <Backdrop open={showEventForm} sx={{ zIndex: 99999, marginLeft: { md: '180px', lg: '280px' } }}>
                        <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, overflowY: matches && 'auto', width: 400 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, marginBottom: 2 }}>
                                <Text bold large>{selectedEvent ? "Editar evento" : "Adicionar evento"}</Text>
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
                                <TextInput
                                    name="title"
                                    value={eventData.title || ''}
                                    label='Nome do evento'
                                    onChange={handleEventFormChange}
                                    sx={{ flex: 1 }}
                                />
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

                                {/* <button type="submit">{selectedEvent ? "Update Event" : "Add Event"}</button>
                            {selectedEvent && <button onClick={handleDeleteEvent}>Delete Event</button>} */}

                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                    <Button
                                        small
                                        type="submit"
                                        text={selectedEvent ? "Atualizar" : "Adicionar"}
                                        style={{ padding: '5px 6px 5px 6px', width: 100 }}
                                        onClick={
                                            (event) => {
                                                handleEventFormSubmit(event)
                                                setShowEventForm(false)
                                                setEventData({
                                                    title: "",
                                                    description: "",
                                                    location: "",
                                                    color: "#007BFF",
                                                });
                                            }}
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
        </Box >
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
