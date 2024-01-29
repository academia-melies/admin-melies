import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text } from "../../atoms"
import { SectionHeader } from "../../organisms"
import { api } from "../../api/api"
import { useAppContext } from "../../context/AppContext"
import { Avatar } from "@mui/material"

const areasAdm = [
    { id: '01', name: 'Recursos Humanos' },
    { id: '02', name: 'Suporte Técnico' },
    { id: '03', name: 'Atendimento' },
    { id: '04', name: 'Financeiro' },
    { id: '05', name: 'Biblioteca' },
    { id: '06', name: 'Secretária' },
    { id: '07', name: 'Psicóloga' },
]

const areasAcademic = [
    { id: '01', name: 'Coordenadores de Curso' },
    { id: '02', name: 'Professores de Animação' },
    { id: '03', name: 'Professores de Animação' },
    { id: '04', name: 'Professores de Games' },
    { id: '05', name: 'Professores de Design' },
]

export default function OurTeamList(props) {
    const [employeeList, setEmployeeList] = useState([])
    const { setLoading, colorPalette, theme } = useAppContext()
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]


    useEffect(() => {
        getEmployees();
    }, []);

    const getEmployees = async () => {
        setLoading(true)
        try {
            const response = await api.get('/users/employee')
            const { data } = response;
            if (data) {
                const sortedEmployees = data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' }));
                setEmployeeList(sortedEmployees)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <SectionHeader title={`Conheça nossa Equipe`} />

            <Box sx={{ display: 'flex', gap: 5, marginTop: 8, flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: { xs: '0px', sm: '0px', md: '450px', lg: '450px', xl: '450px' } }}>
                    <Text title bold>Administrativo</Text>
                    <Text style={{ marginBottom: 15, color: 'rgb(75 85 99)' }}>
                        Somos um grupo dinâmico de indivíduos apaixonados pelo que fazemos e dedicados a entregar os melhores resultados para nossos clientes.
                        Contamos com uma váriedade de áreas para atender da melhor forma, incluindo:
                    </Text>
                    {areasAdm?.map((item, index) =>
                        <Box key={index} sx={{
                            display: 'flex', gap: 1, color: 'rgb(75 85 99)', "&:hover": {
                                opacity: 0.8,
                                transform: 'scale(1.1)',
                                transition: '.5s',
                                color: colorPalette.buttonColor,
                                fontWeight: 'bold'
                            }
                        }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('/icons/topic_icon.png')`,
                                filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                transition: '.3s',
                            }} />
                            <Text bold style={{ color: 'inherit', fontWeight: 'inherit' }}>{item?.name}</Text>
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justufyContent: 'center' }}>
                    {employeeList?.filter(f => f.professor === 0).map((item, index) => {
                        return (
                            <ContentContainer gap={1.75}
                                key={index} sx={{
                                    alignItems: 'center', maxHeight: '330px', "&:hover": {
                                        opacity: 0.8,
                                        transform: 'scale(0.9)',
                                        transition: '.5s',
                                    },
                                    width: { xs: 350, sm: 300, md: 350, lg: 330 }
                                }}>
                                <Avatar src={item?.location} sx={{
                                    height: { xs: 120, sm: 150, md: 150, lg: 180 },
                                    width: { xs: 120, sm: 150, md: 150, lg: 180 },
                                }} variant="circular" />
                                <Text bold>{item?.nome}</Text>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justufyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: colorPalette.buttonColor }}>{item?.funcao || 'Administrativo'}</Text>
                                    <Text light>{item?.area}</Text>
                                </Box>
                            </ContentContainer>
                        )
                    })}
                </Box>
            </Box >
            <Divider size={'2px'} color={!theme ? colorPalette.secondary : '#e5e7eb'} />

            <Box sx={{
                display: 'flex', gap: 10, marginTop: 8, flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row' },
                justifyContent: { xs: 'center', sm: 'center', md: 'start', lg: 'start', xl: 'start' }
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: { xs: '0px', sm: '0px', md: '450px', lg: '400px', xl: '400px' }, maxWidth: '400px' }}>
                    <Text title bold>Equipe Acadêmica</Text>
                    <Text style={{ marginBottom: 15, color: 'rgb(75 85 99)', }}>
                        Somos uma equipe apaixonada e dedicada, comprometida em oferecer a melhor educação em artes digitais, preparando nossos alunos para se destacarem no mercado de trabalho.
                        Nossos professores e coordenadores são profissionais experientes e apaixonados, com um profundo conhecimento nas áreas de animação, efeitos visuais, games e design.
                    </Text>
                    {areasAcademic?.map((item, index) =>
                        <Box key={index} sx={{
                            display: 'flex', gap: 1, color: 'rgb(75 85 99)', "&:hover": {
                                opacity: 0.8,
                                transform: 'scale(1.1)',
                                transition: '.5s',
                                color: colorPalette.buttonColor,
                                fontWeight: 'bold'
                            }
                        }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('/icons/topic_icon.png')`,
                                filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                transition: '.3s',
                            }} />
                            <Text bold style={{ color: 'inherit', fontWeight: 'inherit' }}>{item?.name}</Text>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justufyContent: 'center' }}>
                    {employeeList?.filter(f => f.professor === 1).map((item, index) => {
                        return (
                            <ContentContainer gap={1.75} key={index} sx={{
                                alignItems: 'center', maxHeight: '330px', "&:hover": {
                                    opacity: 0.8,
                                    transform: 'scale(0.9)',
                                    transition: '.5s',
                                },
                                width: { xs: 350, sm: 300, md: 350, lg: 330 }
                            }}>
                                <Avatar src={item?.location} sx={{
                                    height: { xs: 120, sm: 150, md: 150, lg: 180 },
                                    width: { xs: 120, sm: 150, md: 150, lg: 180 },
                                }} variant="circular" />
                                <Text bold>{item?.nome}</Text>
                                <Box sx={{ display: 'flex', flexDirection: 'column', justufyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: colorPalette.buttonColor }}>{item?.funcao || 'Professor'}</Text>
                                    <Text light>{item?.area}</Text>
                                </Box>
                            </ContentContainer>
                        )
                    })}
                </Box>
            </Box >
        </>
    )
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
