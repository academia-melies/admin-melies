import { useAppContext } from '../context/AppContext';
import { Box } from './Box';

/*

Default props:

- FlexDirection: column;
- Alignment: 'flex-start

*/

export const ContentContainer = (props) => {

   const { colorPalette, theme } = useAppContext()

   const {
      children,
      row = false,
      center = false,
      right = false,
      fullWidth = false,
      gap = 2,
      width = null,
      style = {},
      sx = {},
      overflow = 'hidden',
      onClick = () => { }
   } = props;

   return (
      <Box sx={{
         ...styles.contentContainer,
         boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
         overflow,
         gap,
         backgroundColor: colorPalette.secondary,
         transition: 'background-color 1s',
         ...(width && { width }),
         ...(fullWidth && { flex: 1 }),
         ...(row ?
            {
               flexDirection: 'row',
               ...(center && { justifyContent: 'center' }),
               ...(right && { justifyContent: 'flex-end' }),
            }
            :
            {
               ...(center && { alignItems: 'center' }),
               ...(right && { alignItems: 'flex-end' }),
            }),
         ...style,
         ...sx
      }} onClick={onClick}>
         {children}
      </Box>
   )
}

const styles = {
   contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: `30px`,
      borderRadius: `12px`,
      // boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
   }
}