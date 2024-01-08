import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { CustomDropzone, RadioItem, SectionHeader, SelectList } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import Link from "next/link"
import { icons } from "../../../organisms/layout/Colors"

export default function EditCatalogMaterial(props) {
    const { setLoading, alert, user, setShowConfirmationDialog, colorPalette } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newMaterial = id === 'new';
    const [courses, setCourses] = useState([])
    const [showDropzone, setShowDropzone] = useState(false)
    const [imagesCatalog, setImagesCatalog] = useState([])
    const [materialData, setMaterialData] = useState({
        curso_id: '',
        subtitulo: '',
        tipo_material: '',
        categoria: '',
        issn: '',
        idioma: '',
        nome_periodico: '',
        indicacao_resp: '',
        local_publ: '',
        editora: '',
        dt_publicacao: '',
        dimensoes: '',
        periodicidade: '',
        nota_conteudo: '',
        nota_gerais: '',
        assunto: '',
        resumo: '',
        endereco_eletr: '',
        area_cnpq: '',
        n_classificacao: '',
        cutter: '',
        ator_cant_autor: '',
        titulo: '',
        creditos: '',
        produtor: '',
        distribuidor: '',
        detalhes_fisicos: '',
        serie_col: '',
        volume: '',
        legenda: '',
        duracao: '',
        genero: '',
        publico: '',
        isbn: '',
        autor_sec: '',
        edicao: '',
        ativo: 1,
        qnt_exempl: 1,
        usuario_resp: userId
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))


    const getMaterial = async () => {
        try {
            const response = await api.get(`/catalog/material/${id}`)
            const { data } = response
            setMaterialData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getImage = async () => {
        try {
            const response = await api.get(`/catalog/material/images/${id}`)
            const { data } = response
            setImagesCatalog(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        (async () => {
            if (newMaterial) {
                await listCourses()
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getMaterial()
            await getImage()
            await listCourses()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Material')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setMaterialData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!materialData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }
    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/catalog/material/create`, { materialData, files: imagesCatalog });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Material catalogado com sucesso.');
                    router.push(`/library/cataloguing/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar Sala.');
                console.log(error)

            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/catalog/material/delete/${id}`)
            if (response?.status === 200) {
                alert.success('Material excluído com sucesso.');
                router.push(`/library/cataloguing/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Material.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/catalog/material/update/${id}`, { materialData })
                if (response?.status === 200) {
                    alert.success('Material atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Material.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Material.');
            } finally {
                setLoading(false)
            }
        }
    }

    async function listCourses() {
        try {
            const response = await api.get(`/courses`)
            const { data } = response
            const groupCourses = data.map(course => ({
                label: `${course.nome_curso}_${course?.modalidade_curso}`,
                value: course?.id_curso,
                duration: course?.duracao
            }));
            setCourses(groupCourses);
        } catch (error) {
            console.log(error)
        }
    }


    const handleDeleteFile = async (files) => {
        setLoading(true)
        try {
            let query = `?key=${files?.key_file}`;
            const response = await api.delete(`/catalog/material/image/delete/${files?.id_imagem_catalogo}${query}`)
            const { status } = response
            if (status === 200) {
                alert.success('Aqruivo removido.');
                await getImage()
                return
            } else {
                alert.error('Ocorreu um erro ao remover arquivo.');
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupMaterials = [
        { label: 'Livros | Obra de Referência', value: 'Livros | Obra de Referência' },
        { label: 'DVDs | Áudio | CD-ROM', value: 'DVDs | Áudio | CD-ROM' },
        { label: 'Periódicos (Revistas | Gibis | Mangás | Folhetos)', value: 'Periódicos (Revistas | Gibis | Mangás | Folhetos)' },
    ]

    const groupCategory = (value) => {
        if (value === 'Livros | Obra de Referência') {
            let data = [
                { label: 'Livro', value: 'Livro' },
                { label: 'Obra de Referência', value: 'Obra de Referência' },
                { label: 'Anuários', value: 'Anuários' },
                { label: 'Guías', value: 'Guías' },
                { label: 'Folhetos', value: 'Folhetos' },
            ];
            return data
        }
        if (value === 'DVDs | Áudio | CD-ROM') {
            let data = [
                { label: 'DVDs', value: 'DVDs' },
                { label: 'Áudio', value: 'Áudio' },
                { label: 'CD-ROM', value: 'CD-ROM' },
            ];
            return data
        }
        if (value === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)') {
            let data = [
                { label: 'Revistas', value: 'Revistas' },
                { label: 'Gibis', value: 'Gibis' },
                { label: 'Mangás', value: 'Mangás' },
                { label: 'Folhetos', value: 'Folhetos' },
            ];
            return data
        }
    }


    const groupCNPQ = [
        { label: 'Sem classificação', value: 'Sem classificação' },
        { label: 'Ciências exatas e da Terra', value: 'Ciências exatas e da Terra' },
        { label: 'Ciências Biológicas', value: 'Ciências Biológicas' },
        { label: 'Engrnharias', value: 'Engrnharias' },
        { label: 'Ciências da Saúde', value: 'Ciências da Saúde' },
        { label: 'Ciências Agrárias', value: 'Ciências Agrárias' },
        { label: 'Ciências Sociáis Aplicadas', value: 'Ciências Sociáis Aplicadas' },
        { label: 'Ciências Humanas', value: 'Ciências Humanas' },
        { label: 'Linguística, Letras e Artes', value: 'Linguística, Letras e Artes' },
        { label: 'Outros', value: 'Outros' },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });



    return (
        <>
            <SectionHeader
                perfil={materialData?.tipo_material}
                title={materialData?.titulo || materialData?.nome_periodico || `Novo Material`}
                saveButton
                saveButtonAction={newMaterial ? handleCreate : handleEdit}
                deleteButton={!newMaterial}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados bibliográficos</Text>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.75, width: '700px', flexDirection: 'column' }}>
                    <Text bold large>Imagens de capa:</Text>
                    {imagesCatalog?.length > 0 ?
                        <Box sx={{ display: 'flex', gap: 1.75, width: '700px', flexDirection: 'row', padding: 2 }}>
                            {imagesCatalog?.map((file, index) => {
                                const typePdf = file?.name_file
                                    ?.includes('pdf') || null;

                                return (
                                    <Box key={`${file}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: '160px', }}>

                                        <Link style={{ display: 'flex', position: 'relative', border: `1px solid gray`, borderRadius: '8px', padding: '5px' }} href={file?.location || file?.filePreview} target="_blank">
                                            <Box
                                                sx={{
                                                    backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : file?.location || file?.filePreview}')`,
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center center',
                                                    width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                                    aspectRatio: '1/1',
                                                }}>
                                            </Box>
                                            <Box sx={{
                                                backgroundSize: "cover",
                                                backgroundRepeat: "no-repeat",
                                                backgroundPosition: "center",
                                                width: 22,
                                                height: 22,
                                                backgroundImage: `url(/icons/remove_icon.png)`,
                                                position: 'absolute',
                                                top: -5,
                                                right: -5,
                                                transition: ".3s",
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: "pointer",
                                                },
                                                zIndex: 9999,
                                            }} onClick={(event) => {
                                                event.preventDefault()
                                                handleDeleteFile(file)
                                            }} />
                                        </Link>
                                        {file?.name_file && <Text sx={{ fontWeight: 'bold', fontSize: 'small', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {decodeURIComponent(file?.name_file)}
                                        </Text>}
                                    </Box>
                                )
                            })}
                        </Box>
                        :
                        <Text small light>Esse Material não possuí arquivos anexados. Clique no botão abaixo para adicionar arquivo.</Text>
                    }
                    <Button secondary small text="Escolher Arquivo" style={{ maxWidth: 150, height: 30 }} onClick={() => setShowDropzone(true)} />
                    <Divider />

                    <Backdrop open={showDropzone} sx={{ zIndex: 99999 }}>
                        <ContentContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 99999, alignItems: 'center', padding: '0px 0px 8px 0px' }}>
                                <Text bold>Escolha uma Arquivo</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 15,
                                    height: 15,
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => {
                                    setShowDropzone(false)
                                }} />
                            </Box>
                            <Divider />

                            <CustomDropzone
                                txt={'Clique ou arraste para subir uma imagem de capa.'}
                                callback={async (file) => {
                                    if (file.status === 201) {
                                        setImagesCatalog((prevValues) => [
                                            ...prevValues,
                                            {
                                                id_imagem_catalogo: file?.fileId,
                                                location: file?.filePreview,
                                            }
                                        ]);
                                        await setShowDropzone(false)
                                    }
                                }}
                                usuario_id={userId}
                                material_id={id}
                                preview={true}
                                sx={{ flex: 1 }}
                                propsDropzone={{
                                    style: {
                                        border: `2px dotted lightgray`,
                                        padding: '50px 280px'
                                    }
                                }}
                            />
                        </ContentContainer>
                    </Backdrop>

                </Box>
                <SelectList fullWidth data={groupMaterials} valueSelection={materialData?.tipo_material || ''} onSelect={(value) => setMaterialData({ ...materialData, tipo_material: value })}
                    title="Tipo de material:" filterOpition="value" sx={{ color: colorPalette.textColor, maxWidth: 450 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={groupCategory(materialData?.tipo_material)} valueSelection={materialData?.categoria} onSelect={(value) => setMaterialData({ ...materialData, categoria: value })}
                        title="Categoria:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <>
                    <Box sx={styles.inputSection}>
                        {materialData?.tipo_material === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)' && <TextInput name='issn' onChange={handleChange} value={materialData?.issn || ''} label='ISSN' sx={{ flex: 1, }} />}
                        {materialData?.tipo_material === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)' && <TextInput name='nome_periodico' onChange={handleChange} value={materialData?.nome_periodico || ''} label='Nome do periódico' sx={{ flex: 1, }} />}
                    </Box>
                    <Box sx={styles.inputSection}>
                        {materialData?.tipo_material === 'Livros | Obra de Referência' && <TextInput name='isbn' onChange={handleChange} value={materialData?.isbn || ''} label='ISBN' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') &&
                            <TextInput name='n_classificacao' onChange={handleChange} value={materialData?.n_classificacao || ''} label='N° de classificação/CDD:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='cutter' onChange={handleChange} value={materialData?.cutter || ''} label='Cutter' sx={{ flex: 1, }} />}
                    </Box>
                    {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='ator_cant_autor' onChange={handleChange} value={materialData?.ator_cant_autor || ''} label='Ator(es): Cantor(es): Autor(es):' sx={{ flex: 1, }} multiline
                        maxRows={4}
                        rows={3} />}
                    {materialData?.tipo_material === 'Livros | Obra de Referência' && <TextInput name='autor_sec' onChange={handleChange} value={materialData?.autor_sec || ''} label='Autor secundário:' sx={{ flex: 1, }} />}
                    {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='titulo' onChange={handleChange} value={materialData?.titulo || ''} label='Título ' sx={{ flex: 1, }} />}
                    <Box sx={styles.inputSection}>
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM' || materialData?.tipo_material === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)')
                            && <TextInput name='indicacao_resp' onChange={handleChange} value={materialData?.indicacao_resp || ''} label='Indicações de responsabilidade:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='creditos' onChange={handleChange} value={materialData?.creditos || ''} label='Créditos:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='produtor' onChange={handleChange} value={materialData?.produtor || ''} label='Produtor:' sx={{ flex: 1, }} />}
                    </Box>
                    <Box sx={styles.inputSection}>
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='distribuidor' onChange={handleChange} value={materialData?.distribuidor || ''} label='Distribuidor:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='legenda' onChange={handleChange} value={materialData?.legenda || ''} label='Legenda:' sx={{ flex: 1, }} />}

                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput name='idioma' onChange={handleChange} value={materialData?.idioma || ''} label='Idioma' sx={{ flex: 1, }} />
                        {materialData?.tipo_material === 'Livros | Obra de Referência' && <TextInput name='subtitulo' onChange={handleChange} value={materialData?.subtitulo || ''} label='Título/Subtítulo:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='edicao' onChange={handleChange} value={materialData?.edicao || ''} label='Edição ' sx={{ flex: 1, }} />}
                    </Box>
                    <Box sx={styles.inputSection}>
                        <TextInput name='local_publ' onChange={handleChange} value={materialData?.local_publ || ''} label='Lugar de publicação:' sx={{ flex: 1, }} />
                        <TextInput name='dt_publicacao' onChange={handleChange} type="date" value={(materialData?.dt_publicacao)?.split('T')[0] || ''} label='Data da publicação:' sx={{ flex: 1, }} />
                        <TextInput name='editora' onChange={handleChange} value={materialData?.editora || ''} label='Editora:' sx={{ flex: 1, }} />
                    </Box>
                    <TextInput name='detalhes_fisicos' onChange={handleChange} value={materialData?.detalhes_fisicos || ''} label='Detalhes físicos:' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={3}
                    />
                    <Box sx={styles.inputSection}>
                        <TextInput name='dimensoes' onChange={handleChange} value={materialData?.dimensoes || ''} label='Dimensões:' sx={{ flex: 1, }} />
                        {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='serie_col' onChange={handleChange} value={materialData?.serie_col || ''} label='Série/Coleção:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='volume' onChange={handleChange} value={materialData?.volume || ''} label='Volume:' sx={{ flex: 1, }} />}
                        {materialData?.tipo_material === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)' && <TextInput name='periodicidade' onChange={handleChange} value={materialData?.periodicidade || ''} label='Periodicidade' sx={{ flex: 1, }} />}
                    </Box>
                    <TextInput name='nota_conteudo' onChange={handleChange} value={materialData?.nota_conteudo || ''} label='Nota de conteudo:' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={3}
                    />
                    <TextInput name='nota_gerais' onChange={handleChange} value={materialData?.nota_gerais || ''} label='Notas gerais:' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={3}
                    />
                    <TextInput name='assunto' onChange={handleChange} value={materialData?.assunto || ''} label='Assunto:' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={3}
                    />
                    <TextInput name='resumo' onChange={handleChange} value={materialData?.resumo || ''} label='Resumo:' sx={{ flex: 1, }}
                        multiline
                        maxRows={8}
                        rows={5}
                    />
                    <Box sx={styles.inputSection}>
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='duracao' onChange={handleChange} value={materialData?.duracao || ''} label='Duração:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='genero' onChange={handleChange} value={materialData?.genero || ''} label='Gênero:' sx={{ flex: 1, }} />}
                        {(materialData?.tipo_material === 'DVDs | Áudio | CD-ROM') && <TextInput name='publico' onChange={handleChange} value={materialData?.publico || ''} label='Público:' sx={{ flex: 1, }} />}
                    </Box>
                    <Box sx={styles.inputSection}>
                        {(materialData?.tipo_material === 'Livros | Obra de Referência' || materialData?.tipo_material === 'Periódicos (Revistas | Gibis | Mangás | Folhetos)') && <TextInput name='endereco_eletr' onChange={handleChange} value={materialData?.endereco_eletr || ''} label='Endereço eletrônico:' sx={{ flex: 1, }} />}
                        <SelectList fullWidth data={groupCNPQ} valueSelection={materialData?.area_cnpq} onSelect={(value) => setMaterialData({ ...materialData, area_cnpq: value })}
                            title="Área do Conhecimento/CNPq:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Box sx={styles.inputSection}>
                        <SelectList fullWidth data={courses} valueSelection={materialData?.curso_id} onSelect={(value) => setMaterialData({ ...materialData, curso_id: value })}
                            title="Curso:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold', flex: 1 }}
                        />
                        <TextInput name='qnt_exempl' onChange={handleChange} type="number" value={materialData?.qnt_exempl || ''} label='Quantidade de exemplares: ' sx={{ minWidth: 300 }} />
                    </Box>
                </>
                <RadioItem valueRadio={materialData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setMaterialData({ ...materialData, ativo: parseInt(value) })} />
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