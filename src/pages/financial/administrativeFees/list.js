import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import { Box, Button, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { useReactToPrint } from "react-to-print"

export default function ListAdministrativeFeesEdit(props) {
    const [ratesList, setRatesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, alert } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.ensino_graduacao_taxa?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.ensino_graduacao_taxa?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };
    const componentPDF = useRef()

    // const filterRegex = (name) => {
    //     let filterRegex = name.match(/\b[\wáéíóúâêîôûãõç]+\b/gi)
    //     return filterRegex
    // }

    useEffect(() => {
        getFees();
    }, []);

    const getFees = async () => {
        setLoading(true)
        try {
            const response = await api.get('/rates')
            const { data = [] } = response;
            setRatesList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGeneratePdf = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: 'Taxas Administrativa',
        onAfterPrint: () => alert.info('Tabela exportada em PDF.')
    })


    const column = [
        { key: 'id_taxa_adm', label: 'ID' },
        { key: 'ensino_graduacao_taxa', label: 'Ensino Graduação Presencial' },
        { key: 'valor_taxa', label: 'Taxa(R$)' },
        { key: 'prazo_taxa', label: 'Prazo' }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Taxas Administrativa (${ratesList.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/financial/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Atestado de Atividades aos Sábados...' style={{ padding: '15px', }} onChange={setFilterData} />
                <SelectList
                    data={listAtivo}
                    valueSelection={filterAtive}
                    onSelect={(value) => setFilterAtive(value)}
                    title="status"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                    clean={false}
                />
            </Box>
            {ratesList.length > 0 ?
                <div ref={componentPDF}>
                    <Table_V1 data={ratesList?.filter(filter)} columns={column} columnId={'id_taxa_adm'} columnActive={false} />
                </div>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Taxas Administrativas</Text>
                </Box>
            }
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.8, flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                <Text bold>Exportar:</Text>
                <Box sx={{
                    backgroundImage: `url('/icons/pdf_icon.png')`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    width: { xs: '30px', sm: 35, md: 35, lg: 35, xl: 35 },
                    aspectRatio: '1/1',
                    transition: '.3s',
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={handleGeneratePdf}/>
            </Box>
        </>
    )
}
