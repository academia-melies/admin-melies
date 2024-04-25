import { Box, Text } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { useRouter } from 'next/router'


const menuApoio = [
    { id: '01', icon: '/icons/users_icon_home.png', text: 'Usuários', to: '/administrative/users/list', description: 'Lista de todos os usuários, alunos e funcionários.' },
    { id: '02', icon: '/icons/calendar_icon_home.png', text: 'Calendário', to: '/administrative/calendar/calendar', description: 'Calendário administrativo e acadêmico.' },
    { id: '03', icon: '/icons/help-desk_icon_home.png', text: 'Chamados/Ajuda', to: '/suport/tasks/list', description: 'Abra uma chamado para tirar qualquer dúvida, ou obter ajuda ou suporte.' },
    { id: '04', icon: '/icons/aulas_icon_home.png', text: 'Aulas por Turma', to: '/academic/classesDay', description: 'Consulte as aulas por turma, disciplina e módulo/semeste.' },
    { id: '05', icon: '/icons/cursos_icon_home.png', text: 'Cursos', to: '/administrative/course/list', description: 'Lista de todos os cursos da Faculdade.' },
    { id: '06', icon: '/icons/turmas_icon_home.png', text: 'Turmas', to: '/administrative/class/list', description: 'Lista de todas as turmas da Faculdade.' },
    { id: '07', icon: '/icons/student_icon_home.png', text: 'Área do Aluno', to: '/academic/teacherArea/list', description: 'Acesse o resumo do aluno, para vizualizar suas notas, disciplinas matriculadas, atividades complementares, entre outras.' },
    { id: '08', icon: '/icons/cronograma_icon_home.png', text: 'Cronograma', to: '/administrative/classSchedule/list', description: 'Lista de cronogramas de aulas por módulo.' },
]

export const MenuHomeList = (props) => {
    const { colorPalette, theme } = useAppContext()
    const router = useRouter();

    return (
        <Box sx={{
            display: 'flex', gap: 2, justifyContent: 'flex-start',
            width: '100%',
            backgroundColor: 'none',
            flexWrap: { xs: 'wrap', xm: 'wrap', md: 'wrap', lg: 'wrap' },
            display: { xs: 'flex', xm: 'flex', md: 'flex', lg: 'flex' }
        }}>
            {menuApoio?.map((group, index) =>
                <Box key={`${group}-${index}`} sx={{
                    alignItems: 'center',
                    display: 'flex',
                    backgroundColor: colorPalette.secondary,
                    flexDirection: 'row',
                    width: '31%',
                    padding: '15px 20px',
                    gap: 2,
                    borderRadius: 2,
                    transition: '.5s',
                    "&:hover": {
                        cursor: 'pointer',
                        opacity: 0.8,
                        transform: 'scale(1.03, 1.03)',
                    }
                }} onClick={() => router.push(group.to)}>
                    <Box sx={{
                        ...styles.icon, backgroundImage: `url(${group?.icon})`,
                        width: 40, height: 40,
                        aspectRatio: '1/1',
                        flexDirection: 'column',
                        // filter: 'brightness(0) invert(1)',
                        transition: 'background-color 1s'
                    }} />
                    <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                        <Text bold style={{ transition: 'background-color 1s', }}>
                            {group?.text}
                        </Text>
                        <Text light small>{group?.description}</Text>
                    </Box>
                </Box>
            )}
        </Box>
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