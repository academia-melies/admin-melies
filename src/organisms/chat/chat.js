import React, { useEffect, useRef, useState } from "react"
import { Box, Button, Divider, Text, TextInput } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { IconStatus } from "../Table/table"
import { api } from "../../api/api"
import { Avatar, CircularProgress } from "@mui/material"
import { icons } from "../layout/Colors"
import io from 'socket.io-client';
import { formatTimeStamp } from "../../helpers"


export const WorkChat = () => {
    const [showChat, setShowChat] = useState(false)
    const [online, setOnline] = useState(false)
    const { colorPalette, theme, setLoading, user, setUser } = useAppContext()
    const [users, setUsers] = useState([])
    const [showPrivatyChat, setShowPrivatyChat] = useState({ active: false, user: {} })
    const [messages, setMessages] = useState([])
    let fotoPerfil = user?.getPhoto?.location || '';
    const [filterData, setFilterData] = useState('')
    const socket = io('http://localhost:8080');
    const [message, setMessage] = useState()

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);

        return (
            normalizeString(item?.nome)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
        )
    };

    const getUsers = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/users/employee/chat/${user?.id}`)
            const { data = [] } = response;
            console.log('entrou aqui', data)
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getUsers()
    }, [])


    useEffect(() => {
        console.log('Socket criado:', socket);

        socket.on('connect', () => {
            console.log('Conectado ao servidor WebSocket');
            setOnline(true); // Atualiza o estado para online quando conectado
            socket.emit('updateStatusOnline', { userId: user.id, status: 1 }); // Emite evento apenas quando conectado
        });

        socket.on('disconnect', () => {
            console.log('Desconectado do servidor WebSocket');
            setOnline(false); // Atualiza o estado para offline quando desconectado
            socket.emit('updateStatusOnline', { userId: user.id, status: 0 }); // Emite evento apenas quando desconectado
        });

        socket.on('error', (err) => {
            console.error('Erro na conexão do Socket.IO:', err);
        });

        socket.on('userOnline', ({ userId }) => {
            console.log(`Usuário ${userId} está online`);
            // Atualize o estado local do usuário para online
            if (userId === user?.id) {
                setUser((prevUser) => ({ ...prevUser, online: 1 }));
            }

            setUsers((prevUsers) =>
                prevUsers.map((userItem) =>
                    userItem.id === userId ? { ...userItem, online: 1 } : userItem
                )
            );
        });

        socket.on('userOffline', ({ userId }) => {
            console.log(`Usuário ${userId} está offline`);
            // Atualize o estado local do usuário para offline
            if (userId === user?.id) {
                setUser((prevUser) => ({ ...prevUser, online: 0 }));
            }
            setUsers((prevUsers) =>
                prevUsers.map((userItem) =>
                    userItem.id === userId ? { ...userItem, online: 0 } : userItem
                )
            );
        });

        return () => {
            socket.emit('updateStatusOnline', { userId: user?.id, status: 0 });
            socket.disconnect(); // Desconecte o socket quando o componente for desmontado
        };
    }, [user?.id, setUser]);




    const handleSendMessage = async () => {
        if (message.trim() === '') return;
        try {
            let messageData = { texto: message, de_usuario_id: user.id, para_usuario_id: showPrivatyChat?.user?.id, vizualizada: 0 }
            socket.emit('sendMessage', messageData);
            setMessages([...messages, messageData]);
            setMessage('');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    };


    useEffect(() => {
        socket.on('newMessage', (newMessage) => {
            if (!messages.some(msg => msg.id_mensagem === newMessage.id_mensagem)) {
                setMessages([...messages, newMessage]); // Adiciona a nova mensagem à lista de mensagens exibidas em tempo real
            }
        });

        return () => {
            socket.off('newMessage'); // Remove o listener quando o componente for desmontado
        };
    }, [messages]);


    return (
        <>
            <Box sx={{
                ...styles.containerChat, height: showChat ? 500 : 50, width: '300px', border: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
                backgroundColor: colorPalette.secondary, boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                alignItems: 'start',
                "&:hover": {
                    opacity: showChat ? 1 : 0.8,
                    cursor: 'pointer'
                },
            }}>
                <Box sx={{
                    display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: showChat ? '5px 12px' : '0px 12px',
                    borderBottom: showChat && `1px solid ${theme ? '#eaeaea' : '#404040'}`,
                }} onClick={() => {
                    setShowChat(!showChat)
                }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
                            <Avatar
                                sx={{ width: '35px', height: '35px', border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                                src={fotoPerfil || `https://mf-planejados.s3.us-east-1.amazonaws.com/melies/perfil-default.jpg`}
                            />
                            <IconStatus
                                style={{
                                    backgroundColor: parseInt(user?.online) > 0 ? 'green' : 'red',
                                    position: 'absolute', bottom: 2, left: 25, width: 12, height: 12
                                }}
                            />
                        </Box>
                        <Text bold>WorkChat</Text>
                    </Box>
                    <Box sx={{
                        ...styles.menuIcon,
                        width: 17, height: 17,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transform: showChat ? 'rotate(0deg)' : 'rotate(-180deg)',
                        transition: '.3s',
                    }} />
                </Box>
                <TextInput placeholder="Buscar pelo nome.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData}
                    sx={{ width: '100%', height: 40 }} InputProps={{ style: { height: 35 } }} />
                <Divider />
                <Box sx={{ display: showChat ? 'flex' : 'none', flexDirection: 'column', maxHeight: 400, overflow: 'auto' }}>
                    {users?.filter(filter)?.map((user, index) => {
                        return (
                            <CardUser key={index} user={user} setShowPrivatyChat={setShowPrivatyChat} />
                        )
                    })}
                </Box>
            </Box>

            {showPrivatyChat?.active &&
                <ChatUser
                    showPrivatyChat={showPrivatyChat}
                    setShowPrivatyChat={setShowPrivatyChat}
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    messages={messages}
                    setMessages={setMessages}
                />
            }
        </>
    )
}


