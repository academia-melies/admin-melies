import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListServices(props) {
    const [servicesList, setServicesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.nome_servico?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.nome_servico?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    useEffect(() => {
        getServices();
    }, []);

    const getServices = async () => {
        setLoading(true)
        try {
            const response = await api.get('/services')
            const { data} = response;
            setServicesList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_servico', label: 'ID' },
        { key: 'nome_servico', label: 'Serviço'},
        { key: 'fornecedor', label: 'Fornecedor(a)'},
        { key: 'dt_inicio_contrato', label: 'Inicio de Contrato', date: true },
        { key: 'dt_fim_contrato', label: 'Fim do Contrato', date: true }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Serviços (${servicesList.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/suport/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='AutoDesk, Adobe...' style={{ padding: '15px', }} onChange={setFilterData} />
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
            {servicesList.length > 0 ?
                <Table_V1 data={servicesList?.filter(filter)} columns={column} columnId={'id_servico'}/>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar nenhum Serviço Cadastrado</Text>
                </Box>
            }
        </>
    )
}
