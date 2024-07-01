import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createDiscipline, deleteDiscipline, editDiscipline } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { IconStatus } from "../../../organisms/Table/table"

export default function EditDiscipline(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newDiscipline = id === 'new';
    const [disciplineData, setDisciplineData] = useState({
        nome_disciplina: null,
        carga_hr_dp: null,
        pre_req: null,
        plano_ensino: null,
        ementa: null,
        objetivo_dp: null,
        ativo: null,
        disciplina_cobrada: 1,
        metodologia: null,
        recurso_apoio: null,
        bibl_basica: null,
        bibl_compl: null,
        descricao: null,
        optativa: 0
    })
    const [disciplines, setDisciplines] = useState([])
    const [softwares, setSoftwares] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [skills, setSkills] = useState({});
    const [software, setSoftware] = useState({});
    const [arraySkills, setArraySkills] = useState([])
    const [arraySoftwares, setArraySoftwares] = useState([])
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)


    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getDiscipline = async () => {
        try {
            const response = await api.get(`/discipline/${id}`)
            const { data } = response
            setDisciplineData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getSkillDiscipline = async () => {
        try {
            const response = await api.get(`/disciplines/skills/${id}`)
            const { data } = response
            setArraySkills(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getSoftwareDiscipline = async () => {
        try {
            const response = await api.get(`/disciplines/software/${id}`)
            const { data } = response
            setArraySoftwares(data)
        } catch (error) {
            console.log(error)
        }
    }



    useEffect(() => {
        (async () => {
            if (newDiscipline) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        fetchPermissions()
        listDisciplines()
        listSoftwares()
    }, [])

    async function listDisciplines() {
        try {
            const response = await api.get(`/disciplines/active`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
        }
    }


    async function listSoftwares() {
        try {
            const response = await api.get(`/service/software/active`)
            const { data } = response
            const groupSoftwares = data.map(soft => ({
                label: soft.nome_servico,
                value: soft?.id_servico
            }));
            const sortedSoftwares = groupSoftwares.sort((a, b) => a.label.localeCompare(b.label, 'pt', { sensitivity: 'base' }));


            setSoftwares(groupSoftwares);
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const handleItems = async () => {
        setLoading(true)
        try {
            await getDiscipline()
            getSkillDiscipline()
            getSoftwareDiscipline()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setDisciplineData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeSkills = (value) => {
        setSkills((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const addSkills = () => {
        setArraySkills((prevArray) => [...prevArray, { conteudo: skills.conteudo, habilidade: skills.habilidade, avaliacao: skills.avaliacao }])
        setSkills({})
    }

    const deleteSkill = (index) => {

        if (newDiscipline) {
            setArraySkills((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const addSoftware = () => {
        setArraySoftwares((prevArray) => [...prevArray, {
            nome_software: software?.nome_software,
            software_id: software?.software_id
        }])
        setSoftware({})
    }


    const deleteSoftware = (index) => {

        if (newDiscipline) {
            setArraySoftwares((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const checkRequiredFields = () => {
        // if (!disciplineData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createDiscipline({ disciplineData, arraySkills, arraySoftwares, usuario_id });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Disciplina cadastrado com sucesso.');
                    router.push(`/administrative/discipline/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar a disciplina.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await deleteDiscipline(id)
            if (response?.status === 200) {
                alert.success('Disciplina excluída com sucesso.');
                router.push(`/administrative/discipline/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Disciplina.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const deleteSkillDiscipline = async (id_habilidade_dp) => {
        setLoading(true)
        try {
            const response = await api.delete(`/disciplines/skills/delete/${id_habilidade_dp}`)
            if (response?.status == 201) {
                alert.success('Habilidade removida.');
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const addSkillDiscipline = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/disciplines/skills/create/${id}/${usuario_id}`, { skills })
            if (response?.status == 201) {
                alert.success('Habilidade adicionada.');
                setSkills({})
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editDiscipline({ id, disciplineData })
                if (response?.status === 201) {
                    alert.success('Disciplina atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } finally {
                setLoading(false)
            }
        }
    }


    const deleteSoftwareDiscipline = async (id_software_dp) => {
        setLoading(true)
        try {
            const response = await api.delete(`/disciplines/software/delete/${id_software_dp}`)
            if (response?.status == 201) {
                alert.success('Software removida.');
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Software selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const addSoftwareDiscipline = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/disciplines/software/create/${id}/${usuario_id}`, { software })
            if (response?.status == 201) {
                alert.success('Software adicionada.');
                setSoftware({})
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Software selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSoftware = (value) => {
        const nome_software = softwares?.filter(item => item.value === value).map(item => item.label)
        setSoftware((prevValues) => ({
            ...prevValues,
            software_id: value,
            nome_software: nome_software
        }))
    }


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupValue = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                title={disciplineData?.nome_disciplina || `Nova Disciplina`}
                saveButton={isPermissionEdit}
                saveButtonAction={newDiscipline ? handleCreate : handleEdit}
                inativeButton={!newDiscipline && isPermissionEdit}
                inativeButtonAction={(event) => setShowConfirmationDialog({
                    active: true,
                    event,
                    acceptAction: handleDelete,
                    title: 'Inativar Disciplina',
                    message: 'A disciplina será inativada, e ficará por um tempo no banco de dados, até que seja excluída.'
                })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                    <Text title bold>Dados da Disciplina</Text>
                    <IconStatus
                        style={{ backgroundColor: disciplineData.ativo >= 1 ? 'green' : 'red', boxShadow: disciplineData.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name='nome_disciplina' onChange={handleChange} value={disciplineData?.nome_disciplina || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data da Criação' name='dt_criacao' onChange={handleChange} value={(disciplineData?.dt_criacao)?.split('T')[0] || ''} type="date" label='Data da Criação' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Carga Horária' name='carga_hr_dp' onChange={handleChange} value={disciplineData?.carga_hr_dp || ''} label='Carga Horária' sx={{}} />
                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={disciplines} valueSelection={disciplineData?.pre_req} onSelect={(value) => setDisciplineData({ ...disciplineData, pre_req: value })}
                        title="Pré-requisitos" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <TextInput disabled={!isPermissionEdit && true}
                    placeholder='Ex: Estudo dos princípios de animação através da produção prática e da análise de cenas animadas...'
                    name='descricao' onChange={handleChange} value={disciplineData?.descricao || ''} label='Descrição:'
                    multiline
                    maxRows={5}
                    rows={3}
                    sx={{}} />
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={disciplineData?.disciplina_cobrada} group={groupValue} title="Disciplina Cobrada:" horizontal={mobile ? false : true} onSelect={(value) => setDisciplineData({ ...disciplineData, disciplina_cobrada: parseInt(value) })} />
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={disciplineData?.optativa} group={groupValue} title="Disciplina Optativa:" horizontal={mobile ? false : true} onSelect={(value) => setDisciplineData({ ...disciplineData, optativa: parseInt(value) })} />
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={disciplineData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setDisciplineData({ ...disciplineData, ativo: parseInt(value) })} />
            </ContentContainer>
            <ContentContainer>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Plano de ensino</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='Ementa'
                        name='ementa'
                        onChange={handleChange} value={disciplineData?.ementa || ''}
                        label='Ementa' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={4}
                    />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='Objetivo'
                        name='objetivo_dp'
                        onChange={handleChange}
                        value={disciplineData?.objetivo_dp || ''}
                        label='Objetivo'
                        multiline
                        maxRows={8}
                        rows={4}
                        sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='Metodologia'
                        name='metodologia'
                        onChange={handleChange}
                        value={disciplineData?.metodologia || ''}
                        label='Metodologia'
                        multiline
                        maxRows={4}
                        rows={3}
                        sx={{ flex: 1, }}
                    />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='Recurso de apoio'
                        name='recurso_apoio'
                        onChange={handleChange}
                        value={disciplineData?.recurso_apoio || ''}
                        label='Recurso de apoio'
                        multiline
                        maxRows={6}
                        rows={3}
                        sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='Bibliografia Básica'
                        name='bibl_basica'
                        onChange={handleChange}
                        value={disciplineData?.bibl_basica || ''}
                        label='Bibliografia Básica'
                        multiline
                        maxRows={8}
                        rows={3}
                        sx={{ flex: 1, }}
                    />
                    <TextInput disabled={!isPermissionEdit && true}
                        placeholder='Bibliografia Complementar'
                        name='bibl_compl'
                        onChange={handleChange}
                        value={disciplineData?.bibl_compl || ''}
                        label='Bibliografia Complementar'
                        multiline
                        maxRows={8}
                        rows={3}
                        sx={{ flex: 1, }}
                    />
                </Box>
            </ContentContainer >
            <ContentContainer style={{ boxShadow: 'none' }}>
                <Box sx={{ ...styles.inputSection, alignItems: 'center', backgroundColor: colorPalette.buttonColor, padding: '8px', borderRadius: '8px' }}>
                    <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Conteúdo</Text>
                    <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Habilidades</Text>
                    <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Avaliação</Text>
                </Box>

                {arraySkills.map((skill, index) => (
                    <>

                        <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Conteúdo' name={`conteudo-${index}`} onChange={handleChangeSkills} value={skill.conteudo} sx={{ flex: 1 }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Habilidade' name={`habilidade-${index}`} onChange={handleChangeSkills} value={skill.habilidade} sx={{ flex: 1 }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Avaliação' name={`avaliacao-${index}`} onChange={handleChangeSkills} value={skill.avaliacao} sx={{ flex: 1 }} />

                            {isPermissionEdit && <Box sx={{
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                width: 25,
                                height: 25,
                                backgroundImage: `url(/icons/remove_icon.png)`,
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => {
                                newDiscipline ? deleteSkill(index) : deleteSkillDiscipline(skill?.id_habilidade_dp)
                            }} />}
                        </Box>
                    </>
                ))}
                <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Conteúdo' name='conteudo' onChange={handleChangeSkills} value={skills?.conteudo || ''} sx={{ flex: 1 }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Habilidade' name='habilidade' onChange={handleChangeSkills} value={skills?.habilidade || ''} sx={{ flex: 1 }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Avaliação' name='avaliacao' onChange={handleChangeSkills} value={skills?.avaliacao || ''} sx={{ flex: 1 }} />
                    {isPermissionEdit && <Box sx={{
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        width: 25,
                        height: 25,
                        borderRadius: '50%',
                        backgroundImage: `url(/icons/include_icon.png)`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => {
                        newDiscipline ? addSkills() : addSkillDiscipline()
                    }} />}
                </Box>
            </ContentContainer>

            <ContentContainer style={{ boxShadow: 'none' }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Softwares Ultilizados</Text>
                </Box>

                <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                    <Text bold>Escolha um Software</Text>
                    <SelectList disabled={!isPermissionEdit && true}
                        fullWidth
                        data={softwares}
                        valueSelection={software?.software_id || ''}
                        onSelect={(value) =>
                            handleSelectSoftware(value)
                        }
                        filterOpition="value"
                        sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{
                            color: colorPalette.textColor,
                            fontSize: "15px",
                            fontFamily: "MetropolisBold",
                        }}
                    />
                    {isPermissionEdit && <Box sx={{
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        width: 25,
                        height: 25,
                        borderRadius: '50%',
                        backgroundImage: `url(/icons/include_icon.png)`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => {
                        newDiscipline ? addSoftware() : addSoftwareDiscipline()
                    }} />}
                </Box>

                {arraySoftwares?.length > 0 &&
                    <Box sx={{ display: 'flex' }}>

                        <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, }}>
                            <table style={{ borderCollapse: 'collapse', }}>
                                <thead>
                                    <tr style={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, }}>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>ID Software</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nome</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Fornecedor</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Qnt Licenças</th>
                                        <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}></th>
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1 }}>
                                    {
                                        arraySoftwares?.map((item, index) => {
                                            return (
                                                <tr key={`${item}-${index}`}>
                                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {item?.software_id}
                                                    </td>
                                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {item?.nome_software || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {item?.software_fornecedor || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {item?.quantidade || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {isPermissionEdit && <Box sx={{
                                                            backgroundSize: 'cover',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'center',
                                                            width: 15,
                                                            height: 15,
                                                            aspectRatio: '1/1',
                                                            backgroundImage: `url(/icons/remove_icon.png)`,
                                                            transition: '.3s',
                                                            "&:hover": {
                                                                opacity: 0.8,
                                                                cursor: 'pointer'
                                                            }
                                                        }} onClick={() => {
                                                            newDiscipline ? deleteSoftware(index) : deleteSoftwareDiscipline(item?.id_software_dp)
                                                        }} />}
                                                    </td>
                                                </tr>
                                            );
                                        })

                                    }
                                </tbody>
                            </table>
                        </div>
                    </Box>}

            </ContentContainer>
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