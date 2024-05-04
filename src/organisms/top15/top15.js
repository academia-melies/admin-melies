import { Avatar } from "@mui/material"
import { Box, Text, Button, Divider } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { formatTimeStamp } from "../../helpers"
import { useRouter } from "next/router"

export const Top15List = (props) => {
    const { data = [] } = props
    const router = useRouter()
    const { colorPalette, theme } = useAppContext()

    return (
        <Box sx={{
            padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            alignItems: 'start', gap: 1,
            height: 950,
            width: '40%',
            backgroundColor: colorPalette?.secondary,
            borderRadius: 2,
            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
        }}>
            <Text large bold style={{ textAlign: 'center' }}>Últimas Matrículas - <strong style={{ color: colorPalette?.buttonColor }}>TOP15</strong></Text>
            <Divider />
            <Box sx={{
                display: 'flex', justifyContent: 'center', width: '100%', overflowY: 'auto',
            }}>
                {data.length > 0 ?
                    <Box sx={{ borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: 1, }}>
                        {data?.map((item, index) => {
                            const date = item?.dt_criacao?.split('T')[0]
                            const day = date?.split('-')[2]
                            const month = date?.split('-')[1]
                            const description = `${item?.nome_turma} ${item?.periodo} - ${item?.modalidade_curso}`
                            return (
                                <Box key={index} sx={{
                                    display: 'flex',
                                    backgroundColor: colorPalette?.primary,
                                    position: 'relative',
                                    boxShadow: 'none',
                                    alignItems: 'center', width: '100%', padding: '10px',
                                    borderRadius: 2,
                                    gap: 2
                                }}>
                                    {/* <Box sx={{
                                        display: 'flex', borderRadius: 35, backgroundColor: colorPalette?.buttonColor,
                                        height: { xs: 30, sm: 35, md: 35, lg: 35 },
                                        width: { xs: 30, sm: 35, md: 35, lg: 35 },
                                        padding: '5px 5px', position: 'absolute', alignItems: 'center', justifyContent: 'center', top: -1, left: 2, zIndex: 999
                                    }}>
                                        <Text bold xsmall style={{ color: '#fff' }}>{day}/{month}</Text>
                                    </Box> */}
                                    <Avatar src={item?.location} sx={{
                                        height: { xs: 40, sm: 65, md: 65, lg: 65 },
                                        width: { xs: 40, sm: 65, md: 65, lg: 65 },
                                    }} variant="circular"
                                    />
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                                                <Text bold>Aluno:</Text>
                                                <Text light>{item?.aluno}</Text>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                                                <Text bold small>Turma:</Text>
                                                <Text light small>{description || ''}</Text>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                                                <Text bold small>Data da matrícula:</Text>
                                                <Text light small>{formatTimeStamp(item?.dt_criacao, true) || ''}</Text>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box key={index} sx={{ display: 'flex', position: 'absolute', right: 5, bottom: 10 }}>
                                        <Button small secondary text="Ver" style={{ backgroundColor: colorPalette?.secondary }}
                                            onClick={() => router.push(`/administrative/users/${item?.usuario_id}`)} />
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                    :
                    <Box sx={{ backgroundColor: colorPalette.secondary, padding: '5px 10px' }}>
                        <Text >Não existem matrículas</Text>
                    </Box>
                }
            </Box>
        </Box>
    )
}