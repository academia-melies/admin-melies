import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms";
import { SectionHeader } from "../../../organisms";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // Estilo para o recurso de arrastar e soltar (se estiver usando)
import "react-big-calendar/lib/addons/dragAndDrop"; // Recurso de arrastar e soltar (se estiver usando)
import { useAppContext } from "../../../context/AppContext";
import { Backdrop } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors";


moment.locale("pt-br");
const localizer = momentLocalizer(moment);

export default function CalendarComponent(props) {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        location: "",
        color: "#007BFF",
    });
    const { setLoading, alert, colorPalette, matches } = useAppContext()

    console.log(events)

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



    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <SectionHeader title={`Calendario Geral`} />

            <Calendar
                localizer={localizer}
                culture="pt-br"
                events={events}
                startAccessor="start"
                endAccessor="end"
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
                    border: `.5px solid lightgray`
                }}
            components={{
                dateCellWrapper: ({ children }) => (
                    <div className="custom-button">
                      {children.props.value}
                    </div>
                  ),
            }}
            />
            {showEventForm && (
                <Backdrop open={showEventForm} sx={{ zIndex: 99999, marginLeft: { md: '180px', lg: '280px' } }}>
                    <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, overflowY: matches && 'auto', }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, marginBottom: 2 }}>
                            <Text bold large>Adicionar evento</Text>
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
            )}
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
          }
          /* Estilos para os dias da semana */
          .rbc-header {
            background-color: ${colorPalette.primary};
            color: ${colorPalette.textColor};
            font-size: 14px;
            padding: 5px;
          }
      `}</style>
        </Box>
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
