import { Box } from "./Box"

export const Divider = (props) => {

   const { distance = 1, color = '', size = '1px' } = props;

   return (
      <Box sx={{
         width: '100%',
         padding: `${8 * distance}px 0px`
      }}>
         <Box sx={{
            width: '100%',
            height: size,
            backgroundColor: color ? color : '#eaeaea'
         }} />
      </Box>
   )
}