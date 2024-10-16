
import { Box, Text } from "../atoms";
import { useAppContext } from "../context/AppContext";
import { Colors } from "../organisms";

export const Button = (props) => {

   const { colorPalette, theme } = useAppContext()

   const {
      secondary = false,
      tertiary = false,
      cancel = false,
      small = false,
      large = false,
      overallSize = 'regular',
      onClick = () => { },
      text = '',
      style = {},
      closeButton = false,
      disabled = false
   } = props;

   if (closeButton) {
      return (
         <Box sx={{
            ...styles.closeButtonContainer,
            // ...(small && { width: 26,  height: 26, minHeight: 26 }),
            ...(large && { width: 46, minWidth: 46, height: 46, minHeight: 46 }),
         }}
            onClick={onClick}
         >
            <Text xsmall={`${small}`} small={`${!small && !large}`} bold='true' style={{ color: Colors.textPrimary }}>X</Text>
         </Box>
      )
   }

   return (
      <Box
         sx={{
            ...styles.buttonContainer,
            backgroundColor: colorPalette.buttonColor,
            transition: 'background-color 1s',
            "&:hover": {
               backgroundColor: colorPalette.buttonColor + 'dd',
               cursor: !disabled && 'pointer'
            },
            ...(secondary && {
               backgroundColor: 'transparent',
               color: colorPalette.buttonColor,
               // border: `1px solid ${!theme ? '#fff': 'black'}`,
               border: `1px solid ${colorPalette.buttonColor}`,
               boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
               "&:hover": {
                  backgroundColor: colorPalette.buttonColor + '33',
                  cursor: !disabled && 'pointer'
               }
            }),
            ...(cancel && {
               ...styles.buttonContainer,
               backgroundColor: '#ff4d4d',
               transition: 'background-color 3s',
               "&:hover": {
                  opacity: 0.8,
                  cursor: !disabled && 'pointer'
               },
            }),
            ...(tertiary && {
               backgroundColor: Colors.background,
               color: '#fff',
               border: `1px solid #d1d9dd`,
               "&:hover": {
                  backgroundColor: '#e0e5e7',
                  cursor: !disabled && 'pointer'
               }
            }),
            // ...(small && { width: '100%', maxWidth: 130 }),
            ...(large && { width: '100%', maxWidth: 230 }),
            ...style,
            ...disabled && { opacity: 0.3 }
         }}
         onClick={!disabled ? onClick : () => { }}
      >
         <Text small={small} bold style={{ color: 'inherit' }}>{text}</Text>
      </Box>
   )
}

const styles = {
   buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#f0f0f0',
      padding: { xs: `6px 10px`, xm: `8px 16px`, md: `8px 16px`, lg: `8px 16px` },
      borderRadius: '100px',
   },
   closeButtonContainer: {
      // backgroundColor: '#f0f0f0',
      borderRadius: '50%',
      width: 36,
      minWidth: 36,
      height: 36,
      minHeight: 36,
      alignSelf: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      "&:hover": {
         backgroundColor: Colors.background,
         cursor: 'pointer'
      }
   }
}