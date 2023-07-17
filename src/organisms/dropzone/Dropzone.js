import Dropzone from "react-dropzone"
import { useAppContext } from "../../context/AppContext";
import { getRandomInt } from "../../helpers";
import { uploadFile } from "../../validators/api-requests";
import { Box, Button, ContentContainer, Text } from "../../atoms";
import { useState } from "react";

export const CustomDropzone = (props) => {

    const { setLoading, alert, colorPalette } = useAppContext()
    const [filesDrop, setFilesDrop] = useState()
    const {
        callback = () => { },
        usuario_id = null,
        campo = null,
        tipo = null,
        bgImage = null,
        bgImageStyle = {},
    } = props;

    const onDropFiles = async (files) => {
        const uploadedFiles = files.map(file => ({
            file,
            id: getRandomInt(1, 999),
            name: file.name,
            preview: URL.createObjectURL(file),
            progress: 0,
            uploaded: false,
            error: false,
            url: null
        }))

        setFilesDrop(uploadedFiles);

        // uploadedFiles.forEach(processUpload)
    }

    // const processUpload = async (uploadedFile) => {
    //     setLoading(true)

    //     const formData = new FormData()

    //     formData.append('file', uploadedFile.file, encodeURIComponent(uploadedFile.name))


    //     try {
    //         const response = await uploadFile({ formData, usuario_id, campo, tipo });
    //         const { data = {}, status } = response;
    //         const { id_foto_perfil } = data;
    //         let file = {
    //             status, id_foto_perfil
    //         }

    //         if (status === 201) {
    //             alert.success('Upload relizado com sucesso.');
    //             callback(file)
    //             return file
    //         }
    //         alert.error('Tivemos um problema ao fazer upload do arquivo.');
    //         return null
    //     } catch (error) {
    //         alert.error('Tivemos um problema ao fazer upload do arquivo.');
    //         return null
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    const handleUpload = async () => {
        setLoading(true);

        for (const uploadedFile of filesDrop) {
            const formData = new FormData();
            formData.append('file', uploadedFile.file, encodeURIComponent(uploadedFile.name));

            try {
                const response = await uploadFile({ formData, usuario_id, campo, tipo });
                const { data = {}, status } = response;
                const { id_foto_perfil } = data;
                let file = {
                    status,
                    id_foto_perfil,
                };

                if (status === 201) {
                    alert.success('Upload realizado com sucesso.');
                    callback(file);
                } else {
                    alert.error('Tivemos um problema ao fazer upload do arquivo.');
                }
            } catch (error) {
                alert.error('Tivemos um problema ao fazer upload do arquivo.');
            }
        }

        setLoading(false);
        setFilesDrop([]);
    };



    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {campo === 'foto_perfil' && filesDrop && <Text bold>Atual</Text>}
                <Dropzone accept={{ 'image/jpeg': ['.jpeg', '.JPEG', '.jpg', '.JPG'], 'image/png': ['.png', '.PNG'], 'application/pdf': ['.pdf'] }} onDrop={onDropFiles}>
                    {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                        <Box {...getRootProps()}
                            sx={{
                                ...styles.dropZoneContainer,
                                border: `2px dashed ${colorPalette.primary + 'aa'}`,
                                backgroundColor: isDragActive && !isDragReject ? colorPalette.secondary : isDragReject ? '#ff000042' : colorPalette.primary,
                                ...(bgImage ? { ...bgImageStyle, border: 'none' } : {})
                            }}
                        >
                            <input {...getInputProps()} />
                            {!bgImage &&
                                <Box style={{ textAlign: 'center', display: 'flex', fontSize: 12 }}>
                                    <Text small='true' style={{ color: colorPalette.textColor, whiteSpace: 'pre-line' }}>
                                        {props.txt || 'Clique ou arraste aqui seus arquivos para upload'}
                                    </Text>
                                </Box>
                            }
                        </Box>
                    )}
                </Dropzone>
                {filesDrop?.length > 0 &&
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center', alignItems: 'center' }}>

                        <ContentContainer>
                            <Text bold style={{ textAlign: 'center' }}>Preview</Text>
                            {filesDrop?.map((file, index) => (
                                <Box key={`${file}-${index}`}
                                    sx={{
                                        backgroundImage: `url('${file?.preview}')`,
                                        backgroundSize: campo === 'foto_perfil' ? 'cover' : 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center center',
                                        borderRadius: campo === 'foto_perfil' ? '50%' : '',
                                        width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                        aspectRatio: '1/1',
                                    }}>
                                </Box>
                            ))}
                        </ContentContainer>
                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                            <Button small text='Salvar' style={{ padding: '5px 10px 5px 10px', width: 120 }} onClick={() => {
                                handleUpload()
                            }} />
                        </Box>
                    </Box>
                }
            </Box>
        </>
    )
}

export const manageFiles = async (file) => {

    const fileObject = {
        file,
        id: getRandomInt(1, 999),
        name: file.name,
        preview: URL.createObjectURL(file),
        progress: 0,
        uploaded: false,
        error: false,
        url: null
    };

    const response = await uploadFiles(fileObject);
    return response
}

const uploadFiles = async (uploadedFile) => {
    const formData = new FormData()

    formData.append('file', uploadedFile.file, encodeURIComponent(uploadedFile.name))

    const response = await uploadFile({ formData, usuario_id: null, campo: null, tipo: null });
    const { data = {}, status } = response;
    const { file = {} } = data;

    if (status === 201) return file;
    return null
}

const styles = {
    dropZoneContainer: {
        display: 'flex',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        flexDirection: 'column',
        cursor: 'pointer'
    }
}