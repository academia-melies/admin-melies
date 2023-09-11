import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createDiscipline, deleteDiscipline, editDiscipline } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditDiscipline(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
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
        metodologia: null,
        recurso_apoio: null,
        bibl_basica: null,
        bibl_compl: null,
    })
    const [disciplines, setDisciplines] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [skills, setSkills] = useState({});
    const [arraySkills, setArraySkills] = useState([])



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



    useEffect(() => {
        (async () => {
            if (newDiscipline) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        listDisciplines()
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


    const handleItems = async () => {
        setLoading(true)
        try {
            await getDiscipline()
            getSkillDiscipline()
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
        setArraySkills((prevArray) => [...prevArray, { habilidade: skills.habilidade, avaliacao: skills.avaliacao }])
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
                const response = await createDiscipline({ disciplineData, arraySkills, usuario_id });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Disciplina cadastrado com sucesso.');
                    router.push(`/administrative/discipline/${data?.discipline}`)
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
            if (response?.status == 201) {
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
                // perfil={disciplineData?.modalidade_curso}
                title={disciplineData?.nome_disciplina || `Nova Disciplina`}
                saveButton
                saveButtonAction={newDiscipline ? handleCreate : handleEdit}
                deleteButton={!newDiscipline}
                deleteButtonAction={() => handleDelete()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Disciplina</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_disciplina' onChange={handleChange} value={disciplineData?.nome_disciplina || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data da Criação' name='dt_criacao' onChange={handleChange} value={(disciplineData?.dt_criacao)?.split('T')[0] || ''} type="date" label='Data da Criação' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Carga Horária' name='carga_hr_dp' onChange={handleChange} value={disciplineData?.carga_hr_dp || ''} label='Carga Horária' sx={{}} />
                    <SelectList fullWidth data={disciplines} valueSelection={disciplineData?.pre_req} onSelect={(value) => setDisciplineData({ ...disciplineData, pre_req: value })}
                        title="Pré-requisitos" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>


                <RadioItem valueRadio={disciplineData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setDisciplineData({ ...disciplineData, ativo: parseInt(value) })} />
            </ContentContainer>
            <ContentContainer>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Plano de ensino</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput
                        placeholder='Ementa'
                        name='ementa'
                        onChange={handleChange} value={disciplineData?.ementa || ''}
                        label='Ementa' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={4}
                    />
                    <TextInput
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
                    <TextInput
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
                    <TextInput
                        placeholder='Recurso de apoio'
                        name='recusrso_apoio'
                        onChange={handleChange}
                        value={disciplineData?.recusrso_apoio || ''}
                        label='Recurso de apoio'
                        multiline
                        maxRows={6}
                        rows={3}
                        sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput
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
                    <TextInput
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
                            <TextInput placeholder='Conteúdo' name={`conteudo-${index}`} onChange={handleChangeSkills} value={skill.conteudo} sx={{ flex: 1 }} />
                            <TextInput placeholder='Habilidade' name={`habilidade-${index}`} onChange={handleChangeSkills} value={skill.habilidade} sx={{ flex: 1 }} />
                            <TextInput placeholder='Avaliação' name={`avaliacao-${index}`} onChange={handleChangeSkills} value={skill.avaliacao} sx={{ flex: 1 }} />

                            <Box sx={{
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
                            }} />
                        </Box>
                    </>
                ))}
                <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                    <TextInput placeholder='Conteúdo' name='conteudo' onChange={handleChangeSkills} value={skills?.conteudo || ''} sx={{ flex: 1 }} />
                    <TextInput placeholder='Habilidade' name='habilidade' onChange={handleChangeSkills} value={skills?.habilidade || ''} sx={{ flex: 1 }} />
                    <TextInput placeholder='Avaliação' name='avaliacao' onChange={handleChangeSkills} value={skills?.avaliacao || ''} sx={{ flex: 1 }} />
                    <Box sx={{
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
                    }} />
                </Box>
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