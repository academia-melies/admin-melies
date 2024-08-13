import { ChangeEvent, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../../atoms"
import { useAppContext } from "../../../../../context/AppContext";
import { formatDate, formatTimeStampTimezone } from "../../../../../helpers";
import { icons } from "../../../../../organisms/layout/Colors";
import { EditFile } from "../../[id]";
import Link from "next/link";
import { CheckBoxComponent, RadioItem, SelectList } from "../../../../../organisms";
import { api } from "../../../../../api/api";
import { groupData } from "../../../../../helpers/groupData";
import { editeEnrollment } from "../../../../../validators/api-requests";
import { FileUser } from "../Documents/Documents";
import { FilePreview } from "../UserData/UserData";
import { Backdrop, CircularProgress } from "@mui/material";
import { Classes } from "../InterestAndSubscription/InterestAndSubscription";

interface UserDataProps {
    id: number | string
    newUser: boolean
    isPermissionEdit: boolean
    mobile: boolean
    classes: Classes[]
}

interface ReenrolmentPos {
    classId: string | number | null
    moduleCourse: string | number | null
}

interface EnrollmentData {
    id_matricula: string | number
    pendencia_aluno: string | number | null
    dt_inicio: string
    dt_final: string
    status: string
    turma_id: string | number | null
    motivo_desistencia: string | null
    dt_desistencia: string | null
    certificado_emitido: string | number | null
    adimplente: string | number | null
    desc_disp_disc: string | number | null
    dt_criacao: string | null
    desc_adicional: string | number | null
    desc_adicional_porc: string | number | null
    valor_tl_desc: string | number | null
    valor_matricula: string | number | null
    qnt_disci_disp: string | number | null
    usuario_resp: string | number | null
    modulo: number
    vl_disci_dp: string | number | null
    qnt_disci_dp: string | number | null
    rematricula: string | number | null
    cursando_dp: string | number | null
    nome_curso: string | null
    modalidade_curso: string | null
    nivel_curso: string | null
    nome_turma: string | null
    periodo: string | null
    curso_id: string | number | null
    nome_usuario_resp: string | null
    dt_inicio_cronograma: string | null
    dt_fim_cronograma: string | null
    contrato: Contract
}

interface EnrollmentEditData {
    dt_inicio: string | null
    dt_final: string | null
    status: string | null
    turma_id: string | number | null
    motivo_desistencia: string | null
    dt_desistencia: string | null
    certificado_emitido: string | number | null
    adimplente: string | number | null
    qnt_disci_dp: string | number | null
}

interface Contract {
    id_contrato_aluno: string | number | null
    name_file: string | null
    size: number | null
    key_file: string | null
    location: string | null
    usuario_id: string | number | null
    status_assinaturas: string | null
    modulo: string | number | null
    matricula_id: string | number | null
    token_doc: string | null
    dt_criacao: string | null
}


type ShowEnrollTableState = {
    [key: number]: boolean;
};


const Enrollments = ({
    id,
    isPermissionEdit,
    mobile,
    newUser,
    classes
}: UserDataProps) => {
    const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([])
    const [showEnrollTable, setShowEnrollTable] = useState<ShowEnrollTableState>({})
    const [highestModule, setHighestModule] = useState<number | null>(null)
    const [enrollmentStudentEditId, setEnrollmentStudentEditId] = useState<string | number>()
    const [enrollmentStudentEditData, setEnrollmentStudentEditData] = useState<EnrollmentEditData>({
        turma_id: null,
        certificado_emitido: null,
        dt_inicio: null,
        dt_final: null,
        qnt_disci_dp: null,
        status: null,
        motivo_desistencia: null,
        adimplente: null,
        dt_desistencia: null
    })
    const [filesUser, setFilesUser] = useState<FileUser[]>([])
    const [showSections, setShowSections] = useState({
        registration: false,
        interest: false,
        historic: false,
        addHistoric: false,
        addInterest: false,
        viewInterest: false,
        permissions: false,
        accessData: false,
        editEnroll: false
    })
    const [showEditFile, setShowEditFiles] = useState({
        photoProfile: false,
        cpf: false,
        rg: false,
        foreigner: false,
        address: false,
        certificate: false,
        schoolRecord: false,
        contractStudent: false,
        cpf_dependente: false,
        titleDoc: false,
        ctps: false,
        enem: false,
        cert_nascimento: false,
        pis: false
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const { colorPalette, setLoading, alert, theme } = useAppContext()


    const fetchData = async () => {
        setLoadingData(true)
        try {
            const response = await api.get<EnrollmentData[]>(`/enrollment/${id}`);
            const enrollments = response.data;
            if (enrollments && enrollments?.length > 0) {
                const sortedEnrollments = enrollments?.filter(item => item?.status !== 'Transferido')?.sort((a, b) => b.modulo - a.modulo);
                const highestModule = sortedEnrollments[0]?.modulo
                setHighestModule(highestModule);
                setEnrollmentData(enrollments)
            }

        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData()
    }, [id])


    const handleEnrollStudentById = async (id: number | string) => {
        setLoading(true)
        try {
            const response = await api.get(`/enrollment/edit/${id}`)
            const { data } = response
            if (data) {
                setEnrollmentStudentEditData(data)
            }

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleReenrollmentPos = async ({ classId, moduleCourse }: ReenrolmentPos) => {
        try {
            setLoading(true)
            const response = await api.post(`/enrollment/create/pos-graduacao/reenrollment`, {
                classId, moduleCourse,
                userId: id
            })
            if (response?.data?.success) {
                alert.success('Rematrícula realizada com sucesso!')
                await fetchData()
            } else {
                alert.error('Ocorreu um erro ao realizar sua Rematrícula. Entre em contato com o atendimento, ou tente novamente mais tarde.')
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleEnrollStudentEdit = async () => {
        setLoading(true)
        try {
            if (enrollmentStudentEditData) {
                const responseData = await editeEnrollment({ enrollmentStudentEditId, enrollmentStudentEditData })

                if (responseData.status === 201) {
                    setShowSections({ ...showSections, editEnroll: false })
                    await fetchData()
                }
            }

        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    const toggleEnrollTable = (index: number) => {
        setShowEnrollTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleChangeEnrollmentEdit = (value: ChangeEvent<HTMLInputElement>) => {

        setEnrollmentStudentEditData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    return (
        <Box>
            {loadingData &&
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', heigth: '100%', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                    <CircularProgress />
                </Box>}
            <Box sx={{
                display: 'flex', opacity: loadingData ? .6 : 1, gap: 2, backgroundColor: colorPalette?.secondary, flexDirection: 'column',
                padding: '20px', borderRadius: 2,
                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
            }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', padding: '0px 0px 20px 0px', gap: 1, "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    },
                    justifyContent: 'space-between'
                }}>
                    <Text title bold >Matrículas</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>

                    {enrollmentData.length > 0 ?
                        enrollmentData?.map((item, index) => {

                            const isReenrollment = (item.status === "Concluído" || item.status === "Aprovado") &&
                                item.modulo === highestModule;
                            const isPosGratuation = item?.nivel_curso === 'Pós-Graduação';
                            const isDp = item.cursando_dp === 1;
                            const className = item?.nome_turma;
                            const courseName = item?.nome_curso;
                            const period = item?.periodo;
                            let datePeriod = new Date(item?.dt_inicio)
                            let year = datePeriod.getFullYear()
                            let month = datePeriod.getMonth()
                            let moduloYear = month >= 6 ? '2' : '1';
                            let periodEnrollment = `${year}.${moduloYear}`
                            const startDate = formatDate(item?.dt_inicio)
                            const title = `${periodEnrollment} - ${className}_${item?.modulo}SEM_${courseName}_${startDate}_${period}`
                            const enrollmentId = item?.id_matricula;
                            const contract = item?.contrato
                            const bgImagePdf = contract?.name_file?.includes('pdf') ? '/icons/pdf_icon.png' : contract?.location

                            return (

                                <ContentContainer key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2, border: isReenrollment && `1px solid ${colorPalette.buttonColor}` }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'start',
                                            gap: 4,
                                            maxWidth: '90%',
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }}
                                        onClick={() => toggleEnrollTable(index)}
                                    >
                                        <Box
                                            sx={{
                                                ...styles.menuIcon,
                                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                                transform: showEnrollTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                                transition: '.3s',
                                                width: 17,
                                                height: 17
                                            }}
                                        />
                                        <Text bold style={{ color: colorPalette.buttonColor }}>{title}</Text>
                                        {isReenrollment && <Box sx={{ padding: '5px 15px', backgroundColor: colorPalette.buttonColor, borderRadius: 2 }}>
                                            <Text bold small style={{ color: '#fff' }}>Pendente de Rematrícula - {item.modulo + 1} Semetre/Módulo</Text>
                                        </Box>}
                                        {isDp && <Box sx={{ padding: '5px 15px', backgroundColor: 'red', borderRadius: 2 }}>
                                            <Text bold small style={{ color: '#fff' }}>Cursando DP</Text>
                                        </Box>}
                                    </Box>
                                    {showEnrollTable[index] && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '20px 0px 0px 0px' }}>
                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Turma:</Text>
                                                <Text light>{item?.nome_turma}</Text>
                                            </Box>
                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Pendências:</Text>
                                                <Text light>{item?.qnt_disci_dp || 0}</Text>
                                            </Box>
                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Semestre/Módulo cursando:</Text>
                                                <Text light>{item?.modulo}º Módulo</Text>
                                            </Box>
                                            <Divider padding={0} />
                                            <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start', gap: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1 }}>
                                                    <Text bold>Contrato do aluno:</Text>
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        backgroundImage: `url('${icons.file}')`,
                                                        transition: '.3s',
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} onClick={() => setShowEditFiles({ ...showEditFile, contractStudent: true })} />
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        width: 22,
                                                        height: 22,
                                                        backgroundImage: `url('${icons.print}')`,
                                                        transition: '.3s',
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} />
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        width: 22,
                                                        height: 22,
                                                        backgroundImage: `url('${icons.send}')`,
                                                        transition: '.3s',
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} />
                                                    <EditFile
                                                        setFilesUser={setFilesUser}
                                                        filesUser={filesUser}
                                                        isPermissionEdit={isPermissionEdit}
                                                        columnId="id_contrato_aluno"
                                                        open={showEditFile.contractStudent}
                                                        newUser={newUser}
                                                        onSet={(set: boolean) => {
                                                            setShowEditFiles({ ...showEditFile, contractStudent: set })
                                                        }}
                                                        title='Contrato do aluno'
                                                        text='Faça o upload do contrato do aluno, depois clique em salvar.'
                                                        textDropzone='Arraste ou clique para selecionar a foto/arquivo que deseja'
                                                        fileData={contract}
                                                        usuarioId={id}
                                                        matriculaId={enrollmentId}
                                                        bgImage={bgImagePdf}
                                                        callback={(file: FilePreview) => {
                                                            if (file.status === 201 || file.status === 200) {
                                                                fetchData()
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                    <Text bold>Gerar um novo contrato:</Text>
                                                    <Link href={`/administrative/users/${id}/generateContract?enrollmentId=${enrollmentId}`} target="_blank">
                                                        <Button small text="Gerar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                    </Link>
                                                </Box>
                                            </Box>
                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Data de Início:</Text>
                                                <Text light>{startDate}</Text>
                                            </Box>
                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Data Final:</Text>
                                                <Text light>{item?.dt_fim_cronograma ? formatTimeStampTimezone(item?.dt_fim_cronograma) : 'Aguardando Criação do Cronograma'}</Text>
                                            </Box>
                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Status/Situação:</Text>
                                                <Text light>{item?.status}</Text>
                                            </Box>
                                            <Divider padding={0} />
                                            {
                                                item.status?.includes('Desistente') &&
                                                <>

                                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                                        valueChecked={item?.motivo_desistencia || ''}
                                                        boxGroup={groupData?.reasonsDroppingOut}
                                                        title="Motivo da desistência"
                                                        horizontal={mobile ? false : true}
                                                        sx={{ width: 1 }}
                                                    />
                                                    <TextInput disabled={!isPermissionEdit && true} name='dt_desistencia' type="date" value={(item?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                                                    <Divider padding={0} />
                                                </>
                                            }


                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={item?.certificado_emitido}
                                                group={groupData?.typeYesOrNo}
                                                title="Certificado emitido:"
                                                horizontal={mobile ? false : true}
                                            />
                                            <Divider padding={0} />

                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={item?.adimplente}
                                                group={groupData?.typeYesOrNo}
                                                title="Adimplente?"
                                                horizontal={mobile ? false : true}
                                            />
                                            <Divider padding={0} />



                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Usuário responsável:</Text>
                                                <Text light>{item?.nome_usuario_resp}</Text>
                                            </Box>
                                            <Divider padding={0} />

                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Data de criação:</Text>
                                                <Text light>{formatTimeStampTimezone(item?.dt_criacao)}</Text>
                                            </Box>
                                            <Divider padding={0} />

                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Notas, frequências, atividades complementares:</Text>
                                                <Link href={`/academic/teacherArea/${id}`} target="_blank">
                                                    <Button small text="vizualizar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                </Link>
                                            </Box>
                                            <Divider padding={0} />

                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Text bold>Situação dos pagamentos:</Text>
                                                <Link href={`/administrative/users/${id}/statusPayment?enrollmentId=${enrollmentId}`} target="_blank">
                                                    <Button small text="vizualizar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                </Link>
                                            </Box>

                                            <Divider padding={0} />
                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                <Button disabled={!isPermissionEdit && true} secondary small text="editar matrícula" style={{ width: 140, height: 30, alignItems: 'center' }} onClick={() => {
                                                    setEnrollmentStudentEditId(item.id_matricula)
                                                    handleEnrollStudentById(item.id_matricula)
                                                    setShowSections({ ...showSections, editEnroll: true })
                                                }} />
                                                {isReenrollment ? (
                                                    isPosGratuation ? (
                                                        <Button
                                                            disabled={!isPermissionEdit}
                                                            small
                                                            text="rematrícular pós"
                                                            style={{ width: 140, height: 30, alignItems: 'center' }}
                                                            onClick={() => handleReenrollmentPos({ classId: item?.turma_id, moduleCourse: item?.modulo + 1 })} />
                                                    ) : (
                                                        <Link
                                                            href={`/administrative/users/${id}/enrollStudent?classId=${item?.turma_id}&courseId=${item?.curso_id}&reenrollment=true`}
                                                            target="_blank"
                                                        >
                                                            <Button
                                                                disabled={!isPermissionEdit}
                                                                small
                                                                text="rematrícula"
                                                                style={{ width: 140, height: 30, alignItems: 'center' }}
                                                            />
                                                        </Link>
                                                    )
                                                ) : null}

                                            </Box>
                                        </Box>
                                    )
                                    }
                                </ContentContainer>

                            )
                        })
                        :
                        <Text light> Não encontramos matrículas cadastradas.</Text>}
                    <Button disabled={!isPermissionEdit && true} text="Nova matrícula" style={{ width: 150, marginTop: 3 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                </Box>
            </Box >


            <Backdrop open={showSections?.editEnroll} sx={{ zIndex: 999 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <ContentContainer>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Text bold>Editar Matrícula</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_close})`,
                                transition: '.3s',
                                zIndex: 999999999,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => setShowSections({ ...showSections, editEnroll: false })} />
                        </Box>
                        <Divider padding={0} />
                        <Box sx={styles.inputSection}>
                            <SelectList disabled={!isPermissionEdit && true} fullWidth data={classes} valueSelection={enrollmentStudentEditData?.turma_id}
                                onSelect={(value: number | string) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, turma_id: value })}
                                title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Pendências' name='qnt_disci_dp' onChange={handleChangeEnrollmentEdit} type="number" value={enrollmentStudentEditData?.qnt_disci_dp || '0'} label='Pendências' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput disabled={!isPermissionEdit && true} name='dt_inicio' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_inicio)?.split('T')[0] || ''} label='Inicio' sx={{ flex: 1, }} />
                            <TextInput disabled={!isPermissionEdit && true} name='dt_final' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_final)?.split('T')[0] || ''} label='Fim' sx={{ flex: 1, }} />
                            <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.enrollmentSituation} valueSelection={enrollmentStudentEditData?.status} 
                            onSelect={(value: string) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, status: value })}
                                title="Status/Situação" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>
                        {
                            (enrollmentStudentEditData.status && enrollmentStudentEditData.status?.includes('Desistente')) &&
                            <>

                                <CheckBoxComponent disabled={!isPermissionEdit && true}
                                    valueChecked={enrollmentStudentEditData?.motivo_desistencia || ''}
                                    boxGroup={groupData.reasonsDroppingOut}
                                    title="Motivo da desistência"
                                    horizontal={mobile ? false : true}
                                    onSelect={(value: string) => setEnrollmentStudentEditData({
                                        ...enrollmentStudentEditData,
                                        motivo_desistencia: value
                                    })}
                                    sx={{ width: 1 }}
                                />
                                <TextInput disabled={!isPermissionEdit && true} name='dt_desistencia' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                            </>
                        }
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={enrollmentStudentEditData?.certificado_emitido}
                            group={groupData.typeYesOrNo}
                            title="Certificado emitido:"
                            horizontal={mobile ? false : true}
                            onSelect={(value: string | number | null) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, certificado_emitido: value })} />
                        <Divider padding={0} />
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={enrollmentStudentEditData?.adimplente}
                            group={groupData.typeYesOrNo}
                            title="Adimplente?"
                            horizontal={mobile ? false : true}
                            onSelect={(value: string | number | null) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, adimplente: value })} />
                        <Divider padding={0} />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                            <Button disabled={!isPermissionEdit && true} small text="salvar" onClick={() => handleEnrollStudentEdit()} />
                            <Button disabled={!isPermissionEdit && true} secondary small text="cancelar" style={{}} onClick={() => setShowSections({ ...showSections, editEnroll: false })} />
                        </Box>

                    </ContentContainer>
                </Box>
            </Backdrop>

        </Box>
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
    containerContract: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
    },
    menuIcon: {
        backgroundSize: 'contain',
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
    },
    containerFile: {
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray lightgray',
        '&::-webkit-scrollbar': {
            width: '5px',

        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'darkgray',
            borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'gray',

        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'gray',

        },
    }
}

export default Enrollments