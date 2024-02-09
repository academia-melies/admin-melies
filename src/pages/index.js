import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Box, Button, ContentContainer, Divider, Text, TextInput } from '../atoms'
import { Carousel } from '../organisms'
import { useAppContext } from '../context/AppContext'
import { icons } from '../organisms/layout/Colors'
import { useEffect, useState } from 'react'
import { menuItems } from '../permissions'
import { useRouter } from 'next/router'
import { getImageByScreen } from '../validators/api-requests'
import { api } from '../api/api'
import { Avatar, Backdrop } from '@mui/material'
import { formatDate, formatTimeAgo, formatTimeStamp } from '../helpers'
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // Estilo para o recurso de arrastar e soltar (se estiver usando)
import "react-big-calendar/lib/addons/dragAndDrop"; // Recurso de arrastar e soltar (se estiver usando)
import Hamburger from 'hamburger-react'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

const backgroundHome = [
   { name: 'slide-1', location: 'https://adm-melies.s3.amazonaws.com/slide-3.jpg' },
   { name: 'slide-2', location: 'https://adm-melies.s3.amazonaws.com/slide-5.jpg' },
]

const menuProfessor = [
   { id: '01', icon: '', text: 'Aulas do dia', to: '/academic/frequency/list', query: true },
   { id: '02', icon: '', text: 'Lançar nota', to: '/academic/studentGrade/list', query: true },
   { id: '03', icon: '', text: 'Atividade Complementar', to: '/', query: false },
   { id: '04', icon: '', text: 'Calendário Acadêmico', to: '/administrative/calendar/calendar', query: false },
   { id: '05', icon: '', text: 'Cronograma', to: '/administrative/classSchedule/list', query: false },
]

const birthDate = [
   { id: '01', name: 'Marcus Silva', day: 1, function: 'Desenvolvedor' },
   { id: '02', name: 'Felipe Bomfim', day: 13, function: 'Suporte' },
   { id: '03', name: 'Fulano Silva', day: 15, function: 'Suporte' },
   { id: '04', name: 'Renato Miranda', day: 5, function: 'Gerente Suporte' }
]

