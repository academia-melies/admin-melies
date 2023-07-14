import Dropzone from "react-dropzone"
import { useAppContext } from "../../context/AppContext";
import { getRandomInt } from "../../helpers";
import { uploadFile } from "../../validators/api-requests";
import { Box, Text } from "../../atoms";
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

        uploadedFiles.forEach(processUpload)
    }

    const processUpload = async (uploadedFile) => {
        setLoading(true)

        const formData = new FormData()

        formData.append('file', uploadedFile.file, encodeURIComponent(uploadedFile.name))


        try {
            const response = await uploadFile({ formData, usuario_id, campo, tipo });
            const { data = {}, status } = response;
            const { file = {} } = data;

            if (status === 201) {
                alert.success('Upload relizado com sucesso.');
                callback(status)
                return file
            }
            alert.error('Tivemos um problema ao fazer upload do arquivo.');
            return null
        } catch (error) {
            alert.error('Tivemos um problema ao fazer upload do arquivo.');
            return null
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
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
            {/* {filesDrop?.map((file, index) => {
                return (
                    <Box key={`${file}-${index}`}
                        sx={{
                            backgroundImage: `url('${file.preview}')`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center center',
                            width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                            aspectRatio: '1/1',
                        }}>
                    </Box>
                )
            })} */}
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