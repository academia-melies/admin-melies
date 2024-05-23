import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createCourse, deleteCourse, editCourse } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { IconStatus } from "../../../organisms/Table/table"

export default function EditCompensation(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const [userData, setUserData] = useState({
        nome_curso: null,
        nivel_curso: null,
        modalidade_curso: null,
        carga_hr_curso: null,
        sigla: null,
        pt_autorizacao: null,
        dt_autorizacao: null,
        pt_reconhecimento: null,
        dt_reconhecimento: null,
        usuario_resp: null,
        ativo: null,
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [arrayRecognition, setArrayRecognition] = useState([])
    const [recognition, setRecognition] = useState({})
    const [showNewRecognition, setShowNewRecognition] = useState(false)
    const [showEditFile, setShowEditFiles] = useState(false)
    const [files, setFiles] = useState([])



    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getUserData = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            console.log(data)
            setUserData(data.response)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        handleItems();
    }, [])


    const handleItems = async () => {
        setLoading(true)
        try {
            await fetchPermissions()
            await getUserData()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Curso')
        } finally {
            setLoading(false)
        }
    }

    const handleBlurValue = (event) => {
        const { value } = event.target;
        let valueFormatted = formatter.format(value)
        setUserData({ ...userData, valor: valueFormatted })
    };

    const handleChange = (event) => {

        if (event.target.name === 'valor') {
            event.target.value = event.target.value.replace(',', '.');
        }

        setUserData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!userData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateCourse = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createCourse(userData, userId, files);
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Curso cadastrado com sucesso.');
                    router.push(`/administrative/course/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o curso.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteCourse = async () => {
        setLoading(true)
        try {
            const response = await deleteCourse(id)
            if (response?.status == 201) {
                alert.success('Curso excluído com sucesso.');
                router.push(`/administrative/course/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o curso.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditCourse = async () => {
        setLoading(true)
        try {
            const response = await editCourse({ id, userData })
            if (response?.status === 201) {
                alert.success('Curso atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Curso.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Curso.');
        } finally {
            setLoading(false)
        }
    }

    const getRecognition = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/course/recognitions/${id}`)
            const { data } = response
            if (data) setArrayRecognition(data)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const getFiles = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/course/files/${id}`)
            const { data } = response
            if (data) setFiles(data)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleChangeRecognition = (value) => {
        setRecognition((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const addRecognition = () => {
        setArrayRecognition((prevArray) => [...prevArray, { ren_reconhecimento: recognition.ren_reconhecimento, dt_renovacao_rec: recognition.dt_renovacao_rec }])
        setRecognition({ ren_reconhecimento: '', dt_renovacao_rec: '' })
        setShowNewRecognition(false)
    }

    const deleteRecognition = (index) => {

        if (newCourse) {
            setArrayRecognition((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };


    const handleAddRecognition = async () => {
        setLoading(true)
        let recognitionData = {};

        try {
            if (Object.keys(recognition).length > 0) {
                recognitionData = recognition;
                const response = await api.post(`/course/recognition/create/${id}/${userId}`, { recognitionData })
                if (response?.status === 201) {
                    alert.success('Renovação adicionada')
                    setRecognition({ ren_reconhecimento: '', dt_renovacao_rec: '' })
                    handleItems()
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRecognition = async (id_renovacao_rec) => {
        setLoading(true)
        try {
            if (recognition) {
                const response = await api.delete(`/course/recognition/delete/${id_renovacao_rec}`)
                if (response?.status === 200) {
                    alert.success('Renovação excluida.');
                    handleItems()
                }
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupModal = [
        { label: 'Presencial', value: 'Presencial' },
        { label: 'EAD', value: 'EAD' },
        { label: 'Híbrido', value: 'Híbrido' },
    ]

    const groupNivel = [
        { label: 'Bacharelado', value: 'Bacharelado' },
        { label: 'Tecnólogo', value: 'Tecnólogo' },
        { label: 'Pós-Graduação', value: 'Pós-Graduação' },
        { label: 'Extensão', value: 'Extensão' },
    ]

    const groupDuration = [
        { label: '1 - Módulo', value: 1 },
        { label: '2 - Módulos', value: 2 },
        { label: '3 - Módulos', value: 3 },
        { label: '4 - Módulos', value: 4 },
        { label: '5 - Módulos', value: 5 },
        { label: '6 - Módulos', value: 6 },
        { label: '7 - Módulos', value: 7 },
        { label: '8 - Módulos', value: 8 },
    ]

    const groupInstallments = [
        { label: '1x', value: 1 },
        { label: '2x', value: 2 },
        { label: '3x', value: 3 },
        { label: '4x', value: 4 },
        { label: '5x', value: 5 },
        { label: '6x', value: 6 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const formatarParaReal = (valor) => {
        if (!valor || typeof valor !== 'number') {
            return '';
        }
        return formatter.format(valor);
    };

    const handleChangeFiles = (file) => {
        setFiles((prevClassDays) => [
            ...prevClassDays,
            {
                status: file.status,
                id_doc_curso: file.fileId,
                filePreview: file.filePreview
            }
        ]);
    };


    return (
        <>
            <SectionHeader
                perfil={'Remuneração'}
                title={userData?.nome}
                saveButton={isPermissionEdit}
                // saveButtonAction={handleEditCourse}
            />
        </>
    )
}

const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
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