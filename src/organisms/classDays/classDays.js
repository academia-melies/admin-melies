import { Avatar, Backdrop } from "@mui/material"
import { Box, Text, Button, Divider, ContentContainer, TextInput } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { api } from "../../api/api"
import { useState } from "react"
import { icons } from "../layout/Colors"
import Link from "next/link"

export const ClassDays = (props) => {
    const { listClassesDay = [] } = props
    const [showClassDay, setShowClassDay] = useState({ active: false, item: {} })
    const { colorPalette, theme } = useAppContext()


    const formattedName = (name) => {
        const partsName = name?.split(' ')
        const firstName = partsName[0]
        const lastName = partsName[partsName?.length - 1]

        return `${firstName} ${lastName}`
    }
    return (

        <Box sx={{
            padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            alignItems: 'start', gap: 1,
            height: 550,
            backgroundColor: colorPalette?.secondary,
            width: '100%',
            borderRadius: 2,
            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
        }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Text large bold style={{ textAlign: 'start' }}>Aulas do dia</Text>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url('/icons/classDay_icon.png')`,
                    width: 26, height: 26,
                    aspectRatio: '1/1'
                }} />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', overflowY: 'auto', }}>
                {listClassesDay.length > 0 ?
                    <Box sx={{ borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {listClassesDay?.map((item, index) => {


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
                                        padding: '10px'
                                    }}>
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', width: '100%' }}>
                                            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Text light bold style={{
                                                    width: '260px',
                                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                }}>{item?.nome_disciplina}</Text>
                                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    {item?.nome_turma && <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Text bold small>Turma: </Text>
                                                        <Text light small>{item?.nome_turma}</Text>
                                                    </Box>}
                                                    {item?.periodo && <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Text bold small>Período: </Text>
                                                        <Text light small>{item?.periodo}</Text>
                                                    </Box>}
                                                    {item?.professor1 && <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Text bold small>1º professor: </Text>
                                                        <Text light small>{formattedName(item?.professor1)}</Text>
                                                    </Box>}
                                                    {item?.professor2 && <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <Text bold small>2º professor: </Text>
                                                        <Text light small>{formattedName(item?.professor2)}</Text>
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

            <Backdrop open={showClassDay?.active} sx={{ zIndex: 9999 }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'start', width: '100%', position: 'relative' }}>
                        <Text bold>Descrição da Aula</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 17, height: 17,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
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