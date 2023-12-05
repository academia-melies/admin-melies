import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../../atoms"
import { RadioItem, SectionHeader, SelectList } from "../../../../organisms"
import { icons } from "../../../../organisms/layout/Colors"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppContext } from "../../../../context/AppContext"
import { formatTimeStamp } from "../../../../helpers"

export default function LoansStudentEdit(props) {
    const { setLoading, alert, colorPalette, user } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const [studentData, setStudentData] = useState({})
    const [showMaterials, setShowSearchMaterial] = useState(false)
    const [cataloguesList, setCataloguesList] = useState([])
    const [loansData, setLoansData] = useState([])
    const [returnDate, setReturnDate] = useState('')
    const [materialsSelected, setMaterialsSelected] = useState([])
    const [showBox, setShowBox] = useState({
        selected: false,
        loans: false,
    });
    const [filterMaterial, setFilterMaterial] = useState('')
    const [filters, setFilters] = useState({
        type: 'todos',
        category: 'todos',
        search: '',
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const filterFunctions = {
        type: (item) => filters.type === 'todos' || item.tipo_material === filters.type,
        search: (item) => {
            const normalizedSearchTerm = removeAccents(filters.search.toLowerCase());
            const normalizedItemTitle = removeAccents(item.titulo.toLowerCase());
            return normalizedItemTitle.includes(normalizedSearchTerm);
        },
    };

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };

    const getStudent = async () => {
        try {
            const userResponse = await api.get(`/user/${id}`)
            const { response } = userResponse.data
            setStudentData(response)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getCatalogues = async () => {
        setLoading(true)
        try {
            const response = await api.get('/catalogues')
            const { data } = response;
            if (response?.status === 200) {
                setCataloguesList(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const gerLoans = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/loan/${id}`)
            const { data } = response;
            if (response?.status === 200) {
                setLoansData(data)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleItems();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getStudent()
            await getCatalogues()
            await gerLoans()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectedMaterial = (material) => {

        let searchMaterialSelected = materialsSelected?.filter(item => item.id_material === material?.id_material)
        if (searchMaterialSelected.length > 0) {
            alert.info('Material já foi selecionado.')
        } else {
            setMaterialsSelected((prevValues) => [
                ...prevValues,
                {
                    id_material: material?.id_material,
                    titulo: material?.titulo,
                    tipo_material: material?.tipo_material
                }
            ]);
            alert.success('Material incluído na lista de empréstimos.')
        }
    }

    const handleDeleteMaterial = async (id) => {
        let newArray = await materialsSelected?.filter(item => item.id_material !== id)
        setMaterialsSelected(newArray)
        alert.success('Material retirado da lista de empréstimos.')
        return
    }



    const checkRequiredFields = () => {
        // if (!studentData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreate = async () => {
        if (materialsSelected?.length > 0) {
            setLoading(true)
            let loanData = {
                usuario_id: id,
                dt_prev_devolucao: returnDate,
                dt_devolucao: null,
                renovacoes: 0,
                dt_renovacao: null,
                usuario_resp: user?.id,
                status_emprestimo: 'emprestado'
            }
            try {
                const response = await api.post(`/loan/create`, { loanData, materialsSelected })
                if (response?.status === 201) {
                    alert.success('Empréstimos realizados.');
                    setMaterialsSelected([])
                    setReturnDate('')
                    setShowSearchMaterial(false)
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao realizar Empréstimos.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } finally {
                setLoading(false)
            }
        } else {
            alert.info('Por favor, selecione um livro ou DVD para realizar o emprestimo.')
            return
        }
    }



    const handleReturnLoan = async (loanId) => {
        try {
            setLoading(true)
            let loanData = {
                dt_devolucao: new Date(),
                status_emprestimo: 'devolvido'
            }
            const response = await api.patch(`/loan/update/${loanId}`, { loanData })
            if (response?.status === 200) {
                alert.success('Devolução registrada.');
                setMaterialsSelected([])
                setReturnDate('')
                setShowSearchMaterial(false)
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao registrar devolução.');
        } catch (error) {
            alert.error('Tivemos um problema ao registrar devolução.');
        } finally {
            setLoading(false)
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

    const groupMaterials = [
        { label: 'Livros | Obra de Referência', value: 'Livros | Obra de Referência' },
        { label: 'DVDs | Áudio | CD-ROM', value: 'DVDs | Áudio | CD-ROM' },
        { label: 'Periódicos (Revistas | Gibis | Mangás | Folhetos)', value: 'Periódicos (Revistas | Gibis | Mangás | Folhetos)' },
        { label: 'Todos', value: 'todos' },
    ]

    return (
        <>
            <SectionHeader
                perfil={'Empréstimos'}
                title={studentData?.nome}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Realizar Empréstimo</Text>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Text bold>Nome: </Text>
                    <Text>{studentData?.nome}</Text>
                </Box>
                <Divider distance={0} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Text bold>Selecionar Livros, DVDs ou Periódicos: </Text>
                    <Button small text="pesquisar" style={{ height: 22 }} onClick={() => setShowSearchMaterial(true)} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 }}>
                    <Text small>Selecionados:</Text>
                    {materialsSelected?.map((item, index) => {
                        return (
                            <Box key={index} sx={{ display: 'flex', gap: 1, maxWidth: 180, backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                <Text small>{item?.titulo}</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 12,
                                    height: 12,
                                    aspectRatio: '1:1',
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => handleDeleteMaterial(item?.id_material)} />

                            </Box>

                        )
                    })}
                    <Text>{''}</Text>
                </Box>
                <Divider distance={0} />

                <TextInput name='dt_prev_devolucao' onChange={(e) => setReturnDate(e.target.value)} type="date" value={(returnDate)?.split('T')[0] || ''} label='Previsão devolução:' sx={{ maxWidth: 280, }} />
                <Divider distance={0} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button small text="emprestar" style={{ height: 30 }} onClick={() => handleCreate()} />
                    <Button small secondary text="limpar" style={{ height: 30 }} onClick={() => {
                        setMaterialsSelected([])
                        alert.success('Lista de emprestímos límpa.')
                    }} />
                </Box>

            </ContentContainer>

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados dos Empréstimos</Text>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', }}>
                    <Divider distance={0} />

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => setShowBox({ ...showBox, selected: !showBox?.selected })}
                    >
                        <Text bold>Lista de Materiais Selecionados:</Text>
                        <Box
                            sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showBox?.selected ? 'rotate(0)' : 'rotate(-90deg)',
                                transition: '.3s',
                                width: 17,
                                height: 17
                            }}
                        />
                    </Box>
                    {showBox?.selected && (
                        materialsSelected?.length > 0 ?
                            <Box sx={{ display: 'flex' }}>

                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, }}>
                                    <table style={{ borderCollapse: 'collapse', }}>
                                        <thead>
                                            <tr style={{ backgroundColor: colorPalette.primary, color: colorPalette.textColor, }}>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>ID Material</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Tipo</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Material</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Dt prevista devolução</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ flex: 1 }}>
                                            {
                                                materialsSelected?.map((item, index) => {
                                                    const dateDevolution = formatTimeStamp(returnDate)
                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.id_material}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.tipo_material || '-'}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.titulo}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {dateDevolution || '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })

                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Box>
                            :
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                <Text ligth>Não foi selecionado nenhum material.</Text>
                            </Box>
                    )}
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }}
                        onClick={() => setShowBox({ ...showBox, loans: !showBox?.loans })}
                    >
                        <Text bold>Materiais Emprestados/Renovação:</Text>
                        <Box
                            sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showBox?.loans ? 'rotate(0)' : 'rotate(-90deg)',
                                transition: '.3s',
                                width: 17,
                                height: 17
                            }}
                        />
                    </Box>
                    {showBox?.loans && (
                        loansData?.length > 0 ?
                            <Box sx={{ display: 'flex' }}>

                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, }}>
                                    <table style={{ borderCollapse: 'collapse', }}>
                                        <thead>
                                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>ID Material</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Material</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data prevista devolução</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data devolução</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Renovações</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Status</th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}></th>
                                                <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ flex: 1 }}>
                                            {
                                                loansData?.map((item, index) => {
                                                    const dateDevolution = formatTimeStamp(item?.dt_prev_devolucao)
                                                    return (
                                                        <tr key={`${item}-${index}`}>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.material_id}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.titulo}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {dateDevolution || '-'}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {formatTimeStamp(item?.dt_devolucao, true) || '-'}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.renovacoes || 0}
                                                            </td>
                                                            <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {item?.status_emprestimo || '-'}
                                                            </td>
                                                            {item?.status_emprestimo === 'emprestado' && <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <Button small text="Renovar" style={{ height: 20 }} />
                                                            </td>}
                                                            {item?.status_emprestimo === 'emprestado' && <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                <Button small text="Devolver" style={{ height: 20 }} onClick={() => handleReturnLoan(item?.id_emprestimo)} />
                                                            </td>}
                                                        </tr>
                                                    );
                                                })

                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Box>
                            :
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                <Text ligth>Nenhum material emprestado.</Text>
                            </Box>
                    )}
                </Box>
            </ContentContainer>

            <Backdrop open={showMaterials}>
                <ContentContainer sx={{ zIndex: 99999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Selecione o material para emprestímo</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowSearchMaterial(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>

                        <TextInput placeholder="Buscar pelo titulo.." name='filters' type="search" onChange={(event) => setFilters({ ...filters, search: event.target.value })} value={filters?.search} sx={{ flex: 1 }} />
                        <SelectList
                            data={groupMaterials}
                            valueSelection={filters?.type}
                            onSelect={(value) => setFilters({ ...filters, type: value })}
                            title="Tipo de Material:"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    {cataloguesList?.filter(filter).length > 0 ?
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2, alignItems: 'center', justifyContent: 'center' }}>
                            {cataloguesList?.filter(filter)?.map((item, index) => {
                                const selected = materialsSelected?.filter(mat => mat.id_material === item?.id_material)
                                return (
                                    <Box key={index} sx={{
                                        display: 'flex',
                                        backgroundColor: colorPalette.primary,
                                        padding: '8px 12px',
                                        alignItems: 'center',
                                        width: '100%',
                                        justifyContent: 'center',
                                        gap: 2,
                                        cursor: 'pointer',
                                        transition: '.5s',
                                        "&:hover": {
                                            // opacity: 0.7,
                                            cursor: 'pointer',
                                            backgroundColor: colorPalette.primary + '22'
                                        }
                                    }} onClick={() =>
                                        handleSelectedMaterial(item)
                                    }>
                                        {selected?.length > 0 && <CheckCircleIcon style={{ color: 'green', fontSize: 15 }} />}
                                        <Text bold>{item?.titulo}</Text>
                                    </Box>
                                )
                            })}
                        </Box>
                        : <Text ligth style={{ textAlign: 'center' }}>Sem resultado</Text>}
                </ContentContainer>
            </Backdrop>

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
    },
    disciplinesText: {

        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        },
    }
}