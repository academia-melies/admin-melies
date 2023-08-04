import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { CustomDropzone, SearchBar, SectionHeader } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import Link from "next/link"

export default function ImagesAdm(props) {
    const { setLoading, colorPalette, user, alert } = useAppContext()
    const [imagesList, setImagesList] = useState([])
    const [screens, setScreen] = useState([
        { id: '01', screen: 'Login', images: [] },
        { id: '02', screen: 'Inicio - Banner rotativo', images: [] },
        { id: '02', screen: 'Menu Lateral', images: [] },
    ])
    const [filterData, setFilterData] = useState('')
    const router = useRouter()
    const filter = (item) => {
        item?.screen?.toLowerCase().includes(filterData?.toLowerCase())
    }

    const handleImages = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/file/images`)
            const { data } = response
            setImagesList(data)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteImage = async (fileId, key) => {
        setLoading(true)

        let query = `?key=${key}`;

        const response = await api.delete(`/file/image/${fileId}${query}`)
        const { status } = response
        if (status === 200) {
            alert.success('Imagem removida.');
            handleImages()
        } else {
            alert.error('Ocorreu um erro ao remover Imagem.');
        }
        setLoading(false)
    }

    useEffect(() => {
        handleImages()
    }, [])

    return (
        <>
            <SectionHeader
                title={`Imagens (${imagesList?.length || '0'})`}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Pagina login, Banner Inicial ...' style={{ padding: '15px', }} onChange={setFilterData} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {screens.map((screenImages, index) => {
                    const images = imagesList.filter(image => image.tela === screenImages.screen)
                    return (
                        <ContentContainer key={`${index}-${screenImages}`} style={{ display: 'flex', gap: 4 }}>
                            <Text large bold>{screenImages?.screen}</Text>
                            <Box sx={{
                                display: 'flex',
                                // flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 2,
                                borderRadius: '8px',
                                backgroundColor: colorPalette.primary,
                                cursor: 'pointer'
                            }}>
                                <CustomDropzone
                                    txt={'Arraste ou clique para adicionar uma imagem'}
                                    callback={(file) => {
                                        if (file.status === 201) {
                                            handleImages()
                                        }
                                    }}
                                    usuario_id={user?.id}
                                    tela={screenImages?.screen}
                                    tipo={'todos'}
                                    typeOpition={screenImages?.screen === 'Login' ? true : false }
                                    sx={{ flex: 1 }}
                                    propsDropzone={{
                                        style: {
                                            border: `2px dotted lightgray`,
                                            padding: '50px 280px'
                                        }
                                    }}
                                    images={true}
                                />
                            </Box>
                            {images ?
                                <Box sx={{ flexWrap: 'wrap', flexDirection: 'row', display: 'flex', gap: 4 }}>
                                    {images?.map((item, index) => (
                                        <Box key={`${item}-${index}`} sx={{ display: 'flex', gap: 2, justifyContent: 'start', flexWrap: 'wrap', flexDirection: 'row' }}>
                                            <Link style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                border: `2px solid ${colorPalette.primary}`,
                                                position: 'relative',
                                                borderRadius: '8px'
                                            }} target="_blank"
                                                href={item?.location}>
                                                <Box sx={{
                                                    position: 'absolute', top: -5,
                                                    right: -5, display: 'flex', justifyContent: 'space-around', gap: 10,
                                                }}>
                                                    <Text bold small style={{textAlign: 'center', marginTop: 10}}>{item.name_file}</Text>
                                                    <Box sx={{
                                                        backgroundSize: "cover",
                                                        backgroundRepeat: "no-repeat",
                                                        backgroundPosition: "center",
                                                        width: 20,
                                                        height: 20,
                                                        backgroundImage: `url(/icons/remove_icon.png)`,
                                                        transition: ".3s",
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: "pointer",
                                                        },
                                                    }} onClick={(event) => {
                                                        event.preventDefault()
                                                        handleDeleteImage(item.id_imagens_adm, item.key)
                                                    }} />
                                                </Box>

                                                <Box sx={{
                                                    backgroundImage: `url(${item?.location})`,
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center center',
                                                    width: { xs: '100%', sm: 250, md: 200, lg: 200, xl: 260 },
                                                    borderRadius: '8px',
                                                    aspectRatio: '1/1',
                                                }} />
                                            </Link>
                                        </Box>
                                    ))}
                                </Box>
                                :
                                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                                    <Text>Nenhuma imagem encontrada</Text>
                                </Box>}
                        </ContentContainer>
                    )
                })}
            </Box>
        </>
    )
}
