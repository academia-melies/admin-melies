import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"

export default function EditSchoolRoom(props) {
    const { setLoading, alert, user } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newSchoolRoom = id === 'new';
    const [roomData, setRoomData] = useState({
        ativo: 1
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))


    const getRoom = async () => {
        try {
            const response = await api.get(`/schoolRoom/${id}`)
            const { data } = response
            setRoomData(data)
        } catch (error) {
            return error
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newSchoolRoom) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getRoom()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Sala')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setRoomData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!roomData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateRoom = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/schoolRoom/create/${userId}`, { roomData });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Sala cadastrada com sucesso.');
                    router.push(`/suport/schoolRoom/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar Sala.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteRoom = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/schoolRoom/delete/${id}`)
            if (response?.status === 200) {
                alert.success('Sala excluída com sucesso.');
                router.push(`/suport/schoolRoom/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Sala.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditRoom = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/schoolRoom/update/${id}`, { roomData })
                if (response?.status === 201) {
                    alert.success('Sala atualizada com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Sala.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Sala.');
            } finally {
                setLoading(false)
            }
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={roomData?.andar_sala}
                title={roomData?.sala || `Nova Sala`}
                saveButton
                saveButtonAction={newSchoolRoom ? handleCreateRoom : handleEditRoom}
                deleteButton={!newSchoolRoom}
                deleteButtonAction={() => handleDeleteRoom()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Sala</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='sala' name='sala' onChange={handleChange} value={roomData?.sala || ''} label='Sala' sx={{ flex: 1, }} />
                    <TextInput placeholder='1º andar' name='andar_sala' onChange={handleChange} value={roomData?.andar_sala || ''} label='º Andar' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={roomData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setRoomData({ ...roomData, ativo: parseInt(value) })} />
            </ContentContainer>
        </>
    )
}

const styles = {
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}