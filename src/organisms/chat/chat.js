import React, { useEffect, useRef, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { IconStatus } from "../Table/table"
import { api } from "../../api/api"
import { Avatar, CircularProgress, Tooltip } from "@mui/material"
import { icons } from "../layout/Colors"
import io from 'socket.io-client';
import { formatTimeStamp, getRandomInt } from "../../helpers"
import Dropzone from "react-dropzone"
import { BsPaperclip } from 'react-icons/bs';
import { IoHappyOutline } from 'react-icons/io5';


export const WorkChat = () => {
    const [showChat, setShowChat] = useState(false)
    const [showTypeChat, setShowTypeChat] = useState({
        people: true,
        conversations: false
    })
    const [online, setOnline] = useState(false)
    const { colorPalette, theme, setLoading, user, setUser } = useAppContext()
    const [users, setUsers] = useState([])
    const [filesConversation, setFilesConversation] = useState([])
    const [conversationsList, setConversationsList] = useState([])
    const [newMessages, setNewMessages] = useState(0)
    const [conversationChat, setConversationChat] = useState({ active: true, user: {}, messages: [] })
    const [conversationData, setConversation] = useState({ url_key: '', messages: [] })
    let fotoPerfil = user?.getPhoto?.location || '';
    const [filterData, setFilterData] = useState('')
    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    const [message, setMessage] = useState()
    const [loadingChat, setLoadingChat] = useState(false)

    const messagesContainerRef = useRef(null);

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);

        return (
            normalizeString(item?.nome)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
        )
    };

    const audioRef = useRef(null);

    const handlePermissionSound = async () => {

        try {
            if (audioRef.current && Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    audioRef.current.muted = false;
                    await audioRef.current.play();
                }
            } else {
                audioRef.current.muted = false;
            }
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
        }
    };

    const handleClickToShowChat = async () => {
        setShowChat(!showChat);

        try {
            if (audioRef.current && Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    audioRef.current.muted = false;
                }
            } else {
                audioRef.current.muted = false;
            }
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
        }
    };

    const getUsers = async () => {
        setLoadingChat(true)
        try {
            const response = await api.get(`/users/employee/chat/${user?.id}`)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingChat(false)
        }
    }


    const getConversations = async () => {
        setLoadingChat(true)
        try {
            const response = await api.get(`/conversations/chat/${user?.id}`)
            const { data = [] } = response;

            const newMessagesFiltered = data?.map(item => parseInt(item?.msg_novas))?.reduce((curr, acc) => curr += acc, 0)
            if (newMessagesFiltered > 0) {
                document.title = `(${newMessagesFiltered}) - Administrativo Méliès`;

                setTimeout(() => {
                    document.title = `(${newMessagesFiltered}) - Administrativo Méliès`;
                }, 2500); // Altere o tempo conforme necessário
            } else {
                document.title = 'Administrativo Méliès'; // Título padrão sem número de novas mensagens
            }
            setNewMessages(newMessagesFiltered)
            setConversationsList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingChat(false)
        }
    }

    useEffect(() => {
        getUsers()
        getConversations()
        setConversationChat({ active: false, user: {}, messages: [] })
    }, [])


    const handleChangeTypeChat = ({ people = true, conversations = false }) => {
        setShowTypeChat({
            people: people,
            conversations: conversations
        })
        if (people) { getUsers() }
        if (conversations) { getConversations() }
    }


    useEffect(() => {
        socket.on('connect', () => {
            setOnline(true);
            socket.emit('updateStatusOnline', { userId: user.id, status: 1 }); // Emite evento apenas quando conectado
        });

        socket.on('disconnect', () => {
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
            socket.disconnect();
        };
    }, [user?.id, setUser]);




    const handleSendMessage = async () => {
        if (message.trim() === '') return;
        try {
            let messageData = {
                texto: message,
                de_usuario_id: user.id,
                para_usuario_id: conversationChat?.user?.id,
                vizualizada: 0,
                conversa_id: conversationData?.id_conversa || null,
                grupo_id: conversationData?.grupo_id || null
            }
            socket.emit('sendMessage', messageData);
            setMessage('');

            setConversationsList(prevConversion => {
                if (prevConversion && prevConversion?.length > 0) {
                    const updateList = prevConversion?.map(item => {
                        if (item?.id_conversa === conversationData?.id_conversa) {
                            return {
                                ...item,
                                ultima_msg_texto: message,
                            }
                        }
                        return item
                    })
                    return updateList
                }
                return prevConversion
            })
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    };

    const originalTitle = document.title;
    document.title = newMessages > 0 ? `(${newMessages}) - Administrativo Méliès` : originalTitle;

    useEffect(() => {

        socket.on('newMessage', async (newMessage) => {
            if (!conversationData?.messages?.some(msg => msg.id_mensagem === newMessage?.id_mensagem)) {
                setConversation(prevConversation => ({
                    ...prevConversation,
                    messages: [...(prevConversation?.messages || []), newMessage] // Adiciona a nova mensagem à lista de mensagens exibidas em tempo real
                }));// Adiciona a nova mensagem à lista de mensagens exibidas em tempo real

                if (newMessage?.para_usuario_id === user?.id) {
                    setNewMessages(prevCount => prevCount + 1);
                    await handlePermissionSound()
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }

                    setConversationsList(prevConversion => {
                        if (prevConversion && prevConversion?.length > 0) {
                            const updateList = prevConversion?.map(item => {
                                if (item?.id_conversa === conversationData?.id_conversa) {
                                    return {
                                        ...item,
                                        ultima_msg_texto: newMessage?.texto,
                                    }
                                }
                                return item
                            })
                            return updateList
                        }
                        return prevConversion
                    })
                }
            }
        });

        return () => {
            socket.off('newMessage'); // Remove o listener quando o componente for desmontado
        };
    }, [conversationData]);


    return (
        <>
            <audio ref={audioRef} src="/sons/notification_sound.mp3" style={{ display: 'none' }} muted></audio>

            <Box sx={{
                ...styles.containerChat, height: showChat ? 620 : 50, width: '300px', border: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
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
                    handleClickToShowChat()
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
                    <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 16,
                            height: 16,
                            backgroundImage: `url('/icons/chat_icon.png')`,
                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                            transition: 'background-color 1s',
                            transition: '.3s',
                            aspectRatio: '1/1',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                        {parseInt(newMessages) > 0 &&
                            <Box sx={{
                                width: 14,
                                height: 14,
                                position: 'absolute',
                                borderRadius: 14,
                                backgroundColor: 'red',
                                alignItems: 'center',
                                justifyContent: 'center',
                                top: -4,
                                right: -14
                            }}>
                                <Text bold xsmall style={{ color: '#fff', textAlign: 'center' }}>{newMessages}</Text>
                            </Box>}
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

                <Box sx={{
                    display: 'flex', gap: 3, width: '100%', borderBottom: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
                    justifyContent: 'space-around'
                }}>
                    <Box sx={{
                        borderBottom: `2px solid ${showTypeChat?.people ? 'black' : 'transparent'}`, padding: '10px 0px', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                        width: '100%', "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => handleChangeTypeChat({ people: true, conversations: false })}>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 16,
                            height: 16,
                            backgroundImage: `url('/icons/people_icon.png')`,
                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                            transition: 'background-color 1s',
                            transition: '.3s',
                            aspectRatio: '1/1',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                        <Text>Pessoas</Text>
                    </Box>
                    <Box sx={{
                        borderBottom: `2px solid ${showTypeChat?.conversations ? 'black' : 'transparent'}`, padding: '10px 0px', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                        width: '100%', "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => handleChangeTypeChat({ people: false, conversations: true })}>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 16,
                            height: 16,
                            backgroundImage: `url('/icons/chat_icon.png')`,
                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                            transition: 'background-color 1s',
                            transition: '.3s',
                            aspectRatio: '1/1',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} />
                        <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
                            <Text>Conversas</Text>

                            {parseInt(newMessages) > 0 &&
                                <Box sx={{
                                    width: 14,
                                    height: 14,
                                    position: 'absolute',
                                    borderRadius: 14,
                                    backgroundColor: 'red',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    top: -4,
                                    right: -14
                                }}>
                                    <Text bold xsmall style={{ color: '#fff', textAlign: 'center' }}>{newMessages}</Text>
                                </Box>}
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: showChat ? 'flex' : 'none', flexDirection: 'column', maxHeight: 400, overflow: 'auto', width: '100%' }}>
                    {loadingChat ? (
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                            <CircularProgress />
                            <Text small light>Carregando Chat...</Text>
                        </Box>
                    ) : (
                        <>

                            {showTypeChat?.people && users?.filter(filter)?.map((user, index) => {
                                return (
                                    <CardUser
                                        key={index}
                                        user={user}
                                        setConversationChat={setConversationChat}
                                    />
                                )
                            })}

                            {showTypeChat?.conversations && conversationsList?.map((chat, index) => {
                                return (
                                    <CardConversation
                                        key={index}
                                        conversation={chat}
                                        setConversationChat={setConversationChat}
                                        conversationChat={conversationChat}
                                        users={users}
                                    />
                                )
                            })}
                        </>
                    )}
                </Box>
            </Box>

            {(conversationChat?.active && conversationChat?.user) &&
                <ChatUser
                    conversationChat={conversationChat}
                    setConversationChat={setConversationChat}
                    message={message}
                    setMessage={setMessage}
                    handleSendMessage={handleSendMessage}
                    conversationData={conversationData}
                    setConversation={setConversation}
                    filesConversation={filesConversation}
                    setFilesConversation={setFilesConversation}
                    messagesContainerRef={messagesContainerRef}
                />
            }
        </>
    )
}


const CardUser = ({ user, setConversationChat }) => {

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
        }} onClick={() => setConversationChat({ active: true, user: user, messages: [] })}>
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

const CardConversation = ({ conversation, setConversationChat, users, conversationChat }) => {
    const { colorPalette, theme, setLoading, user } = useAppContext()
    const [userOnline, setUserOnline] = useState(0)
    const [userFinded, setUserFinded] = useState({})
    const [userName, setUserName] = useState()

    const verifyOnline = async (users) => {
        let usersList = users;
        let [userFiltered] = await usersList?.filter((item) => (item?.id === (user?.id !== conversation?.usuario_2_id ? conversation?.usuario_2_id : conversation?.usuario_1_id)))

        const name = userFiltered?.nome?.split(' ');
        const firstName = name[0];
        const lastName = name[name.length - 1];
        const userName = `${firstName} ${lastName}`;

        setUserFinded(userFiltered)
        setUserOnline(userFiltered?.online)
        setUserName(userName)
        return
    }


    useEffect(() => {
        verifyOnline(users)
    }, [conversation])

    return (
        <Box sx={{
            display: 'flex', justifyContent: 'flex-start', padding: '8px 12px',
            width: '100%',
            transition: '.3s', flexDirection: 'column',
            borderRadius: 2, borderBottom: `1px solid ${theme ? '#eaeaea' : '#404040'}`,
            "&:hover": {
                opacity: 0.8,
                backgroundColor: colorPalette.primary + '77',
                cursor: 'pointer'
            },
        }} onClick={() => setConversationChat({
            active: true,
            user: userFinded,
            messages: []
        })}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start', alignItems: 'start', width: '100%', padding: '0px 12px' }}>
                <Box sx={{ display: 'flex', gap: 1, position: 'relative', width: 40 }}>
                    <Avatar
                        sx={{ width: '35px', height: '35px', border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                        src={userFinded?.location}
                    />
                    <IconStatus
                        style={{
                            backgroundColor: userOnline && userOnline > 0 ? 'green' : 'red',
                            position: 'absolute', bottom: 2, left: 25, width: 12, height: 12
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                    <Text small bold>{userName}</Text>
                    <Text small light style={{
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        maxWidth: '160px',
                    }}>{conversation?.ultima_msg_texto}</Text>
                </Box>
                {parseInt(conversation?.msg_novas) > 0 &&
                    <Box sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 14,
                        backgroundColor: 'red',
                        alignItems: 'center',
                        justifyContent: 'center',
                        top: 3,
                        left: 5
                    }}>
                        <Text bold small style={{ color: '#fff', textAlign: 'center' }}>{conversation?.msg_novas}</Text>
                    </Box>}
            </Box>
        </Box >
    )
}

const ChatUser = ({ conversationChat, messagesContainerRef, setConversationChat, message, setMessage, conversationData, handleSendMessage, setConversation,
    setFilesConversation, filesConversation }) => {

    const name = conversationChat?.user && conversationChat?.user?.nome?.split(' ');
    const firstName = name && name[0];
    const lastName = name && name[name.length - 1];
    const userName = `${firstName} ${lastName}`;
    const { colorPalette, theme, setLoading, user } = useAppContext()
    const [loadingMessages, setLoadingMessages] = useState(false)
    let fotoPerfil = user?.getPhoto?.location || '';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const handleToggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleToggleIconPicker = () => {
        setShowIconPicker(!showIconPicker);
    };

    const handleSelectEmoji = (emoji) => {
        // Lógica para inserir o emoji selecionado no texto
        console.log('Emoji selecionado:', emoji);
    };

    const markMessagesAsViewed = async (menssagemData) => {
        try {
            const unreadMessages = menssagemData.filter(item => item.de_usuario_id !== user.id && item.vizualizada === 0);
            if (unreadMessages?.length > 0) {
                const updatedMessages = unreadMessages.map(item => ({ ...item, vizualizada: 1 }));
                await api.patch('/messages/viewed', { messages: updatedMessages });
                const updatedStateMessages = menssagemData.map(item => updatedMessages.find(msg => msg.id_mensagem === item.id_mensagem) || item);
                setConversation(prevConversation => ({
                    ...prevConversation,
                    messages: updatedStateMessages
                }))
            }
        } catch (error) {
            console.log('Erro ao marcar mensagens como visualizadas:', error);
        }
    };


    const getConversation = async () => {
        setLoadingMessages(true)
        try {
            const response = await api.get(`/conversation/${user?.id}/${conversationChat?.user?.id}`)
            const { data } = response;
            if (data) {
                await setConversation(data)
                // await markMessagesAsViewed(data?.messages)
                scrollToBottom()
            } else {
                setConversation({ url_key: '', messages: [] })
            }
        } catch (error) {
            console.log(error)
        } finally {
            scrollToBottom()
            setLoadingMessages(false)
        }
    }


    const handleRemoveFile = (file) => {
        const arquivosAtualizados = filesConversation.filter((uploadedFile) => uploadedFile.id !== file.id);
        setFilesConversation(arquivosAtualizados);
    };


    useEffect(() => {
        getConversation()
    }, [conversationChat])


    useEffect(() => {
        scrollToBottom();
    }, [conversationData?.messages?.length || 0, conversationChat.active, conversationChat.user]);


    return (
        <Box sx={{
            display: conversationChat?.active ? 'flex' : 'none', justifyContent: 'space-between',
            padding: '12px 12px',
            transition: '.3s', flexDirection: 'column',
            position: 'fixed',
            zIndex: 99999,
            borderRadius: '8px 8px 0px 0px',
            bottom: 0,
            right: 450,
            height: 520, width: '480px',
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
                                src={conversationChat?.user?.location}
                            />
                            <IconStatus
                                style={{
                                    backgroundColor: parseInt(conversationChat?.user?.online) > 0 ? 'green' : 'red',
                                    position: 'absolute', bottom: 2, left: 25, width: 12, height: 12
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                            <Text small bold>{userName}</Text>
                            <Text small light>{conversationChat?.user?.funcao || conversationChat?.user?.area}</Text>
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
                    }} onClick={async () => {
                        setConversationChat({ active: false, user: {}, messages: [] })
                        await markMessagesAsViewed(conversationData?.messages)

                    }} />

                </Box>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '260px', overflowY: 'auto',
                    justifyContent: 'flex-end',
                }}>
                    {loadingMessages ? (
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                            <CircularProgress />
                            <Text small light>Carregando mensagens..</Text>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px', backgroundColor: colorPalette.primary, }}>
                            {conversationData?.messages && conversationData?.messages?.map((item, index, array) => {
                                const isOwner = item.de_usuario_id === user.id;
                                const senderName = isOwner ? user.nome : item.de_usuario_nome;
                                const senderAvatar = isOwner ? fotoPerfil : item.de_usuario_foto;
                                const isNewMessage = !isOwner && parseInt(item.vizualizada) === 0;

                                const messageDate = new Date(item.dt_criacao).toLocaleDateString();
                                const previousMessage = array[index - 1];
                                const previousMessageDate = previousMessage ? new Date(previousMessage.dt_criacao).toLocaleDateString() : null;

                                // Verifica se a data da mensagem é diferente da data da mensagem anterior
                                const showDateHeader = previousMessageDate !== messageDate;
                                const currentDay = new Date()

                                const isToday = (dateString) => {

                                    if (dateString) {

                                        const today = new Date();
                                        const messageDate = new Date(dateString);
                                        return (
                                            today.getDate() === messageDate.getDate() &&
                                            today.getMonth() === messageDate.getMonth() &&
                                            today.getFullYear() === messageDate.getFullYear()
                                        );
                                    } else {
                                        return ''
                                    }
                                };


                                return (
                                    <Box key={index}>
                                        {showDateHeader && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                <Box sx={{
                                                    display: 'flex', padding: '8px 12px', borderRadius: 2, backgroundColor: colorPalette?.secondary,
                                                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                                                    alignItems: 'center', justifyContent: 'center',
                                                    marginTop: 2, marginBottom: 2
                                                }}>
                                                    <Text bold style={{ textAlign: 'center' }}>
                                                        {isToday(item.dt_criacao) ? 'Hoje' : formatTimeStamp(item.dt_criacao)}
                                                    </Text>
                                                </Box>
                                            </Box>
                                        )}
                                        <Box sx={{ width: '90%', justifyContent: isOwner ? 'flex-end' : 'flex-start', display: 'flex', gap: 1 }}>
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
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </div>

            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: `1px solid ${theme ? '#eaeaea' : '#404040'}`, paddingTop: '12px', marginBottom: 1 }}>
                <TextInput
                    placeholder='Escreva sua mensagem'
                    name='descr_interacao'
                    onChange={(e) => setMessage(e.target.value)}
                    value={message || ''}
                    sx={{ flex: 1, }}
                    InputProps={{
                        style: {
                            border: 'none'
                        }
                    }}
                    multiline
                    maxRows={8}
                    rows={2}
                />

                {filesConversation?.length > 0 &&
                    <Box sx={{
                        display: 'flex', gap: .5, overflowX: 'auto',
                        overflowStyle: 'marquee,panner',
                        scrollbarHeight: 'thin',
                        scrollbarColor: 'gray lightgray',
                    }}>
                        {filesConversation?.map((item, index) => {
                            const name = item?.name_file || item?.name
                            return (
                                <Box key={index} sx={{
                                    display: 'flex', gap: 1,
                                    flexShrink: 0,
                                    minWidth: 100,
                                    backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                }} >
                                    <Box sx={{
                                        display: 'flex', gap: 1, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between',
                                    }} >
                                        <Text xsmall style={{ textDecoration: 'underline', color: 'blue', flexWrap: 'nowrap' }}>{decodeURI(name)}</Text>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 12,
                                            height: 12,
                                            aspectRatio: '1:1',
                                            backgroundImage: `url(${icons?.gray_close})`,
                                            transition: '.3s',
                                            zIndex: 9999,
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => handleRemoveFile(item)} />
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>}

                <Divider distance={0} />
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <DropZoneFiles setFilesDrop={setFilesConversation} filesDrop={filesConversation} />
                    <Button secondary={message === '' || message === null} text="Enviar" small style={{ width: 90 }} onClick={() => handleSendMessage()} />
                </Box>
            </Box>
        </Box>
    )
}

const DropZoneFiles = ({ filesDrop, setFilesDrop, children }) => {

    const { setLoading, colorPalette, theme } = useAppContext()


    const onDropFiles = async (files) => {
        try {
            setLoading(true)
            const uploadedFiles = files.map(file => ({
                file,
                id: getRandomInt(1, 999),
                name: file.name,
                preview: URL.createObjectURL(file),
                progress: 0,
                uploaded: false,
                error: false,
                url: null
            }));

            setFilesDrop(prevFilesDrop => [...prevFilesDrop, ...uploadedFiles]);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    return (
        <Dropzone
            accept={{ 'image/jpeg': ['.jpeg', '.JPEG', '.jpg', '.JPG'], 'image/png': ['.png', '.PNG'], 'application/pdf': ['.pdf'] }}
            onDrop={onDropFiles}
            addRemoveLinks={true}
            removeLink={(file) => handleRemoveFile(file)}
        >
            {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                <Box {...getRootProps()}
                    sx={{
                        // ...styles.dropZoneContainer,
                        // border: `2px dashed ${colorPalette.primary + 'aa'}`,
                        // backgroundColor: isDragActive && !isDragReject ? colorPalette.secondary : isDragReject ? '#ff000042' : colorPalette.primary,
                    }}
                >
                    <input {...getInputProps()} />
                    <Tooltip title={"Anexar arquivo na conversa."} sx={{ zIndex: 99999999 }}>
                        <div>
                            <Box sx={{
                                display: 'flex', padding: '4px', borderRadius: '4px',
                                alignItems: 'center', justifyContent: 'center',
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer',
                                    backgroundColor: colorPalette?.primary + '99'
                                }
                            }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 20,
                                    height: 20,
                                    aspectRatio: '1:1',
                                    backgroundImage: `url('/icons/anexar_icon.png')`,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} />

                            </Box>
                        </div>
                    </Tooltip>
                </Box>
            )}
        </Dropzone>
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