function Home() {

   const { user, colorPalette, theme, setLoading, alert, notificationUser } = useAppContext()
   const [menu, setMenu] = useState(menuItems)
   const [imagesList, setImagesList] = useState([])
   const [listBirthDay, setListBirthDay] = useState([])
   const [listClassesDay, setListClassesDay] = useState([])
   const [events, setEvents] = useState([])
   const [tasksList, setTasksList] = useState([])
   const [showMessageBirthDay, setShowMessageBirthDay] = useState(false)
   const [idSelected, setIdSelected] = useState()
   const [showMenuHelp, setShowMenuHelp] = useState(false)
   const [showClassDay, setShowClassDay] = useState({ active: false, item: {} })

   const [showSections, setShowSections] = useState({
      legend: false,
      notification: false,
      tasks: false
   })
   let isProfessor = user?.professor === 1 ? true : false;
   const userId = user?.id;

   const router = useRouter();
   moment.locale("pt-br");
   const localizer = momentLocalizer(moment);


   const handleImages = async () => {
      setLoading(true)
      try {
         const response = await getImageByScreen('Inicio - Banner rotativo')
         if (response.status === 200) {
            setImagesList(response.data)
         }
      } catch (error) {
         return error
      } finally {
         setLoading(false)
      }
   }


   const handleBirthday = async () => {
      setLoading(true)
      try {
         const response = await api.get(`/user/list/birthdates`)
         setListBirthDay(response?.data)
      } catch (error) {
         return error
      } finally {
         setLoading(false)
      }
   }

   const handleClassesDay = async () => {
      setLoading(true)
      try {
         const response = await api.get(`/classDay/month/now`)
         if (response.status === 200) {
            setListClassesDay(response?.data)
         }
      } catch (error) {
         console.log(error)
         return error
      } finally {
         setLoading(false)
      }
   }


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
               perfil_evento: event?.perfil_evento,
               allDay: false, // Ajuste isso com base no seu caso de uso

            }));
            setEvents([...eventsMap]);
            return
         }
      } catch (error) {
         return error
      } finally {
         setLoading(false)
      }
   }


   const getTasks = async () => {
      setLoading(true)
      try {
         const response = await api.get(`/task/user/${user?.id}`)
         const { data } = response;
         setTasksList(data?.filter(item => item?.status_chamado === 'Em aberto'))
      } catch (error) {
         console.log(error)
      } finally {
         setLoading(false)
      }
   }


   useEffect(() => {
      handleImages(imagesList)
      handleBirthday()
      handleClassesDay()
      handleEvents()
      getTasks()
   }, [])

   const nowMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
   const formattedMonth = nowMonth[0].toString().toLocaleUpperCase() + nowMonth.slice(1);
   const dataAtual = new Date();
   let anoAtual = dataAtual.getFullYear();
   const mesAtual = dataAtual.getMonth();
   const defaultYear = {
      start: new Date(anoAtual, mesAtual, 1),
      end: new Date(anoAtual, mesAtual, 31),
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

   const listEvents = [
      {
         id: '01',
         title: "Feriado",
         description: "Escola fechada para todos, não tem aula nem funciona o adm",
         location: "",
         color: "#FF0000",
      },
      {
         id: '02',
         title: "Emenda de feriado",
         description: "Não tem aula, adm funciona normalmente",
         location: "",
         color: "#FF8C00",
      },
      {
         id: '03',
         title: "Férias/recesso de professores e alunos",
         description: "Adm funciona das 9h ás 18h",
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
         title: "Avaliação",
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

   const lengthNotifications = notificationUser?.filter(item => item?.vizualizado === 0)?.length;


   const CustomToolbar = (toolbar) => {

      const goToNext = () => {
         toolbar.onNavigate('NEXT');
      };

      const goToPrev = () => {
         toolbar.onNavigate('PREV');
      };

      const firstLetter = toolbar?.label?.charAt(0).toUpperCase();
      const restOfMonth = toolbar?.label?.slice(1);
      const formattedMonth = `${firstLetter}${restOfMonth}`;


      return (
         <div className="rbc-toolbar">
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
               <Box sx={{
                  ...styles.menuIcon,
                  padding: '8px',
                  margin: '0px 5px',
                  backgroundImage: `url(${icons.gray_arrow_down})`,
                  // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                  transform: 'rotate(90deg)',
                  transition: '.3s',
                  width: 18, height: 18,
                  aspectRatio: '1/1',
                  "&:hover": {
                     opacity: 0.8,
                     cursor: 'pointer',
                     backgroundColor: colorPalette.primary
                  }
               }} onClick={goToPrev} />
               <Text small bold>{formattedMonth}</Text>
               <Box sx={{
                  ...styles.menuIcon,
                  margin: '0px 5px',
                  backgroundImage: `url(${icons.gray_arrow_down})`,
                  // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                  transform: 'rotate(-90deg)',
                  transition: '.3s',
                  width: 18, height: 18,
                  aspectRatio: '1/1',
                  "&:hover": {
                     opacity: 0.8,
                     cursor: 'pointer',
                     backgroundColor: colorPalette.primary
                  }
               }} onClick={goToNext} />
            </Box>
         </div>
      );
   };


   return (
      <>
         <Head>
            <title>Administrativo Méliès</title>
            <meta name="description" content="Generated by create next app" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charset="utf-8" />
            <link rel="icon" href="https://adm-melies.s3.amazonaws.com/logo_vermelho_linhas_brancas.svg" />
         </Head>
         <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row' }}>
            <Box sx={{
               display: 'flex', flexDirection: 'column', width: showMenuHelp ? { xs: '100%', xm: '100%', md: '75%', lg: '75%' } : { xs: '100%', xm: '96%', md: '96%', lg: '96%' }, transition: '0.5s', marginTop: 10,
               padding: { xs: '10px 15px', xm: '10px 50px', md: '10px 50px', lg: '10px 50px' }
            }}>
               <Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xm: 'row', md: 'row', lg: 'row' }, alignItems: 'center', gap: 2 }}>
                     <Text
                        bold
                        veryLarge
                        style={{
                           padding: { xs: '0', xm: '10px 0px 10px 0px', md: '10px 0px 10px 0px', lg: '10px 0px 10px 0px' }, display: 'flex',
                           flexDirection: { xs: 'column', xm: 'row', md: 'row', lg: 'row' }, gap: 8
                        }}>
                        Bem-vindo,
                        <Text bold veryLarge style={{ color: colorPalette.buttonColor }}>
                           {user?.nome}!
                        </Text>
                     </Text>
                     <Text bold small>Se liga nas novidades...</Text>
                  </Box>
                  <Carousel
                     data={imagesList || backgroundHome}
                     style={{
                        backgroundColor: colorPalette.secondary,
                        borderRadius: '8px',
                        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                     }}
                     heigth={{ xs: 200, xm: 480, md: 200, lg: 280, xl: 400 }}
                     width={'auto'}
                  />
               </Box>
               <Box sx={{ display: { xs: 'flex', xm: 'flex', md: 'none', lg: 'none', xl: 'none' } }}>
                  <Divider distance={5} />
               </Box>

               <Box sx={{ padding: '20px 15px', borderRadius: 2, display: { xs: 'flex', xm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', backgroundColor: colorPalette.secondary }}>
                  <Box sx={{
                     display: 'flex', marginBottom: showSections?.notification && 3, gap: 2, alignItems: 'center',
                     "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                     }
                  }} onClick={() => setShowSections({ ...showSections, notification: !showSections?.notification })} >
                     <Text bold>Últimas notificações</Text>
                     <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                        transform: showSections?.notification ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: '.3s',
                        width: 13, height: 13,
                        aspectRatio: '1/1'
                     }} />
                  </Box>

                  {showSections?.notification &&
                     <Box sx={{
                        width: 200, height: notificationUser?.filter(item => item.ativo === 1)?.length > 0 ? 400 : 'auto', overflowY: 'auto', width: '100%', gap: 1, display: 'flex', flexDirection: 'column',
                        scrollbarWidth: 'thin', // para navegadores que não são WebKit
                        scrollbarColor: 'transparent transparent', // para navegadores que não são WebKit
                        '&::-webkit-scrollbar': {
                           width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                           backgroundColor: 'transparent',
                        },
                     }}>
                        {notificationUser?.filter(item => item.ativo === 1)?.length > 0 ? notificationUser
                           ?.filter(item => item.ativo === 1)
                           ?.sort((a, b) => b.dt_criacao.localeCompare(a.dt_criacao))
                           ?.slice(0, 10)
                           ?.map((item, index) => {
                              const vizualized = item?.vizualizado === 0 ? false : true
                              return (
                                 <Box key={index} sx={{
                                    display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '8px 12px',
                                    backgroundColor: colorPalette.primary,
                                    borderRadius: 2,
                                    "&:hover": {
                                       backgroundColor: colorPalette.primary + '99',
                                       cursor: 'pointer'
                                    }
                                 }}>
                                    <Box sx={{ display: 'flex', gap: 1.75, }}>
                                       <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1 }}>
                                          <Text bold>{item?.titulo}</Text>
                                          <Text>{item?.menssagem}</Text>
                                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                {item?.id_path && <Text bold small>id: {item?.id_path}</Text>}
                                                <Text style={{ color: '#606060' }} xsmall>{formatTimeAgo(item?.dt_criacao, true)}</Text>
                                                {vizualized ?
                                                   <>
                                                      <Text style={{ color: '#606060', marginTop: 2 }} xsmall>-</Text>
                                                      <Text style={{ color: '#606060', marginTop: 2 }} xsmall>vista</Text>
                                                   </>
                                                   :
                                                   <Box sx={{ backgroundColor: colorPalette.buttonColor, borderRadius: 8, padding: '1px 5px' }}>
                                                      <Text xsmall style={{ color: '#fff' }}>new</Text>
                                                   </Box>
                                                }
                                             </Box>
                                             <Button secondary text="visitar" small style={{ height: 20 }} onClick={() => router.push(item?.path)} />
                                          </Box>
                                       </Box>
                                    </Box>
                                 </Box>
                              )
                           })
                           :
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
                              <Text small>Você não possui novas notificações.</Text>
                           </Box>
                        }

                     </Box>}
               </Box>

               <Box sx={{ padding: '20px 15px', marginTop: 1, borderRadius: 2, display: { xs: 'flex', xm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', backgroundColor: colorPalette.secondary }}>
                  <Box sx={{
                     display: 'flex', marginBottom: showSections?.tasks ? 3 : 0, gap: 2, alignItems: 'center',
                     "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                     }
                  }} onClick={() => setShowSections({ ...showSections, tasks: !showSections?.tasks })} >
                     <Text bold>Chamados em aberto</Text>
                     <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                        transform: showSections?.tasks ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: '.3s',
                        width: 13, height: 13,
                        aspectRatio: '1/1'
                     }} />
                  </Box>
                  {showSections?.tasks &&
                     <Box sx={{
                        width: 200, height: tasksList?.length > 0 ? 400 : 'auto', overflowY: 'auto', width: '100%', gap: 1, display: 'flex', flexDirection: 'column',
                        scrollbarWidth: 'thin', // para navegadores que não são WebKit
                        scrollbarColor: 'transparent transparent', // para navegadores que não são WebKit
                        '&::-webkit-scrollbar': {
                           width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                           backgroundColor: 'transparent',
                        },
                     }}>
                        {tasksList?.length > 0 ?
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 5 }}>
                              {tasksList?.sort((a, b) => b.dt_criacao.localeCompare(a.dt_criacao))
                                 ?.map((item, index) => {
                                    return (
                                       <Box key={index} sx={{
                                          display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '12px 12px',
                                          backgroundColor: colorPalette.primary,
                                          borderRadius: 2,
                                          maxHeight: 150,
                                          "&:hover": {
                                             backgroundColor: colorPalette.primary + '99',
                                             cursor: 'pointer'
                                          },
                                       }}>
                                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                                             <Text bold style={{ color: colorPalette?.buttonColor }}>Aberto por:</Text>
                                             <Text>{item?.autor}</Text>
                                          </Box>
                                          <Box sx={{
                                             display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1,
                                             padding: '10px 0px'
                                          }}>
                                             <Text bold>{item?.titulo_chamado}</Text>
                                             <Text style={{
                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                             }}>{item?.descricao_chamado}</Text>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between' }}>
                                             <Text small style={{ color: '#606060' }}>aberto em: {formatTimeStamp(item?.dt_criacao, true)}</Text>
                                             <Button secondary text="visitar" small style={{ height: 20 }} onClick={() => router.push(`/suport/tasks/${item?.id_chamado}`)} />
                                          </Box>
                                       </Box>
                                    )
                                 })}
                           </Box>
                           : <Text light small>Você não possui chamados em aberto</Text>
                        }

                     </Box>
                  }
               </Box>

               <ContentContainer style={{ marginTop: '30px', boxShadow: 'none', backgroundColor: 'none', }}>
                  <Divider />
                  <Text bold title={true} sx={{ padding: { xs: '0px 0px 20px 20px', xm: '0px 0px 20px 40px', md: '0px 0px 30px 0px', lg: '0px 0px 20px 80px' } }}>
                     Menu de fácil acesso..</Text>
                  {isProfessor ?
                     (<Box sx={{ display: 'flex', gap: 5, justifyContent: 'flex-start', flexWrap: { xs: 'wrap', xm: 'wrap', md: 'wrap', lg: 'wrap' }, display: { xs: 'flex', xm: 'flex', md: 'flex', lg: 'flex' } }}>
                        {menuProfessor?.map((group, index) => {

                           return (
                              <ContentContainer key={`${group}-${index}`} sx={{
                                 alignItems: 'center', backgroundColor: colorPalette.buttonColor,
                                 width: '200px',
                                 transition: '.5s',
                                 justifyContent: 'center',
                                 "&:hover": {
                                    cursor: 'pointer',
                                    opacity: 0.8,
                                    transform: 'scale(1.1)',
                                 }
                              }} onClick={() => {
                                 group.query ?
                                    router.push(`${group.to}?id=${userId}`) : router.push(`${group.to}`)
                              }}>
                                 <Text bold style={{ color: '#fff', transition: 'background-color 1s', textAlign: 'center' }}>
                                    {group.text}
                                 </Text>
                              </ContentContainer>
                           )
                        })}

                     </Box>
                     )
                     :
                     (<Box sx={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: { xs: 'wrap', xm: 'wrap', md: 'wrap', lg: 'wrap' }, display: { xs: 'flex', xm: 'flex', md: 'flex', lg: 'flex' } }}>

                        {menu?.map((group, index) =>
                           <ContentContainer key={`${group}-${index}`} sx={{
                              alignItems: 'center', backgroundColor: colorPalette.buttonColor,
                              width: { xs: '120px', xm: '180px', md: '180px', lg: '180px' },
                              transition: '.5s',
                              "&:hover": {
                                 cursor: 'pointer',
                                 opacity: 0.8,
                                 transform: 'scale(1.1)',
                              }
                           }} onClick={() => router.push(group.to)}>
                              <Box sx={{ ...styles.icon, backgroundImage: `url(${group?.icon_dark})`, width: group?.text === 'Administrativo' ? 15 : 18, height: group.text === 'Administrativo' ? 24 : 18, filter: 'brightness(0) invert(1)', transition: 'background-color 1s' }} />
                              <Text bold style={{ color: '#fff', transition: 'background-color 1s', }}>
                                 {group.text}
                              </Text>
                           </ContentContainer>
                        )}

                     </Box>
                     )
                  }
               </ContentContainer>
               <Divider />
               <ContentContainer row style={{
                  padding: { xs: '10px', xm: '30px', md: '30px', lg: '30px' },
                  flexDirection: { xs: 'column', xm: 'row', md: 'row', lg: 'row' },
                  display: 'flex', marginTop: 5, backgroundColor: 'none', boxShadow: 'none', position: 'relative', alignItems: 'start', justifyContent: 'start'
               }}>

                  <ContentContainer sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 1, maxHeight: 350, overflowY: 'auto' }}>
                     <Text large bold style={{ textAlign: 'center' }}>Aniversáriantes de {formattedMonth} 🎉🎉</Text>
                     <Box sx={{ display: 'flex', justifyContent: 'center', }}>
                        {listBirthDay.length > 0 ?
                           <Box sx={{ borderRadius: '8px', minWidth: { xs: '100px', xm: '400px', md: '400px', lg: '400px' }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {listBirthDay?.map((item, index) => {
                                 const date = item?.nascimento?.split('T')[0]
                                 const day = date?.split('-')[2]
                                 const month = date?.split('-')[1]
                                 return (
                                    <ContentContainer row key={index} style={{ display: 'flex', backgroundColor: colorPalette?.primary, position: 'relative', boxShadow: 'none', alignItems: 'center', maxHeight: 100 }}>
                                       <Box sx={{
                                          display: 'flex', borderRadius: 40, backgroundColor: colorPalette?.buttonColor,
                                          height: { xs: 30, sm: 40, md: 40, lg: 40 },
                                          width: { xs: 30, sm: 40, md: 40, lg: 40 },
                                          padding: '5px 5px', position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 15, left: 10, zIndex: 999
                                       }}>
                                          <Text bold small style={{ color: '#fff' }}>{day}/{month}</Text>
                                       </Box>
                                       <Avatar src={item?.location} sx={{
                                          height: { xs: 40, sm: 65, md: 65, lg: 65 },
                                          width: { xs: 40, sm: 65, md: 65, lg: 65 },
                                       }} variant="circular"
                                       />
                                       <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                          <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                                             <Text light bold>{item?.nome}</Text>
                                             <Text light>{item?.funcao || 'Nenhum(a)'}</Text>
                                          </Box>
                                       </Box>
                                       <Box key={index} sx={{ display: 'flex', position: 'absolute', right: 5, bottom: 10 }}>
                                          <Button small secondary text="Dar parabéns" onClick={() => {
                                             setIdSelected(item?.id)
                                             setShowMessageBirthDay(true)
                                          }} />
                                       </Box>
                                    </ContentContainer>
                                 )
                              })}
                           </Box>
                           :
                           <Box sx={{ backgroundColor: colorPalette.secondary, padding: '5px 10px' }}>
                              <Text >Não existem aniversáriantes nesse mês</Text>
                           </Box>
                        }
                     </Box>
                     <Backdrop open={showMessageBirthDay} sx={{ zIndex: 9999 }}>
                        <BirthDateDiaog idSelected={idSelected} setShowMessageBirthDay={setShowMessageBirthDay} userBirthDay={listBirthDay} />
                     </Backdrop>
                  </ContentContainer>

                  <ContentContainer sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', gap: 1, maxWidth: 500, maxHeight: 300, overflowY: 'auto' }}>
                     <Text large bold style={{ textAlign: 'center' }}>Aulas do dia</Text>
                     <Box sx={{ display: 'flex', justifyContent: 'center', }}>
                        {listClassesDay.length > 0 ?
                           <Box sx={{ borderRadius: '8px', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {listClassesDay?.map((item, index) => {
                                 const date = formatDate(item?.dt_aula)
                                 const classDay = `${item?.nome_turma} - ${item?.nome_disciplina}`;
                                 return (
                                    <Box key={index} sx={{
                                       display: 'flex', flexDirection: 'column', position: 'relative',
                                       "&:hover": {
                                          opacity: 0.8,
                                          cursor: 'pointer'
                                       }
                                    }} onClick={() => setShowClassDay({ active: true, item })}>
                                       <ContentContainer row style={{
                                          display: 'flex',
                                          backgroundColor: colorPalette?.primary, boxShadow: 'none',
                                          alignItems: 'center',
                                          maxHeight: 100,
                                          padding: '20px'
                                       }}>
                                          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', width: '100%' }}>
                                             <Box sx={{
                                                display: 'flex', borderRadius: 5,
                                                backgroundColor: colorPalette?.buttonColor,
                                                padding: '5px 5px',
                                                position: 'absolute',
                                                top: -5,  // Ajuste aqui para mover para cima
                                                right: -10, // Ajuste aqui para mover para a esquerda
                                                zIndex: 999
                                             }}>
                                                <Text bold xsmall style={{ color: '#fff' }}>{date}</Text>
                                             </Box>
                                             <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Text light bold>{classDay}</Text>
                                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                                                   {item?.professor1 && <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                      <Text bold>1º professor: </Text>
                                                      <Text light>{item?.professor1}</Text>
                                                   </Box>}
                                                   {item?.professor2 && <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                      <Text bold>2º professor: </Text>
                                                      <Text light>{item?.professor2}</Text>
                                                   </Box>}
                                                </Box>
                                             </Box>
                                          </Box>
                                       </ContentContainer>
                                    </Box>
                                 )
                              })}
                           </Box>
                           :
                           <Box sx={{ backgroundColor: colorPalette.secondary, padding: '5px 10px' }}>
                              <Text >Não existem aulas cadastradas hoje.</Text>
                           </Box>
                        }
                     </Box>
                  </ContentContainer>
                  <Backdrop open={showClassDay?.active} sx={{ zIndex: 9999 }}>
                     <ContentContainer>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'start', width: '100%', position: 'relative' }}>
                           <Text bold>Descrição da Aula</Text>
                           <Box sx={{
                              ...styles.menuIcon,
                              backgroundImage: `url(${icons.gray_close})`,
                              transition: '.3s',
                              zIndex: 999999999,
                              position: 'absolute',
                              right: 5,
                              top: 2,
                              "&:hover": {
                                 opacity: 0.8,
                                 cursor: 'pointer'
                              }
                           }} onClick={() => setShowClassDay({ active: false, item: {} })} />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 350 }}>
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Text bold>Resumo da aula:</Text>
                              <Text>{showClassDay?.item?.resumo_aula}</Text>
                           </Box>
                           <Link href={showClassDay?.item?.link_aula || ''} target='_blank'>
                              <Button small disabled={showClassDay?.item?.link_aula ? false : true} text="Assistir aula" />
                           </Link>
                        </Box>
                     </ContentContainer>
                  </Backdrop>
               </ContentContainer>
            </Box>

            <Box sx={{ position: 'fixed', width: showMenuHelp ? '22%' : 60, transition: '.5s', overflowY: 'auto', height: 1000, right: 0, display: { xs: 'none', xm: 'none', md: 'flex', lg: 'flex' }, flexDirection: 'column', flex: 1, paddingTop: 10, backgroundColor: colorPalette?.secondary, boxShadow: `rgba(149, 157, 165, 0.5) 0px 6px 24px`, }}>
               <Box sx={{ position: 'absolute', left: 5, top: 40 }}>
                  <Hamburger
                     toggled={showMenuHelp}
                     toggle={setShowMenuHelp}
                     duration={0.5}
                     size={20}
                     color={colorPalette.textColor}
                  />
                  {(lengthNotifications > 0 && !showMenuHelp) &&
                     <Box sx={{
                        position: 'absolute',
                        width: lengthNotifications > 20 ? 21 : 17,
                        height: lengthNotifications > 20 ? 21 : 17,
                        borderRadius: lengthNotifications > 20 ? 21 : 17,
                        padding: lengthNotifications > 20 ? '3px 0px 2px 0px' : '2px',
                        backgroundColor: 'red',
                        alignItems: 'center',
                        justifyContent: 'center',
                        top: lengthNotifications > 20 ? 1 : 3,
                        left: lengthNotifications > 20 ? 1 : 5
                     }}>
                        <Text bold style={{ color: '#fff', fontSize: '10px', textAlign: 'center' }}>{lengthNotifications > 20 ? '+20' : lengthNotifications}</Text>
                     </Box>
                  }
               </Box>
               {showMenuHelp && <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: 5 }}>
                     <Text bold style={{ textAlign: 'center' }}>Eventos do mês</Text>
                     <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 5, padding: '15px' }}>
                        <Calendar
                           localizer={localizer}
                           defaultDate={moment(defaultYear?.start).toDate()}
                           culture="pt-br"
                           events={events}
                           startAccessor="start"
                           endAccessor="end"
                           selectable
                           eventPropGetter={eventStyleGetter}
                           messages={messages}
                           components={{
                              toolbar: CustomToolbar,
                           }}
                           style={{
                              fontFamily: 'MetropolisBold',
                              color: colorPalette.textColor,
                              backgroundColor: colorPalette.secondary,
                              borderRadius: '12px',
                              boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                              // border: `.5px solid lightgray`,
                              padding: 10,
                              width: '100%',
                              height: 380
                           }}
                           views={['month']}
                        />
                        <style>{`
        .rbc-btn-group > button {
            color: white; /* Defina a cor do texto dos botões do calendário para pink */
            background-color: ${colorPalette.buttonColor}
          }
          .rbc-btn-group > button:focus {
            background-color: ${colorPalette.buttonColor + '66'}; /* Defina a cor de fundo do botão quando estiver com foco (ativo) */
            outline: none; /* Remova a borda de foco padrão */
          }

         //  .rbc-toolbar {
         //    padding: 10px;
         //    display: flex;
         //    justify-content: space-between;
         //    align-items: center;
         //    color: ${colorPalette.textColor};
         //    background-color: ${colorPalette.primary};
         //    font-size: 18px;
         //    // display: none;

         //  }

          /* Estilos para os dias da semana */
          .rbc-header {
            background-color: ${colorPalette.primary};
            color: ${colorPalette.textColor};
            font-size: 14px;
            padding: 5px;
          }

          .rbc-off-range {
            color: ${colorPalette.textColor}; /* Defina a cor do texto para dias fora do intervalo */
            background-color: ${colorPalette.primary}; /* Defina a cor de fundo para dias fora do intervalo */
          }

          .rbc-off-range-bg {
            background-color: ${colorPalette.primary}; /* Defina a cor de fundo para dias fora do intervalo */
          }

          .rbc-off {
            color: ${colorPalette.textColor}; /* Defina a cor do texto para dias fora do intervalo */
            background-color: ${colorPalette.primary}; /* Defina a cor de fundo para dias fora do intervalo */
          }
        
          /* Adicione estilos para o dia atual */
          .rbc-today {
            color: ${colorPalette.textColor}; /* Defina a cor do texto para o dia atual */
            background-color: ${colorPalette.primary}; /* Defina a cor de fundo para o dia atual */
          }
      `}</style>
                     </Box>

                  </Box>
                  {/* <Divider distance={0} /> */}
                  <Box sx={{ padding: '15px 15px' }}>
                     <Box sx={{
                        display: 'flex', marginBottom: showSections?.legend && 3, gap: 2, alignItems: 'center',
                        "&:hover": {
                           opacity: 0.8,
                           cursor: 'pointer'
                        }
                     }} onClick={() => setShowSections({ ...showSections, legend: !showSections?.legend })} >
                        <Text small bold >Legenda</Text>
                        <Box sx={{
                           ...styles.menuIcon,
                           backgroundImage: `url(${icons.gray_arrow_down})`,
                           // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                           transform: showSections?.legend ? 'rotate(0deg)' : 'rotate(-90deg)',
                           transition: '.3s',
                           width: 13, height: 13,
                           aspectRatio: '1/1'
                        }} />
                     </Box>
                     {showSections?.legend && listEvents.map((item, index) => (
                        <Box key={`${item}-${index}`} sx={{ display: 'flex', gap: 2, alignItems: 'start', marginBottom: '10px' }}>
                           <Box sx={{ width: 10, height: 10, aspectRatio: '1/1', backgroundColor: item.color }} />
                           <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Text small>{item.title}</Text>
                              {item.description && <Text small>({item?.description})</Text>}
                           </Box>

                        </Box>
                     ))}
                  </Box>

                  <Divider distance={0} />
                  <Box sx={{ padding: '15px 15px' }}>
                     <Box sx={{
                        display: 'flex', marginBottom: showSections?.notification && 3, gap: 2, alignItems: 'center',
                        "&:hover": {
                           opacity: 0.8,
                           cursor: 'pointer'
                        }
                     }} onClick={() => setShowSections({ ...showSections, notification: !showSections?.notification })} >
                        <Text bold small>Últimas notificações</Text>
                        <Box sx={{
                           ...styles.menuIcon,
                           backgroundImage: `url(${icons.gray_arrow_down})`,
                           // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                           transform: showSections?.notification ? 'rotate(0deg)' : 'rotate(-90deg)',
                           transition: '.3s',
                           width: 13, height: 13,
                           aspectRatio: '1/1'
                        }} />
                     </Box>

                     {showSections?.notification &&
                        <Box sx={{
                           width: 200, height: notificationUser?.filter(item => item.ativo === 1)?.length > 0 ? 400 : 'auto', overflowY: 'auto', width: '100%', gap: 1, display: 'flex', flexDirection: 'column',
                           scrollbarWidth: 'thin', // para navegadores que não são WebKit
                           scrollbarColor: 'transparent transparent', // para navegadores que não são WebKit
                           '&::-webkit-scrollbar': {
                              width: '6px',
                           },
                           '&::-webkit-scrollbar-thumb': {
                              backgroundColor: 'transparent',
                           },
                        }}>
                           {notificationUser?.filter(item => item.ativo === 1)?.length > 0 ? notificationUser
                              ?.filter(item => item.ativo === 1)
                              ?.sort((a, b) => b.dt_criacao.localeCompare(a.dt_criacao))
                              ?.slice(0, 10)
                              ?.map((item, index) => {
                                 const vizualized = item?.vizualizado === 0 ? false : true
                                 return (
                                    <Box key={index} sx={{
                                       display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '8px 12px',
                                       backgroundColor: colorPalette.primary,
                                       borderRadius: 2,
                                       "&:hover": {
                                          backgroundColor: colorPalette.primary + '99',
                                          cursor: 'pointer'
                                       }
                                    }}>
                                       <Box sx={{ display: 'flex', gap: 1.75, }}>
                                          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1 }}>
                                             <Text small bold>{item?.titulo}</Text>
                                             <Text small>{item?.menssagem}</Text>
                                             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                   {item?.id_path && <Text bold small>id: {item?.id_path}</Text>}
                                                   <Text style={{ color: '#606060' }} xsmall>{formatTimeAgo(item?.dt_criacao, true)}</Text>
                                                   {vizualized ?
                                                      <>
                                                         <Text style={{ color: '#606060', marginTop: 2 }} xsmall>-</Text>
                                                         <Text style={{ color: '#606060', marginTop: 2 }} xsmall>vista</Text>
                                                      </>
                                                      :
                                                      <Box sx={{ backgroundColor: colorPalette.buttonColor, borderRadius: 8, padding: '1px 5px' }}>
                                                         <Text xsmall style={{ color: '#fff' }}>new</Text>
                                                      </Box>
                                                   }
                                                </Box>
                                                <Button secondary text="visitar" small style={{ height: 20 }} onClick={() => router.push(item?.path)} />
                                             </Box>
                                          </Box>
                                       </Box>
                                    </Box>
                                 )
                              })
                              :
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
                                 <Text small>Você não possui novas notificações.</Text>
                              </Box>
                           }

                        </Box>}
                  </Box>
                  <Divider distance={0} />
                  <Box sx={{ padding: '15px 15px' }}>
                     <Box sx={{
                        display: 'flex', marginBottom: showSections?.tasks ? 3 : 10, gap: 2, alignItems: 'center',
                        "&:hover": {
                           opacity: 0.8,
                           cursor: 'pointer'
                        }
                     }} onClick={() => setShowSections({ ...showSections, tasks: !showSections?.tasks })} >
                        <Text bold small>Chamados em aberto</Text>
                        <Box sx={{
                           ...styles.menuIcon,
                           backgroundImage: `url(${icons.gray_arrow_down})`,
                           // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                           transform: showSections?.tasks ? 'rotate(0deg)' : 'rotate(-90deg)',
                           transition: '.3s',
                           width: 13, height: 13,
                           aspectRatio: '1/1'
                        }} />
                     </Box>
                     {showSections?.tasks &&
                        <Box sx={{
                           width: 200, height: tasksList?.length > 0 ? 400 : 'auto', overflowY: 'auto', width: '100%', gap: 1, display: 'flex', flexDirection: 'column',
                           scrollbarWidth: 'thin', // para navegadores que não são WebKit
                           scrollbarColor: 'transparent transparent', // para navegadores que não são WebKit
                           '&::-webkit-scrollbar': {
                              width: '6px',
                           },
                           '&::-webkit-scrollbar-thumb': {
                              backgroundColor: 'transparent',
                           },
                        }}>
                           {tasksList?.length > 0 ?
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, paddingBottom: 5 }}>
                                 {tasksList?.sort((a, b) => b.dt_criacao.localeCompare(a.dt_criacao))
                                    ?.map((item, index) => {
                                       return (
                                          <Box key={index} sx={{
                                             display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '12px 12px',
                                             backgroundColor: colorPalette.primary,
                                             borderRadius: 2,
                                             maxHeight: 150,
                                             "&:hover": {
                                                backgroundColor: colorPalette.primary + '99',
                                                cursor: 'pointer'
                                             },
                                          }}>
                                             <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Text small bold style={{ color: colorPalette?.buttonColor }}>Aberto por:</Text>
                                                <Text small>{item?.autor}</Text>
                                             </Box>
                                             <Box sx={{
                                                display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1,
                                                padding: '10px 0px'
                                             }}>
                                                <Text small bold>{item?.titulo_chamado}</Text>
                                                <Text small style={{
                                                   textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                   overflow: 'hidden',
                                                }}>{item?.descricao_chamado}</Text>
                                             </Box>
                                             <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between' }}>
                                                <Text small style={{ color: '#606060' }}>aberto em: {formatTimeStamp(item?.dt_criacao, true)}</Text>
                                                <Button secondary text="visitar" small style={{ height: 20 }} onClick={() => router.push(`/suport/tasks/${item?.id_chamado}`)} />
                                             </Box>
                                          </Box>
                                       )
                                    })}
                              </Box>
                              : <Text light small>Você não possui chamados em aberto</Text>
                           }

                        </Box>
                     }
                  </Box>
               </>}
            </Box>
         </Box>
      </>
   )


}


