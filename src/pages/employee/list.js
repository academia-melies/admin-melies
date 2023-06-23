import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../atoms"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../organisms"
import { api } from "../../api/api"
import { getUsersPerfil } from "../../validators/api-requests"
import { useAppContext } from "../../context/AppContext"

export default function ListUsers(props) {

   const [usersList, setUsers] = useState([])
   const [filterData, setFilterData] = useState('')
   const [perfil, setPerfil] = useState('funcionario')
   const { setLoading, alert, theme, setTheme, colorPalette } = useAppContext()
   const router = useRouter()
   const filter = (item) => (item?.nome?.toLowerCase().includes(filterData?.toLowerCase())) || (item?.cpf?.toLowerCase().includes(filterData?.toLowerCase()));
   // const theme = useTheme()

   const getUsers = async () => {
      setLoading(true)
      try {
         const response = await getUsersPerfil(perfil)
         const { data = [] } = response;
         setUsers(data)
      } catch (error) {
         console.log(error.response.data)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      getUsers()
   }, [])

   const column = [
      { key: 'id', label: 'ID' },
      { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'foto' },
      { key: 'email', label: 'E-mail' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'cpf', label: 'CPF' },
      { key: 'nacionalidade', label: 'Nacionalidade' },
      { key: 'estado_civil', label: 'Estado Civil' },
      { key: 'email_melies', label: 'Email Meliés' },
   ];

   return (
      <>
         <SectionHeader
            title={`Funcionarios (${usersList?.length})`}
            newButton
            newButtonAction={() => router.push(`/employee/new`)}
         />
         <Box>
            <Text bold style={{ margin: '0px 5px 5px 5px', }}>Buscar por funcionario: </Text>
            <SearchBar placeholder='João, Robert, Renato, etc.' style={{ padding: '15px' }} onChange={setFilterData} />
         </Box>
         <Table_V1 data={usersList?.filter(filter)} columns={column}/>
      </>
   )
}

const styles = {
   contentContainer: {
      display: "flex",
      textAlign: 'center',
      justifyContent: 'space-around',
      backgroundColor: Colors.backgroundPrimary,
      padding: 8
   },
   bodyContainer: {
      width: '100%',
   },
   title: {
      width: '50%'
   },
}