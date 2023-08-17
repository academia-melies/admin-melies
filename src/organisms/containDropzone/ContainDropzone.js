import Link from "next/link"
import { Box, ContentContainer, Text } from "../../atoms"
import { CustomDropzone } from "../dropzone/Dropzone"
import { useAppContext } from "../../context/AppContext"
import { deleteContract } from "../../validators/api-requests"


export const ContainDropzone = (props) => {

    const { data = [], title = "", callback = () => { }, userId, screen, servicoId } = props
    const { colorPalette, setLoading, alert } = useAppContext()

    const handleDelete = async (id_contrato_servico, key) => {
        setLoading(true)
        try {
            const response = await deleteContract(id_contrato_servico, key)
            if (response.status === 200) {
                alert.info('Contrato excluído.')
                callback(response.status)
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }
    return (

        <ContentContainer style={{ display: 'flex', gap: 4, padding: 5 }}>
            <Text title bold>{title}</Text>
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
                    txt={'Arraste ou clique para subir o contrato'}
                    callback={(file) => {
                        if (file.status === 201) {
                            callback(file)
                        }
                    }}
                    usuario_id={userId}
                    servicoId={servicoId}
                    contract={true}
                    tela={screen}
                    preview={false}
                    sx={{ flex: 1 }}
                    propsDropzone={{
                        style: {
                            border: `2px dotted lightgray`,
                            padding: '50px 280px'
                        }
                    }}
                />
            </Box>
            {data.length > 0 ?
                <Box sx={{ flexWrap: 'wrap', flexDirection: 'row', display: 'flex', gap: 4 }}>
                    {data?.map((item, index) => {
                        const typeFile = item?.name_file.includes('.pdf') ? 'pdf' : 'jpg';
                        return (
                            <Box key={`${item}-${index}`} sx={{ display: 'flex', gap: 2, justifyContent: 'start', flexWrap: 'wrap', flexDirection: 'row' }}>
                                <Link style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: `2px solid ${colorPalette.primary}`,
                                    position: 'relative',
                                    borderRadius: '8px',
                                }} target="_blank"
                                    href={item?.location}>
                                    <Box sx={{
                                        position: 'absolute', top: -5,
                                        right: -5, display: 'flex', justifyContent: 'space-around',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden'
                                    }}>
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
                                            handleDelete(item?.id_contrato_servico, item?.key)
                                        }} />
                                    </Box>
                                    <Text bold small style={{
                                        textAlign: 'center',
                                        marginTop: 10,
                                        whiteSpace: 'nowrap', // Prevent text from wrapping
                                        overflow: 'hidden', // Hide overflow
                                        textOverflow: 'ellipsis', // Apply ellipsis
                                        maxWidth: 140,
                                        gap: 1
                                    }}>{item?.name_file}</Text>
                                    <Box sx={{
                                        backgroundImage: `url(${typeFile === 'pdf' ? '/icons/pdf_icon.png' : item?.location})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center center',
                                        width: { xs: '100%', sm: 150, md: 150, lg: 150, xl: 150 },
                                        marginTop: 4,
                                        aspectRatio: '1/1',
                                    }} />
                                </Link>
                            </Box>
                        )
                    })}
                </Box>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '40px 0px' }}>
                    <Text light style={{ color: 'darkgray' }}>Esse {screen} não possui contratos</Text>
                </Box>}
        </ContentContainer>

    )
}