const BirthDateDiaog = ({ idSelected, setShowMessageBirthDay, userBirthDay }) => {

   const { user, colorPalette, theme, setLoading, alert } = useAppContext()

   const [message, setMessage] = useState('')
   const nameBirthDay = userBirthDay?.filter(item => item.id === idSelected).map(item => item.nome)

   const handlePushNotification = async (id) => {
      setLoading(true)
      try {
         const notificationData = {
            titulo: `Parabéns!!`,
            menssagem: message,
            vizualizado: 0,
            usuario_env: user?.id
         }
         const response = await api.post(`/notification/create/${id}`, { notificationData })
         if (response.status === 201) {
            alert.success('Mensagem de parabéns enviada!')
            setShowMessageBirthDay(false)
         }
      } catch (error) {
         console.log(error)
         return error
      } finally {
         setLoading(false)
      }
   }

   return (

      <ContentContainer style={{ position: 'relative', width: 415, maxHeight: 600, overflowY: 'auto', padding: 4, display: 'flex', flexDirection: 'column' }}>

         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'start', width: '100%', position: 'relative' }}>
            <Text bold>Escreva uma mensagem de aniversário</Text>
            <Box sx={{
               ...styles.menuIcon,
               backgroundImage: `url(${icons.gray_close})`,
               transition: '.3s',
               zIndex: 999999999,
               position: 'absolute',
               right: 5,
               top: 2,
               "&:hover": {
                  opacity: 0.8,
                  cursor: 'pointer'
               }
            }} onClick={() => setShowMessageBirthDay(false)} />
         </Box>

         <Box sx={{ width: '100%', height: '1px', backgroundColor: '#eaeaea', margin: '0px 0px 20px 0px' }} />

         <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'start', flex: 1 }}>
            <Text style={{ whiteSpace: 'nowrap' }}>Escreva sua mensagem de aniversário para</Text>
            <Text style={{ whiteSpace: 'nowrap' }} bold>{nameBirthDay},</Text>
            <Text style={{ whiteSpace: 'nowrap' }}>ou envie mensagens pré-montadas!</Text>
         </Box>
         <Box sx={{ display: 'flex', gap: 1.75, }}>
            <TextInput
               placeholder='Feliz aniversário!'
               name='message'
               onChange={(e) => setMessage(e.target.value)}
               value={message || ''}
               multiline
               maxRows={6}
               rows={3}
               sx={{ flex: 1, }}
            />
         </Box>

         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Text bold xsmall>Mensagens pré-montadas:</Text>
            <Box sx={{
               display: 'flex', padding: '5px 15px', backgroundColor: colorPalette?.buttonColor, alignItems: 'center', justifyContent: 'center', borderRadius: 8,
               "&:hover": {
                  opacity: 0.8,
                  cursor: 'pointer'
               }
            }}
               onClick={() => setMessage(`${user?.nome} te desejou muitas felicidades no seu dia!`)}>
               <Text xsmall style={{ color: '#fff', }}>{user?.nome} te desejou muitas felicidades no seu dia!</Text>
            </Box>
         </Box>
         <Divider distance={0} />
         <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
               <Button small text="Enviar" style={{ height: 30, width: 80 }} onClick={() => handlePushNotification(idSelected)} />
               <Button secondary small text="Apagar" style={{ height: 30, width: 80 }} onClick={() => setMessage('')} />
            </Box>
         </Box>

      </ContentContainer>
   )
}

const styles = {
   icon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      width: '15px',
      height: '15px',
      marginRight: '0px',
      backgroundImage: `url('/favicon.svg')`,
   },
   menuIcon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,

   },
}

Home.noPadding = true;

export default Home;