import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from '../../api/api'
import { Box, ContentContainer, Text } from "../../atoms"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { Colors, SearchBar, SectionHeader, Table_V1 } from "../../organisms"

export default function ListUsers(props) {

   // const [users, setUsers] = useState([])
   const [filterData, setFilterData] = useState('')
   
   const filter = (item) => item?.name?.toLowerCase().includes(filterData?.toLowerCase());

   const theme = useTheme()

   // useEffect(() => {
   //    getUsers()
   // }, [])

   // const getUsers = async () => {
   //    setLoading(true)
   //    await api.get(`/users`)
   //       .then(response => {
   //          const { data } = response
   //          setUsers(data)
   //       })
   //       .catch(error => {
   //          console.log(error)
   //       })
   //       .finally(() => setLoading(false));
   // }

   const users = [
      {
         id: '01',
         name: 'Marcus Silva',
         email: 'marcus.silva@melies.com',
         birthDate: '13/11/2000',
         perfil: 'Funcionario'
      },
      {
         id: '02',
         name: 'fulano Silva',
         email: 'fulano.silva@melies.com',
         birthDate: '13/11/2000',
         perfil: 'Funcionario'
      },
      {
         id: '03',
         name: 'cicrano Silva',
         email: 'cicrano.silva@melies.com',
         birthDate: '12/10/2000',
         perfil: 'Aluno'
      },
      {
         id: '04',
         name: 'beltrano Silva',
         email: 'beltrano.silva@melies.com',
         birthDate: '13/11/2000',
         perfil: 'Funcionario'
      },
   ]

   const column = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'E-mail' },
      { key: 'birthDate', label: 'Nascimento' },
      { key: 'perfil', label: 'Perfil' },

   ];

   return (
      <>
         <SectionHeader
            title={`Usuários (1)`}
            newButton
            newButtonAction={() => router.push(`/users/new`)}
         />
         <Box>
            <Text secundary bold style={{margin:'0px 5px 5px 5px',}}>Buscar por usuario: </Text>
            <SearchBar placeholder='João, Robert, Renato, etc.' style={{padding: '15px'}} onChange={setFilterData}/>
         </Box>
         <Table_V1 data={users?.filter(filter)} columns={column} />
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