const CardUser = ({ user, setShowPrivatyChat }) => {

    const name = user?.nome?.split(' ');
    const firstName = name[0];
    const lastName = name[name.length - 1];
    const userName = `${firstName} ${lastName}`;
    const { colorPalette, theme, setLoading } = useAppContext()

    return (
        <Box sx={{
            display: 'flex', justifyContent: 'flex-start', padding: '8px 12px',
            transition: '.3s', flexDirection: 'column',
            borderRadius: 2, borderBottom: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
            "&:hover": {
                opacity: 0.8,
                backgroundColor: colorPalette.primary + '77',
                cursor: 'pointer'
            },
        }} onClick={() => setShowPrivatyChat({ active: true, user: user })}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', alignItems: 'start', width: '100%', padding: '0px 12px' }}>
                <Box sx={{ display: 'flex', gap: 1, position: 'relative', width: 40 }}>
                    {user?.mensagensChat > 0 && <Box sx={{
                        position: 'absolute',
                        width: 11,
                        height: 11,
                        borderRadius: 5,
                        backgroundColor: 'red',
                        alignItems: 'center',
                        justifyContent: 'center',
                        top: 3,
                        left: 5
                    }}>
                        <Text bold style={{ color: '#fff', fontSize: '8px', textAlign: 'center' }}>{user?.mensagensChat}</Text>
                    </Box>}
                    <Avatar
                        sx={{ width: '35px', height: '35px', border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                        src={user?.location}
                    />
                    <IconStatus
                        style={{
                            backgroundColor: parseInt(user?.online) > 0 ? 'green' : 'red',
                            position: 'absolute', bottom: 2, left: 25, width: 12, height: 12
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                    <Text small bold>{userName}</Text>
                    <Text small light>{user?.funcao || user?.area}</Text>
                </Box>
            </Box>
        </Box>
    )
}




const ChatUser = ({ showPrivatyChat, setShowPrivatyChat, message, setMessage, messages, handleSendMessage, setMessages }) => {

    const name = showPrivatyChat?.user && showPrivatyChat?.user?.nome?.split(' ');
    const firstName = name && name[0];
    const lastName = name && name[name.length - 1];
    const userName = `${firstName} ${lastName}`;
    const { colorPalette, theme, setLoading, user } = useAppContext()
    const [loadingMessages, setLoadingMessages] = useState(false)
    let fotoPerfil = user?.getPhoto?.location || '';

    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const markMessagesAsViewed = async (menssagemData) => {
        try {
            const unreadMessages = menssagemData.filter(item => item.de_usuario_id !== user.id && item.vizualizada === 0);
            if (unreadMessages?.length > 0) {
                console.log('entrou aqui')
                // Atualiza as mensagens para vizualizada: 1
                const updatedMessages = unreadMessages.map(item => ({ ...item, vizualizada: 1 }));
                await api.patch('/messages/viewed', { messages: updatedMessages });
                // Atualiza o estado das mensagens com as mensagens marcadas como visualizadas
                const updatedStateMessages = menssagemData.map(item => updatedMessages.find(msg => msg.id_mensagem === item.id_mensagem) || item);
                setMessages(updatedStateMessages);
            }
        } catch (error) {
            console.log('Erro ao marcar mensagens como visualizadas:', error);
        }
    };

    const getMessages = async () => {
        setLoadingMessages(true)
        try {
            const response = await api.get(`/message/${showPrivatyChat?.user?.id}/${user?.id}`)
            const { data = [] } = response;
            setMessages(data)
            await markMessagesAsViewed(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingMessages(false)
        }
    }


    useEffect(() => {
        getMessages()
    }, [showPrivatyChat?.user])


    useEffect(() => {
        scrollToBottom();
    }, [message])


    return (
        <Box sx={{
            display: showPrivatyChat?.active ? 'flex' : 'none', justifyContent: 'space-between', padding: '8px 12px',
            transition: '.3s', flexDirection: 'column',
            position: 'fixed',
            zIndex: 99999,
            bottom: 0,
            right: 450,
            height: 500, width: '480px',
            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
            backgroundColor: colorPalette.secondary, boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
        }}>
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Box sx={{
                    display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '5px 12px',
                    borderBottom: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
                }}>
                    <Box sx={{ display: 'flex', gap: 1, }}>
                        <Box sx={{ display: 'flex', gap: 1, position: 'relative', width: 40 }}>
                            <Avatar
                                sx={{ width: '35px', height: '35px', border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                                src={showPrivatyChat?.user?.location}
                            />
                            <IconStatus
                                style={{
                                    backgroundColor: parseInt(showPrivatyChat?.user?.online) > 0 ? 'green' : 'red',
                                    position: 'absolute', bottom: 2, left: 25, width: 12, height: 12
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                            <Text small bold>{userName}</Text>
                            <Text small light>{showPrivatyChat?.user?.funcao || showPrivatyChat?.user?.area}</Text>
                        </Box>
                    </Box>

                    <Box sx={{
                        ...styles.menuIcon,
                        width: 14,
                        height: 14,
                        aspectRatio: '1:1',
                        backgroundImage: `url(${icons.gray_close})`,
                        transition: '.3s',
                        zIndex: 9999,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => setShowPrivatyChat({ active: false, user: {} })} />

                </Box>

                <div ref={messagesContainerRef} style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {loadingMessages ? (
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                            <CircularProgress />
                            <Text small light>Carregando mensagens..</Text>
                        </Box>
                    ) : messages?.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px', backgroundColor: colorPalette.primary }}>
                            {messages.map((item, index) => {
                                const isOwner = item.de_usuario_id === user.id;
                                const senderName = isOwner ? user.nome : item.de_usuario_nome;
                                const senderAvatar = isOwner ? fotoPerfil : item.de_usuario_foto;
                                const isNewMessage = !isOwner && parseInt(item.vizualizada) === 0;

                                return (
                                    <Box key={index} sx={{ width: '90%', justifyContent: isOwner ? 'flex-end' : 'flex-start', display: 'flex', gap: 1 }}>
                                        {!isOwner && <Avatar sx={{ width: '35px', height: '35px', border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }} src={senderAvatar} />}
                                        <Box sx={{
                                            display: 'flex', gap: 1, justifyContent: 'flex-start', alignItems: 'flex-start', width: '90%', padding: '5px 12px',
                                            border: isNewMessage && `1px solid ${colorPalette?.buttonColor}`,
                                            borderBottom: !isNewMessage && `1px solid ${theme ? '#eaeaea' : '#404040'}`, boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`, borderRadius: 2, backgroundColor: isOwner ? colorPalette?.buttonColor + '33' : colorPalette?.secondary
                                        }}>
                                            <Box sx={{ display: 'flex', gap: .5, justifyContent: 'flex-start', alignItems: 'start', width: '100%', flexDirection: 'column' }}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <Text small bold>{senderName}</Text>
                                                    {isNewMessage && <Box sx={{ display: 'flex', width: 8, height: 8, borderRadius: 8, backgroundColor: colorPalette?.buttonColor }} />}
                                                </Box>
                                                <Text small light>{item?.texto}</Text>
                                                <Text xsmall light style={{ color: 'gray' }}>{formatTimeStamp(item?.dt_criacao, true)}</Text>
                                            </Box>
                                        </Box>
                                        {isOwner && <Avatar sx={{ width: '35px', height: '35px', border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }} src={senderAvatar} />}
                                    </Box>
                                );
                            })}
                        </Box>
                    ) : (
                        <Text small light>Não existem mensagens nesta conversa.</Text>
                    )}
                </div>

            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, borderTop: `1px solid ${theme ? '#eaeaea' : '#404040'}`, paddingTop: '12px' }}>
                <TextInput
                    placeholder='Escreva sua mensagem'
                    name='descr_interacao'
                    onChange={(e) => setMessage(e.target.value)}
                    value={message || ''}
                    sx={{ flex: 1, }}
                    multiline
                    maxRows={8}
                    rows={3}
                />
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                    <Button secondary text="Enviar" small style={{ width: 120 }} onClick={() => handleSendMessage()} />
                </Box>
            </Box>
        </Box>
    )
}

const styles = {
    containerChat: {
        display: 'flex',
        transition: '.3s',
        gap: 1,
        position: 'fixed',
        zIndex: 99999,
        bottom: 0,
        right: 120,
        padding: '10px 20px',
        justifyContent: 'flex-start',
        borderRadius: '8px 8px 0px 0px',
        flexDirection: 'column'
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
}