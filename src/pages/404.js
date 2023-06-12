const { Text, Box } = require("../atoms")

const PageNotFound = () => {
   return (
      <Box sx={{
         width: '100%',
         height: '100%',
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'center',
         alignItems: 'center',
         gap: 2
      }}>
         <Text title='true' bold='true'>Desculpe</Text>
         <Text>Não conseguimos encontrar esta página.</Text>
      </Box>

   )
}

export default PageNotFound;